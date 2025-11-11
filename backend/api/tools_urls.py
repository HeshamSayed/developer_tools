from django.urls import path
from api.views import (
    json_tools,
    base64_tools,
    hash_tools,
    password_tools,
    timestamp_tools,
    jwt_tools,
    text_tools,
    conversion_tools,
    encoding_tools,
    generator_tools,
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

    # JWT Tools
    path('jwt/decode', jwt_tools.JWTDecoderView.as_view(), name='jwt-decode'),

    # Text Tools
    path('text/diff', text_tools.TextDiffView.as_view(), name='text-diff'),
    path('text/regex', text_tools.RegexTesterView.as_view(), name='regex-tester'),

    # Conversion Tools
    path('convert/csv-to-json', conversion_tools.CSVToJSONView.as_view(), name='csv-to-json'),
    path('convert/json-to-csv', conversion_tools.JSONToCSVView.as_view(), name='json-to-csv'),

    # Encoding Tools
    path('encode/url', encoding_tools.URLEncodeView.as_view(), name='url-encode'),
    path('decode/url', encoding_tools.URLDecodeView.as_view(), name='url-decode'),
    path('encode/html', encoding_tools.HTMLEncodeView.as_view(), name='html-encode'),
    path('decode/html', encoding_tools.HTMLDecodeView.as_view(), name='html-decode'),

    # Generator Tools
    path('generate/uuid', generator_tools.UUIDGeneratorView.as_view(), name='uuid-generate'),
    path('generate/qrcode', generator_tools.QRCodeGeneratorView.as_view(), name='qrcode-generate'),
]
