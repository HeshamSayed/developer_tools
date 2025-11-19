from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from PIL import Image
import base64
import io
import os


@api_view(['POST'])
def image_to_base64(request):
    """
    Convert uploaded image to Base64 string with format options.
    """
    try:
        # Check if file was uploaded
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        image_file = request.FILES['image']
        output_format = request.data.get('outputFormat', 'png').lower()  # png, jpg, webp
        include_data_uri = request.data.get('includeDataUri', True)
        quality = int(request.data.get('quality', 85))  # 1-100 for JPEG

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            return Response(
                {'error': f'File too large. Maximum size is {max_size / (1024 * 1024)}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate format
        valid_formats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']
        if output_format not in valid_formats:
            return Response(
                {'error': f'Invalid output format. Supported: {", ".join(valid_formats)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Open and process image
            img = Image.open(image_file)

            # Convert RGBA to RGB if saving as JPEG
            if output_format in ['jpg', 'jpeg'] and img.mode in ['RGBA', 'LA', 'P']:
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Save to bytes buffer
            buffer = io.BytesIO()

            # Normalize format
            save_format = output_format.upper()
            if save_format == 'JPG':
                save_format = 'JPEG'

            # Save with appropriate options
            if save_format == 'JPEG':
                img.save(buffer, format=save_format, quality=quality, optimize=True)
            elif save_format == 'PNG':
                img.save(buffer, format=save_format, optimize=True)
            elif save_format == 'WEBP':
                img.save(buffer, format=save_format, quality=quality)
            else:
                img.save(buffer, format=save_format)

            buffer.seek(0)

            # Convert to base64
            base64_string = base64.b64encode(buffer.read()).decode('utf-8')

            # Get MIME type
            mime_types = {
                'PNG': 'image/png',
                'JPEG': 'image/jpeg',
                'WEBP': 'image/webp',
                'GIF': 'image/gif',
                'BMP': 'image/bmp'
            }
            mime_type = mime_types.get(save_format, 'image/png')

            # Create data URI if requested
            data_uri = f"data:{mime_type};base64,{base64_string}" if include_data_uri else base64_string

            # Calculate sizes
            original_size = image_file.size
            base64_size = len(base64_string)
            data_uri_size = len(data_uri) if include_data_uri else base64_size

            result = {
                'base64': base64_string,
                'dataUri': data_uri if include_data_uri else None,
                'mimeType': mime_type,
                'format': save_format,
                'width': img.width,
                'height': img.height,
                'originalFilename': image_file.name,
                'statistics': {
                    'originalSize': original_size,
                    'originalSizeFormatted': format_bytes(original_size),
                    'base64Size': base64_size,
                    'base64SizeFormatted': format_bytes(base64_size),
                    'dataUriSize': data_uri_size,
                    'dataUriSizeFormatted': format_bytes(data_uri_size),
                    'increase': round((base64_size / original_size - 1) * 100, 2) if original_size > 0 else 0
                }
            }

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Failed to process image: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Failed to convert image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def base64_to_image(request):
    """
    Convert Base64 string to image with format conversion options.
    """
    try:
        data = request.data
        base64_string = data.get('base64', '')
        output_format = data.get('outputFormat', 'png').lower()  # png, jpg, webp, gif, bmp
        quality = int(data.get('quality', 85))  # 1-100 for JPEG/WebP
        resize_width = data.get('resizeWidth')
        resize_height = data.get('resizeHeight')

        if not base64_string:
            return Response(
                {'error': 'Base64 string is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate format
        valid_formats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']
        if output_format not in valid_formats:
            return Response(
                {'error': f'Invalid output format. Supported: {", ".join(valid_formats)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Remove data URI prefix if present
            if ',' in base64_string and base64_string.startswith('data:'):
                base64_string = base64_string.split(',', 1)[1]

            # Remove whitespace
            base64_string = base64_string.strip().replace('\n', '').replace('\r', '').replace(' ', '')

            # Decode base64
            image_data = base64.b64decode(base64_string)

            # Open image
            img = Image.open(io.BytesIO(image_data))

            original_width = img.width
            original_height = img.height
            original_format = img.format or 'UNKNOWN'

            # Resize if requested
            if resize_width or resize_height:
                if resize_width and resize_height:
                    new_size = (int(resize_width), int(resize_height))
                elif resize_width:
                    ratio = int(resize_width) / img.width
                    new_size = (int(resize_width), int(img.height * ratio))
                else:
                    ratio = int(resize_height) / img.height
                    new_size = (int(img.width * ratio), int(resize_height))

                img = img.resize(new_size, Image.Resampling.LANCZOS)

            # Convert RGBA to RGB if saving as JPEG
            if output_format in ['jpg', 'jpeg'] and img.mode in ['RGBA', 'LA', 'P']:
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Save to buffer
            buffer = io.BytesIO()

            # Normalize format
            save_format = output_format.upper()
            if save_format == 'JPG':
                save_format = 'JPEG'

            # Save with appropriate options
            if save_format == 'JPEG':
                img.save(buffer, format=save_format, quality=quality, optimize=True)
            elif save_format == 'PNG':
                img.save(buffer, format=save_format, optimize=True)
            elif save_format == 'WEBP':
                img.save(buffer, format=save_format, quality=quality)
            else:
                img.save(buffer, format=save_format)

            buffer.seek(0)

            # Convert back to base64 for response
            output_base64 = base64.b64encode(buffer.read()).decode('utf-8')

            # Get MIME type
            mime_types = {
                'PNG': 'image/png',
                'JPEG': 'image/jpeg',
                'WEBP': 'image/webp',
                'GIF': 'image/gif',
                'BMP': 'image/bmp'
            }
            mime_type = mime_types.get(save_format, 'image/png')

            # Create data URI
            data_uri = f"data:{mime_type};base64,{output_base64}"

            result = {
                'imageData': output_base64,
                'dataUri': data_uri,
                'mimeType': mime_type,
                'format': save_format,
                'width': img.width,
                'height': img.height,
                'originalFormat': original_format,
                'statistics': {
                    'originalWidth': original_width,
                    'originalHeight': original_height,
                    'newWidth': img.width,
                    'newHeight': img.height,
                    'inputSize': len(base64_string),
                    'inputSizeFormatted': format_bytes(len(base64_string)),
                    'outputSize': len(output_base64),
                    'outputSizeFormatted': format_bytes(len(output_base64))
                }
            }

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Failed to decode or process Base64 string: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Failed to convert Base64 to image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def format_bytes(bytes_count):
    """Format bytes to human readable format."""
    if bytes_count < 1024:
        return f"{bytes_count} B"
    elif bytes_count < 1024 * 1024:
        return f"{round(bytes_count / 1024, 2)} KB"
    else:
        return f"{round(bytes_count / (1024 * 1024), 2)} MB"
