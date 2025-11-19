"""
Custom authentication backends for API keys
"""
from rest_framework import authentication, exceptions
from django.conf import settings
from .models import APIKey, UserProfile


class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication backend for API keys.
    Clients should authenticate by passing the API key in the "X-API-Key" HTTP header.
    """

    def authenticate(self, request):
        api_key_header = request.META.get("HTTP_X_API_KEY")

        if not api_key_header:
            return None  # No API key provided, try other authentication methods

        try:
            api_key = APIKey.objects.select_related("user").get(key=api_key_header)

            # Check if API key is valid
            if not api_key.is_valid():
                raise exceptions.AuthenticationFailed("Invalid or expired API key")

            # Check if user profile allows requests
            try:
                profile = UserProfile.objects.get(user=api_key.user)
                can_request, error = profile.can_make_request()

                if not can_request:
                    raise exceptions.AuthenticationFailed(error)
            except UserProfile.DoesNotExist:
                raise exceptions.AuthenticationFailed("User profile not found")

            # Record API key usage
            api_key.record_usage()

            # Return the user and None (no credentials to check)
            # We also attach the api_key to the request for tracking
            request.api_key = api_key
            return (api_key.user, None)

        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed("Invalid API key")

    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the WWW-Authenticate
        header in a 401 Unauthenticated response.
        """
        return "X-API-Key"
