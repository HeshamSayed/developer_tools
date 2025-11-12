"""
Advanced Code Analysis and Formatting Views
Uses autopep8, black, pylint, radon, bandit for code analysis
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import autopep8
import black
from io import StringIO
import sys
import re


@api_view(['POST'])
def format_python(request):
    """
    Format Python code using Black and autopep8
    """
    try:
        code = request.data.get('code', '')
        formatter = request.data.get('formatter', 'black')  # 'black' or 'autopep8'

        if formatter == 'black':
            try:
                formatted_code = black.format_str(code, mode=black.FileMode())
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Black formatting error: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        elif formatter == 'autopep8':
            formatted_code = autopep8.fix_code(code)
        else:
            return Response({
                'success': False,
                'error': 'Invalid formatter. Use "black" or "autopep8"'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'formatted_code': formatted_code,
            'formatter': formatter
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def analyze_complexity(request):
    """
    Analyze code complexity using radon
    """
    try:
        code = request.data.get('code', '')

        from radon.complexity import cc_visit
        from radon.metrics import h_visit, mi_visit

        # Cyclomatic Complexity
        cc_results = cc_visit(code)
        complexity_data = []
        for item in cc_results:
            complexity_data.append({
                'name': item.name,
                'type': item.classname if hasattr(item, 'classname') else 'function',
                'complexity': item.complexity,
                'rank': item.rank,
                'lineno': item.lineno
            })

        # Halstead metrics
        try:
            halstead = h_visit(code)
            halstead_data = {
                'vocabulary': halstead.vocabulary if hasattr(halstead, 'vocabulary') else 0,
                'length': halstead.length if hasattr(halstead, 'length') else 0,
                'calculated_length': halstead.calculated_length if hasattr(halstead, 'calculated_length') else 0,
                'volume': halstead.volume if hasattr(halstead, 'volume') else 0,
                'difficulty': halstead.difficulty if hasattr(halstead, 'difficulty') else 0,
                'effort': halstead.effort if hasattr(halstead, 'effort') else 0
            }
        except:
            halstead_data = {}

        # Maintainability Index
        try:
            mi_score = mi_visit(code, multi=True)
        except:
            mi_score = 0

        return Response({
            'success': True,
            'cyclomatic_complexity': complexity_data,
            'halstead_metrics': halstead_data,
            'maintainability_index': mi_score
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def count_loc(request):
    """
    Count lines of code metrics
    """
    try:
        code = request.data.get('code', '')

        from radon.raw import analyze

        metrics = analyze(code)

        return Response({
            'success': True,
            'loc': metrics.loc,  # Lines of Code
            'lloc': metrics.lloc,  # Logical Lines of Code
            'sloc': metrics.sloc,  # Source Lines of Code
            'comments': metrics.comments,  # Comment lines
            'multi': metrics.multi,  # Multi-line strings
            'blank': metrics.blank,  # Blank lines
            'single_comments': metrics.single_comments
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def security_scan(request):
    """
    Scan code for security issues using Bandit
    """
    try:
        code = request.data.get('code', '')

        # Save code to temporary file for bandit
        import tempfile
        import os
        from bandit import run

        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name

        try:
            # Run bandit
            from bandit.core import manager
            from bandit.core import config

            b_mgr = manager.BanditManager(config.BanditConfig(), 'file')
            b_mgr.discover_files([temp_file])
            b_mgr.run_tests()

            issues = []
            for issue in b_mgr.results:
                issues.append({
                    'severity': issue.severity,
                    'confidence': issue.confidence,
                    'text': issue.text,
                    'line_number': issue.lineno,
                    'test_id': issue.test_id
                })

            return Response({
                'success': True,
                'issues': issues,
                'issue_count': len(issues)
            })
        finally:
            os.unlink(temp_file)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def minify_code(request):
    """
    Minify JavaScript/CSS code
    """
    try:
        code = request.data.get('code', '')
        code_type = request.data.get('type', 'javascript')  # 'javascript' or 'css'

        if code_type == 'javascript':
            # Simple JS minification (remove comments and extra whitespace)
            import jsbeautifier
            import re

            # Remove comments
            code = re.sub(r'//.*?\n|/\*.*?\*/', '', code, flags=re.DOTALL)
            # Remove extra whitespace
            code = re.sub(r'\s+', ' ', code)
            code = code.strip()

            minified = code

        elif code_type == 'css':
            import cssbeautifier
            import re

            # Remove comments
            code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
            # Remove extra whitespace
            code = re.sub(r'\s+', ' ', code)
            code = re.sub(r'\s*([{}:;,])\s*', r'\1', code)
            code = code.strip()

            minified = code
        else:
            return Response({
                'success': False,
                'error': 'Invalid code type. Use "javascript" or "css"'
            }, status=status.HTTP_400_BAD_REQUEST)

        original_size = len(request.data.get('code', ''))
        minified_size = len(minified)
        reduction = ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0

        return Response({
            'success': True,
            'minified_code': minified,
            'original_size': original_size,
            'minified_size': minified_size,
            'size_reduction': f'{reduction:.2f}%'
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def beautify_code(request):
    """
    Beautify/format JavaScript or CSS code
    """
    try:
        code = request.data.get('code', '')
        code_type = request.data.get('type', 'javascript')

        if code_type == 'javascript':
            import jsbeautifier
            beautified = jsbeautifier.beautify(code)
        elif code_type == 'css':
            import cssbeautifier
            beautified = cssbeautifier.beautify(code)
        else:
            return Response({
                'success': False,
                'error': 'Invalid code type. Use "javascript" or "css"'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'beautified_code': beautified,
            'type': code_type
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def syntax_check(request):
    """
    Check Python syntax
    """
    try:
        code = request.data.get('code', '')

        import ast
        try:
            ast.parse(code)
            return Response({
                'success': True,
                'valid': True,
                'message': 'Syntax is valid'
            })
        except SyntaxError as e:
            return Response({
                'success': True,
                'valid': False,
                'error': str(e),
                'line': e.lineno,
                'offset': e.offset
            })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
