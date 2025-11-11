from django.urls import path
from api.views import (
    json_tools,
    base64_tools,
    hash_tools,
    password_tools,
    timestamp_tools,
)

urlpatterns = [
    # JSON Tools
    path('json/format', json_tools.JSONFormatterView.as_view(), name='json-format'),
    path('json/validate', json_tools.JSONValidatorView.as_view(), name='json-validate'),
    path('json/minify', json_tools.JSONMinifyView.as_view(), name='json-minify'),

    # Base64 Tools
    path('base64/encode', base64_tools.Base64EncodeView.as_view(), name='base64-encode'),
    path('base64/decode', base64_tools.Base64DecodeView.as_view(), name='base64-decode'),

    # Hash Tools
    path('hash/generate', hash_tools.HashGeneratorView.as_view(), name='hash-generate'),

    # Password Tools
    path('password/generate', password_tools.PasswordGeneratorView.as_view(), name='password-generate'),
    path('password/strength', password_tools.PasswordStrengthView.as_view(), name='password-strength'),

    # Timestamp Tools
    path('timestamp/convert', timestamp_tools.TimestampConverterView.as_view(), name='timestamp-convert'),
]
