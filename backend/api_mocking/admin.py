from django.contrib import admin
from django.utils.html import format_html
from .models import (
    MockApp, MockCollection, MockEnvironment, MockEndpoint,
    MockResponse, MockScenario, MockRequest, MockSettings
)


@admin.register(MockApp)
class MockAppAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'total_collections', 'total_endpoints', 'total_requests', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_collections', 'total_endpoints', 'total_requests']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'name', 'description', 'icon', 'color')
        }),
        ('Settings', {
            'fields': ('base_url', 'is_public')
        }),
        ('Statistics', {
            'fields': ('total_collections', 'total_endpoints', 'total_requests', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MockCollection)
class MockCollectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'app', 'total_endpoints', 'total_requests', 'order', 'created_at']
    list_filter = ['app', 'created_at']
    search_fields = ['name', 'description', 'app__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_endpoints', 'total_requests']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'app', 'name', 'description')
        }),
        ('Organization', {
            'fields': ('order', 'folder')
        }),
        ('Statistics', {
            'fields': ('total_endpoints', 'total_requests', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MockEnvironment)
class MockEnvironmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'app', 'is_active', 'created_at']
    list_filter = ['app', 'is_active', 'created_at']
    search_fields = ['name', 'app__name']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'app', 'name', 'is_active')
        }),
        ('Variables', {
            'fields': ('variables',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MockEndpoint)
class MockEndpointAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'method', 'path', 'protocol', 'status_code',
        'is_active', 'request_count', 'collection', 'created_at'
    ]
    list_filter = ['method', 'protocol', 'is_active', 'created_at', 'collection__app']
    search_fields = ['name', 'path', 'description', 'collection__name', 'collection__app__name']
    readonly_fields = ['id', 'request_count', 'created_at', 'updated_at', 'mock_url_display']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'collection', 'name', 'description', 'order')
        }),
        ('Endpoint Configuration', {
            'fields': ('path', 'method', 'protocol', 'mock_url_display')
        }),
        ('Response Configuration', {
            'fields': ('status_code', 'response_body', 'response_headers', 'content_type')
        }),
        ('Advanced Behaviors', {
            'fields': ('latency_min', 'latency_max', 'error_rate'),
            'classes': ('collapse',)
        }),
        ('State & Settings', {
            'fields': ('is_active', 'enable_logging')
        }),
        ('Statistics', {
            'fields': ('request_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_endpoints', 'deactivate_endpoints', 'reset_counters']

    def mock_url_display(self, obj):
        """Display the mock URL with a copy button"""
        url = obj.get_mock_url()
        return format_html(
            '<code style="background: #f0f0f0; padding: 5px; border-radius: 3px;">{}</code>',
            url
        )
    mock_url_display.short_description = 'Mock URL'

    def activate_endpoints(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} endpoint(s) activated successfully.')
    activate_endpoints.short_description = 'Activate selected endpoints'

    def deactivate_endpoints(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} endpoint(s) deactivated successfully.')
    deactivate_endpoints.short_description = 'Deactivate selected endpoints'

    def reset_counters(self, request, queryset):
        updated = queryset.update(request_count=0)
        self.message_user(request, f'Reset counters for {updated} endpoint(s).')
    reset_counters.short_description = 'Reset request counters'


@admin.register(MockResponse)
class MockResponseAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'endpoint', 'condition_type', 'status_code',
        'priority', 'usage_count', 'created_at'
    ]
    list_filter = ['condition_type', 'endpoint', 'created_at']
    search_fields = ['name', 'description', 'endpoint__name']
    readonly_fields = ['id', 'usage_count', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'endpoint', 'name', 'description', 'priority')
        }),
        ('Condition', {
            'fields': (
                'condition_type', 'condition_key', 'condition_value',
                'condition_probability'
            )
        }),
        ('Response', {
            'fields': ('status_code', 'response_body', 'response_headers')
        }),
        ('Statistics', {
            'fields': ('usage_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MockScenario)
class MockScenarioAdmin(admin.ModelAdmin):
    list_display = ['name', 'app', 'endpoint_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'app']
    search_fields = ['name', 'description', 'app__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['endpoints']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'app', 'name', 'description')
        }),
        ('Endpoints', {
            'fields': ('endpoints',)
        }),
        ('Configuration', {
            'fields': ('scenario_data', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def endpoint_count(self, obj):
        return obj.endpoints.count()
    endpoint_count.short_description = 'Endpoints'


@admin.register(MockRequest)
class MockRequestAdmin(admin.ModelAdmin):
    list_display = [
        'endpoint', 'method', 'response_status',
        'response_time_ms', 'ip_address', 'created_at'
    ]
    list_filter = ['method', 'response_status', 'endpoint', 'created_at']
    search_fields = ['endpoint__name', 'path', 'ip_address']
    readonly_fields = [
        'id', 'endpoint', 'method', 'path', 'query_params', 'headers',
        'body', 'response_status', 'response_body', 'response_headers',
        'response_time_ms', 'ip_address', 'user_agent', 'created_at'
    ]

    fieldsets = (
        ('Request', {
            'fields': (
                'id', 'endpoint', 'method', 'path',
                'query_params', 'headers', 'body'
            )
        }),
        ('Response', {
            'fields': (
                'response_status', 'response_body', 'response_headers',
                'response_time_ms'
            )
        }),
        ('Client Information', {
            'fields': ('ip_address', 'user_agent', 'created_at')
        }),
    )

    def has_add_permission(self, request):
        return False  # Logs are auto-created


@admin.register(MockSettings)
class MockSettingsAdmin(admin.ModelAdmin):
    list_display = ['enable_request_logging', 'max_requests_per_hour', 'log_retention_days']
    readonly_fields = ['id']

    fieldsets = (
        ('Logging', {
            'fields': ('enable_request_logging', 'log_retention_days')
        }),
        ('Rate Limiting', {
            'fields': ('max_requests_per_hour', 'max_endpoints_per_user', 'max_endpoints_pro', 'max_endpoints_enterprise')
        }),
    )

    def has_add_permission(self, request):
        # Only allow one settings instance
        return not MockSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Don't allow deleting the settings instance
        return False
