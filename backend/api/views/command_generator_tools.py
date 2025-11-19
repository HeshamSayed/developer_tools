"""
Command Generator Tools - MySQL, Tar, Curl
"""
import time
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class MySQLCommandGeneratorView(AuthenticatedToolView):
    """Generate MySQL commands"""

    def post(self, request):
        start_time = time.time()
        try:
            command_type = request.data.get('command_type', 'select')
            table_name = request.data.get('table_name', 'my_table')
            columns = request.data.get('columns', '')
            where_clause = request.data.get('where_clause', '')
            values = request.data.get('values', '')
            set_clause = request.data.get('set_clause', '')
            table_schema = request.data.get('table_schema', '')

            command = ''

            if command_type == 'select':
                cols = columns if columns.strip() else '*'
                command = f"SELECT {cols}\nFROM {table_name}"
                if where_clause.strip():
                    command += f"\nWHERE {where_clause}"
                command += ';'

            elif command_type == 'insert':
                cols = [c.strip() for c in columns.split(',') if c.strip()]
                command = f"INSERT INTO {table_name}"
                if cols:
                    command += f" ({', '.join(cols)})"
                command += f"\nVALUES ({values});"

            elif command_type == 'update':
                command = f"UPDATE {table_name}\nSET {set_clause}"
                if where_clause.strip():
                    command += f"\nWHERE {where_clause}"
                command += ';'

            elif command_type == 'delete':
                command = f"DELETE FROM {table_name}"
                if where_clause.strip():
                    command += f"\nWHERE {where_clause}"
                command += ';'

            elif command_type == 'create':
                schema_lines = table_schema.split('\n')
                formatted_schema = ',\n  '.join([line.strip() for line in schema_lines if line.strip()])
                command = f"CREATE TABLE {table_name} (\n  {formatted_schema}\n);"

            else:
                return Response({
                    'success': False,
                    'error': f'Unknown command type: {command_type}'
                }, status=status.HTTP_400_BAD_REQUEST)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': command,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TarCommandGeneratorView(AuthenticatedToolView):
    """Generate tar commands"""

    def post(self, request):
        start_time = time.time()
        try:
            operation = request.data.get('operation', 'create')
            compression = request.data.get('compression', 'gzip')
            archive_name = request.data.get('archive_name', 'archive.tar.gz')
            files = request.data.get('files', '')
            verbose = request.data.get('verbose', True)

            command = 'tar '

            # Operation flag
            if operation == 'create':
                command += '-c'
            elif operation == 'extract':
                command += '-x'
            elif operation == 'list':
                command += '-t'
            else:
                return Response({
                    'success': False,
                    'error': f'Unknown operation: {operation}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Compression flag
            if compression == 'gzip':
                command += 'z'
            elif compression == 'bzip2':
                command += 'j'
            elif compression == 'xz':
                command += 'J'

            # Verbose flag
            if verbose:
                command += 'v'

            # File flag
            command += 'f '

            # Archive name
            command += archive_name

            # Files (only for create operation)
            if operation == 'create' and files.strip():
                command += ' ' + files

            # Generate explanation
            explanation = []
            if operation == 'create':
                explanation.append('Create a new archive')
            elif operation == 'extract':
                explanation.append('Extract files from archive')
            elif operation == 'list':
                explanation.append('List contents of archive')

            if compression == 'gzip':
                explanation.append('Use gzip compression')
            elif compression == 'bzip2':
                explanation.append('Use bzip2 compression')
            elif compression == 'xz':
                explanation.append('Use xz compression')

            if verbose:
                explanation.append('Verbose mode (show progress)')

            explanation.append('Specify archive filename')

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': command,
                'explanation': explanation,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurlCommandGeneratorView(AuthenticatedToolView):
    """Generate curl commands"""

    def post(self, request):
        start_time = time.time()
        try:
            url = request.data.get('url', '')
            method = request.data.get('method', 'GET')
            headers = request.data.get('headers', '')
            body = request.data.get('body', '')
            query_params = request.data.get('query_params', '')

            if not url:
                return Response({
                    'success': False,
                    'error': 'URL is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            command = 'curl'

            # Method
            if method != 'GET':
                command += f' -X {method}'

            # URL with query params
            full_url = url
            if query_params.strip():
                params = '&'.join([p.strip() for p in query_params.split('\n') if p.strip()])
                full_url += ('&' if '?' in url else '?') + params

            # Headers
            if headers.strip():
                for header in headers.split('\n'):
                    if header.strip():
                        command += f' \\\n  -H "{header.strip()}"'

            # Body (for POST, PUT, PATCH)
            if method in ['POST', 'PUT', 'PATCH'] and body.strip():
                # Escape quotes in body
                escaped_body = body.replace('"', '\\"').replace('\n', '')
                command += f' \\\n  -d "{escaped_body}"'

            # URL
            command += f' \\\n  "{full_url}"'

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': command,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
