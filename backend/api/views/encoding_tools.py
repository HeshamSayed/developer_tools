import time
import html
from urllib.parse import quote, unquote
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class URLEncodeView(AuthenticatedToolView):
    """Encode text for URLs"""

    def post(self, request):
        start_time = time.time()
        try:
            text = request.data.get('input', '')

            if not text:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            encoded = quote(text)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': encoded,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class URLDecodeView(AuthenticatedToolView):
    """Decode URL-encoded text"""

    def post(self, request):
        start_time = time.time()
        try:
            text = request.data.get('input', '')

            if not text:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                decoded = unquote(text)

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': decoded,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })
            except Exception as decode_error:
                return Response({
                    'success': False,
                    'error': f'Failed to decode: {str(decode_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HTMLEncodeView(AuthenticatedToolView):
    """Encode HTML entities"""

    def post(self, request):
        start_time = time.time()
        try:
            text = request.data.get('input', '')

            if not text:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            encoded = html.escape(text)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': encoded,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HTMLDecodeView(AuthenticatedToolView):
    """Decode HTML entities"""

    def post(self, request):
        start_time = time.time()
        try:
            text = request.data.get('input', '')

            if not text:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            decoded = html.unescape(text)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': decoded,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
