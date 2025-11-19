import time
import re
import xml.etree.ElementTree as ET
from xml.dom import minidom
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status

try:
    import sqlparse
    SQLPARSE_AVAILABLE = True
except ImportError:
    SQLPARSE_AVAILABLE = False

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False

try:
    import markdown
    MARKDOWN_AVAILABLE = True
except ImportError:
    MARKDOWN_AVAILABLE = False


class SQLFormatterView(AuthenticatedToolView):
    """Format SQL queries"""

    def post(self, request):
        start_time = time.time()

        if not SQLPARSE_AVAILABLE:
            return Response({
                'success': False,
                'error': 'SQL formatting is not available. Install sqlparse library.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            sql = request.data.get('input', '')
            keyword_case = request.data.get('keyword_case', 'upper')  # 'upper', 'lower', 'capitalize'
            reindent = request.data.get('reindent', True)

            if not sql:
                return Response({
                    'success': False,
                    'error': 'SQL input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Format SQL
            formatted = sqlparse.format(
                sql,
                reindent=reindent,
                keyword_case=keyword_case,
                indent_width=2
            )

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': formatted,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'original_length': len(sql),
                    'formatted_length': len(formatted)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class XMLFormatterView(AuthenticatedToolView):
    """Format XML"""

    def post(self, request):
        start_time = time.time()
        try:
            xml_string = request.data.get('input', '')
            indent = request.data.get('indent', 2)

            if not xml_string:
                return Response({
                    'success': False,
                    'error': 'XML input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Parse XML
                root = ET.fromstring(xml_string)

                # Convert to pretty string
                rough_string = ET.tostring(root, encoding='unicode')
                reparsed = minidom.parseString(rough_string)
                formatted = reparsed.toprettyxml(indent=' ' * indent)

                # Remove extra blank lines
                formatted = '\n'.join([line for line in formatted.split('\n') if line.strip()])

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': formatted,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

            except ET.ParseError as e:
                return Response({
                    'success': False,
                    'error': f'Invalid XML: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class XMLValidatorView(AuthenticatedToolView):
    """Validate XML"""

    def post(self, request):
        start_time = time.time()
        try:
            xml_string = request.data.get('input', '')

            if not xml_string:
                return Response({
                    'success': False,
                    'error': 'XML input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                ET.fromstring(xml_string)
                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'valid': True,
                    'message': 'Valid XML',
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

            except ET.ParseError as e:
                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'valid': False,
                    'error': str(e),
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class YAMLFormatterView(AuthenticatedToolView):
    """Format YAML"""

    def post(self, request):
        start_time = time.time()

        if not YAML_AVAILABLE:
            return Response({
                'success': False,
                'error': 'YAML formatting is not available. Install PyYAML library.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            yaml_string = request.data.get('input', '')

            if not yaml_string:
                return Response({
                    'success': False,
                    'error': 'YAML input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Parse and format YAML
                data = yaml.safe_load(yaml_string)
                formatted = yaml.dump(data, default_flow_style=False, sort_keys=False)

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': formatted,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

            except yaml.YAMLError as e:
                return Response({
                    'success': False,
                    'error': f'Invalid YAML: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkdownPreviewView(AuthenticatedToolView):
    """Convert Markdown to HTML"""

    def post(self, request):
        start_time = time.time()

        if not MARKDOWN_AVAILABLE:
            return Response({
                'success': False,
                'error': 'Markdown preview is not available. Install markdown library.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            markdown_text = request.data.get('input', '')

            if not markdown_text:
                return Response({
                    'success': False,
                    'error': 'Markdown input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Convert to HTML
            html = markdown.markdown(
                markdown_text,
                extensions=['extra', 'codehilite', 'toc']
            )

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'html': html,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
