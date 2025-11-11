from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class ToolException(Exception):
    """Custom exception for tool-specific errors"""
    pass


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize error response format
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = custom_response_data
    else:
        # Handle unexpected exceptions
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        custom_response_data = {
            'success': False,
            'error': {
                'message': 'An unexpected error occurred. Please try again.',
                'details': str(exc) if hasattr(exc, '__str__') else 'Unknown error'
            }
        }
        response = Response(
            custom_response_data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
