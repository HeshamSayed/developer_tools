"""
URL routing for Code Tools API
"""

from django.urls import path
from . import views

urlpatterns = [
    path('format-python/', views.format_python, name='format_python'),
    path('analyze-complexity/', views.analyze_complexity, name='analyze_complexity'),
    path('count-loc/', views.count_loc, name='count_loc'),
    path('security-scan/', views.security_scan, name='security_scan'),
    path('minify/', views.minify_code, name='minify_code'),
    path('beautify/', views.beautify_code, name='beautify_code'),
    path('syntax-check/', views.syntax_check, name='syntax_check'),
]
