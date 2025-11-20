from rest_framework import serializers
from .models import (
    MockApp, MockCollection, MockEnvironment, MockEndpoint,
    MockResponse, MockScenario, MockRequest, MockSettings
)


class MockEnvironmentSerializer(serializers.ModelSerializer):
    """Serializer for MockEnvironment model"""

    class Meta:
        model = MockEnvironment
        fields = [
            'id', 'app', 'name', 'variables', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MockCollectionSerializer(serializers.ModelSerializer):
    """Serializer for MockCollection model"""
    total_endpoints = serializers.ReadOnlyField()
    total_requests = serializers.ReadOnlyField()

    class Meta:
        model = MockCollection
        fields = [
            'id', 'app', 'name', 'description', 'order', 'folder',
            'total_endpoints', 'total_requests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_endpoints', 'total_requests']


class MockCollectionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for MockCollection with endpoints"""
    total_endpoints = serializers.ReadOnlyField()
    total_requests = serializers.ReadOnlyField()
    # endpoints will be added by the view if needed

    class Meta:
        model = MockCollection
        fields = [
            'id', 'app', 'name', 'description', 'order', 'folder',
            'total_endpoints', 'total_requests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_endpoints', 'total_requests']


class MockAppSerializer(serializers.ModelSerializer):
    """Serializer for MockApp model"""
    total_collections = serializers.ReadOnlyField()
    total_endpoints = serializers.ReadOnlyField()
    total_requests = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MockApp
        fields = [
            'id', 'user', 'user_username', 'name', 'description', 'icon', 'color',
            'base_url', 'is_public', 'total_collections', 'total_endpoints',
            'total_requests', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_username', 'total_collections', 'total_endpoints',
            'total_requests', 'created_at', 'updated_at'
        ]


class MockAppDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for MockApp with collections and environments"""
    total_collections = serializers.ReadOnlyField()
    total_endpoints = serializers.ReadOnlyField()
    total_requests = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    collections = MockCollectionSerializer(many=True, read_only=True)
    environments = MockEnvironmentSerializer(many=True, read_only=True)

    class Meta:
        model = MockApp
        fields = [
            'id', 'user', 'user_username', 'name', 'description', 'icon', 'color',
            'base_url', 'is_public', 'total_collections', 'total_endpoints',
            'total_requests', 'collections', 'environments', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_username', 'total_collections', 'total_endpoints',
            'total_requests', 'created_at', 'updated_at'
        ]


class MockResponseSerializer(serializers.ModelSerializer):
    """Serializer for MockResponse model"""
    usage_count = serializers.ReadOnlyField()

    class Meta:
        model = MockResponse
        fields = [
            'id', 'endpoint', 'name', 'description', 'condition_type',
            'condition_key', 'condition_value', 'condition_probability',
            'status_code', 'response_body', 'response_headers', 'priority',
            'usage_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'usage_count']


class MockEndpointSerializer(serializers.ModelSerializer):
    """Serializer for MockEndpoint model"""
    responses = MockResponseSerializer(many=True, read_only=True)
    request_count = serializers.ReadOnlyField()
    mock_url = serializers.SerializerMethodField()
    collection_name = serializers.CharField(source='collection.name', read_only=True)

    class Meta:
        model = MockEndpoint
        fields = [
            'id', 'collection', 'collection_name', 'name', 'description', 'order', 'path',
            'method', 'protocol', 'status_code', 'response_body',
            'response_headers', 'content_type', 'latency_min', 'latency_max',
            'error_rate', 'is_active', 'enable_logging', 'request_count',
            'mock_url', 'responses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'request_count', 'created_at', 'updated_at', 'mock_url']

    def get_mock_url(self, obj):
        """Get the mock URL for this endpoint"""
        return obj.get_mock_url()

    def validate(self, data):
        """Validate endpoint data"""
        # Check if user has reached endpoint limit
        user = self.context['request'].user
        settings = MockSettings.get_settings()

        # Get user's subscription tier (assuming this exists in user profile)
        try:
            tier = user.userprofile.subscription_tier if hasattr(user, 'userprofile') else 'free'
        except AttributeError:
            tier = 'free'

        # Determine max endpoints based on tier
        if tier == 'enterprise':
            max_endpoints = settings.max_endpoints_enterprise
        elif tier == 'pro':
            max_endpoints = settings.max_endpoints_pro
        else:
            max_endpoints = settings.max_endpoints_per_user

        # Count existing endpoints across all user's apps (exclude current if updating)
        existing_count = MockEndpoint.objects.filter(
            collection__app__user=user
        ).count()
        if self.instance:
            existing_count -= 1

        # Check limit
        if max_endpoints != -1 and existing_count >= max_endpoints:
            raise serializers.ValidationError(
                f"You have reached the maximum number of mock endpoints ({max_endpoints}) for your tier. "
                f"Upgrade to Pro or Enterprise for more endpoints."
            )

        return data


class MockEndpointCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating MockEndpoint (without nested responses)"""

    class Meta:
        model = MockEndpoint
        fields = [
            'collection', 'name', 'description', 'order', 'path', 'method', 'protocol',
            'status_code', 'response_body', 'response_headers',
            'content_type', 'latency_min', 'latency_max', 'error_rate',
            'is_active', 'enable_logging'
        ]

    def validate_path(self, value):
        """Ensure path starts with /"""
        if not value.startswith('/'):
            return f'/{value}'
        return value

    def validate_response_body(self, value):
        """Validate response body is valid JSON if content type is JSON"""
        # Try to parse as JSON if it looks like JSON
        if value.strip().startswith(('{', '[')):
            try:
                import json
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Response body must be valid JSON")
        return value


class MockScenarioSerializer(serializers.ModelSerializer):
    """Serializer for MockScenario model"""
    endpoints = MockEndpointSerializer(many=True, read_only=True)
    endpoint_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=MockEndpoint.objects.all(),
        write_only=True,
        source='endpoints'
    )
    endpoint_count = serializers.SerializerMethodField()
    app_name = serializers.CharField(source='app.name', read_only=True)

    class Meta:
        model = MockScenario
        fields = [
            'id', 'app', 'app_name', 'name', 'description',
            'endpoints', 'endpoint_ids', 'scenario_data', 'is_active',
            'endpoint_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'endpoint_count']

    def get_endpoint_count(self, obj):
        """Get number of endpoints in scenario"""
        return obj.endpoints.count()


class MockRequestSerializer(serializers.ModelSerializer):
    """Serializer for MockRequest (logs)"""
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)

    class Meta:
        model = MockRequest
        fields = [
            'id', 'endpoint', 'endpoint_name', 'method', 'path',
            'query_params', 'headers', 'body', 'response_status',
            'response_body', 'response_headers', 'response_time_ms',
            'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = fields  # All fields are read-only


class MockRequestSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for request logs (for list views)"""
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)

    class Meta:
        model = MockRequest
        fields = [
            'id', 'endpoint_name', 'method', 'path', 'response_status',
            'response_time_ms', 'created_at'
        ]
        read_only_fields = fields


class MockSettingsSerializer(serializers.ModelSerializer):
    """Serializer for MockSettings"""

    class Meta:
        model = MockSettings
        fields = [
            'max_requests_per_hour', 'max_endpoints_per_user',
            'max_endpoints_pro', 'max_endpoints_enterprise',
            'log_retention_days', 'enable_request_logging',
            'enable_graphql', 'enable_soap', 'enable_advanced_scenarios',
            'updated_at'
        ]
        read_only_fields = ['updated_at']


class EndpointStatsSerializer(serializers.Serializer):
    """Serializer for endpoint statistics"""
    total_endpoints = serializers.IntegerField()
    active_endpoints = serializers.IntegerField()
    total_requests = serializers.IntegerField()
    requests_today = serializers.IntegerField()
    avg_response_time = serializers.FloatField()
    error_rate = serializers.FloatField()
