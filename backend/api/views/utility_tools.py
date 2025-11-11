"""
Utility Tools Views
Provides additional utility tools like CSS/JS formatting, image conversion, etc.

Libraries used:
- jsbeautifier (MIT License) - JavaScript/CSS formatting
- Pillow (HPND License) - Image processing
- pyfiglet (MIT License) - ASCII art generation
- ssl, socket (Python standard library) - SSL certificate checking
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.exceptions import ToolException
import jsbeautifier
import cssbeautifier
from PIL import Image
import io
import base64
import re
import pyfiglet
import random
import ssl
import socket
from datetime import datetime


class CSSFormatterView(APIView):
    """Format CSS code with proper indentation"""

    def post(self, request):
        try:
            css_code = request.data.get('input', '')
            indent_size = request.data.get('indent_size', 2)

            if not css_code:
                raise ToolException('CSS code is required')

            # Configure beautifier options
            opts = cssbeautifier.default_options()
            opts.indent_size = indent_size
            opts.indent_char = ' '
            opts.end_with_newline = True

            # Format CSS
            formatted = cssbeautifier.beautify(css_code, opts)

            return Response({
                'success': True,
                'result': formatted
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to format CSS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CSSMinifierView(APIView):
    """Minify CSS code by removing whitespace and comments"""

    def post(self, request):
        try:
            css_code = request.data.get('input', '')

            if not css_code:
                raise ToolException('CSS code is required')

            # Remove comments
            minified = re.sub(r'/\*[\s\S]*?\*/', '', css_code)

            # Remove whitespace
            minified = re.sub(r'\s+', ' ', minified)
            minified = re.sub(r'\s*([{}:;,])\s*', r'\1', minified)
            minified = minified.strip()

            # Calculate savings
            original_size = len(css_code)
            minified_size = len(minified)
            savings_percent = ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0

            return Response({
                'success': True,
                'result': minified,
                'original_size': original_size,
                'minified_size': minified_size,
                'savings_percent': round(savings_percent, 2)
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to minify CSS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JavaScriptFormatterView(APIView):
    """Format JavaScript code with proper indentation"""

    def post(self, request):
        try:
            js_code = request.data.get('input', '')
            indent_size = request.data.get('indent_size', 2)

            if not js_code:
                raise ToolException('JavaScript code is required')

            # Configure beautifier options
            opts = jsbeautifier.default_options()
            opts.indent_size = indent_size
            opts.indent_char = ' '
            opts.end_with_newline = True
            opts.brace_style = 'collapse'
            opts.keep_array_indentation = False

            # Format JavaScript
            formatted = jsbeautifier.beautify(js_code, opts)

            return Response({
                'success': True,
                'result': formatted
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to format JavaScript: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JavaScriptMinifierView(APIView):
    """Minify JavaScript code (basic minification)"""

    def post(self, request):
        try:
            js_code = request.data.get('input', '')

            if not js_code:
                raise ToolException('JavaScript code is required')

            # Basic minification (remove comments and extra whitespace)
            # Remove single-line comments
            minified = re.sub(r'//.*$', '', js_code, flags=re.MULTILINE)

            # Remove multi-line comments
            minified = re.sub(r'/\*[\s\S]*?\*/', '', minified)

            # Remove extra whitespace
            minified = re.sub(r'\s+', ' ', minified)
            minified = minified.strip()

            # Calculate savings
            original_size = len(js_code)
            minified_size = len(minified)
            savings_percent = ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0

            return Response({
                'success': True,
                'result': minified,
                'original_size': original_size,
                'minified_size': minified_size,
                'savings_percent': round(savings_percent, 2)
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to minify JavaScript: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImageConverterView(APIView):
    """Convert images between PNG, JPG, and WebP formats"""

    def post(self, request):
        try:
            image_data = request.data.get('image', '')
            output_format = request.data.get('format', 'PNG').upper()
            quality = request.data.get('quality', 90)

            if not image_data:
                raise ToolException('Image data is required')

            if output_format not in ['PNG', 'JPEG', 'JPG', 'WEBP']:
                raise ToolException('Invalid output format. Supported: PNG, JPEG, WEBP')

            # Handle JPG as JPEG
            if output_format == 'JPG':
                output_format = 'JPEG'

            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]

            image_bytes = base64.b64decode(image_data)

            # Open image with Pillow
            image = Image.open(io.BytesIO(image_bytes))

            # Convert RGBA to RGB for JPEG
            if output_format == 'JPEG' and image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background

            # Convert image
            output_buffer = io.BytesIO()

            if output_format == 'WEBP':
                image.save(output_buffer, format=output_format, quality=quality)
            elif output_format == 'JPEG':
                image.save(output_buffer, format=output_format, quality=quality, optimize=True)
            else:  # PNG
                image.save(output_buffer, format=output_format, optimize=True)

            # Encode to base64
            output_buffer.seek(0)
            converted_image = base64.b64encode(output_buffer.read()).decode('utf-8')

            # Get file size info
            original_size = len(image_bytes)
            converted_size = len(base64.b64decode(converted_image))

            return Response({
                'success': True,
                'result': f'data:image/{output_format.lower()};base64,{converted_image}',
                'format': output_format,
                'original_size': original_size,
                'converted_size': converted_size,
                'width': image.width,
                'height': image.height
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to convert image: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoremIpsumGeneratorView(APIView):
    """Generate Lorem Ipsum placeholder text"""

    LOREM_WORDS = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ]

    def post(self, request):
        try:
            count = request.data.get('count', 5)
            unit = request.data.get('unit', 'paragraphs')  # words, sentences, paragraphs
            start_with_lorem = request.data.get('start_with_lorem', True)

            if unit not in ['words', 'sentences', 'paragraphs']:
                raise ToolException('Invalid unit. Use: words, sentences, or paragraphs')

            if count < 1 or count > 1000:
                raise ToolException('Count must be between 1 and 1000')

            result = []

            if unit == 'words':
                words = self.generate_words(count, start_with_lorem)
                result.append(' '.join(words))

            elif unit == 'sentences':
                for i in range(count):
                    sentence_length = random.randint(8, 20)
                    words = self.generate_words(sentence_length, start_with_lorem and i == 0)
                    sentence = ' '.join(words).capitalize() + '.'
                    result.append(sentence)

            elif unit == 'paragraphs':
                for i in range(count):
                    sentences_in_para = random.randint(4, 8)
                    paragraph = []
                    for j in range(sentences_in_para):
                        sentence_length = random.randint(8, 20)
                        words = self.generate_words(sentence_length, start_with_lorem and i == 0 and j == 0)
                        sentence = ' '.join(words).capitalize() + '.'
                        paragraph.append(sentence)
                    result.append(' '.join(paragraph))

            return Response({
                'success': True,
                'result': '\n\n'.join(result) if unit == 'paragraphs' else ' '.join(result)
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate Lorem Ipsum: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_words(self, count, start_with_lorem=False):
        """Generate random words from Lorem Ipsum dictionary"""
        words = []

        if start_with_lorem and count >= 2:
            words = ['Lorem', 'ipsum']
            count -= 2

        for _ in range(count):
            words.append(random.choice(self.LOREM_WORDS))

        return words


class BinaryHexConverterView(APIView):
    """Convert between Binary, Hexadecimal, and Decimal"""

    def post(self, request):
        try:
            input_value = request.data.get('input', '').strip()
            input_type = request.data.get('input_type', 'decimal')  # binary, hex, decimal, text

            if not input_value:
                raise ToolException('Input value is required')

            result = {}

            if input_type == 'binary':
                # Validate binary
                if not all(c in '01 ' for c in input_value):
                    raise ToolException('Invalid binary input')

                binary = input_value.replace(' ', '')
                decimal_value = int(binary, 2)

                result = {
                    'binary': binary,
                    'decimal': decimal_value,
                    'hexadecimal': hex(decimal_value)[2:].upper(),
                    'octal': oct(decimal_value)[2:]
                }

            elif input_type == 'hex':
                # Validate hex
                hex_value = input_value.replace('0x', '').replace(' ', '')
                try:
                    decimal_value = int(hex_value, 16)
                except ValueError:
                    raise ToolException('Invalid hexadecimal input')

                result = {
                    'hexadecimal': hex_value.upper(),
                    'decimal': decimal_value,
                    'binary': bin(decimal_value)[2:],
                    'octal': oct(decimal_value)[2:]
                }

            elif input_type == 'decimal':
                try:
                    decimal_value = int(input_value)
                except ValueError:
                    raise ToolException('Invalid decimal input')

                if decimal_value < 0:
                    raise ToolException('Negative numbers not supported')

                result = {
                    'decimal': decimal_value,
                    'binary': bin(decimal_value)[2:],
                    'hexadecimal': hex(decimal_value)[2:].upper(),
                    'octal': oct(decimal_value)[2:]
                }

            elif input_type == 'text':
                # Convert text to binary/hex
                text_bytes = input_value.encode('utf-8')
                binary = ' '.join(format(byte, '08b') for byte in text_bytes)
                hex_value = text_bytes.hex().upper()

                result = {
                    'text': input_value,
                    'binary': binary,
                    'hexadecimal': hex_value,
                    'decimal': [byte for byte in text_bytes]
                }

            return Response({
                'success': True,
                'result': result
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to convert: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ASCIIArtGeneratorView(APIView):
    """Generate ASCII art from text using pyfiglet"""

    def post(self, request):
        try:
            text = request.data.get('text', '')
            font = request.data.get('font', 'standard')

            if not text:
                raise ToolException('Text is required')

            if len(text) > 100:
                raise ToolException('Text too long (max 100 characters)')

            # Get available fonts
            available_fonts = pyfiglet.FigletFont.getFonts()

            # Use default if font not available
            if font not in available_fonts:
                font = 'standard'

            # Generate ASCII art
            figlet = pyfiglet.Figlet(font=font)
            ascii_art = figlet.renderText(text)

            return Response({
                'success': True,
                'result': ascii_art,
                'font': font,
                'available_fonts': sorted(available_fonts)[:50]  # Return first 50 popular fonts
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate ASCII art: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SSLCheckerView(APIView):
    """Check SSL/TLS certificate information for a domain"""

    def post(self, request):
        try:
            domain = request.data.get('domain', '').strip()
            port = request.data.get('port', 443)

            if not domain:
                raise ToolException('Domain is required')

            # Remove protocol if provided
            domain = domain.replace('https://', '').replace('http://', '')
            # Remove path if provided
            domain = domain.split('/')[0]
            # Remove port if provided
            if ':' in domain:
                parts = domain.split(':')
                domain = parts[0]
                try:
                    port = int(parts[1])
                except (ValueError, IndexError):
                    pass

            if not domain:
                raise ToolException('Invalid domain')

            # Validate port
            try:
                port = int(port)
                if port < 1 or port > 65535:
                    raise ValueError()
            except ValueError:
                raise ToolException('Invalid port number (1-65535)')

            # Create SSL context
            context = ssl.create_default_context()

            # Connect to the server and get certificate
            try:
                with socket.create_connection((domain, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=domain) as ssock:
                        cert = ssock.getpeercert()
                        cipher = ssock.cipher()
                        version = ssock.version()
            except socket.gaierror:
                raise ToolException(f'Could not resolve domain: {domain}')
            except socket.timeout:
                raise ToolException(f'Connection timeout for {domain}:{port}')
            except ssl.SSLError as e:
                raise ToolException(f'SSL Error: {str(e)}')
            except ConnectionRefusedError:
                raise ToolException(f'Connection refused to {domain}:{port}')
            except Exception as e:
                raise ToolException(f'Connection error: {str(e)}')

            # Parse certificate information
            subject = dict(x[0] for x in cert['subject'])
            issuer = dict(x[0] for x in cert['issuer'])

            # Parse dates
            not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
            not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')

            # Calculate days until expiration
            now = datetime.now()
            days_remaining = (not_after - now).days

            # Determine status
            if days_remaining < 0:
                cert_status = 'expired'
                status_color = 'danger'
            elif days_remaining < 30:
                cert_status = 'expiring_soon'
                status_color = 'warning'
            else:
                cert_status = 'valid'
                status_color = 'success'

            # Get Subject Alternative Names (SANs)
            san_list = []
            for san_type, san_value in cert.get('subjectAltName', []):
                if san_type == 'DNS':
                    san_list.append(san_value)

            result = {
                'domain': domain,
                'port': port,
                'status': cert_status,
                'status_color': status_color,
                'valid': cert_status == 'valid',
                'days_remaining': days_remaining,
                'subject': {
                    'common_name': subject.get('commonName', 'N/A'),
                    'organization': subject.get('organizationName', 'N/A'),
                    'organizational_unit': subject.get('organizationalUnitName', 'N/A'),
                    'country': subject.get('countryName', 'N/A'),
                },
                'issuer': {
                    'common_name': issuer.get('commonName', 'N/A'),
                    'organization': issuer.get('organizationName', 'N/A'),
                    'country': issuer.get('countryName', 'N/A'),
                },
                'validity': {
                    'not_before': not_before.strftime('%Y-%m-%d %H:%M:%S UTC'),
                    'not_after': not_after.strftime('%Y-%m-%d %H:%M:%S UTC'),
                    'days_remaining': days_remaining,
                },
                'subject_alternative_names': san_list,
                'serial_number': cert.get('serialNumber', 'N/A'),
                'version': cert.get('version', 'N/A'),
                'cipher_suite': {
                    'name': cipher[0] if cipher else 'N/A',
                    'protocol': version if version else 'N/A',
                    'bits': cipher[2] if cipher and len(cipher) > 2 else 'N/A',
                },
            }

            return Response({
                'success': True,
                'result': result
            })

        except ToolException as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to check SSL certificate: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
