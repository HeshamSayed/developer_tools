"""
Celery tasks for PDF processing operations.

These tasks handle heavy document processing asynchronously to improve
user experience and system reliability.
"""

import base64
import os
import tempfile
from io import BytesIO
from celery import shared_task
from celery.utils.log import get_task_logger
from datetime import timedelta
from django.utils import timezone

logger = get_task_logger(__name__)


def base64_to_pdf(base64_string):
    """Convert base64 string to PDF BytesIO object"""
    try:
        pdf_data = base64.b64decode(base64_string)
        return BytesIO(pdf_data)
    except Exception as e:
        logger.error(f"Error decoding base64 to PDF: {str(e)}")
        raise


@shared_task(bind=True, name='pdf_tools.tasks.pdf_to_word', max_retries=3)
def pdf_to_word_task(self, pdf_base64):
    """
    Async task: Convert PDF to Word document (DOCX)

    Args:
        pdf_base64 (str): Base64 encoded PDF data

    Returns:
        dict: Result containing docx base64, filename, and size
    """
    try:
        logger.info(f"Starting PDF to Word conversion task {self.request.id}")

        from pdf2docx import Converter

        pdf_file = base64_to_pdf(pdf_base64)

        # Create temporary files
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as pdf_temp:
            pdf_temp.write(pdf_file.getvalue())
            pdf_temp_path = pdf_temp.name

        docx_temp_path = pdf_temp_path.replace('.pdf', '.docx')

        try:
            # Convert PDF to DOCX with progress tracking
            cv = Converter(pdf_temp_path)
            cv.convert(docx_temp_path)
            cv.close()

            # Read the converted file
            with open(docx_temp_path, 'rb') as docx_file:
                docx_bytes = docx_file.read()

            docx_base64 = base64.b64encode(docx_bytes).decode('utf-8')

            logger.info(f"PDF to Word conversion completed: {len(docx_bytes)} bytes")

            return {
                'success': True,
                'docx': docx_base64,
                'filename': 'converted.docx',
                'size': len(docx_bytes),
                'task_id': self.request.id
            }
        finally:
            # Cleanup temporary files
            if os.path.exists(pdf_temp_path):
                os.unlink(pdf_temp_path)
            if os.path.exists(docx_temp_path):
                os.unlink(docx_temp_path)

    except Exception as exc:
        logger.error(f"PDF to Word conversion failed: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, name='pdf_tools.tasks.word_to_pdf', max_retries=3)
def word_to_pdf_task(self, docx_base64):
    """
    Async task: Convert Word document to PDF

    Args:
        docx_base64 (str): Base64 encoded DOCX data

    Returns:
        dict: Result containing pdf base64, filename, and size
    """
    try:
        logger.info(f"Starting Word to PDF conversion task {self.request.id}")

        from docx import Document
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        # Decode DOCX
        docx_data = base64.b64decode(docx_base64)
        docx_file = BytesIO(docx_data)

        # Read Word document
        doc = Document(docx_file)

        # Create PDF
        pdf_buffer = BytesIO()
        pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Extract content from Word document
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                p = Paragraph(paragraph.text, styles['Normal'])
                story.append(p)
                story.append(Spacer(1, 12))

        # Build PDF
        pdf_doc.build(story)
        pdf_bytes = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        logger.info(f"Word to PDF conversion completed: {len(pdf_bytes)} bytes")

        return {
            'success': True,
            'pdf': pdf_base64,
            'filename': 'converted.pdf',
            'size': len(pdf_bytes),
            'task_id': self.request.id
        }

    except Exception as exc:
        logger.error(f"Word to PDF conversion failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, name='pdf_tools.tasks.pdf_to_excel', max_retries=3)
def pdf_to_excel_task(self, pdf_base64):
    """
    Async task: Extract tables from PDF to Excel

    Args:
        pdf_base64 (str): Base64 encoded PDF data

    Returns:
        dict: Result containing excel base64, filename, sheets count, and size
    """
    try:
        logger.info(f"Starting PDF to Excel conversion task {self.request.id}")

        import pdfplumber
        import pandas as pd
        from io import BytesIO

        pdf_file = base64_to_pdf(pdf_base64)

        # Extract tables from PDF
        excel_buffer = BytesIO()

        with pdfplumber.open(pdf_file) as pdf:
            writer = pd.ExcelWriter(excel_buffer, engine='xlsxwriter')
            sheet_count = 0

            for page_num, page in enumerate(pdf.pages, 1):
                tables = page.extract_tables()

                for table_num, table in enumerate(tables, 1):
                    if table:
                        df = pd.DataFrame(table[1:], columns=table[0] if table[0] else None)
                        sheet_name = f'Page{page_num}_Table{table_num}'
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        sheet_count += 1

            if sheet_count == 0:
                raise ValueError("No tables found in PDF")

            writer.close()

        excel_bytes = excel_buffer.getvalue()
        excel_base64 = base64.b64encode(excel_bytes).decode('utf-8')

        logger.info(f"PDF to Excel conversion completed: {sheet_count} sheets, {len(excel_bytes)} bytes")

        return {
            'success': True,
            'excel': excel_base64,
            'filename': 'converted.xlsx',
            'sheets': sheet_count,
            'size': len(excel_bytes),
            'task_id': self.request.id
        }

    except Exception as exc:
        logger.error(f"PDF to Excel conversion failed: {str(exc)}")
        if "No tables found" in str(exc):
            return {
                'success': False,
                'error': 'No tables found in the PDF document',
                'task_id': self.request.id
            }
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, name='pdf_tools.tasks.excel_to_pdf', max_retries=3)
def excel_to_pdf_task(self, excel_base64):
    """
    Async task: Convert Excel to PDF

    Args:
        excel_base64 (str): Base64 encoded Excel data

    Returns:
        dict: Result containing pdf base64, filename, sheets converted, and size
    """
    try:
        logger.info(f"Starting Excel to PDF conversion task {self.request.id}")

        import pandas as pd
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, PageBreak, Paragraph
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO

        # Decode Excel
        excel_data = base64.b64decode(excel_base64)
        excel_file = BytesIO(excel_data)

        # Read all sheets
        excel_data_dict = pd.read_excel(excel_file, sheet_name=None)

        # Create PDF
        pdf_buffer = BytesIO()
        pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        story = []

        sheets_converted = 0
        for sheet_name, df in excel_data_dict.items():
            # Add sheet title
            title = Paragraph(f"<b>{sheet_name}</b>", styles['Heading1'])
            story.append(title)

            # Convert DataFrame to table data
            data = [df.columns.tolist()] + df.values.tolist()

            # Create table
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))

            story.append(table)
            story.append(PageBreak())
            sheets_converted += 1

        # Build PDF
        pdf_doc.build(story)
        pdf_bytes = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        logger.info(f"Excel to PDF conversion completed: {sheets_converted} sheets, {len(pdf_bytes)} bytes")

        return {
            'success': True,
            'pdf': pdf_base64,
            'filename': 'converted.pdf',
            'sheets_converted': sheets_converted,
            'size': len(pdf_bytes),
            'task_id': self.request.id
        }

    except Exception as exc:
        logger.error(f"Excel to PDF conversion failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, name='pdf_tools.tasks.generate_pdf', max_retries=3)
def generate_pdf_task(self, template_type, data):
    """
    Async task: Generate PDF from template and data

    Args:
        template_type (str): Type of template (invoice, report, certificate)
        data (dict): Data to populate the template

    Returns:
        dict: Result containing pdf base64, filename, and size
    """
    try:
        logger.info(f"Starting PDF generation task {self.request.id} - Template: {template_type}")

        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from datetime import datetime

        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        if template_type == 'invoice':
            # Generate invoice
            title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1a56db'))
            story.append(Paragraph("INVOICE", title_style))
            story.append(Spacer(1, 0.3*inch))

            # Invoice details
            details = [
                ['Invoice Number:', data.get('invoice_number', 'N/A')],
                ['Date:', data.get('date', datetime.now().strftime('%Y-%m-%d'))],
                ['Customer:', data.get('customer_name', 'N/A')],
            ]
            details_table = Table(details, colWidths=[2*inch, 4*inch])
            details_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ]))
            story.append(details_table)
            story.append(Spacer(1, 0.5*inch))

            # Items table
            items = data.get('items', [])
            table_data = [['Description', 'Quantity', 'Price', 'Total']]
            subtotal = 0

            for item in items:
                qty = float(item.get('quantity', 0))
                price = float(item.get('price', 0))
                total = qty * price
                subtotal += total
                table_data.append([
                    item.get('description', ''),
                    str(qty),
                    f"${price:.2f}",
                    f"${total:.2f}"
                ])

            tax_rate = float(data.get('tax_rate', 0)) / 100
            tax = subtotal * tax_rate
            grand_total = subtotal + tax

            table_data.extend([
                ['', '', 'Subtotal:', f"${subtotal:.2f}"],
                ['', '', f'Tax ({data.get("tax_rate", 0)}%):', f"${tax:.2f}"],
                ['', '', 'Total:', f"${grand_total:.2f}"]
            ])

            items_table = Table(table_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -2), 1, colors.grey),
                ('LINEBELOW', (2, -3), (-1, -3), 2, colors.black),
                ('LINEBELOW', (2, -1), (-1, -1), 2, colors.black),
                ('BACKGROUND', (2, -1), (-1, -1), colors.HexColor('#e5e7eb')),
            ]))
            story.append(items_table)

        elif template_type == 'report':
            # Generate report
            story.append(Paragraph(data.get('title', 'Report'), styles['Title']))
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph(f"Author: {data.get('author', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d')}", styles['Normal']))
            story.append(Spacer(1, 0.5*inch))

            for section in data.get('sections', []):
                story.append(Paragraph(section.get('heading', ''), styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph(section.get('content', ''), styles['Normal']))
                story.append(Spacer(1, 0.3*inch))

        elif template_type == 'certificate':
            # Generate certificate
            cert_style = ParagraphStyle('Certificate', parent=styles['Title'], fontSize=32, textColor=colors.HexColor('#1a56db'), alignment=1)
            story.append(Spacer(1, 1.5*inch))
            story.append(Paragraph("CERTIFICATE OF COMPLETION", cert_style))
            story.append(Spacer(1, 0.5*inch))
            story.append(Paragraph("This is to certify that", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))

            name_style = ParagraphStyle('Name', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1a56db'), alignment=1)
            story.append(Paragraph(data.get('recipient_name', 'N/A'), name_style))
            story.append(Spacer(1, 0.2*inch))

            story.append(Paragraph("has successfully completed", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph(data.get('course_name', 'N/A'), styles['Heading2']))

        # Build PDF
        doc.build(story)
        pdf_bytes = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        logger.info(f"PDF generation completed: {template_type}, {len(pdf_bytes)} bytes")

        return {
            'success': True,
            'pdf': pdf_base64,
            'filename': f'{template_type}.pdf',
            'size': len(pdf_bytes),
            'task_id': self.request.id
        }

    except Exception as exc:
        logger.error(f"PDF generation failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, name='pdf_tools.tasks.create_excel', max_retries=3)
def create_excel_task(self, sheets_data):
    """
    Async task: Create Excel file from data

    Args:
        sheets_data (list): List of sheet data dictionaries

    Returns:
        dict: Result containing excel base64, filename, and size
    """
    try:
        logger.info(f"Starting Excel creation task {self.request.id}")

        import xlsxwriter
        from io import BytesIO

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
            'align': 'right',
            'num_format': '#,##0.00'
        })

        for sheet_data in sheets_data:
            worksheet = workbook.add_worksheet(sheet_data.get('name', 'Sheet'))
            data = sheet_data.get('data', [])

            if not data:
                continue

            has_header = sheet_data.get('has_header', True)

            for row_num, row_data in enumerate(data):
                for col_num, cell_value in enumerate(row_data):
                    if row_num == 0 and has_header:
                        worksheet.write(row_num, col_num, cell_value, header_format)
                    else:
                        # Try to detect numbers
                        try:
                            numeric_value = float(cell_value)
                            worksheet.write(row_num, col_num, numeric_value, number_format)
                        except (ValueError, TypeError):
                            worksheet.write(row_num, col_num, cell_value, cell_format)

            # Auto-size columns
            for col_num in range(len(data[0]) if data else 0):
                max_length = max(len(str(row[col_num])) for row in data if col_num < len(row))
                worksheet.set_column(col_num, col_num, min(max_length + 2, 50))

        workbook.close()
        excel_bytes = excel_buffer.getvalue()
        excel_base64 = base64.b64encode(excel_bytes).decode('utf-8')

        logger.info(f"Excel creation completed: {len(sheets_data)} sheets, {len(excel_bytes)} bytes")

        return {
            'success': True,
            'excel': excel_base64,
            'filename': 'generated.xlsx',
            'size': len(excel_bytes),
            'task_id': self.request.id
        }

    except Exception as exc:
        logger.error(f"Excel creation failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(name='pdf_tools.tasks.cleanup_old_results')
def cleanup_old_results():
    """
    Periodic task: Clean up old task results from Redis
    """
    try:
        from celery.result import AsyncResult
        from django_celery_results.models import TaskResult

        # Delete task results older than 24 hours
        cutoff_time = timezone.now() - timedelta(hours=24)
        old_results = TaskResult.objects.filter(date_created__lt=cutoff_time)
        count = old_results.count()
        old_results.delete()

        logger.info(f"Cleaned up {count} old task results")
        return {'cleaned': count}

    except Exception as e:
        logger.error(f"Cleanup task failed: {str(e)}")
        return {'error': str(e)}
