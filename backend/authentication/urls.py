from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    APIKeyListCreateView,
    APIKeyDetailView,
    UsageStatsView,
    SubscriptionView,
    verify_api_key,
    platform_stats
)

app_name = 'authentication'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('usage/', UsageStatsView.as_view(), name='usage'),
    path('subscription/', SubscriptionView.as_view(), name='subscription'),

    # API Keys
    path('api-keys/', APIKeyListCreateView.as_view(), name='api_keys'),
    path('api-keys/<int:pk>/', APIKeyDetailView.as_view(), name='api_key_detail'),
    path('verify-key/', verify_api_key, name='verify_key'),

    # Platform Stats
    path('platform-stats/', platform_stats, name='platform_stats'),
]
