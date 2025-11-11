import base64
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class Base64EncodeView(APIView):
    """Encode text or data to Base64"""

    def post(self, request):
        start_time = time.time()
        try:
            data = request.data.get('input', '')

            if not data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Encode to base64
            encoded = base64.b64encode(data.encode('utf-8')).decode('utf-8')

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': encoded,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'original_size': len(data),
                    'encoded_size': len(encoded)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Base64DecodeView(APIView):
    """Decode Base64 to text"""

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
                # Decode from base64
                decoded_bytes = base64.b64decode(data)
                decoded = decoded_bytes.decode('utf-8')

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': decoded,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'encoded_size': len(data),
                        'decoded_size': len(decoded)
                    }
                })
            except Exception as decode_error:
                return Response({
                    'success': False,
                    'error': f'Invalid Base64 string: {str(decode_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
