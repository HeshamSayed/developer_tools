import uuid
import time
import io
import base64
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status
from PIL import Image, ImageDraw

try:
    import qrcode
    QRCODE_AVAILABLE = True
except ImportError:
    QRCODE_AVAILABLE = False


class UUIDGeneratorView(AuthenticatedToolView):
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


class QRCodeGeneratorView(AuthenticatedToolView):
    """Generate QR codes with image output"""

    def post(self, request):
        start_time = time.time()

        if not QRCODE_AVAILABLE:
            return Response({
                'success': False,
                'error': 'QR code generation is not available. Install qrcode library.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            text = request.data.get('text', '')
            box_size = int(request.data.get('box_size', 10))
            border = int(request.data.get('border', 4))
            error_correction = request.data.get('error_correction', 'M')
            fill_color = request.data.get('fill_color', '#000000')
            back_color = request.data.get('back_color', '#FFFFFF')
            output_format = request.data.get('output_format', 'png').lower()

            if not text:
                return Response({
                    'success': False,
                    'error': 'Text is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate text length (QR codes have limits)
            if len(text) > 2953:  # Max for alphanumeric with low error correction
                return Response({
                    'success': False,
                    'error': 'Text is too long. Maximum 2953 characters.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Map error correction levels
            ec_map = {
                'L': qrcode.constants.ERROR_CORRECT_L,  # 7% correction
                'M': qrcode.constants.ERROR_CORRECT_M,  # 15% correction
                'Q': qrcode.constants.ERROR_CORRECT_Q,  # 25% correction
                'H': qrcode.constants.ERROR_CORRECT_H,  # 30% correction
            }

            ec_level = ec_map.get(error_correction, qrcode.constants.ERROR_CORRECT_M)

            # Generate QR code
            qr = qrcode.QRCode(
                version=None,  # Auto-determine version based on data
                error_correction=ec_level,
                box_size=box_size,
                border=border,
            )
            qr.add_data(text)
            qr.make(fit=True)

            # Create image
            img = qr.make_image(fill_color=fill_color, back_color=back_color)

            # Convert to bytes
            buffer = io.BytesIO()
            if output_format == 'png':
                img.save(buffer, format='PNG', optimize=True)
            elif output_format == 'jpg' or output_format == 'jpeg':
                # Convert to RGB for JPEG (remove alpha channel)
                rgb_img = img.convert('RGB')
                rgb_img.save(buffer, format='JPEG', quality=95, optimize=True)
            else:
                img.save(buffer, format='PNG', optimize=True)

            buffer.seek(0)

            # Convert to base64
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

            # Create data URI
            mime_type = 'image/png' if output_format == 'png' else 'image/jpeg'
            data_uri = f"data:{mime_type};base64,{image_base64}"

            # Get image dimensions
            img_size = img.size

            # Create ASCII art version for preview
            matrix = qr.get_matrix()
            ascii_qr = '\n'.join(
                ''.join('██' if cell else '  ' for cell in row)
                for row in matrix
            )

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'imageData': image_base64,
                'dataUri': data_uri,
                'ascii_qr': ascii_qr,
                'format': output_format.upper(),
                'mimeType': mime_type,
                'width': img_size[0],
                'height': img_size[1],
                'qr_version': qr.version,
                'statistics': {
                    'text_length': len(text),
                    'matrix_size': len(matrix),
                    'error_correction': error_correction,
                    'box_size': box_size,
                    'border': border,
                    'image_size_bytes': len(image_base64),
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
