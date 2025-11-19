import time
import re
import difflib
from rest_framework.views import APIView
from api.views.base import AuthenticatedToolView
from rest_framework.response import Response
from rest_framework import status


class TextDiffView(AuthenticatedToolView):
    """Compare two texts and show differences"""

    def post(self, request):
        start_time = time.time()
        try:
            text1 = request.data.get('text1', '')
            text2 = request.data.get('text2', '')
            diff_type = request.data.get('diff_type', 'unified')  # 'unified' or 'side_by_side'

            if not text1 and not text2:
                return Response({
                    'success': False,
                    'error': 'At least one text input is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Split into lines for comparison
            text1_lines = text1.splitlines(keepends=True)
            text2_lines = text2.splitlines(keepends=True)

            if diff_type == 'unified':
                # Generate unified diff
                diff = list(difflib.unified_diff(
                    text1_lines,
                    text2_lines,
                    fromfile='Text 1',
                    tofile='Text 2',
                    lineterm=''
                ))
                diff_output = '\n'.join(diff)
            else:
                # Generate side-by-side comparison
                differ = difflib.Differ()
                diff = list(differ.compare(text1_lines, text2_lines))
                diff_output = ''.join(diff)

            # Calculate statistics
            matcher = difflib.SequenceMatcher(None, text1, text2)
            similarity = round(matcher.ratio() * 100, 2)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'diff': diff_output,
                'similarity': similarity,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'text1_lines': len(text1_lines),
                    'text2_lines': len(text2_lines)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegexTesterView(AuthenticatedToolView):
    """Test regex patterns against input text"""

    def post(self, request):
        start_time = time.time()
        try:
            pattern = request.data.get('pattern', '')
            text = request.data.get('text', '')
            flags = request.data.get('flags', [])

            if not pattern:
                return Response({
                    'success': False,
                    'error': 'Regex pattern is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse flags
            regex_flags = 0
            if 'i' in flags or 'ignorecase' in flags:
                regex_flags |= re.IGNORECASE
            if 'm' in flags or 'multiline' in flags:
                regex_flags |= re.MULTILINE
            if 's' in flags or 'dotall' in flags:
                regex_flags |= re.DOTALL

            try:
                # Compile regex
                compiled_pattern = re.compile(pattern, regex_flags)

                # Find all matches
                matches = []
                for match in compiled_pattern.finditer(text):
                    matches.append({
                        'match': match.group(0),
                        'start': match.start(),
                        'end': match.end(),
                        'groups': match.groups()
                    })

                processing_time = (time.time() - start_time) * 1000

                return Response({
                    'success': True,
                    'matches': matches,
                    'match_count': len(matches),
                    'metadata': {
                        'processing_time_ms': round(processing_time, 2)
                    }
                })

            except re.error as regex_error:
                return Response({
                    'success': False,
                    'error': f'Invalid regex pattern: {str(regex_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
