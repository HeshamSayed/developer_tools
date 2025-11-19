import hashlib
import time
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class HashGeneratorView(AuthenticatedToolView):
    """Generate various hash types (MD5, SHA1, SHA256, SHA512)"""

    SUPPORTED_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512']

    def post(self, request):
        start_time = time.time()
        try:
            data = request.data.get('input', '')
            algorithms = request.data.get('algorithms', ['md5', 'sha256'])

            if not data:
                return Response({
                    'success': False,
                    'error': 'Input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate algorithms
            if not isinstance(algorithms, list):
                algorithms = [algorithms]

            invalid_algorithms = [alg for alg in algorithms if alg not in self.SUPPORTED_ALGORITHMS]
            if invalid_algorithms:
                return Response({
                    'success': False,
                    'error': f'Invalid algorithms: {", ".join(invalid_algorithms)}. Supported: {", ".join(self.SUPPORTED_ALGORITHMS)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate hashes
            hashes = {}
            data_bytes = data.encode('utf-8')

            for algorithm in algorithms:
                if algorithm == 'md5':
                    hashes['md5'] = hashlib.md5(data_bytes).hexdigest()
                elif algorithm == 'sha1':
                    hashes['sha1'] = hashlib.sha1(data_bytes).hexdigest()
                elif algorithm == 'sha256':
                    hashes['sha256'] = hashlib.sha256(data_bytes).hexdigest()
                elif algorithm == 'sha512':
                    hashes['sha512'] = hashlib.sha512(data_bytes).hexdigest()

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'hashes': hashes,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'input_size': len(data)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
