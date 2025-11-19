from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jsbeautifier
import cssbeautifier
import rjsmin
import rcssmin
import htmlmin
from bs4 import BeautifulSoup
import json


@api_view(['POST'])
def code_minifier(request):
    """
    Advanced code minifier supporting JavaScript, CSS, and HTML with multiple options.
    """
    try:
        data = request.data
        code = data.get('code', '')
        language = data.get('language', 'javascript')  # javascript, css, html
        options = data.get('options', {})

        if not code:
            return Response(
                {'error': 'Code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        original_size = len(code.encode('utf-8'))
        original_lines = len(code.splitlines())

        minified_code = ''

        try:
            if language == 'javascript':
                # JavaScript minification using rjsmin
                minified_code = rjsmin.jsmin(code)

            elif language == 'css':
                # CSS minification using rcssmin
                keep_bang_comments = options.get('keepImportantComments', False)
                minified_code = rcssmin.cssmin(code, keep_bang_comments=keep_bang_comments)

            elif language == 'html':
                # HTML minification using htmlmin
                remove_comments = options.get('removeComments', True)
                remove_empty_space = options.get('removeEmptySpace', True)
                reduce_boolean_attributes = options.get('reduceBooleanAttributes', True)

                minified_code = htmlmin.minify(
                    code,
                    remove_comments=remove_comments,
                    remove_empty_space=remove_empty_space,
                    reduce_boolean_attributes=reduce_boolean_attributes
                )
            else:
                return Response(
                    {'error': f'Unsupported language: {language}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            minified_size = len(minified_code.encode('utf-8'))
            minified_lines = len(minified_code.splitlines())

            # Calculate savings
            size_saved = original_size - minified_size
            size_saved_percent = round((size_saved / original_size) * 100, 2) if original_size > 0 else 0

            result = {
                'minified': minified_code,
                'statistics': {
                    'original': {
                        'size': original_size,
                        'lines': original_lines,
                        'size_formatted': format_bytes(original_size)
                    },
                    'minified': {
                        'size': minified_size,
                        'lines': minified_lines,
                        'size_formatted': format_bytes(minified_size)
                    },
                    'saved': {
                        'bytes': size_saved,
                        'percentage': size_saved_percent,
                        'size_formatted': format_bytes(size_saved)
                    }
                }
            }

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Minification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Failed to minify code: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def code_beautifier(request):
    """
    Advanced code beautifier supporting JavaScript, CSS, and HTML with extensive formatting options.
    """
    try:
        data = request.data
        code = data.get('code', '')
        language = data.get('language', 'javascript')  # javascript, css, html
        options = data.get('options', {})

        if not code:
            return Response(
                {'error': 'Code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        original_size = len(code.encode('utf-8'))
        original_lines = len(code.splitlines())

        beautified_code = ''

        try:
            if language == 'javascript':
                # JavaScript beautification using jsbeautifier
                js_options = jsbeautifier.default_options()

                # Apply custom options
                js_options.indent_size = options.get('indentSize', 2)
                js_options.indent_char = '\t' if options.get('indentWithTabs', False) else ' '
                js_options.max_preserve_newlines = options.get('maxPreserveNewlines', 2)
                js_options.preserve_newlines = options.get('preserveNewlines', True)
                js_options.keep_array_indentation = options.get('keepArrayIndentation', False)
                js_options.break_chained_methods = options.get('breakChainedMethods', False)
                js_options.indent_scripts = options.get('indentScripts', 'normal')  # keep, separate, normal
                js_options.brace_style = options.get('braceStyle', 'collapse')  # collapse, expand, end-expand
                js_options.space_before_conditional = options.get('spaceBeforeConditional', True)
                js_options.unescape_strings = options.get('unescapeStrings', False)
                js_options.wrap_line_length = options.get('wrapLineLength', 0)
                js_options.end_with_newline = options.get('endWithNewline', True)
                js_options.comma_first = options.get('commaFirst', False)
                js_options.operator_position = options.get('operatorPosition', 'before-newline')

                beautified_code = jsbeautifier.beautify(code, js_options)

            elif language == 'css':
                # CSS beautification using cssbeautifier
                css_options = cssbeautifier.default_options()

                # Apply custom options
                css_options.indent_size = options.get('indentSize', 2)
                css_options.indent_char = '\t' if options.get('indentWithTabs', False) else ' '
                css_options.selector_separator_newline = options.get('selectorSeparatorNewline', True)
                css_options.end_with_newline = options.get('endWithNewline', True)
                css_options.newline_between_rules = options.get('newlineBetweenRules', True)
                css_options.space_around_combinator = options.get('spaceAroundCombinator', False)
                css_options.preserve_newlines = options.get('preserveNewlines', True)
                css_options.max_preserve_newlines = options.get('maxPreserveNewlines', 2)

                beautified_code = cssbeautifier.beautify(code, css_options)

            elif language == 'html':
                # HTML beautification using BeautifulSoup
                indent_size = options.get('indentSize', 2)
                indent_char = '\t' if options.get('indentWithTabs', False) else ' '

                # Parse HTML with BeautifulSoup
                soup = BeautifulSoup(code, 'html.parser')
                beautified_code = soup.prettify(formatter='html')

                # Adjust indentation if needed
                if indent_size != 1 or indent_char != ' ':
                    lines = beautified_code.splitlines()
                    adjusted_lines = []
                    for line in lines:
                        # Count leading spaces
                        stripped = line.lstrip(' ')
                        spaces = len(line) - len(stripped)
                        indent_level = spaces // 1  # BeautifulSoup uses 1 space per level

                        # Create new indentation
                        new_indent = (indent_char * indent_size) * indent_level
                        adjusted_lines.append(new_indent + stripped)

                    beautified_code = '\n'.join(adjusted_lines)

            else:
                return Response(
                    {'error': f'Unsupported language: {language}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            beautified_size = len(beautified_code.encode('utf-8'))
            beautified_lines = len(beautified_code.splitlines())

            result = {
                'beautified': beautified_code,
                'statistics': {
                    'original': {
                        'size': original_size,
                        'lines': original_lines,
                        'size_formatted': format_bytes(original_size)
                    },
                    'beautified': {
                        'size': beautified_size,
                        'lines': beautified_lines,
                        'size_formatted': format_bytes(beautified_size)
                    }
                }
            }

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Beautification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Failed to beautify code: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def format_bytes(bytes_count):
    """Format bytes to human readable format."""
    if bytes_count < 1024:
        return f"{bytes_count} B"
    elif bytes_count < 1024 * 1024:
        return f"{round(bytes_count / 1024, 2)} KB"
    else:
        return f"{round(bytes_count / (1024 * 1024), 2)} MB"
