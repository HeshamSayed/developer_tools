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


# ============================================
# ADVANCED DOCUMENT CONVERSION
# ============================================

@api_view(['POST'])
def pdf_to_word(request):
    """
    Convert PDF to Word document (DOCX) using pdf2docx
    Preserves formatting, images, tables, and text
    """
    try:
        pdf_data = request.data.get('pdf')

        # Convert base64 to PDF file
        pdf_file = base64_to_pdf(pdf_data)

        # Create temporary files for conversion
        import tempfile
        import os
        from pdf2docx import Converter

        with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as pdf_temp:
            pdf_temp.write(pdf_file.getvalue())
            pdf_temp_path = pdf_temp.name

        docx_temp_path = pdf_temp_path.replace('.pdf', '.docx')

        try:
            # Convert PDF to DOCX
            cv = Converter(pdf_temp_path)
            cv.convert(docx_temp_path)
            cv.close()

            # Read the DOCX file
            with open(docx_temp_path, 'rb') as docx_file:
                docx_bytes = docx_file.read()

            # Convert to base64
            docx_base64 = base64.b64encode(docx_bytes).decode('utf-8')

            return Response({
                'success': True,
                'docx': docx_base64,
                'filename': 'converted.docx',
                'size': len(docx_bytes)
            })

        finally:
            # Clean up temporary files
            if os.path.exists(pdf_temp_path):
                os.unlink(pdf_temp_path)
            if os.path.exists(docx_temp_path):
                os.unlink(docx_temp_path)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def word_to_pdf(request):
    """
    Convert Word document (DOCX) to PDF using python-docx and reportlab
    Preserves basic formatting and structure
    """
    try:
        docx_data = request.data.get('docx')

        # Decode base64 DOCX
        docx_bytes = base64.b64decode(docx_data.split(',')[1] if ',' in docx_data else docx_data)

        import tempfile
        import os
        from docx import Document
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors

        # Save DOCX to temp file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.docx', delete=False) as docx_temp:
            docx_temp.write(docx_bytes)
            docx_temp_path = docx_temp.name

        pdf_temp_path = docx_temp_path.replace('.docx', '.pdf')

        try:
            # Read DOCX
            doc = Document(docx_temp_path)

            # Create PDF
            pdf_buffer = BytesIO()
            pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []

            # Convert paragraphs
            for para in doc.paragraphs:
                if para.text.strip():
                    # Determine style based on paragraph
                    if para.style.name.startswith('Heading'):
                        style = styles['Heading1']
                    else:
                        style = styles['BodyText']

                    p = Paragraph(para.text, style)
                    story.append(p)
                    story.append(Spacer(1, 0.2*inch))

            # Convert tables
            for table in doc.tables:
                data = []
                for row in table.rows:
                    row_data = [cell.text for cell in row.cells]
                    data.append(row_data)

                if data:
                    t = Table(data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 14),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 0.3*inch))

            # Build PDF
            pdf_doc.build(story)

            pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')

            return Response({
                'success': True,
                'pdf': pdf_base64,
                'filename': 'converted.pdf',
                'size': len(pdf_buffer.getvalue())
            })

        finally:
            if os.path.exists(docx_temp_path):
                os.unlink(docx_temp_path)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pdf_to_excel(request):
    """
    Convert PDF to Excel (XLSX) by extracting tables using pdfplumber
    """
    try:
        pdf_data = request.data.get('pdf')

        pdf_file = base64_to_pdf(pdf_data)

        import pandas as pd
        import tempfile

        all_tables = []

        with pdfplumber.open(pdf_file) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                tables = page.extract_tables()

                for table_num, table in enumerate(tables, 1):
                    if table:
                        # Convert to DataFrame
                        df = pd.DataFrame(table[1:], columns=table[0])
                        all_tables.append({
                            'sheet_name': f'Page{page_num}_Table{table_num}',
                            'data': df
                        })

        if not all_tables:
            return Response({
                'success': False,
                'error': 'No tables found in PDF'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Excel file
        excel_buffer = BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            for table_info in all_tables:
                sheet_name = table_info['sheet_name'][:31]  # Excel sheet name limit
                table_info['data'].to_excel(writer, sheet_name=sheet_name, index=False)

        excel_base64 = base64.b64encode(excel_buffer.getvalue()).decode('utf-8')

        return Response({
            'success': True,
            'excel': excel_base64,
            'filename': 'converted.xlsx',
            'sheets': len(all_tables),
            'size': len(excel_buffer.getvalue())
        })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def excel_to_pdf(request):
    """
    Convert Excel (XLSX) to PDF using pandas and reportlab
    """
    try:
        excel_data = request.data.get('excel')

        # Decode base64 Excel
        excel_bytes = base64.b64decode(excel_data.split(',')[1] if ',' in excel_data else excel_data)

        import pandas as pd
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, PageBreak, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors

        # Read Excel file
        excel_buffer = BytesIO(excel_bytes)
        excel_file = pd.ExcelFile(excel_buffer)

        # Create PDF
        pdf_buffer = BytesIO()
        pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        story = []

        # Process each sheet
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)

            # Add sheet title
            title = Paragraph(f"<b>{sheet_name}</b>", styles['Heading1'])
            story.append(title)
            story.append(Spacer(1, 0.3*inch))

            # Convert DataFrame to table data
            data = [df.columns.tolist()] + df.fillna('').astype(str).values.tolist()

            # Create table
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))

            story.append(table)
            story.append(PageBreak())

        # Build PDF
        pdf_doc.build(story)

        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')

        return Response({
            'success': True,
            'pdf': pdf_base64,
            'filename': 'converted.pdf',
            'sheets_converted': len(excel_file.sheet_names),
            'size': len(pdf_buffer.getvalue())
        })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def generate_pdf_from_data(request):
    """
    Generate professional PDF from structured data with template support
    Supports invoices, reports, certificates, etc.
    """
    try:
        template_type = request.data.get('template_type', 'invoice')
        data = request.data.get('data', {})

        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
        from datetime import datetime

        pdf_buffer = BytesIO()
        pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=30,
            alignment=TA_CENTER
        )

        if template_type == 'invoice':
            # Invoice Template
            title = Paragraph("INVOICE", title_style)
            story.append(title)

            # Invoice details
            invoice_data = [
                ['Invoice Number:', data.get('invoice_number', 'INV-001')],
                ['Date:', data.get('date', datetime.now().strftime('%Y-%m-%d'))],
                ['Due Date:', data.get('due_date', '')],
            ]
            invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
            invoice_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ]))
            story.append(invoice_table)
            story.append(Spacer(1, 0.5*inch))

            # Customer info
            story.append(Paragraph(f"<b>Bill To:</b>", styles['Heading3']))
            story.append(Paragraph(data.get('customer_name', ''), styles['Normal']))
            story.append(Paragraph(data.get('customer_address', ''), styles['Normal']))
            story.append(Spacer(1, 0.3*inch))

            # Items table
            items = data.get('items', [])
            if items:
                item_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
                total = 0
                for item in items:
                    qty = float(item.get('quantity', 0))
                    price = float(item.get('price', 0))
                    item_total = qty * price
                    total += item_total
                    item_data.append([
                        item.get('description', ''),
                        str(qty),
                        f"${price:.2f}",
                        f"${item_total:.2f}"
                    ])

                item_data.append(['', '', 'Subtotal:', f"${total:.2f}"])
                tax_rate = float(data.get('tax_rate', 0))
                tax = total * tax_rate / 100
                item_data.append(['', '', f'Tax ({tax_rate}%):', f"${tax:.2f}"])
                item_data.append(['', '', 'Total:', f"${total + tax:.2f}"])

                items_table = Table(item_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
                items_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -3), colors.beige),
                    ('GRID', (0, 0), (-1, -3), 1, colors.black),
                    ('FONTNAME', (2, -2), (-1, -1), 'Helvetica-Bold'),
                    ('FONTSIZE', (2, -1), (-1, -1), 12),
                ]))
                story.append(items_table)

        elif template_type == 'report':
            # Report Template
            title = Paragraph(data.get('title', 'Report'), title_style)
            story.append(title)

            story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%Y-%m-%d')}", styles['Normal']))
            story.append(Paragraph(f"<b>Author:</b> {data.get('author', '')}", styles['Normal']))
            story.append(Spacer(1, 0.3*inch))

            # Sections
            sections = data.get('sections', [])
            for section in sections:
                story.append(Paragraph(f"<b>{section.get('heading', '')}</b>", styles['Heading2']))
                story.append(Paragraph(section.get('content', ''), styles['Normal']))
                story.append(Spacer(1, 0.2*inch))

        elif template_type == 'certificate':
            # Certificate Template
            story.append(Spacer(1, 1.5*inch))

            cert_title = ParagraphStyle(
                'CertTitle',
                parent=styles['Heading1'],
                fontSize=32,
                textColor=colors.HexColor('#1a5490'),
                spaceAfter=50,
                alignment=TA_CENTER
            )
            story.append(Paragraph("CERTIFICATE OF COMPLETION", cert_title))

            story.append(Spacer(1, 0.5*inch))
            story.append(Paragraph(f"This certifies that", styles['Normal']))
            story.append(Spacer(1, 0.3*inch))

            name_style = ParagraphStyle(
                'NameStyle',
                parent=styles['Heading1'],
                fontSize=28,
                textColor=colors.HexColor('#2c3e50'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            story.append(Paragraph(data.get('recipient_name', ''), name_style))

            story.append(Paragraph(f"has successfully completed", styles['Normal']))
            story.append(Spacer(1, 0.3*inch))
            story.append(Paragraph(data.get('course_name', ''), styles['Heading2']))
            story.append(Spacer(1, 0.5*inch))
            story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))

        # Build PDF
        pdf_doc.build(story)

        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')

        return Response({
            'success': True,
            'pdf': pdf_base64,
            'filename': f'{template_type}.pdf',
            'template': template_type,
            'size': len(pdf_buffer.getvalue())
        })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_excel_file(request):
    """
    Create Excel file from data with formatting and multiple sheets
    """
    try:
        sheets_data = request.data.get('sheets', [])

        import xlsxwriter

        excel_buffer = BytesIO()
        workbook = xlsxwriter.Workbook(excel_buffer, {'in_memory': True})

        # Define formats
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'align': 'center',
            'valign': 'vcenter',
            'border': 1
        })

        cell_format = workbook.add_format({
            'border': 1,
            'align': 'left',
            'valign': 'vcenter'
        })

        number_format = workbook.add_format({
            'border': 1,
            'num_format': '#,##0.00'
        })

        for sheet_data in sheets_data:
            sheet_name = sheet_data.get('name', 'Sheet1')
            data = sheet_data.get('data', [])
            has_header = sheet_data.get('has_header', True)

            worksheet = workbook.add_worksheet(sheet_name)

            if data:
                # Write header
                if has_header and len(data) > 0:
                    for col, header in enumerate(data[0]):
                        worksheet.write(0, col, header, header_format)
                    start_row = 1
                    data_rows = data[1:]
                else:
                    start_row = 0
                    data_rows = data

                # Write data
                for row_idx, row in enumerate(data_rows, start=start_row):
                    for col_idx, cell_value in enumerate(row):
                        # Try to detect numbers
                        try:
                            num_value = float(cell_value)
                            worksheet.write(row_idx, col_idx, num_value, number_format)
                        except (ValueError, TypeError):
                            worksheet.write(row_idx, col_idx, str(cell_value), cell_format)

                # Auto-fit columns
                for col_idx in range(len(data[0]) if data else 0):
                    worksheet.set_column(col_idx, col_idx, 15)

        workbook.close()

        excel_base64 = base64.b64encode(excel_buffer.getvalue()).decode('utf-8')

        return Response({
            'success': True,
            'excel': excel_base64,
            'filename': 'generated.xlsx',
            'sheets': len(sheets_data),
            'size': len(excel_buffer.getvalue())
        })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
