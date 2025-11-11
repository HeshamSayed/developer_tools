from django.urls import path, include

urlpatterns = [
    path('tools/', include('api.tools_urls')),
]
