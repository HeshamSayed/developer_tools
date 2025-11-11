import time
from datetime import datetime, timezone
import pytz
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class TimestampConverterView(APIView):
    """Convert between timestamps and human-readable dates"""

    def post(self, request):
        start_time = time.time()
        try:
            input_value = request.data.get('input', '')
            input_type = request.data.get('input_type', 'timestamp')  # 'timestamp' or 'datetime'
            target_timezone = request.data.get('timezone', 'UTC')

            if not input_value:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate timezone
            try:
                tz = pytz.timezone(target_timezone)
            except pytz.exceptions.UnknownTimeZoneError:
                return Response({
                    'success': False,
                    'error': f'Invalid timezone: {target_timezone}'
                }, status=status.HTTP_400_BAD_REQUEST)

            result = {}

            if input_type == 'timestamp':
                # Convert timestamp to datetime
                try:
                    timestamp = float(input_value)

                    # Handle both seconds and milliseconds
                    if timestamp > 10000000000:  # Likely milliseconds
                        timestamp = timestamp / 1000

                    dt_utc = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    dt_local = dt_utc.astimezone(tz)

                    result = {
                        'timestamp': int(timestamp),
                        'timestamp_ms': int(timestamp * 1000),
                        'iso_8601': dt_utc.isoformat(),
                        'utc': dt_utc.strftime('%Y-%m-%d %H:%M:%S UTC'),
                        'local': dt_local.strftime(f'%Y-%m-%d %H:%M:%S {target_timezone}'),
                        'formats': {
                            'full': dt_local.strftime('%A, %B %d, %Y %I:%M:%S %p'),
                            'date': dt_local.strftime('%Y-%m-%d'),
                            'time': dt_local.strftime('%H:%M:%S'),
                            'date_time': dt_local.strftime('%Y-%m-%d %H:%M:%S'),
                        }
                    }
                except (ValueError, OSError) as e:
                    return Response({
                        'success': False,
                        'error': f'Invalid timestamp: {str(e)}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            else:  # datetime to timestamp
                try:
                    # Try parsing various datetime formats
                    formats = [
                        '%Y-%m-%d %H:%M:%S',
                        '%Y-%m-%d',
                        '%Y/%m/%d %H:%M:%S',
                        '%Y/%m/%d',
                        '%d-%m-%Y %H:%M:%S',
                        '%d-%m-%Y',
                        '%m/%d/%Y %H:%M:%S',
                        '%m/%d/%Y',
                    ]

                    dt = None
                    for fmt in formats:
                        try:
                            dt = datetime.strptime(input_value, fmt)
                            break
                        except ValueError:
                            continue

                    if dt is None:
                        raise ValueError('Unable to parse datetime string')

                    # Localize to target timezone
                    dt = tz.localize(dt)
                    timestamp = dt.timestamp()

                    result = {
                        'timestamp': int(timestamp),
                        'timestamp_ms': int(timestamp * 1000),
                        'iso_8601': dt.isoformat(),
                        'utc': dt.astimezone(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'),
                        'local': dt.strftime(f'%Y-%m-%d %H:%M:%S {target_timezone}'),
                    }
                except Exception as e:
                    return Response({
                        'success': False,
                        'error': f'Invalid datetime string: {str(e)}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'result': result,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
