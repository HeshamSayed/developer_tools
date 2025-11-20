from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta

from .models import AIQuota, AIUsageLog, ContentFilterLog, AISettings, QuotaPurchase
from .content_filter import check_prompt_safety
from .llm_service import get_llm_service


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_assistant(request):
    """
    Ask the AI assistant a question

    POST /api/ai/ask/
    Body: {
        "prompt": "How do I fix this error?",
        "context_type": "error_fix",  # optional: code_explanation, error_fix, best_practice, general_chat
        "code_snippet": "..."  # optional: code context
    }
    """
    prompt = request.data.get('prompt', '').strip()
    context_type = request.data.get('context_type', 'general_chat')
    code_snippet = request.data.get('code_snippet', '')

    if not prompt:
        return Response(
            {'error': 'Prompt is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get or create user quota
    quota, created = AIQuota.objects.get_or_create(
        user=request.user,
        defaults={
            'monthly_quota': AISettings.get_settings().default_monthly_quota
        }
    )

    # Reset quota if month has passed
    quota.reset_monthly_quota()

    # Check quota
    if quota.is_quota_exceeded:
        return Response({
            'error': 'Quota exceeded',
            'message': 'You have used all your AI assistant requests for this month. Purchase additional quota to continue.',
            'quota_status': {
                'used': quota.used_this_month,
                'total': quota.total_quota,
                'remaining': 0
            },
            'purchase_info': {
                'price_per_request_usd': str(quota.price_per_request_usd),
                'suggested_package': 10,
            }
        }, status=status.HTTP_402_PAYMENT_REQUIRED)

    # Get AI settings
    ai_settings = AISettings.get_settings()

    # Check if AI assistant is enabled
    if not ai_settings.enabled:
        return Response({
            'error': 'Service unavailable',
            'message': ai_settings.maintenance_message or 'AI assistant is temporarily unavailable'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # Content filtering
    if ai_settings.enable_content_filter:
        is_safe, violation_type, severity = check_prompt_safety(
            prompt,
            strict_mode=ai_settings.strict_mode
        )

        if not is_safe:
            # Log the violation
            ContentFilterLog.objects.create(
                user=request.user,
                prompt=prompt,
                filter_reason=violation_type,
                severity=severity
            )

            return Response({
                'error': 'Content policy violation',
                'message': 'Your request violates our content policy. Please keep questions focused on coding and development.',
                'violation_type': violation_type
            }, status=status.HTTP_400_BAD_REQUEST)

    # Add code snippet to prompt if provided
    full_prompt = prompt
    if code_snippet:
        full_prompt = f"{prompt}\n\nCode:\n```\n{code_snippet}\n```"

    # Generate response using LLM
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_response(
            prompt=full_prompt,
            context_type=context_type,
            user_context={'username': request.user.username}
        )

        # Calculate cost
        cost_usd = quota.price_per_request_usd

        # Log usage
        usage_log = AIUsageLog.objects.create(
            user=request.user,
            prompt=prompt,
            response=result['response'],
            tokens_used=result['tokens_used'],
            response_time_ms=result['response_time_ms'],
            cost_usd=cost_usd,
            context_type=context_type
        )

        # Use quota
        quota.use_quota(1)

        return Response({
            'response': result['response'],
            'metadata': {
                'tokens_used': result['tokens_used'],
                'response_time_ms': result['response_time_ms'],
                'context_type': context_type,
            },
            'quota_status': {
                'used': quota.used_this_month,
                'total': quota.total_quota,
                'remaining': quota.remaining_quota
            }
        })

    except Exception as e:
        return Response({
            'error': 'Service error',
            'message': 'Unable to generate response. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quota_status(request):
    """
    Get current quota status

    GET /api/ai/quota/
    """
    quota, created = AIQuota.objects.get_or_create(
        user=request.user,
        defaults={
            'monthly_quota': AISettings.get_settings().default_monthly_quota
        }
    )

    quota.reset_monthly_quota()

    # Get usage stats
    thirty_days_ago = timezone.now() - timedelta(days=30)
    usage_stats = AIUsageLog.objects.filter(
        user=request.user,
        created_at__gte=thirty_days_ago
    ).aggregate(
        total_requests=Count('id'),
        total_tokens=Sum('tokens_used'),
        total_cost=Sum('cost_usd')
    )

    return Response({
        'quota': {
            'monthly_quota': quota.monthly_quota,
            'additional_quota': quota.additional_quota,
            'total_quota': quota.total_quota,
            'used_this_month': quota.used_this_month,
            'remaining': quota.remaining_quota,
            'last_reset': quota.last_reset,
        },
        'usage_stats': {
            'total_requests_30d': usage_stats['total_requests'] or 0,
            'total_tokens_30d': usage_stats['total_tokens'] or 0,
            'total_cost_usd_30d': str(usage_stats['total_cost'] or 0),
        },
        'pricing': {
            'price_per_request_usd': str(quota.price_per_request_usd),
            'suggested_packages': [
                {'quantity': 10, 'price_usd': str(quota.price_per_request_usd * 10)},
                {'quantity': 50, 'price_usd': str(quota.price_per_request_usd * 50 * 0.9)},  # 10% discount
                {'quantity': 100, 'price_usd': str(quota.price_per_request_usd * 100 * 0.8)},  # 20% discount
            ]
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usage_history(request):
    """
    Get AI assistant usage history

    GET /api/ai/history/?limit=20
    """
    limit = int(request.query_params.get('limit', 20))
    limit = min(limit, 100)  # Max 100 records

    logs = AIUsageLog.objects.filter(user=request.user)[:limit]

    return Response({
        'history': [
            {
                'id': log.id,
                'prompt': log.prompt[:200],  # Truncate for privacy
                'response': log.response[:500],  # Truncate
                'context_type': log.context_type,
                'tokens_used': log.tokens_used,
                'response_time_ms': log.response_time_ms,
                'cost_usd': str(log.cost_usd),
                'created_at': log.created_at,
            }
            for log in logs
        ],
        'total_count': AIUsageLog.objects.filter(user=request.user).count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_quota(request):
    """
    Purchase additional AI assistant quota

    POST /api/ai/purchase/
    Body: {
        "quantity": 10,
        "payment_method": "credit_card",
        "payment_token": "tok_..."  # Payment provider token
    }
    """
    quantity = request.data.get('quantity', 0)
    payment_method = request.data.get('payment_method', 'credit_card')
    payment_token = request.data.get('payment_token', '')

    if quantity <= 0:
        return Response(
            {'error': 'Invalid quantity'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get user quota
    quota, created = AIQuota.objects.get_or_create(
        user=request.user,
        defaults={
            'monthly_quota': AISettings.get_settings().default_monthly_quota
        }
    )

    # Calculate price
    price_per_request = quota.price_per_request_usd
    total_price = price_per_request * quantity

    # Apply bulk discounts
    if quantity >= 100:
        total_price *= 0.8  # 20% discount
    elif quantity >= 50:
        total_price *= 0.9  # 10% discount

    # Create purchase record
    purchase = QuotaPurchase.objects.create(
        user=request.user,
        quantity=quantity,
        price_usd=total_price,
        payment_method=payment_method,
        payment_id=payment_token,
        payment_status='pending'
    )

    # TODO: Process payment with payment provider (Stripe, PayPal, etc.)
    # For now, simulate successful payment
    if payment_token:
        purchase.payment_status = 'completed'
        purchase.completed_at = timezone.now()
        purchase.save()

        # Add quota to user
        quota.add_quota(quantity)

        return Response({
            'success': True,
            'message': f'Successfully purchased {quantity} AI requests',
            'purchase': {
                'id': purchase.id,
                'quantity': quantity,
                'price_usd': str(total_price),
                'status': purchase.payment_status,
            },
            'quota_status': {
                'used': quota.used_this_month,
                'total': quota.total_quota,
                'remaining': quota.remaining_quota
            }
        })
    else:
        return Response({
            'error': 'Payment failed',
            'message': 'Invalid payment token'
        }, status=status.HTTP_400_BAD_REQUEST)
