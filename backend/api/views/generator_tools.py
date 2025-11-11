import uuid
import time
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

try:
    import qrcode
    QRCODE_AVAILABLE = True
except ImportError:
    QRCODE_AVAILABLE = False


class UUIDGeneratorView(APIView):
    """Generate UUIDs (v1, v4)"""

    def post(self, request):
        start_time = time.time()
        try:
            version = request.data.get('version', 4)
            quantity = int(request.data.get('quantity', 1))

            if quantity < 1 or quantity > 100:
                return Response({
                    'success': False,
                    'error': 'Quantity must be between 1 and 100'
                }, status=status.HTTP_400_BAD_REQUEST)

            uuids = []
            for _ in range(quantity):
                if version == 1:
                    uuids.append(str(uuid.uuid1()))
                elif version == 4:
                    uuids.append(str(uuid.uuid4()))
                else:
                    return Response({
                        'success': False,
                        'error': 'Only UUID v1 and v4 are supported'
                    }, status=status.HTTP_400_BAD_REQUEST)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'uuids': uuids,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'version': version,
                    'quantity': quantity
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QRCodeGeneratorView(APIView):
    """Generate QR codes"""

    def post(self, request):
        start_time = time.time()

        if not QRCODE_AVAILABLE:
            return Response({
                'success': False,
                'error': 'QR code generation is not available. Install qrcode library.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            text = request.data.get('text', '')
            size = int(request.data.get('size', 10))
            error_correction = request.data.get('error_correction', 'M')

            if not text:
                return Response({
                    'success': False,
                    'error': 'Text is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Map error correction levels
            ec_map = {
                'L': qrcode.constants.ERROR_CORRECT_L,
                'M': qrcode.constants.ERROR_CORRECT_M,
                'Q': qrcode.constants.ERROR_CORRECT_Q,
                'H': qrcode.constants.ERROR_CORRECT_H,
            }

            ec_level = ec_map.get(error_correction, qrcode.constants.ERROR_CORRECT_M)

            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=ec_level,
                box_size=size,
                border=4,
            )
            qr.add_data(text)
            qr.make(fit=True)

            # Create ASCII art version for text representation
            matrix = qr.get_matrix()
            ascii_qr = '\n'.join(
                ''.join('██' if cell else '  ' for cell in row)
                for row in matrix
            )

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'ascii_qr': ascii_qr,
                'size': len(matrix),
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'error_correction': error_correction,
                    'text_length': len(text)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
