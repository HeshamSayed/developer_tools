from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import json


class MockApp(models.Model):
    """
    Top-level organization for mock APIs (like a Postman Workspace).
    An app contains multiple collections of related endpoints.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mock_apps')
    name = models.CharField(max_length=255, help_text="App name (e.g., 'E-commerce API')")
    description = models.TextField(blank=True, help_text="What this app/project is for")
    icon = models.CharField(max_length=50, blank=True, help_text="Emoji or icon name")
    color = models.CharField(max_length=7, default='#6366f1', help_text="Hex color code")

    # Settings
    base_url = models.CharField(max_length=500, blank=True, help_text="Base URL for all endpoints")
    is_public = models.BooleanField(default=False, help_text="Allow public access to this app")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mock App'
        verbose_name_plural = 'Mock Apps'

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def total_collections(self):
        return self.collections.count()

    @property
    def total_endpoints(self):
        return MockEndpoint.objects.filter(collection__app=self).count()

    @property
    def total_requests(self):
        return sum(e.request_count for e in MockEndpoint.objects.filter(collection__app=self))


class MockCollection(models.Model):
    """
    A collection groups related endpoints together (like Postman Collections).
    Collections belong to an App.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    app = models.ForeignKey(MockApp, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=255, help_text="Collection name (e.g., 'User Management')")
    description = models.TextField(blank=True, help_text="What endpoints are in this collection")

    # Organization
    order = models.IntegerField(default=0, help_text="Display order within the app")
    folder = models.CharField(max_length=255, blank=True, help_text="Optional folder/category")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Mock Collection'
        verbose_name_plural = 'Mock Collections'

    def __str__(self):
        return f"{self.app.name} > {self.name}"

    @property
    def total_endpoints(self):
        return self.endpoints.count()

    @property
    def total_requests(self):
        return sum(e.request_count for e in self.endpoints.all())


class MockEnvironment(models.Model):
    """
    Environment variables for an app (dev, staging, production).
    Similar to Postman environments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    app = models.ForeignKey(MockApp, on_delete=models.CASCADE, related_name='environments')
    name = models.CharField(max_length=255, help_text="Environment name (e.g., 'Development')")
    variables = models.JSONField(default=dict, help_text="Key-value pairs of variables")
    is_active = models.BooleanField(default=False, help_text="Currently active environment")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Mock Environment'
        verbose_name_plural = 'Mock Environments'

    def __str__(self):
        return f"{self.app.name} - {self.name}"

    def save(self, *args, **kwargs):
        # If this is being set as active, deactivate others
        if self.is_active:
            MockEnvironment.objects.filter(app=self.app).update(is_active=False)
        super().save(*args, **kwargs)


class MockEndpoint(models.Model):
    """
    Represents a mock API endpoint that can be accessed by users.
    Supports multiple HTTP methods and dynamic response configuration.
    """
    HTTP_METHODS = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
        ('HEAD', 'HEAD'),
        ('OPTIONS', 'OPTIONS'),
    ]

    PROTOCOL_CHOICES = [
        ('rest', 'REST/JSON'),
        ('graphql', 'GraphQL'),
        ('soap', 'SOAP/XML'),
        ('toml', 'TOML'),
        ('yaml', 'YAML'),
    ]

    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(MockCollection, on_delete=models.CASCADE, related_name='endpoints', null=True, blank=True)
    name = models.CharField(max_length=255, help_text="Friendly name for this endpoint")
    description = models.TextField(blank=True, help_text="Description of what this mock endpoint does")

    # Organization
    order = models.IntegerField(default=0, help_text="Display order within collection")

    # Endpoint Configuration
    path = models.CharField(max_length=500, help_text="URL path (e.g., /api/users/:id)")
    method = models.CharField(max_length=10, choices=HTTP_METHODS, default='GET')
    protocol = models.CharField(max_length=20, choices=PROTOCOL_CHOICES, default='rest')

    # Response Configuration
    status_code = models.IntegerField(
        default=200,
        validators=[MinValueValidator(100), MaxValueValidator(599)],
        help_text="Default HTTP status code"
    )
    response_body = models.TextField(
        help_text="Response body template (supports variables like {{user_id}})"
    )
    response_headers = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom response headers as JSON object"
    )
    content_type = models.CharField(
        max_length=100,
        default='application/json',
        help_text="Content-Type header value"
    )

    # Advanced Behaviors
    latency_min = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Minimum response latency in milliseconds"
    )
    latency_max = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Maximum response latency in milliseconds (0 = no latency)"
    )
    error_rate = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Percentage of requests that should return errors (0-100)"
    )

    # State Management
    is_active = models.BooleanField(default=True, help_text="Whether this endpoint is active")
    enable_logging = models.BooleanField(default=True, help_text="Log requests to this endpoint")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    request_count = models.IntegerField(default=0, help_text="Total number of requests received")

    class Meta:
        ordering = ['order', '-created_at']
        unique_together = [['collection', 'path', 'method']]
        indexes = [
            models.Index(fields=['collection', 'is_active']),
            models.Index(fields=['path', 'method']),
        ]

    def __str__(self):
        return f"{self.method} {self.path} - {self.name}"

    def get_mock_url(self):
        """Returns the full URL where this mock can be accessed"""
        return f"/api/mock-api/execute/{self.id}/{self.path.lstrip('/')}"

    def increment_request_count(self):
        """Atomically increment request counter"""
        self.request_count = models.F('request_count') + 1
        self.save(update_fields=['request_count'])


class MockResponse(models.Model):
    """
    Alternative responses for an endpoint based on scenarios or conditions.
    Allows multiple response templates for the same endpoint.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.ForeignKey(MockEndpoint, on_delete=models.CASCADE, related_name='responses')

    # Response Identification
    name = models.CharField(max_length=255, help_text="Name for this response (e.g., 'Success', 'Not Found')")
    description = models.TextField(blank=True)

    # Condition for this response
    condition_type = models.CharField(
        max_length=50,
        choices=[
            ('default', 'Default Response'),
            ('query_param', 'Query Parameter Match'),
            ('header', 'Header Match'),
            ('body_field', 'Request Body Field Match'),
            ('random', 'Random (Percentage-based)'),
        ],
        default='default'
    )
    condition_key = models.CharField(
        max_length=255,
        blank=True,
        help_text="Key to check (param name, header name, or body field)"
    )
    condition_value = models.TextField(
        blank=True,
        help_text="Expected value for the condition"
    )
    condition_probability = models.FloatField(
        default=100.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Probability % this response is returned (for random type)"
    )

    # Response Data
    status_code = models.IntegerField(
        validators=[MinValueValidator(100), MaxValueValidator(599)]
    )
    response_body = models.TextField(help_text="Response body template")
    response_headers = models.JSONField(default=dict, blank=True)

    # Priority (higher = checked first)
    priority = models.IntegerField(default=0, help_text="Higher priority responses are evaluated first")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    usage_count = models.IntegerField(default=0, help_text="How many times this response was used")

    class Meta:
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['endpoint', 'priority']),
        ]

    def __str__(self):
        return f"{self.name} ({self.status_code}) - {self.endpoint.name}"

    def increment_usage(self):
        """Atomically increment usage counter"""
        self.usage_count = models.F('usage_count') + 1
        self.save(update_fields=['usage_count'])


