"""
Advanced PDF Processing Views
Uses PyPDF2, reportlab, pdfplumber for powerful PDF manipulation
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
import pdfplumber
from io import BytesIO
import base64
from PIL import Image


def pdf_to_base64(pdf_bytes: bytes) -> str:
    """Convert PDF bytes to base64 string"""
    return base64.b64encode(pdf_bytes).decode('utf-8')


def base64_to_pdf(base64_string: str) -> BytesIO:
    """Convert base64 string to PDF BytesIO"""
    pdf_data = base64.b64decode(base64_string.split(',')[1] if ',' in base64_string else base64_string)
    return BytesIO(pdf_data)


@api_view(['POST'])
def merge_pdfs(request):
    """
    Merge multiple PDFs into a single document
    """
    try:
        pdf_files = request.data.get('pdfs', [])

        if len(pdf_files) < 2:
            return Response({
                'success': False,
                'error': 'At least 2 PDF files are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        merger = PdfMerger()

        for pdf_data in pdf_files:
            pdf_file = base64_to_pdf(pdf_data)
            merger.append(pdf_file)

        output = BytesIO()
        merger.write(output)
        merger.close()

        return Response({
            'success': True,
            'pdf': pdf_to_base64(output.getvalue()),
            'pages': len(merger.pages) if hasattr(merger, 'pages') else 'unknown'
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def split_pdf(request):
    """
    Split PDF into individual pages or ranges
    """
    try:
        pdf_data = request.data.get('pdf')
        split_type = request.data.get('split_type', 'all')  # 'all', 'range', 'single'
        page_ranges = request.data.get('page_ranges', [])  # e.g., [[1, 3], [5, 7]]

        pdf_file = base64_to_pdf(pdf_data)
        reader = PdfReader(pdf_file)

        results = []

        if split_type == 'all':
            # Split into individual pages
            for i, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                output = BytesIO()
                writer.write(output)
                results.append({
                    'page_number': i + 1,
                    'pdf': pdf_to_base64(output.getvalue())
                })
        elif split_type == 'range' and page_ranges:
            # Split by ranges
            for range_idx, (start, end) in enumerate(page_ranges):
                writer = PdfWriter()
                for i in range(start - 1, min(end, len(reader.pages))):
                    writer.add_page(reader.pages[i])
                output = BytesIO()
                writer.write(output)
                results.append({
                    'range': f'{start}-{end}',
                    'pdf': pdf_to_base64(output.getvalue())
                })

        return Response({
            'success': True,
            'total_pages': len(reader.pages),
            'results': results
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def extract_pdf_text(request):
    """
    Extract text content from PDF using pdfplumber
    """
    try:
        pdf_data = request.data.get('pdf')
        page_numbers = request.data.get('pages', None)  # None = all pages, or list of page numbers

        pdf_file = base64_to_pdf(pdf_data)

        text_by_page = []

        with pdfplumber.open(pdf_file) as pdf:
            pages_to_extract = page_numbers if page_numbers else range(len(pdf.pages))

            for i in pages_to_extract:
                if isinstance(i, int) and 0 <= i < len(pdf.pages):
                    page = pdf.pages[i]
                    text = page.extract_text()
                    text_by_page.append({
                        'page_number': i + 1,
                        'text': text or ''
                    })

        return Response({
            'success': True,
            'total_pages': len(text_by_page),
            'pages': text_by_page
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def extract_pdf_tables(request):
    """
    Extract tables from PDF using pdfplumber
    """
    try:
        pdf_data = request.data.get('pdf')

        pdf_file = base64_to_pdf(pdf_data)

        tables_by_page = []

        with pdfplumber.open(pdf_file) as pdf:
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                if tables:
                    tables_by_page.append({
                        'page_number': i + 1,
                        'tables': tables,
                        'table_count': len(tables)
                    })

        return Response({
            'success': True,
            'total_tables': sum(t['table_count'] for t in tables_by_page),
            'pages': tables_by_page
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def rotate_pdf(request):
    """
    Rotate PDF pages by specified angle
    """
    try:
        pdf_data = request.data.get('pdf')
        angle = int(request.data.get('angle', 90))  # 90, 180, 270
        pages = request.data.get('pages', 'all')  # 'all' or list of page numbers

        pdf_file = base64_to_pdf(pdf_data)
        reader = PdfReader(pdf_file)
        writer = PdfWriter()

        for i, page in enumerate(reader.pages):
            if pages == 'all' or (i + 1) in pages:
                page.rotate(angle)
            writer.add_page(page)

        output = BytesIO()
        writer.write(output)

        return Response({
            'success': True,
            'pdf': pdf_to_base64(output.getvalue()),
            'angle': angle
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def compress_pdf(request):
    """
    Compress PDF by reducing image quality
    """
    try:
        pdf_data = request.data.get('pdf')
        quality = int(request.data.get('quality', 50))

        pdf_file = base64_to_pdf(pdf_data)
        reader = PdfReader(pdf_file)
        writer = PdfWriter()

        for page in reader.pages:
            # Compress page
            page.compress_content_streams()
            writer.add_page(page)

        # Set compression
        for page in writer.pages:
            page.compress_content_streams()

        output = BytesIO()
        writer.write(output)

        original_size = len(base64.b64decode(pdf_data.split(',')[1] if ',' in pdf_data else pdf_data))
        compressed_size = len(output.getvalue())
        compression_ratio = (1 - compressed_size / original_size) * 100

        return Response({
            'success': True,
            'pdf': pdf_to_base64(output.getvalue()),
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': f'{compression_ratio:.2f}%'
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def add_watermark(request):
    """
    Add watermark to PDF pages
    """
    try:
        pdf_data = request.data.get('pdf')
        watermark_text = request.data.get('watermark_text', 'CONFIDENTIAL')
        position = request.data.get('position', 'center')  # 'center', 'top', 'bottom'

        pdf_file = base64_to_pdf(pdf_data)
        reader = PdfReader(pdf_file)

        # Create watermark PDF
        watermark_buffer = BytesIO()
        c = canvas.Canvas(watermark_buffer, pagesize=letter)

        # Set watermark properties
        c.setFont('Helvetica', 60)
        c.setFillAlpha(0.3)

        if position == 'center':
            c.drawCentredString(300, 400, watermark_text)
        elif position == 'top':
            c.drawCentredString(300, 700, watermark_text)
        elif position == 'bottom':
            c.drawCentredString(300, 100, watermark_text)

        c.save()
        watermark_buffer.seek(0)

        watermark_reader = PdfReader(watermark_buffer)
        watermark_page = watermark_reader.pages[0]

        writer = PdfWriter()

        # Merge watermark with each page
        for page in reader.pages:
            page.merge_page(watermark_page)
            writer.add_page(page)

        output = BytesIO()
        writer.write(output)

        return Response({
            'success': True,
            'pdf': pdf_to_base64(output.getvalue())
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pdf_to_images(request):
    """
    Convert PDF pages to images
    """
    try:
        pdf_data = request.data.get('pdf')
        dpi = int(request.data.get('dpi', 200))
        format_type = request.data.get('format', 'PNG').upper()

        pdf_file = base64_to_pdf(pdf_data)

        # Note: This requires pdf2image library with poppler-utils
        # For now, return info that this feature requires additional setup
        return Response({
            'success': False,
            'error': 'PDF to image conversion requires pdf2image and poppler-utils to be installed',
            'info': 'This feature will be available once the dependencies are configured'
        }, status=status.HTTP_501_NOT_IMPLEMENTED)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def get_pdf_info(request):
    """
    Get metadata and information about PDF
    """
    try:
        pdf_data = request.data.get('pdf')

        pdf_file = base64_to_pdf(pdf_data)
        reader = PdfReader(pdf_file)

        metadata = reader.metadata

        return Response({
            'success': True,
            'info': {
                'pages': len(reader.pages),
                'title': metadata.get('/Title', 'N/A') if metadata else 'N/A',
                'author': metadata.get('/Author', 'N/A') if metadata else 'N/A',
                'subject': metadata.get('/Subject', 'N/A') if metadata else 'N/A',
                'creator': metadata.get('/Creator', 'N/A') if metadata else 'N/A',
                'producer': metadata.get('/Producer', 'N/A') if metadata else 'N/A',
                'creation_date': str(metadata.get('/CreationDate', 'N/A')) if metadata else 'N/A',
            }
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_pdf_from_text(request):
    """
    Create PDF from text content
    """
    try:
        text = request.data.get('text', '')
        title = request.data.get('title', 'Document')
        page_size = request.data.get('page_size', 'letter')  # 'letter' or 'a4'

        # Create PDF buffer
        buffer = BytesIO()
        size = letter if page_size == 'letter' else A4
        c = canvas.Canvas(buffer, pagesize=size)

        # Set title
        c.setTitle(title)

        # Add text
        text_object = c.beginText(40, size[1] - 40)
        text_object.setFont('Helvetica', 12)

        for line in text.split('\n'):
            text_object.textLine(line)

        c.drawText(text_object)
        c.save()

        return Response({
            'success': True,
            'pdf': pdf_to_base64(buffer.getvalue())
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
