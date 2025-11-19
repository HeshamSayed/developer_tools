import json
import csv
import io
import time
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class CSVToJSONView(AuthenticatedToolView):
    """Convert CSV to JSON"""

    def post(self, request):
        start_time = time.time()
        try:
            csv_data = request.data.get('input', '')
            delimiter = request.data.get('delimiter', ',')

            if not csv_data:
                return Response({
                    'success': False,
                    'error': 'CSV input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Parse CSV
                csv_file = io.StringIO(csv_data)
                reader = csv.DictReader(csv_file, delimiter=delimiter)

                # Convert to list of dictionaries
                result = list(reader)

                # Convert to JSON string
                json_output = json.dumps(result, indent=2, ensure_ascii=False)

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': json_output,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'row_count': len(result),
                        'column_count': len(result[0].keys()) if result else 0
                    }
                })

            except Exception as parse_error:
                return Response({
                    'success': False,
                    'error': f'Failed to parse CSV: {str(parse_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JSONToCSVView(AuthenticatedToolView):
    """Convert JSON to CSV"""

    def post(self, request):
        start_time = time.time()
        try:
            json_data = request.data.get('input', '')

            if not json_data:
                return Response({
                    'success': False,
                    'error': 'JSON input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Parse JSON
                data = json.loads(json_data)

                if not isinstance(data, list):
                    return Response({
                        'success': False,
                        'error': 'JSON must be an array of objects'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if not data:
                    return Response({
                        'success': False,
                        'error': 'JSON array is empty'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Get headers from first object
                headers = list(data[0].keys())

                # Convert to CSV
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=headers)
                writer.writeheader()
                writer.writerows(data)

                csv_output = output.getvalue()

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'result': csv_output,
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2),
                        'row_count': len(data),
                        'column_count': len(headers)
                    }
                })

            except json.JSONDecodeError as json_error:
                return Response({
                    'success': False,
                    'error': f'Invalid JSON: {str(json_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
