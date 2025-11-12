"""
URL routing for Data Tools API
"""

from django.urls import path
from . import views

urlpatterns = [
    path('analyze-csv/', views.analyze_csv, name='analyze_csv'),
    path('csv-to-json/', views.convert_csv_to_json, name='convert_csv_to_json'),
    path('json-to-csv/', views.convert_json_to_csv, name='convert_json_to_csv'),
    path('statistics/', views.data_statistics, name='data_statistics'),
    path('correlation/', views.correlation_analysis, name='correlation_analysis'),
    path('detect-outliers/', views.detect_outliers, name='detect_outliers'),
    path('normalize/', views.normalize_data, name='normalize_data'),
    path('clean/', views.clean_data, name='clean_data'),
    path('group-aggregate/', views.group_aggregate, name='group_aggregate'),
    path('pivot/', views.pivot_table, name='pivot_table'),
]
