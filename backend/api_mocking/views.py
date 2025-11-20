from django.shortcuts import get_object_or_404
from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import JsonResponse
import json

from .models import (
    MockApp, MockCollection, MockEnvironment, MockEndpoint,
    MockResponse, MockScenario, MockRequest, MockSettings
)
from .serializers import (
    MockAppSerializer,
    MockAppDetailSerializer,
    MockCollectionSerializer,
    MockCollectionDetailSerializer,
    MockEnvironmentSerializer,
    MockEndpointSerializer,
    MockEndpointCreateUpdateSerializer,
    MockResponseSerializer,
    MockScenarioSerializer,
    MockRequestSerializer,
    MockRequestSummarySerializer,
    EndpointStatsSerializer
)
from .mock_engine import MockEngine, create_http_response


# ============ Mock App Views ============

class MockAppListCreate(APIView):
    """List all mock apps or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all apps for the current user"""
        apps = MockApp.objects.filter(user=request.user).prefetch_related('collections', 'environments')
        serializer = MockAppSerializer(apps, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new mock app"""
        serializer = MockAppSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockAppDetail(APIView):
    """Retrieve, update, or delete a mock app"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get app and verify ownership"""
        try:
            return MockApp.objects.prefetch_related('collections', 'environments').get(pk=pk, user=user)
        except MockApp.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific app with all collections and environments"""
        app = self.get_object(pk, request.user)
        if not app:
            return Response({'error': 'App not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockAppDetailSerializer(app)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update an app"""
        app = self.get_object(pk, request.user)
        if not app:
            return Response({'error': 'App not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockAppSerializer(app, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Partially update an app"""
        app = self.get_object(pk, request.user)
        if not app:
            return Response({'error': 'App not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockAppSerializer(app, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete an app"""
        app = self.get_object(pk, request.user)
        if not app:
            return Response({'error': 'App not found'}, status=status.HTTP_404_NOT_FOUND)

        app.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============ Mock Collection Views ============

class MockCollectionListCreate(APIView):
    """List all collections for an app or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all collections for user's apps, optionally filtered by app_id"""
        app_id = request.query_params.get('app_id')

        if app_id:
            # Get collections for a specific app
            collections = MockCollection.objects.filter(
                app_id=app_id,
                app__user=request.user
            ).prefetch_related('endpoints')
        else:
            # Get all collections for user's apps
            collections = MockCollection.objects.filter(
                app__user=request.user
            ).prefetch_related('endpoints')

        serializer = MockCollectionSerializer(collections, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new collection"""
        serializer = MockCollectionSerializer(data=request.data)
        if serializer.is_valid():
            # Verify user owns the app
            app = serializer.validated_data['app']
            if app.user != request.user:
                return Response(
                    {'error': "You don't have permission to add collections to this app"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockCollectionDetail(APIView):
    """Retrieve, update, or delete a collection"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get collection and verify ownership"""
        try:
            return MockCollection.objects.prefetch_related('endpoints').get(pk=pk, app__user=user)
        except MockCollection.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific collection with endpoints"""
        collection = self.get_object(pk, request.user)
        if not collection:
            return Response({'error': 'Collection not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get endpoints for this collection
        endpoints = MockEndpoint.objects.filter(collection=collection)

        collection_data = MockCollectionSerializer(collection).data
        collection_data['endpoints'] = MockEndpointSerializer(endpoints, many=True).data

        return Response(collection_data)

    def put(self, request, pk):
        """Update a collection"""
        collection = self.get_object(pk, request.user)
        if not collection:
            return Response({'error': 'Collection not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockCollectionSerializer(collection, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Partially update a collection"""
        collection = self.get_object(pk, request.user)
        if not collection:
            return Response({'error': 'Collection not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockCollectionSerializer(collection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a collection"""
        collection = self.get_object(pk, request.user)
        if not collection:
            return Response({'error': 'Collection not found'}, status=status.HTTP_404_NOT_FOUND)

        collection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============ Mock Environment Views ============

class MockEnvironmentListCreate(APIView):
    """List all environments for an app or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all environments, optionally filtered by app_id"""
        app_id = request.query_params.get('app_id')

        if app_id:
            # Get environments for a specific app
            environments = MockEnvironment.objects.filter(
                app_id=app_id,
                app__user=request.user
            )
        else:
            # Get all environments for user's apps
            environments = MockEnvironment.objects.filter(
                app__user=request.user
            )

        serializer = MockEnvironmentSerializer(environments, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new environment"""
        serializer = MockEnvironmentSerializer(data=request.data)
        if serializer.is_valid():
            # Verify user owns the app
            app = serializer.validated_data['app']
            if app.user != request.user:
                return Response(
                    {'error': "You don't have permission to add environments to this app"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockEnvironmentDetail(APIView):
    """Retrieve, update, or delete an environment"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get environment and verify ownership"""
        try:
            return MockEnvironment.objects.get(pk=pk, app__user=user)
        except MockEnvironment.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific environment"""
        environment = self.get_object(pk, request.user)
        if not environment:
            return Response({'error': 'Environment not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEnvironmentSerializer(environment)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update an environment"""
        environment = self.get_object(pk, request.user)
        if not environment:
            return Response({'error': 'Environment not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEnvironmentSerializer(environment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Partially update an environment"""
        environment = self.get_object(pk, request.user)
        if not environment:
            return Response({'error': 'Environment not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEnvironmentSerializer(environment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete an environment"""
        environment = self.get_object(pk, request.user)
        if not environment:
            return Response({'error': 'Environment not found'}, status=status.HTTP_404_NOT_FOUND)

        environment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============ Mock Endpoint Views ============

class MockEndpointListCreate(APIView):
    """List all mock endpoints or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all endpoints for the current user, optionally filtered by collection_id"""
        collection_id = request.query_params.get('collection_id')

        if collection_id:
            # Get endpoints for a specific collection
            endpoints = MockEndpoint.objects.filter(
                collection_id=collection_id,
                collection__app__user=request.user
            ).select_related('collection').prefetch_related('responses')
        else:
            # Get all endpoints for user's apps
            endpoints = MockEndpoint.objects.filter(
                collection__app__user=request.user
            ).select_related('collection').prefetch_related('responses')

        serializer = MockEndpointSerializer(endpoints, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new mock endpoint"""
        serializer = MockEndpointCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Verify user owns the collection
            collection = serializer.validated_data['collection']
            if collection.app.user != request.user:
                return Response(
                    {'error': "You don't have permission to add endpoints to this collection"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
            # Return full endpoint data
            endpoint = MockEndpoint.objects.get(id=serializer.instance.id)
            response_serializer = MockEndpointSerializer(endpoint)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockEndpointDetail(APIView):
    """Retrieve, update, or delete a mock endpoint"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get endpoint and verify ownership"""
        try:
            return MockEndpoint.objects.get(pk=pk, collection__app__user=user)
        except MockEndpoint.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific endpoint"""
        endpoint = self.get_object(pk, request.user)
        if not endpoint:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEndpointSerializer(endpoint)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update an endpoint"""
        endpoint = self.get_object(pk, request.user)
        if not endpoint:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEndpointCreateUpdateSerializer(endpoint, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            response_serializer = MockEndpointSerializer(endpoint)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Partially update an endpoint"""
        endpoint = self.get_object(pk, request.user)
        if not endpoint:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockEndpointCreateUpdateSerializer(endpoint, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            response_serializer = MockEndpointSerializer(endpoint)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete an endpoint"""
        endpoint = self.get_object(pk, request.user)
        if not endpoint:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        endpoint.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MockEndpointToggleActive(APIView):
    """Toggle endpoint active status"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            endpoint = MockEndpoint.objects.get(pk=pk, collection__app__user=request.user)
        except MockEndpoint.DoesNotExist:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        endpoint.is_active = not endpoint.is_active
        endpoint.save()
        return Response({
            'is_active': endpoint.is_active,
            'message': f'Endpoint {"activated" if endpoint.is_active else "deactivated"}'
        })


class MockEndpointResetCounter(APIView):
    """Reset endpoint request counter"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            endpoint = MockEndpoint.objects.get(pk=pk, collection__app__user=request.user)
        except MockEndpoint.DoesNotExist:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        old_count = endpoint.request_count
        endpoint.request_count = 0
        endpoint.save()
        return Response({
            'message': f'Counter reset from {old_count} to 0'
        })


class MockEndpointStats(APIView):
    """Get statistics for a specific endpoint"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            endpoint = MockEndpoint.objects.get(pk=pk, collection__app__user=request.user)
        except MockEndpoint.DoesNotExist:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get request logs for this endpoint
        logs = MockRequest.objects.filter(endpoint=endpoint)

        # Calculate stats
        total_requests = logs.count()
        avg_response_time = logs.aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0
        error_count = logs.filter(response_status__gte=400).count()
        error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0

        # Recent requests (last 24 hours)
        yesterday = timezone.now() - timedelta(days=1)
        recent_requests = logs.filter(created_at__gte=yesterday).count()

        return Response({
            'endpoint_id': str(endpoint.id),
            'endpoint_name': endpoint.name,
            'total_requests': total_requests,
            'recent_requests_24h': recent_requests,
            'avg_response_time_ms': round(avg_response_time, 2),
            'error_count': error_count,
            'error_rate_percent': round(error_rate, 2),
            'is_active': endpoint.is_active
        })


class MockEndpointLogs(APIView):
    """Get request logs for a specific endpoint"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            endpoint = MockEndpoint.objects.get(pk=pk, collection__app__user=request.user)
        except MockEndpoint.DoesNotExist:
            return Response({'error': 'Endpoint not found'}, status=status.HTTP_404_NOT_FOUND)

        # Pagination parameters
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))

        # Get logs
        logs = MockRequest.objects.filter(endpoint=endpoint).order_by('-created_at')[offset:offset + limit]
        total_count = MockRequest.objects.filter(endpoint=endpoint).count()

        serializer = MockRequestSummarySerializer(logs, many=True)
        return Response({
            'count': total_count,
            'logs': serializer.data
        })


class MockResponseListCreate(APIView):
    """List all mock responses or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all responses for user's endpoints"""
        responses = MockResponse.objects.filter(
            endpoint__collection__app__user=request.user
        ).select_related('endpoint')
        serializer = MockResponseSerializer(responses, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new mock response"""
        serializer = MockResponseSerializer(data=request.data)
        if serializer.is_valid():
            # Validate user owns the endpoint
            endpoint = serializer.validated_data['endpoint']
            if endpoint.collection.app.user != request.user:
                return Response(
                    {'error': "You don't have permission to add responses to this endpoint"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockResponseDetail(APIView):
    """Retrieve, update, or delete a mock response"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get response and verify ownership"""
        try:
            return MockResponse.objects.select_related('endpoint').get(pk=pk, endpoint__collection__app__user=user)
        except MockResponse.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific response"""
        response = self.get_object(pk, request.user)
        if not response:
            return Response({'error': 'Response not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockResponseSerializer(response)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update a response"""
        response = self.get_object(pk, request.user)
        if not response:
            return Response({'error': 'Response not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockResponseSerializer(response, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a response"""
        response = self.get_object(pk, request.user)
        if not response:
            return Response({'error': 'Response not found'}, status=status.HTTP_404_NOT_FOUND)

        response.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MockScenarioListCreate(APIView):
    """List all mock scenarios or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all scenarios for the current user's apps"""
        scenarios = MockScenario.objects.filter(app__user=request.user).prefetch_related('endpoints')
        serializer = MockScenarioSerializer(scenarios, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new mock scenario"""
        serializer = MockScenarioSerializer(data=request.data)
        if serializer.is_valid():
            # Verify user owns the app
            app = serializer.validated_data['app']
            if app.user != request.user:
                return Response(
                    {'error': "You don't have permission to add scenarios to this app"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MockScenarioDetail(APIView):
    """Retrieve, update, or delete a mock scenario"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        """Get scenario and verify ownership"""
        try:
            return MockScenario.objects.prefetch_related('endpoints').get(pk=pk, app__user=user)
        except MockScenario.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific scenario"""
        scenario = self.get_object(pk, request.user)
        if not scenario:
            return Response({'error': 'Scenario not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockScenarioSerializer(scenario)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update a scenario"""
        scenario = self.get_object(pk, request.user)
        if not scenario:
            return Response({'error': 'Scenario not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockScenarioSerializer(scenario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a scenario"""
        scenario = self.get_object(pk, request.user)
        if not scenario:
            return Response({'error': 'Scenario not found'}, status=status.HTTP_404_NOT_FOUND)

        scenario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MockRequestList(APIView):
    """List all request logs for user's endpoints"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List request logs"""
        logs = MockRequest.objects.filter(
            endpoint__collection__app__user=request.user
        ).select_related('endpoint').order_by('-created_at')

        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))

        paginated_logs = logs[offset:offset + limit]
        serializer = MockRequestSummarySerializer(paginated_logs, many=True)

        return Response({
            'count': logs.count(),
            'results': serializer.data
        })


class MockRequestDetail(APIView):
    """Retrieve a specific request log"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            log = MockRequest.objects.select_related('endpoint').get(pk=pk, endpoint__collection__app__user=request.user)
        except MockRequest.DoesNotExist:
            return Response({'error': 'Log not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MockRequestSerializer(log)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the current user"""
    user = request.user

    # Endpoint stats
    endpoints = MockEndpoint.objects.filter(collection__app__user=user)
    total_endpoints = endpoints.count()
    active_endpoints = endpoints.filter(is_active=True).count()

    # Request stats
    logs = MockRequest.objects.filter(endpoint__collection__app__user=user)
    total_requests = logs.count()

    # Requests today
    today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    requests_today = logs.filter(created_at__gte=today).count()

    # Average response time
    avg_response_time = logs.aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0

    # Error rate
    error_count = logs.filter(response_status__gte=400).count()
    error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0

    stats = {
        'total_endpoints': total_endpoints,
        'active_endpoints': active_endpoints,
        'total_requests': total_requests,
        'requests_today': requests_today,
        'avg_response_time': round(avg_response_time, 2),
        'error_rate': round(error_rate, 2)
    }

    serializer = EndpointStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
def execute_mock(request, endpoint_id, path=''):
    """Execute a mock endpoint request - PUBLIC ENDPOINT"""
    try:
        # Get the endpoint
        endpoint = get_object_or_404(MockEndpoint, id=endpoint_id, is_active=True)

        # Extract request data
        method = request.method
        query_params = dict(request.query_params)
        headers = dict(request.headers)
        body = request.body.decode('utf-8') if request.body else ''
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Use the mock engine to process the request
        engine = MockEngine()
        response_body, status_code, response_headers = engine.process_request(
            endpoint=endpoint,
            method=method,
            path=f"/{path}",
            query_params=query_params,
            headers=headers,
            body=body,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Create and return HTTP response
        return create_http_response(response_body, status_code, response_headers)

    except MockEndpoint.DoesNotExist:
        return JsonResponse(
            {'error': 'Mock endpoint not found or inactive'},
            status=404
        )
    except Exception as e:
        return JsonResponse(
            {'error': 'Internal server error', 'message': str(e)},
            status=500
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_code_snippet(request, endpoint_id):
    """Generate code snippets for calling a mock endpoint"""
    endpoint = get_object_or_404(MockEndpoint, id=endpoint_id)

    # Verify user owns this endpoint
    if endpoint.collection.app.user != request.user:
        return Response({'error': 'Permission denied'}, status=403)

    mock_url = f"http://localhost:8003{endpoint.get_mock_url()}"
    method = endpoint.method

    # Sample request body (for POST/PUT/PATCH)
    sample_body = endpoint.response_body if method in ['POST', 'PUT', 'PATCH'] else None

    snippets = {
        'curl': generate_curl_snippet(mock_url, method, sample_body),
        'fetch': generate_fetch_snippet(mock_url, method, sample_body),
        'axios': generate_axios_snippet(mock_url, method, sample_body),
    }

    return Response({
        'endpoint_name': endpoint.name,
        'mock_url': mock_url,
        'method': method,
        'snippets': snippets
    })


def generate_curl_snippet(url, method, body=None):
    """Generate cURL command snippet"""
    cmd = f"curl -X {method} '{url}'"

    if body and method in ['POST', 'PUT', 'PATCH']:
        cmd += f" \\\n  -H 'Content-Type: application/json' \\\n  -d '{body}'"

    return cmd


def generate_fetch_snippet(url, method, body=None):
    """Generate JavaScript Fetch API snippet"""
    body_part = f",\n  body: JSON.stringify({body})" if body and method in ['POST', 'PUT', 'PATCH'] else ''
    return f"""fetch('{url}', {{
  method: '{method}',
  headers: {{
    'Content-Type': 'application/json'
  }}{body_part}
}})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));"""


def generate_axios_snippet(url, method, body=None):
    """Generate Axios snippet"""
    method_lower = method.lower()

    if body and method in ['POST', 'PUT', 'PATCH']:
        return f"""axios.{method_lower}('{url}', {body})
  .then(response => {{
    console.log(response.data);
  }})
  .catch(error => {{
    console.error('Error:', error);
  }});"""
    else:
        return f"""axios.{method_lower}('{url}')
  .then(response => {{
    console.log(response.data);
  }})
  .catch(error => {{
    console.error('Error:', error);
  }});"""


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_openapi(request, endpoint_id):
    """Export mock endpoint as OpenAPI 3.0 specification"""
    endpoint = get_object_or_404(MockEndpoint, id=endpoint_id)

    # Verify user owns this endpoint
    if endpoint.collection.app.user != request.user:
        return Response({'error': 'Permission denied'}, status=403)

    # Generate OpenAPI spec
    spec = {
        'openapi': '3.0.0',
        'info': {
            'title': endpoint.name,
            'description': endpoint.description or 'Mock API Endpoint',
            'version': '1.0.0'
        },
        'servers': [
            {
                'url': f'http://localhost:8003/api/mock/{endpoint.id}',
                'description': 'Mock server'
            }
        ],
        'paths': {
            endpoint.path: {
                endpoint.method.lower(): {
                    'summary': endpoint.name,
                    'description': endpoint.description or '',
                    'responses': {
                        str(endpoint.status_code): {
                            'description': 'Success response',
                            'content': {
                                endpoint.content_type: {
                                    'example': json.loads(endpoint.response_body) if endpoint.response_body else {}
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return Response(spec)