class MockScenario(models.Model):
    """
    Predefined scenarios combining multiple endpoints for testing workflows.
    E.g., "User Registration Flow" with success/error paths.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    app = models.ForeignKey(MockApp, on_delete=models.CASCADE, related_name='scenarios', null=True, blank=True)

    # Scenario Details
    name = models.CharField(max_length=255, help_text="Scenario name (e.g., 'User Registration Flow')")
    description = models.TextField(help_text="What this scenario tests")

    # Endpoints in this scenario
    endpoints = models.ManyToManyField(
        MockEndpoint,
        related_name='scenarios',
        help_text="Endpoints included in this scenario"
    )

    # Scenario Configuration
    scenario_data = models.JSONField(
        default=dict,
        help_text="Additional scenario configuration (e.g., sequence, dependencies)"
    )

    # State
    is_active = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['app', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.endpoints.count()} endpoints)"


class MockRequest(models.Model):
    """
    Logs all requests made to mock endpoints for analytics and debugging.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.ForeignKey(
        MockEndpoint,
        on_delete=models.CASCADE,
        related_name='request_logs',
        null=True,
        blank=True
    )

    # Request Details
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    query_params = models.JSONField(default=dict, blank=True)
    headers = models.JSONField(default=dict, blank=True)
    body = models.TextField(blank=True, help_text="Request body")

    # Response Details
    response_status = models.IntegerField()
    response_body = models.TextField(blank=True)
    response_headers = models.JSONField(default=dict, blank=True)

    # Performance
    response_time_ms = models.IntegerField(help_text="Response time in milliseconds")

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['endpoint', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.method} {self.path} - {self.response_status} ({self.created_at})"


class MockSettings(models.Model):
    """
    Global settings for the API mocking service.
    Singleton model - only one instance exists.
    """
    # Rate Limiting
    max_requests_per_hour = models.IntegerField(
        default=1000,
        help_text="Maximum requests per hour per user"
    )
    max_endpoints_per_user = models.IntegerField(
        default=50,
        help_text="Maximum mock endpoints per user (Free tier)"
    )
    max_endpoints_pro = models.IntegerField(
        default=500,
        help_text="Maximum mock endpoints for Pro users"
    )
    max_endpoints_enterprise = models.IntegerField(
        default=-1,
        help_text="Maximum mock endpoints for Enterprise (-1 = unlimited)"
    )

    # Logging
    log_retention_days = models.IntegerField(
        default=30,
        help_text="How long to keep request logs"
    )
    enable_request_logging = models.BooleanField(
        default=True,
        help_text="Enable logging of all mock requests"
    )

    # Features
    enable_graphql = models.BooleanField(default=False, help_text="Enable GraphQL mocking")
    enable_soap = models.BooleanField(default=False, help_text="Enable SOAP/XML mocking")
    enable_advanced_scenarios = models.BooleanField(default=True)

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mock Settings"
        verbose_name_plural = "Mock Settings"

    def __str__(self):
        return "API Mocking Settings"

    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings

    def save(self, *args, **kwargs):
        """Ensure only one instance exists"""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent deletion"""
        pass
