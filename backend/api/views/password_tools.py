import random
import string
import re
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class PasswordGeneratorView(APIView):
    """Generate secure random passwords"""

    def post(self, request):
        start_time = time.time()
        try:
            length = int(request.data.get('length', 16))
            include_uppercase = request.data.get('include_uppercase', True)
            include_lowercase = request.data.get('include_lowercase', True)
            include_numbers = request.data.get('include_numbers', True)
            include_symbols = request.data.get('include_symbols', True)
            exclude_ambiguous = request.data.get('exclude_ambiguous', False)
            quantity = int(request.data.get('quantity', 1))

            # Validation
            if length < 4 or length > 128:
                return Response({
                    'success': False,
                    'error': 'Password length must be between 4 and 128'
                }, status=status.HTTP_400_BAD_REQUEST)

            if quantity < 1 or quantity > 50:
                return Response({
                    'success': False,
                    'error': 'Quantity must be between 1 and 50'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not any([include_uppercase, include_lowercase, include_numbers, include_symbols]):
                return Response({
                    'success': False,
                    'error': 'At least one character type must be selected'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Build character set
            chars = ''
            if include_lowercase:
                chars += string.ascii_lowercase
            if include_uppercase:
                chars += string.ascii_uppercase
            if include_numbers:
                chars += string.digits
            if include_symbols:
                chars += string.punctuation

            # Exclude ambiguous characters if requested
            if exclude_ambiguous:
                ambiguous = 'il1Lo0O'
                chars = ''.join(c for c in chars if c not in ambiguous)

            # Generate passwords
            passwords = []
            for _ in range(quantity):
                password = ''.join(random.choice(chars) for _ in range(length))
                passwords.append(password)

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'passwords': passwords,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2),
                    'length': length,
                    'quantity': quantity
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordStrengthView(APIView):
    """Analyze password strength and provide feedback"""

    def post(self, request):
        start_time = time.time()
        try:
            password = request.data.get('password', '')

            if not password:
                return Response({
                    'success': False,
                    'error': 'Password is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Analyze password
            length = len(password)
            has_lowercase = bool(re.search(r'[a-z]', password))
            has_uppercase = bool(re.search(r'[A-Z]', password))
            has_numbers = bool(re.search(r'\d', password))
            has_symbols = bool(re.search(r'[^a-zA-Z0-9]', password))

            # Calculate score (0-100)
            score = 0

            # Length scoring
            if length >= 8:
                score += 20
            if length >= 12:
                score += 10
            if length >= 16:
                score += 10

            # Character variety scoring
            if has_lowercase:
                score += 15
            if has_uppercase:
                score += 15
            if has_numbers:
                score += 15
            if has_symbols:
                score += 15

            # Determine strength level
            if score >= 80:
                strength = 'very_strong'
                strength_label = 'Very Strong'
            elif score >= 60:
                strength = 'strong'
                strength_label = 'Strong'
            elif score >= 40:
                strength = 'moderate'
                strength_label = 'Moderate'
            elif score >= 20:
                strength = 'weak'
                strength_label = 'Weak'
            else:
                strength = 'very_weak'
                strength_label = 'Very Weak'

            # Generate suggestions
            suggestions = []
            if length < 12:
                suggestions.append('Use at least 12 characters')
            if not has_uppercase:
                suggestions.append('Include uppercase letters')
            if not has_lowercase:
                suggestions.append('Include lowercase letters')
            if not has_numbers:
                suggestions.append('Include numbers')
            if not has_symbols:
                suggestions.append('Include special symbols')

            processing_time = (time.time() - start_time) * 1000

            return Response({
                'success': True,
                'strength': strength,
                'strength_label': strength_label,
                'score': score,
                'checks': {
                    'length': length,
                    'has_lowercase': has_lowercase,
                    'has_uppercase': has_uppercase,
                    'has_numbers': has_numbers,
                    'has_symbols': has_symbols
                },
                'suggestions': suggestions,
                'metadata': {
                    'processing_time_ms': round(processing_time, 2)
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
