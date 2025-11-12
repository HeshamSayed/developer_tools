"""
Advanced Image Processing Views
Uses PIL, OpenCV, scikit-image for powerful image manipulation
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import cv2
import numpy as np
from io import BytesIO
import base64
import skimage
from skimage import exposure, filters, transform


def image_to_base64(image: Image.Image, format: str = 'PNG') -> str:
    """Convert PIL Image to base64 string"""
    buffered = BytesIO()
    image.save(buffered, format=format)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')


def base64_to_image(base64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image"""
    image_data = base64.b64decode(base64_string.split(',')[1] if ',' in base64_string else base64_string)
    return Image.open(BytesIO(image_data))


@api_view(['POST'])
def resize_image(request):
    """
    Advanced image resizing with multiple algorithms
    Supports: LANCZOS, BICUBIC, BILINEAR, NEAREST
    """
    try:
        image_data = request.data.get('image')
        width = int(request.data.get('width', 800))
        height = int(request.data.get('height', 600))
        algorithm = request.data.get('algorithm', 'LANCZOS')
        maintain_aspect = request.data.get('maintain_aspect', True)

        image = base64_to_image(image_data)

        if maintain_aspect:
            image.thumbnail((width, height), getattr(Image.Resampling, algorithm))
        else:
            image = image.resize((width, height), getattr(Image.Resampling, algorithm))

        return Response({
            'success': True,
            'image': image_to_base64(image),
            'width': image.width,
            'height': image.height
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def compress_image(request):
    """
    Advanced image compression with quality optimization
    Supports JPEG, PNG, WebP with optimal compression algorithms
    """
    try:
        image_data = request.data.get('image')
        quality = int(request.data.get('quality', 85))
        format_type = request.data.get('format', 'JPEG').upper()
        optimize = request.data.get('optimize', True)

        image = base64_to_image(image_data)

        # Convert RGBA to RGB for JPEG
        if format_type == 'JPEG' and image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background

        buffered = BytesIO()
        save_kwargs = {'quality': quality, 'optimize': optimize}

        if format_type == 'PNG':
            save_kwargs = {'optimize': optimize, 'compress_level': 9}
        elif format_type == 'WEBP':
            save_kwargs = {'quality': quality, 'method': 6}

        image.save(buffered, format=format_type, **save_kwargs)
        compressed_size = buffered.tell()

        return Response({
            'success': True,
            'image': base64.b64encode(buffered.getvalue()).decode('utf-8'),
            'size': compressed_size,
            'format': format_type
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def enhance_image(request):
    """
    Advanced image enhancement using PIL and OpenCV
    - Brightness, Contrast, Color, Sharpness
    - Auto-enhancement algorithms
    """
    try:
        image_data = request.data.get('image')
        brightness = float(request.data.get('brightness', 1.0))
        contrast = float(request.data.get('contrast', 1.0))
        color = float(request.data.get('color', 1.0))
        sharpness = float(request.data.get('sharpness', 1.0))
        auto_enhance = request.data.get('auto_enhance', False)

        image = base64_to_image(image_data)

        if auto_enhance:
            # Auto contrast and color equalization
            image = ImageOps.autocontrast(image)
            image = ImageOps.equalize(image)
        else:
            # Manual enhancements
            if brightness != 1.0:
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(brightness)

            if contrast != 1.0:
                enhancer = ImageEnhance.Contrast(image)
                image = enhancer.enhance(contrast)

            if color != 1.0:
                enhancer = ImageEnhance.Color(image)
                image = enhancer.enhance(color)

            if sharpness != 1.0:
                enhancer = ImageEnhance.Sharpness(image)
                image = enhancer.enhance(sharpness)

        return Response({
            'success': True,
            'image': image_to_base64(image)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def apply_filter(request):
    """
    Apply advanced filters using PIL and OpenCV
    Filters: blur, sharpen, edge_detect, emboss, contour, grayscale, sepia
    """
    try:
        image_data = request.data.get('image')
        filter_type = request.data.get('filter', 'blur')
        intensity = float(request.data.get('intensity', 1.0))

        image = base64_to_image(image_data)

        if filter_type == 'blur':
            image = image.filter(ImageFilter.GaussianBlur(radius=5 * intensity))
        elif filter_type == 'sharpen':
            image = image.filter(ImageFilter.SHARPEN)
        elif filter_type == 'edge_detect':
            image = image.filter(ImageFilter.FIND_EDGES)
        elif filter_type == 'emboss':
            image = image.filter(ImageFilter.EMBOSS)
        elif filter_type == 'contour':
            image = image.filter(ImageFilter.CONTOUR)
        elif filter_type == 'grayscale':
            image = ImageOps.grayscale(image)
        elif filter_type == 'sepia':
            # Convert to sepia tone
            image = image.convert('RGB')
            sepia_image = np.array(image)
            sepia_filter = np.array([[0.393, 0.769, 0.189],
                                     [0.349, 0.686, 0.168],
                                     [0.272, 0.534, 0.131]])
            sepia_image = cv2.transform(sepia_image, sepia_filter)
            sepia_image = np.clip(sepia_image, 0, 255).astype(np.uint8)
            image = Image.fromarray(sepia_image)
        elif filter_type == 'vintage':
            # Apply vintage effect
            image = ImageEnhance.Color(image).enhance(0.5)
            image = ImageEnhance.Contrast(image).enhance(1.2)

        return Response({
            'success': True,
            'image': image_to_base64(image),
            'filter': filter_type
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def remove_background(request):
    """
    Advanced background removal using OpenCV
    Uses GrabCut algorithm for smart background removal
    """
    try:
        image_data = request.data.get('image')

        image = base64_to_image(image_data)
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Create mask
        mask = np.zeros(image_cv.shape[:2], np.uint8)

        # Define rectangle for foreground
        rect = (10, 10, image_cv.shape[1]-10, image_cv.shape[0]-10)

        # Initialize background and foreground models
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        # Apply GrabCut algorithm
        cv2.grabCut(image_cv, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)

        # Create mask where sure and likely foreground are set to 1
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

        # Apply mask to image
        result = image_cv * mask2[:, :, np.newaxis]

        # Convert back to PIL Image with transparency
        result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGBA)
        result_rgb[:, :, 3] = mask2 * 255

        result_image = Image.fromarray(result_rgb, 'RGBA')

        return Response({
            'success': True,
            'image': image_to_base64(result_image, 'PNG')
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def detect_faces(request):
    """
    Face detection using OpenCV Haar Cascades
    Returns coordinates of detected faces
    """
    try:
        image_data = request.data.get('image')

        image = base64_to_image(image_data)
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)

        # Load Haar Cascade classifier
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        # Draw rectangles around faces
        for (x, y, w, h) in faces:
            cv2.rectangle(image_cv, (x, y), (x+w, y+h), (0, 255, 0), 2)

        result_image = Image.fromarray(cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB))

        return Response({
            'success': True,
            'image': image_to_base64(result_image),
            'faces_detected': len(faces),
            'faces': [{'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)} for (x, y, w, h) in faces]
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def image_to_sketch(request):
    """
    Convert image to pencil sketch using OpenCV
    """
    try:
        image_data = request.data.get('image')

        image = base64_to_image(image_data)
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)

        # Invert the grayscale image
        inverted = cv2.bitwise_not(gray)

        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(inverted, (21, 21), 0)

        # Invert the blurred image
        inverted_blur = cv2.bitwise_not(blurred)

        # Create sketch by dividing grayscale by inverted blur
        sketch = cv2.divide(gray, inverted_blur, scale=256.0)

        result_image = Image.fromarray(sketch)

        return Response({
            'success': True,
            'image': image_to_base64(result_image)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def rotate_image(request):
    """
    Advanced image rotation with automatic cropping
    """
    try:
        image_data = request.data.get('image')
        angle = float(request.data.get('angle', 90))
        expand = request.data.get('expand', True)

        image = base64_to_image(image_data)
        rotated = image.rotate(angle, expand=expand, fillcolor='white')

        return Response({
            'success': True,
            'image': image_to_base64(rotated),
            'angle': angle
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def watermark_image(request):
    """
    Add watermark to image with customizable position and opacity
    """
    try:
        image_data = request.data.get('image')
        watermark_text = request.data.get('watermark_text', 'Watermark')
        position = request.data.get('position', 'bottom-right')
        opacity = int(request.data.get('opacity', 128))

        image = base64_to_image(image_data).convert('RGBA')

        # Create watermark layer
        watermark = Image.new('RGBA', image.size, (255, 255, 255, 0))
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(watermark)

        # Try to use a font, fallback to default
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 36)
        except:
            font = ImageFont.load_default()

        # Calculate text position
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        if position == 'bottom-right':
            pos = (image.width - text_width - 10, image.height - text_height - 10)
        elif position == 'bottom-left':
            pos = (10, image.height - text_height - 10)
        elif position == 'top-right':
            pos = (image.width - text_width - 10, 10)
        elif position == 'top-left':
            pos = (10, 10)
        else:  # center
            pos = ((image.width - text_width) // 2, (image.height - text_height) // 2)

        draw.text(pos, watermark_text, fill=(255, 255, 255, opacity), font=font)

        # Composite watermark onto image
        result = Image.alpha_composite(image, watermark).convert('RGB')

        return Response({
            'success': True,
            'image': image_to_base64(result)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
