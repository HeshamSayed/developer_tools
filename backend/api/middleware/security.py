"""
Security middleware for input validation and sanitization
"""
import logging
import json
from django.http import JsonResponse
from django.conf import settings
import bleach

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """
    Custom security middleware for input validation and sanitization
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Validate request size
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length:
            try:
                content_length = int(content_length)
                if content_length > settings.DATA_UPLOAD_MAX_MEMORY_SIZE:
                    logger.warning(f"Request too large: {content_length} bytes from {self.get_client_ip(request)}")
                    return JsonResponse({
                        'error': 'Request payload too large',
                        'max_size': f'{settings.DATA_UPLOAD_MAX_MEMORY_SIZE} bytes'
                    }, status=413)
            except (ValueError, TypeError):
                pass  # Invalid content length, let Django handle it

        # Validate JSON payloads
        if request.content_type == 'application/json' and request.body:
            try:
                # Check JSON size
                if len(request.body) > settings.MAX_JSON_SIZE:
                    return JsonResponse({
                        'error': 'JSON payload too large',
                        'max_size': f'{settings.MAX_JSON_SIZE} bytes'
                    }, status=413)

                # Validate JSON structure
                json.loads(request.body)
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON from {self.get_client_ip(request)}: {str(e)}")
                return JsonResponse({
                    'error': 'Invalid JSON payload',
                    'detail': str(e)
                }, status=400)

        # Process request
        response = self.get_response(request)

        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        return response

    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class InputSanitizationMixin:
    """
    Mixin for sanitizing user inputs in API views
    """

    @staticmethod
    def sanitize_text(text, max_length=None):
        """
        Sanitize text input by removing HTML tags and limiting length
        """
        if not isinstance(text, str):
            return text

        # Remove HTML tags
        sanitized = bleach.clean(text, tags=[], strip=True)

        # Limit length
        if max_length:
            sanitized = sanitized[:max_length]
        elif hasattr(settings, 'MAX_TEXT_LENGTH'):
            sanitized = sanitized[:settings.MAX_TEXT_LENGTH]

        return sanitized.strip()

    @staticmethod
    def validate_file_upload(file, allowed_types=None, max_size=None):
        """
        Validate uploaded file type and size
        """
        if not file:
            raise ValueError("No file provided")

        # Check file size
        max_upload_size = max_size or getattr(settings, 'MAX_UPLOAD_SIZE', 10485760)
        if file.size > max_upload_size:
            raise ValueError(f"File too large. Maximum size: {max_upload_size} bytes")

        # Check file type
        allowed_file_types = allowed_types or getattr(settings, 'ALLOWED_IMAGE_TYPES', [])
        if allowed_file_types and file.content_type not in allowed_file_types:
            raise ValueError(f"File type not allowed. Allowed types: {', '.join(allowed_file_types)}")

        return True

    @staticmethod
    def validate_url(url):
        """
        Validate URL format
        """
        import re
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)

        if not url_pattern.match(url):
            raise ValueError("Invalid URL format")

        # Prevent SSRF attacks - block internal IPs
        internal_ips = ['127.0.0.1', 'localhost', '0.0.0.0', '::1']
        for internal_ip in internal_ips:
            if internal_ip in url.lower():
                raise ValueError("Access to internal resources is not allowed")

        return True

    @staticmethod
    def validate_email(email):
        """
        Validate email format
        """
        import re
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

        if not email_pattern.match(email):
            raise ValueError("Invalid email format")

        if len(email) > 254:  # RFC 5321
            raise ValueError("Email address too long")

        return True
