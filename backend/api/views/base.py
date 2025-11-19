from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from authentication.authentication import APIKeyAuthentication


class AuthenticatedToolView(APIView):
    """
    Base view for all tools that requires authentication.
    Supports JWT token, session, and API key authentication.
    """
    authentication_classes = [JWTAuthentication, APIKeyAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]
