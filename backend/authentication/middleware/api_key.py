import time
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from authentication.models import APIKey, UserProfile, UsageLog
from django.conf import settings


class APIKeyMiddleware(MiddlewareMixin):
    """
    Middleware to validate API keys and track usage
    """

    def process_request(self, request):
        # Skip middleware for admin, auth, and static URLs
        exempt_paths = ['/admin/', '/api/auth/', '/static/', '/media/']
        if any(request.path.startswith(path) for path in exempt_paths):
            return None

        # Get API key from header
        api_key = request.META.get('HTTP_X_API_KEY') or request.META.get('HTTP_API_KEY')

        if api_key:
            try:
                # Validate API key
                key_obj = APIKey.objects.select_related('user', 'user__profile').get(key=api_key)

                if not key_obj.is_valid():
                    return JsonResponse({
                        'error': 'Invalid or expired API key',
                        'code': 'INVALID_API_KEY'
                    }, status=401)

                # Check if user can make request (quota check)
                profile = UserProfile.objects.get(user=key_obj.user)
                can_request, error_msg = profile.can_make_request()

                if not can_request:
                    return JsonResponse({
                        'error': error_msg,
                        'code': 'QUOTA_EXCEEDED',
                        'quota_info': {
                            'daily_used': profile.api_calls_today,
                            'daily_limit': profile.daily_quota,
                            'monthly_used': profile.api_calls_this_month,
                            'monthly_limit': profile.monthly_quota,
                        }
                    }, status=429)

                # Attach user and API key to request
                request.user = key_obj.user
                request.api_key = key_obj
                request.user_profile = profile

                # Record start time for response time tracking
                request._api_start_time = time.time()

            except APIKey.DoesNotExist:
                return JsonResponse({
                    'error': 'Invalid API key',
                    'code': 'INVALID_API_KEY'
                }, status=401)
            except UserProfile.DoesNotExist:
                return JsonResponse({
                    'error': 'User profile not found',
                    'code': 'PROFILE_NOT_FOUND'
                }, status=500)

        return None

    def process_response(self, request, response):
        # Track API usage if API key was used
        if hasattr(request, 'api_key') and hasattr(request, '_api_start_time'):
            try:
                # Calculate response time
                response_time_ms = (time.time() - request._api_start_time) * 1000

                # Get file size if present
                file_size = 0
                if hasattr(request, 'FILES'):
                    for file in request.FILES.values():
                        file_size += file.size

                # Determine tool name from path
                tool_name = self._extract_tool_name(request.path)

                # Calculate cost (basic implementation)
                cost_usd = self._calculate_cost(tool_name, file_size, response_time_ms)

                # Create usage log
                UsageLog.objects.create(
                    user=request.user,
                    api_key=request.api_key,
                    endpoint=request.path,
                    method=request.method,
                    tool_name=tool_name,
                    status_code=response.status_code,
                    response_time_ms=response_time_ms,
                    file_size_bytes=file_size,
                    cost_usd=cost_usd,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
                )

                # Increment usage counters
                if response.status_code < 500:  # Only count successful requests
                    request.user_profile.increment_usage()
                    request.api_key.record_usage()

                # Add usage headers to response
                response['X-RateLimit-Limit-Daily'] = str(request.user_profile.daily_quota)
                response['X-RateLimit-Remaining-Daily'] = str(
                    max(0, request.user_profile.daily_quota - request.user_profile.api_calls_today)
                )
                response['X-RateLimit-Limit-Monthly'] = str(request.user_profile.monthly_quota)
                response['X-RateLimit-Remaining-Monthly'] = str(
                    max(0, request.user_profile.monthly_quota - request.user_profile.api_calls_this_month)
                )

            except Exception as e:
                # Log error but don't fail the request
                print(f"Error tracking API usage: {e}")

        return response

    def _extract_tool_name(self, path):
        """Extract tool name from request path"""
        parts = path.strip('/').split('/')
        if len(parts) >= 2:
            return parts[-1] or parts[-2]
        return 'unknown'

    def _calculate_cost(self, tool_name, file_size_bytes, response_time_ms):
        """Calculate cost based on tool and usage"""
        # Basic cost calculation - can be enhanced
        tool_pricing = getattr(settings, 'TOOL_PRICING', {})

        if tool_name in tool_pricing:
            pricing = tool_pricing[tool_name]
            if 'price_per_call_usd' in pricing:
                return pricing['price_per_call_usd']
            elif 'price_per_mb_usd' in pricing and file_size_bytes > 0:
                file_size_mb = file_size_bytes / (1024 * 1024)
                return pricing['price_per_mb_usd'] * file_size_mb

        return 0.0

    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
