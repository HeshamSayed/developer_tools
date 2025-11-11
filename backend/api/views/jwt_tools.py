import json
import base64
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class JWTDecoderView(APIView):
    """Decode JWT tokens and display header, payload, and signature"""

    def post(self, request):
        start_time = time.time()
        try:
            token = request.data.get('token', '')

            if not token:
                return Response({
                    'success': False,
                    'error': 'JWT token is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Split JWT into parts
            parts = token.split('.')
            if len(parts) != 3:
                return Response({
                    'success': False,
                    'error': 'Invalid JWT format. Expected format: header.payload.signature'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Decode header
                header_data = self._decode_base64_url(parts[0])
                header = json.loads(header_data)

                # Decode payload
                payload_data = self._decode_base64_url(parts[1])
                payload = json.loads(payload_data)

                # Signature (keep as base64)
                signature = parts[2]

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'header': header,
                    'payload': payload,
                    'signature': signature,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'algorithm': header.get('alg', 'Unknown'),
                        'type': header.get('typ', 'Unknown')
                    }
                })
            except Exception as decode_error:
                return Response({
                    'success': False,
                    'error': f'Failed to decode JWT: {str(decode_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _decode_base64_url(self, data):
        """Decode base64url encoded data"""
        # Add padding if needed
        missing_padding = len(data) % 4
        if missing_padding:
            data += '=' * (4 - missing_padding)

        # Replace URL-safe characters
        data = data.replace('-', '+').replace('_', '/')

        # Decode
        return base64.b64decode(data).decode('utf-8')
