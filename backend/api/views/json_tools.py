import json
import time
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status
from analytics.models import ToolUsage


class JSONFormatterView(AuthenticatedToolView):
    """Format/prettify JSON with proper indentation"""

    def post(self, request):
        start_time = time.time()
        try:
            data = request.data.get('input', '')
            indent = request.data.get('indent', 2)

            if not data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse and format JSON
            try:
                parsed = json.loads(data)
                formatted = json.dumps(parsed, indent=indent, ensure_ascii=False)

                # Track usage
                processing_time = (time.time() - start_time) * 1000
                self._track_usage('json-formatter', request, processing_time, True)

                return Response({
                    'success': True,
                    'result': formatted,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })
            except json.JSONDecodeError as e:
                # Track failed usage
                processing_time = (time.time() - start_time) * 1000
                self._track_usage('json-formatter', request, processing_time, False, str(e))

                return Response({
                    'success': False,
                    'error': f'Invalid JSON: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            self._track_usage('json-formatter', request, processing_time, False, str(e))

            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _track_usage(self, tool_slug, request, processing_time, success, error_message=''):
        """Track tool usage for analytics"""
        try:
            ToolUsage.objects.create(
                tool_slug=tool_slug,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_id=request.session.session_key or '',
                processing_time=processing_time,
                success=success,
                error_message=error_message
            )
        except Exception:
            pass  # Don't fail the request if analytics tracking fails

    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class JSONValidatorView(AuthenticatedToolView):
    """Validate JSON and provide detailed error information"""

    def post(self, request):
        start_time = time.time()
        try:
            data = request.data.get('input', '')

            if not data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                parsed = json.loads(data)
                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'valid': True,
                    'message': 'Valid JSON',
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'type': type(parsed).__name__
                    }
                })
            except json.JSONDecodeError as e:
                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'valid': False,
                    'error': str(e),
                    'error_details': {
                        'line': e.lineno,
                        'column': e.colno,
                        'position': e.pos
                    },
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JSONMinifyView(AuthenticatedToolView):
    """Minify JSON by removing whitespace"""

    def post(self, request):
        start_time = time.time()
        try:
            data = request.data.get('input', '')

            if not data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                parsed = json.loads(data)
                minified = json.dumps(parsed, separators=(',', ':'), ensure_ascii=False)

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': minified,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'original_size': len(data),
                        'minified_size': len(minified),
                        'reduction': round((1 - len(minified) / len(data)) * 100, 2)
                    }
                })
            except json.JSONDecodeError as e:
                return Response({
                    'success': False,
                    'error': f'Invalid JSON: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
