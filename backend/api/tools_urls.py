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
    advanced_tools,
    utility_tools,
    new_converter_tools,
    new_utility_tools,
    command_generator_tools,
    network_tools,
    code_tools,
    image_conversion_tools,
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

    # Advanced Tools
    path('sql/format', advanced_tools.SQLFormatterView.as_view(), name='sql-format'),
    path('xml/format', advanced_tools.XMLFormatterView.as_view(), name='xml-format'),
    path('xml/validate', advanced_tools.XMLValidatorView.as_view(), name='xml-validate'),
    path('yaml/format', advanced_tools.YAMLFormatterView.as_view(), name='yaml-format'),
    path('markdown/preview', advanced_tools.MarkdownPreviewView.as_view(), name='markdown-preview'),

    # Utility Tools
    path('css/format', utility_tools.CSSFormatterView.as_view(), name='css-format'),
    path('css/minify', utility_tools.CSSMinifierView.as_view(), name='css-minify'),
    path('js/format', utility_tools.JavaScriptFormatterView.as_view(), name='js-format'),
    path('js/minify', utility_tools.JavaScriptMinifierView.as_view(), name='js-minify'),
    path('image/convert', utility_tools.ImageConverterView.as_view(), name='image-convert'),
    path('lorem/generate', utility_tools.LoremIpsumGeneratorView.as_view(), name='lorem-generate'),
    path('binary/convert', utility_tools.BinaryHexConverterView.as_view(), name='binary-convert'),
    path('ascii/generate', utility_tools.ASCIIArtGeneratorView.as_view(), name='ascii-generate'),
    path('ssl/check', utility_tools.SSLCheckerView.as_view(), name='ssl-check'),

    # New Converter Tools
    path('convert/json-to-yaml', new_converter_tools.JSONToYAMLView.as_view(), name='json-to-yaml'),
    path('convert/yaml-to-json', new_converter_tools.YAMLToJSONView.as_view(), name='yaml-to-json'),
    path('convert/toml-to-json', new_converter_tools.TOMLToJSONView.as_view(), name='toml-to-json'),
    path('convert/json-to-toml', new_converter_tools.JSONToTOMLView.as_view(), name='json-to-toml'),
    path('convert/json-to-sql', new_converter_tools.JSONToSQLView.as_view(), name='json-to-sql'),
    path('convert/json-to-json-schema', new_converter_tools.JSONToJSONSchemaView.as_view(), name='json-to-json-schema'),

    # New Utility Tools
    path('utility/string-length', new_utility_tools.StringLengthCalculatorView.as_view(), name='string-length'),
    path('utility/big-number', new_utility_tools.BigNumberCalculatorView.as_view(), name='big-number'),
    path('utility/json-diff', new_utility_tools.JSONDiffViewerView.as_view(), name='json-diff'),
    path('utility/go-stacktrace', new_utility_tools.GoStacktraceFormatterView.as_view(), name='go-stacktrace'),
    path('utility/template-string', new_utility_tools.TemplateStringValuesView.as_view(), name='template-string'),
    path('utility/sql-ddl-diagram', new_utility_tools.SQLDDLToDiagramView.as_view(), name='sql-ddl-diagram'),

    # Command Generators
    path('generate/mysql-command', command_generator_tools.MySQLCommandGeneratorView.as_view(), name='mysql-command'),
    path('generate/tar-command', command_generator_tools.TarCommandGeneratorView.as_view(), name='tar-command'),
    path('generate/curl-command', command_generator_tools.CurlCommandGeneratorView.as_view(), name='curl-command'),

    # Network Tools
    path('network/ip-lookup', network_tools.ip_lookup, name='ip-lookup'),
    path('network/http-request-tester', network_tools.http_request_tester, name='http-request-tester'),
    path('network/dns-lookup', network_tools.dns_lookup, name='dns-lookup'),
    path('network/ping-test', network_tools.ping_test, name='ping-test'),
    path('network/whois-lookup', network_tools.whois_lookup, name='whois-lookup'),

    # Code Tools
    path('code/minify', code_tools.code_minifier, name='code-minify'),
    path('code/beautify', code_tools.code_beautifier, name='code-beautify'),

    # Image Conversion Tools
    path('image/to-base64', image_conversion_tools.image_to_base64, name='image-to-base64'),
    path('image/from-base64', image_conversion_tools.base64_to_image, name='base64-to-image'),
]
