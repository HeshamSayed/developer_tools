"""
New Converter Tools - JSON/YAML/TOML/SQL Converters
"""
import json
import yaml
import toml
import time
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class JSONToYAMLView(AuthenticatedToolView):
    """Convert JSON to YAML"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse JSON
            json_data = json.loads(input_data)

            # Convert to YAML
            yaml_output = yaml.dump(json_data, default_flow_style=False, allow_unicode=True)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': yaml_output,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
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


class YAMLToJSONView(AuthenticatedToolView):
    """Convert YAML to JSON"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')
            formatted = request.data.get('formatted', True)

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse YAML
            yaml_data = yaml.safe_load(input_data)

            # Convert to JSON
            if formatted:
                json_output = json.dumps(yaml_data, indent=2, ensure_ascii=False)
            else:
                json_output = json.dumps(yaml_data, ensure_ascii=False)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': json_output,
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
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TOMLToJSONView(AuthenticatedToolView):
    """Convert TOML to JSON"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')
            formatted = request.data.get('formatted', True)

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse TOML
            toml_data = toml.loads(input_data)

            # Convert to JSON
            if formatted:
                json_output = json.dumps(toml_data, indent=2, ensure_ascii=False)
            else:
                json_output = json.dumps(toml_data, ensure_ascii=False)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': json_output,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except toml.TomlDecodeError as e:
            return Response({
                'success': False,
                'error': f'Invalid TOML: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JSONToTOMLView(AuthenticatedToolView):
    """Convert JSON to TOML"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse JSON
            json_data = json.loads(input_data)

            # Convert to TOML
            toml_output = toml.dumps(json_data)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': toml_output,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
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


class JSONToSQLView(AuthenticatedToolView):
    """Convert JSON to SQL INSERT statements"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')
            table_name = request.data.get('table_name', 'my_table')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse JSON
            json_data = json.loads(input_data)

            # Handle both single objects and arrays
            if isinstance(json_data, dict):
                json_data = [json_data]

            if not isinstance(json_data, list) or len(json_data) == 0:
                return Response({
                    'success': False,
                    'error': 'JSON must be an object or array of objects'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate SQL statements
            sql_statements = []
            for item in json_data:
                if not isinstance(item, dict):
                    continue

                columns = list(item.keys())
                values = []

                for col in columns:
                    value = item[col]
                    if value is None:
                        values.append('NULL')
                    elif isinstance(value, str):
                        escaped_value = value.replace("'", "''")
                        values.append(f"'{escaped_value}'")
                    elif isinstance(value, bool):
                        values.append('1' if value else '0')
                    elif isinstance(value, (dict, list)):
                        json_str = json.dumps(value).replace("'", "''")
                        values.append(f"'{json_str}'")
                    else:
                        values.append(str(value))

                sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(values)});"
                sql_statements.append(sql)

            result = '\n'.join(sql_statements)
            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': result,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'statement_count': len(sql_statements)
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


class JSONToJSONSchemaView(AuthenticatedToolView):
    """Generate JSON Schema from JSON data"""

    def post(self, request):
        start_time = time.time()
        try:
            input_data = request.data.get('input', '')
            title = request.data.get('title', 'Generated Schema')

            if not input_data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse JSON
            json_data = json.loads(input_data)

            # Generate schema
            def generate_schema(obj, is_root=True):
                schema = {}

                if is_root:
                    schema['$schema'] = 'http://json-schema.org/draft-07/schema#'
                    schema['title'] = title

                if isinstance(obj, list):
                    schema['type'] = 'array'
                    if len(obj) > 0:
                        schema['items'] = generate_schema(obj[0], False)
                elif obj is None:
                    schema['type'] = 'null'
                elif isinstance(obj, dict):
                    schema['type'] = 'object'
                    schema['properties'] = {}
                    required = []

                    for key, value in obj.items():
                        schema['properties'][key] = generate_schema(value, False)
                        required.append(key)

                    if required:
                        schema['required'] = required
                elif isinstance(obj, str):
                    schema['type'] = 'string'
                elif isinstance(obj, bool):
                    schema['type'] = 'boolean'
                elif isinstance(obj, int):
                    schema['type'] = 'integer'
                elif isinstance(obj, float):
                    schema['type'] = 'number'

                return schema

            schema = generate_schema(json_data)
            result = json.dumps(schema, indent=2)

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
                'error': f'Invalid JSON: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
