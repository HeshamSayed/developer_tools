"""
URL routing for PDF Tools API

Includes both synchronous and asynchronous endpoints for document processing.
Async endpoints use Celery for heavy processing tasks.
"""

from django.urls import path
from . import views
from . import async_views

urlpatterns = [
    # Legacy sync endpoints (for backwards compatibility)
    path('merge/', views.merge_pdfs, name='merge_pdfs'),
    path('split/', views.split_pdf, name='split_pdf'),
    path('extract-text/', views.extract_pdf_text, name='extract_pdf_text'),
    path('extract-tables/', views.extract_pdf_tables, name='extract_pdf_tables'),
    path('rotate/', views.rotate_pdf, name='rotate_pdf'),
    path('compress/', views.compress_pdf, name='compress_pdf'),
    path('watermark/', views.add_watermark, name='add_watermark'),
    path('to-images/', views.pdf_to_images, name='pdf_to_images'),
    path('info/', views.get_pdf_info, name='get_pdf_info'),
    path('create-from-text/', views.create_pdf_from_text, name='create_pdf_from_text'),

    # Advanced Document Conversion (Sync - for small files)
    path('pdf-to-word/', views.pdf_to_word, name='pdf_to_word'),
    path('word-to-pdf/', views.word_to_pdf, name='word_to_pdf'),
    path('pdf-to-excel/', views.pdf_to_excel, name='pdf_to_excel'),
    path('excel-to-pdf/', views.excel_to_pdf, name='excel_to_pdf'),
    path('generate-pdf/', views.generate_pdf_from_data, name='generate_pdf_from_data'),
    path('create-excel/', views.create_excel_file, name='create_excel_file'),

    # Async endpoints (Celery-powered for large files and heavy processing)
    path('async/pdf-to-word/', async_views.pdf_to_word_async, name='pdf_to_word_async'),
    path('async/word-to-pdf/', async_views.word_to_pdf_async, name='word_to_pdf_async'),
    path('async/pdf-to-excel/', async_views.pdf_to_excel_async, name='pdf_to_excel_async'),
    path('async/excel-to-pdf/', async_views.excel_to_pdf_async, name='excel_to_pdf_async'),
    path('async/generate-pdf/', async_views.generate_pdf_async, name='generate_pdf_async'),
    path('async/create-excel/', async_views.create_excel_async, name='create_excel_async'),

    # Task management endpoints
    path('task-status/<str:task_id>/', async_views.task_status, name='task_status'),
    path('cancel-task/<str:task_id>/', async_views.cancel_task, name='cancel_task'),
    path('queue-status/', async_views.queue_status, name='queue_status'),
]
