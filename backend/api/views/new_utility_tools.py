"""
New Utility Tools - String Length, Big Number, JSON Diff, etc.
"""
import json
import time
import re
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class StringLengthCalculatorView(AuthenticatedToolView):
    """Calculate string statistics"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')

            # Calculate statistics
            chars = len(input_data)
            chars_no_spaces = len(input_data.replace(' ', '').replace('\t', '').replace('\n', '').replace('\r', ''))
            words = len(input_data.strip().split()) if input_data.strip() else 0
            lines = len(input_data.split('\n'))
            paragraphs = len([p for p in input_data.split('\n\n') if p.strip()])
            bytes_count = len(input_data.encode('utf-8'))
            sentences = len([s for s in re.split(r'[.!?]+', input_data) if s.strip()])

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': {
                    'characters': chars,
                    'characters_no_spaces': chars_no_spaces,
                    'words': words,
                    'lines': lines,
                    'paragraphs': paragraphs,
                    'bytes': bytes_count,
                    'sentences': sentences,
                    'kilobytes': round(bytes_count / 1024, 2)
                },
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BigNumberCalculatorView(AuthenticatedToolView):
    """Perform operations on big numbers"""

    def post(self, request):
        start_time = time.time()
        try:
            num1 = request.data.get('num1', '')
            num2 = request.data.get('num2', '')
            operation = request.data.get('operation', 'add')

            if not num1 or not num2:
                return Response({
                    'success': False,
                    'error': 'Both numbers are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Convert to integers
            n1 = int(num1)
            n2 = int(num2)

            # Perform operation
            if operation == 'add':
                result = n1 + n2
            elif operation == 'subtract':
                result = n1 - n2
            elif operation == 'multiply':
                result = n1 * n2
            elif operation == 'divide':
                if n2 == 0:
                    return Response({
                        'success': False,
                        'error': 'Cannot divide by zero'
                    }, status=status.HTTP_400_BAD_REQUEST)
                result = n1 // n2
            elif operation == 'power':
                if n2 < 0:
                    return Response({
                        'success': False,
                        'error': 'Negative exponents not supported'
                    }, status=status.HTTP_400_BAD_REQUEST)
                result = n1 ** n2
            elif operation == 'modulo':
                if n2 == 0:
                    return Response({
                        'success': False,
                        'error': 'Cannot modulo by zero'
                    }, status=status.HTTP_400_BAD_REQUEST)
                result = n1 % n2
            else:
                return Response({
                    'success': False,
                    'error': f'Unknown operation: {operation}'
                }, status=status.HTTP_400_BAD_REQUEST)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': str(result),
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'digits': len(str(result))
                }
            })

        except ValueError as e:
            return Response({
                'success': False,
                'error': f'Invalid number format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JSONDiffViewerView(AuthenticatedToolView):
    """Compare two JSON objects"""

    def post(self, request):
        start_time = time.time()
        try:
            json1 = request.data.get('json1', '')
            json2 = request.data.get('json2', '')

            if not json1 or not json2:
                return Response({
                    'success': False,
                    'error': 'Both JSON inputs are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse JSON
            obj1 = json.loads(json1)
            obj2 = json.loads(json2)

            # Compare JSON
            def compare_json(o1, o2, path=''):
                differences = []

                if o1 is None and o2 is None:
                    return differences

                keys = set()
                if isinstance(o1, dict):
                    keys.update(o1.keys())
                if isinstance(o2, dict):
                    keys.update(o2.keys())

                for key in keys:
                    current_path = f'{path}.{key}' if path else key
                    val1 = o1.get(key) if isinstance(o1, dict) else None
                    val2 = o2.get(key) if isinstance(o2, dict) else None

                    if val1 is None and val2 is not None:
                        differences.append({'path': current_path, 'type': 'added', 'value': val2})
                    elif val2 is None and val1 is not None:
                        differences.append({'path': current_path, 'type': 'removed', 'value': val1})
                    elif isinstance(val1, dict) and isinstance(val2, dict):
                        differences.extend(compare_json(val1, val2, current_path))
                    elif isinstance(val1, list) and isinstance(val2, list):
                        if json.dumps(val1, sort_keys=True) != json.dumps(val2, sort_keys=True):
                            differences.append({'path': current_path, 'type': 'modified', 'old': val1, 'new': val2})
                    elif val1 != val2:
                        differences.append({'path': current_path, 'type': 'modified', 'old': val1, 'new': val2})

                return differences

            differences = compare_json(obj1, obj2)
            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'differences': differences,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'difference_count': len(differences)
                }
            })

        except json.JSONDecodeError as e:
            return Response({
                'success': False,
                'error': f'Invalid JSON: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoStacktraceFormatterView(AuthenticatedToolView):
    """Format Go stacktrace"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            lines = input_data.split('\n')
            frames = []
            current_frame = None

            for line in lines:
                # Check for panic or error message
                if line.startswith('panic:') or 'Error:' in line:
                    frames.append({'type': 'error', 'message': line})
                    continue

                # Check for goroutine line
                if line.startswith('goroutine'):
                    frames.append({'type': 'goroutine', 'message': line})
                    continue

                # Check for function call
                if re.match(r'^[a-zA-Z0-9_./]+\(', line):
                    if current_frame:
                        frames.append(current_frame)
                    current_frame = {'type': 'frame', 'function': line.strip(), 'location': ''}
                elif current_frame and line.strip().startswith('\t'):
                    current_frame['location'] = line.strip()
                    frames.append(current_frame)
                    current_frame = None

            if current_frame:
                frames.append(current_frame)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'frames': frames,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'frame_count': len(frames)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TemplateStringValuesView(AuthenticatedToolView):
    """Replace template placeholders with values"""

    def post(self, request):
        start_time = time.time()
        try:
            template = request.data.get('template', '')
            values_json = request.data.get('values', '')

            if not template:
                return Response({
                    'success': False,
                    'error': 'Template is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not values_json:
                return Response({
                    'success': False,
                    'error': 'Values are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse values JSON
            values = json.loads(values_json)

            # Replace placeholders
            result = template

            # Replace {{variable}} style
            result = re.sub(r'\{\{(\w+)\}\}', lambda m: str(values.get(m.group(1), m.group(0))), result)

            # Replace ${variable} style
            result = re.sub(r'\$\{(\w+)\}', lambda m: str(values.get(m.group(1), m.group(0))), result)

            # Replace {variable} style
            result = re.sub(r'\{(\w+)\}', lambda m: str(values.get(m.group(1), m.group(0))), result)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': result,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except json.JSONDecodeError as e:
            return Response({
                'success': False,
                'error': f'Invalid JSON values: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SQLDDLToDiagramView(AuthenticatedToolView):
    """Parse SQL DDL and generate diagram data"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse CREATE TABLE statements
            tables = []
            table_pattern = re.compile(r'CREATE\s+TABLE\s+`?(\w+)`?\s*\(([\s\S]*?)\);', re.IGNORECASE)

            for match in table_pattern.finditer(input_data):
                table_name = match.group(1)
                columns_text = match.group(2)

                columns = []
                for line in columns_text.split(','):
                    line = line.strip()

                    # Skip constraint lines
                    if any(line.upper().startswith(kw) for kw in ['PRIMARY KEY', 'FOREIGN KEY', 'CONSTRAINT', 'KEY', 'INDEX']):
                        continue

                    parts = line.split()
                    if len(parts) >= 2:
                        column_name = parts[0].replace('`', '')
                        data_type = ' '.join(parts[1:])

                        columns.append({
                            'name': column_name,
                            'type': data_type,
                            'is_primary': 'PRIMARY KEY' in line.upper(),
                            'is_not_null': 'NOT NULL' in line.upper(),
                            'is_unique': 'UNIQUE' in line.upper()
                        })

                tables.append({'name': table_name, 'columns': columns})

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'tables': tables,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'table_count': len(tables)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
