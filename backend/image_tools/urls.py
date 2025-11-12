"""
URL routing for Image Tools API
"""

from django.urls import path
from . import views

urlpatterns = [
    path('resize/', views.resize_image, name='resize_image'),
    path('compress/', views.compress_image, name='compress_image'),
    path('enhance/', views.enhance_image, name='enhance_image'),
    path('filter/', views.apply_filter, name='apply_filter'),
    path('remove-background/', views.remove_background, name='remove_background'),
    path('detect-faces/', views.detect_faces, name='detect_faces'),
    path('sketch/', views.image_to_sketch, name='image_to_sketch'),
    path('rotate/', views.rotate_image, name='rotate_image'),
    path('watermark/', views.watermark_image, name='watermark_image'),
]
