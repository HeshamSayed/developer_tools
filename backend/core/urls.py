"""
URL configuration for developer_tools project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication & User Management
    path('api/auth/', include('authentication.urls')),
    
    # Tool APIs
    path('api/', include('api.urls')),
    
    # Python-powered tool APIs
    path('api/image-tools/', include('image_tools.urls')),
    path('api/pdf-tools/', include('pdf_tools.urls')),
    path('api/data-tools/', include('data_tools.urls')),
    path('api/code-tools/', include('code_tools.urls')),
]
