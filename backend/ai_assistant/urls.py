from django.urls import path
from . import views

urlpatterns = [
    # AI Assistant endpoints
    path('ask/', views.ask_assistant, name='ai_ask'),
    path('quota/', views.quota_status, name='ai_quota'),
    path('history/', views.usage_history, name='ai_history'),
    path('purchase/', views.purchase_quota, name='ai_purchase'),
]
