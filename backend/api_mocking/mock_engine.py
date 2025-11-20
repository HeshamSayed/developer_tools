"""
Mock Execution Engine
Handles dynamic response generation for mock endpoints based on conditions and templates.
"""
import time
import random
import json
import re
from typing import Dict, Any, Optional, Tuple
from django.http import JsonResponse, HttpResponse
from faker import Faker
from .models import MockEndpoint, MockResponse, MockRequest, MockSettings


class MockEngine:
    """
    Core engine for executing mock API requests and generating responses.
    """

    def __init__(self):
        self.settings = MockSettings.get_settings()
        self.faker = Faker()

    def process_request(
        self,
        endpoint: MockEndpoint,
        method: str,
        path: str,
        query_params: Dict[str, Any],
        headers: Dict[str, str],
        body: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[Dict[str, Any], int, Dict[str, str]]:
        """
        Process an incoming request to a mock endpoint and generate response.

        Returns:
            Tuple of (response_body, status_code, response_headers)
        """
        start_time = time.time()

        # Simulate latency if configured
        self._simulate_latency(endpoint)

        # Check if we should simulate an error
        if self._should_simulate_error(endpoint):
            response_body, status_code, response_headers = self._generate_error_response()
        else:
            # Find the best matching response based on conditions
            mock_response = self._find_matching_response(
                endpoint, query_params, headers, body
            )

            if mock_response:
                response_body, status_code, response_headers = self._generate_response_from_template(
                    mock_response.response_body,
                    mock_response.status_code,
                    mock_response.response_headers,
                    query_params,
                    headers,
                    body,
                    path
                )
                mock_response.increment_usage()
            else:
                # Use endpoint's default response
                response_body, status_code, response_headers = self._generate_response_from_template(
                    endpoint.response_body,
                    endpoint.status_code,
                    endpoint.response_headers,
                    query_params,
                    headers,
                    body,
                    path
                )

        # Ensure Content-Type header is set
        if 'Content-Type' not in response_headers:
            response_headers['Content-Type'] = endpoint.content_type

        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)

        # Log the request if logging is enabled
        if endpoint.enable_logging and self.settings.enable_request_logging:
            self._log_request(
                endpoint=endpoint,
                method=method,
                path=path,
                query_params=query_params,
                headers=headers,
                body=body,
                response_status=status_code,
                response_body=json.dumps(response_body) if isinstance(response_body, dict) else str(response_body),
                response_headers=response_headers,
                response_time_ms=response_time_ms,
                ip_address=ip_address,
                user_agent=user_agent
            )

        # Increment endpoint request counter
        endpoint.increment_request_count()

        return response_body, status_code, response_headers

    def _simulate_latency(self, endpoint: MockEndpoint):
        """Simulate network latency based on endpoint configuration"""
        if endpoint.latency_max > 0:
            latency_ms = random.randint(endpoint.latency_min, endpoint.latency_max)
            time.sleep(latency_ms / 1000.0)

    def _should_simulate_error(self, endpoint: MockEndpoint) -> bool:
        """Determine if we should simulate an error based on error_rate"""
        if endpoint.error_rate > 0:
            return random.random() * 100 < endpoint.error_rate
        return False

    def _generate_error_response(self) -> Tuple[Dict[str, Any], int, Dict[str, str]]:
        """Generate a simulated error response"""
        error_codes = [400, 404, 500, 502, 503]
        status_code = random.choice(error_codes)

        error_messages = {
            400: "Bad Request",
            404: "Not Found",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable"
        }

        response_body = {
            "error": error_messages.get(status_code, "Unknown Error"),
            "message": "This is a simulated error response",
            "code": status_code
        }

        return response_body, status_code, {}

    def _find_matching_response(
        self,
        endpoint: MockEndpoint,
        query_params: Dict[str, Any],
        headers: Dict[str, str],
        body: str
    ) -> Optional[MockResponse]:
        """
        Find the best matching MockResponse based on conditions.
        Responses are ordered by priority (highest first).
        """
        responses = endpoint.responses.all()

        for response in responses:
            if self._check_condition(response, query_params, headers, body):
                return response

        return None

    def _check_condition(
        self,
        response: MockResponse,
        query_params: Dict[str, Any],
        headers: Dict[str, str],
        body: str
    ) -> bool:
        """Check if a response's condition matches the current request"""
        if response.condition_type == 'default':
            return True

        elif response.condition_type == 'query_param':
            param_value = query_params.get(response.condition_key, '')
            return str(param_value) == response.condition_value

        elif response.condition_type == 'header':
            header_value = headers.get(response.condition_key, '')
            return header_value == response.condition_value

        elif response.condition_type == 'body_field':
            try:
                body_data = json.loads(body) if body else {}
                field_value = body_data.get(response.condition_key, '')
                return str(field_value) == response.condition_value
            except (json.JSONDecodeError, AttributeError):
                return False

        elif response.condition_type == 'random':
            return random.random() * 100 < response.condition_probability

        return False

    def _generate_response_from_template(
        self,
        template: str,
        status_code: int,
        custom_headers: Dict[str, str],
        query_params: Dict[str, Any],
        headers: Dict[str, str],
        body: str,
        path: str
    ) -> Tuple[Any, int, Dict[str, str]]:
        """
        Generate response by processing template with variable substitution.

        Supported template variables:
        Basic:
        - {{query.param_name}} - Query parameter
        - {{header.header_name}} - Request header
        - {{body.field_name}} - Request body field
        - {{path}} - Request path
        - {{random_int}} - Random integer (1000-9999)
        - {{random_uuid}} - Random UUID
        - {{timestamp}} - Current Unix timestamp
        - {{date}} - Current date (ISO format)

        Faker (Personal):
        - {{faker.name}} - Full name
        - {{faker.first_name}} - First name
        - {{faker.last_name}} - Last name
        - {{faker.email}} - Email address
        - {{faker.phone}} - Phone number
        - {{faker.address}} - Full address
        - {{faker.city}} - City name
        - {{faker.country}} - Country name
        - {{faker.zipcode}} - Zip code

        Faker (Internet):
        - {{faker.url}} - Random URL
        - {{faker.domain}} - Domain name
        - {{faker.username}} - Username
        - {{faker.ipv4}} - IPv4 address
        - {{faker.user_agent}} - User agent string

        Faker (Business):
        - {{faker.company}} - Company name
        - {{faker.job}} - Job title
        - {{faker.currency_code}} - Currency code (USD, EUR, etc.)

        Faker (Text):
        - {{faker.sentence}} - Random sentence
        - {{faker.paragraph}} - Random paragraph
        - {{faker.text}} - Random text (200 chars)
        - {{faker.word}} - Random word

        Faker (Numbers & Dates):
        - {{faker.random_number}} - Random number (1-99999)
        - {{faker.latitude}} - Latitude coordinate
        - {{faker.longitude}} - Longitude coordinate
        - {{faker.date}} - Random past date
        - {{faker.future_date}} - Random future date
        - {{faker.time}} - Random time

        Faker (Other):
        - {{faker.color}} - Color name
        - {{faker.hex_color}} - Hex color code
        - {{faker.credit_card}} - Credit card number
        - {{faker.uuid4}} - UUID v4
        - {{faker.boolean}} - Random boolean (true/false)
        """
        # Parse request body if JSON
        try:
            body_data = json.loads(body) if body else {}
        except (json.JSONDecodeError, ValueError):
            body_data = {}

        # Variable substitution context
        context = {
            'query': query_params,
            'headers': headers,
            'body': body_data,
            'path': path,
            'random_int': lambda: random.randint(1000, 9999),
            'random_uuid': lambda: str(__import__('uuid').uuid4()),
            'timestamp': lambda: int(time.time()),
            'date': lambda: time.strftime('%Y-%m-%d')
        }

        # Process template
        processed_template = self._process_template_variables(template, context)

        # Try to parse as JSON, otherwise return as plain text
        try:
            response_body = json.loads(processed_template)
        except (json.JSONDecodeError, ValueError):
            response_body = processed_template

        return response_body, status_code, custom_headers

    def _process_template_variables(self, template: str, context: Dict[str, Any]) -> str:
        """Replace template variables with actual values"""
        result = template

        # Replace {{query.param_name}}
        for key, value in context['query'].items():
            result = result.replace(f'{{{{query.{key}}}}}', str(value))

        # Replace {{header.header_name}}
        for key, value in context['headers'].items():
            result = result.replace(f'{{{{header.{key}}}}}', str(value))

        # Replace {{body.field_name}}
        if isinstance(context['body'], dict):
            for key, value in context['body'].items():
                result = result.replace(f'{{{{body.{key}}}}}', str(value))

        # Replace {{path}}
        result = result.replace('{{path}}', str(context['path']))

        # Replace basic variables
        while '{{random_int}}' in result:
            result = result.replace('{{random_int}}', str(context['random_int']()), 1)

        while '{{random_uuid}}' in result:
            result = result.replace('{{random_uuid}}', context['random_uuid'](), 1)

        result = result.replace('{{timestamp}}', str(context['timestamp']()))
        result = result.replace('{{date}}', context['date']())

        # Replace Faker variables using regex to handle all faker.* patterns
        faker_pattern = r'\{\{faker\.(\w+)\}\}'

        def replace_faker(match):
            faker_method = match.group(1)
            try:
                # Map common faker methods
                faker_map = {
                    # Personal
                    'name': lambda: self.faker.name(),
                    'first_name': lambda: self.faker.first_name(),
                    'last_name': lambda: self.faker.last_name(),
                    'email': lambda: self.faker.email(),
                    'phone': lambda: self.faker.phone_number(),
                    'address': lambda: self.faker.address(),
                    'city': lambda: self.faker.city(),
                    'country': lambda: self.faker.country(),
                    'zipcode': lambda: self.faker.zipcode(),
                    # Internet
                    'url': lambda: self.faker.url(),
                    'domain': lambda: self.faker.domain_name(),
                    'username': lambda: self.faker.user_name(),
                    'ipv4': lambda: self.faker.ipv4(),
                    'user_agent': lambda: self.faker.user_agent(),
                    # Business
                    'company': lambda: self.faker.company(),
                    'job': lambda: self.faker.job(),
                    'currency_code': lambda: self.faker.currency_code(),
                    # Text
                    'sentence': lambda: self.faker.sentence(),
                    'paragraph': lambda: self.faker.paragraph(),
                    'text': lambda: self.faker.text(),
                    'word': lambda: self.faker.word(),
                    # Numbers & Dates
                    'random_number': lambda: str(self.faker.random_int(1, 99999)),
                    'latitude': lambda: str(self.faker.latitude()),
                    'longitude': lambda: str(self.faker.longitude()),
                    'date': lambda: str(self.faker.date()),
                    'future_date': lambda: str(self.faker.future_date()),
                    'time': lambda: str(self.faker.time()),
                    # Other
                    'color': lambda: self.faker.color_name(),
                    'hex_color': lambda: self.faker.hex_color(),
                    'credit_card': lambda: self.faker.credit_card_number(),
                    'uuid4': lambda: str(self.faker.uuid4()),
                    'boolean': lambda: str(self.faker.boolean()).lower(),
                }

                if faker_method in faker_map:
                    return faker_map[faker_method]()
                else:
                    # Try to call the method directly on faker object
                    return str(getattr(self.faker, faker_method)())
            except (AttributeError, TypeError):
                # If method doesn't exist, return the original placeholder
                return match.group(0)

        result = re.sub(faker_pattern, replace_faker, result)

        return result

    def _log_request(
        self,
        endpoint: MockEndpoint,
        method: str,
        path: str,
        query_params: Dict[str, Any],
        headers: Dict[str, str],
        body: str,
        response_status: int,
        response_body: str,
        response_headers: Dict[str, str],
        response_time_ms: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log request details to database"""
        try:
            MockRequest.objects.create(
                endpoint=endpoint,
                method=method,
                path=path,
                query_params=query_params,
                headers=headers,
                body=body,
                response_status=response_status,
                response_body=response_body,
                response_headers=response_headers,
                response_time_ms=response_time_ms,
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            # Don't let logging failures break the mock response
            print(f"Failed to log request: {e}")


def create_http_response(response_body: Any, status_code: int, headers: Dict[str, str]) -> HttpResponse:
    """
    Create a Django HttpResponse from mock engine output.

    Args:
        response_body: Response body (dict, list, or string)
        status_code: HTTP status code
        headers: Response headers

    Returns:
        HttpResponse object
    """
    # Handle different response body types
    if isinstance(response_body, (dict, list)):
        response = JsonResponse(response_body, status=status_code, safe=False)
    else:
        response = HttpResponse(response_body, status=status_code)

    # Add custom headers
    for key, value in headers.items():
        response[key] = value

    return response
