"""
URL routing for PDF Tools API
"""

from django.urls import path
from . import views

urlpatterns = [
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
    # Advanced Document Conversion
    path('pdf-to-word/', views.pdf_to_word, name='pdf_to_word'),
    path('word-to-pdf/', views.word_to_pdf, name='word_to_pdf'),
    path('pdf-to-excel/', views.pdf_to_excel, name='pdf_to_excel'),
    path('excel-to-pdf/', views.excel_to_pdf, name='excel_to_pdf'),
    path('generate-pdf/', views.generate_pdf_from_data, name='generate_pdf_from_data'),
    path('create-excel/', views.create_excel_file, name='create_excel_file'),
]
