from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, APIKey, UsageLog, Subscription
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    APIKeySerializer,
    APIKeyCreateSerializer,
    UsageLogSerializer,
    SubscriptionSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """Enhanced login view with user profile data"""
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            username = request.data.get('username')
            try:
                user = User.objects.get(username=username)
                profile = UserProfile.objects.get(user=user)
                
                response.data['user'] = {
                    'username': user.username,
                    'email': user.email,
                    'subscription_tier': profile.subscription_tier,
                    'api_calls_today': profile.api_calls_today,
                    'api_calls_this_month': profile.api_calls_this_month,
                }
            except (User.DoesNotExist, UserProfile.DoesNotExist):
                pass

        return response


class UserProfileView(APIView):
    """Get current user profile"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)


class APIKeyListCreateView(generics.ListCreateAPIView):
    """List and create API keys"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return APIKeyCreateSerializer
        return APIKeySerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class APIKeyDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete an API key"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = APIKeySerializer

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)


class UsageStatsView(APIView):
    """Get usage statistics for current user"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        
        # Get recent usage logs
        recent_logs = UsageLog.objects.filter(user=request.user).order_by('-timestamp')[:50]
        
        # Calculate totals
        total_requests = UsageLog.objects.filter(user=request.user).count()
        total_cost = sum(log.cost_usd for log in UsageLog.objects.filter(user=request.user))
        
        return Response({
            'profile': UserProfileSerializer(profile).data,
            'usage': {
                'today': profile.api_calls_today,
                'this_month': profile.api_calls_this_month,
                'daily_quota': profile.daily_quota,
                'monthly_quota': profile.monthly_quota,
                'daily_remaining': max(0, profile.daily_quota - profile.api_calls_today),
                'monthly_remaining': max(0, profile.monthly_quota - profile.api_calls_this_month),
            },
            'totals': {
                'total_requests': total_requests,
                'total_cost_usd': float(total_cost),
            },
            'recent_activity': UsageLogSerializer(recent_logs, many=True).data
        })


class SubscriptionView(APIView):
    """Get current subscription status"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response({
                'tier': 'free',
                'status': 'active',
                'message': 'No active subscription'
            })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_api_key(request):
    """Verify if an API key is valid"""
    key = request.data.get('key')

    if not key:
        return Response({'valid': False, 'error': 'No API key provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        api_key = APIKey.objects.get(key=key)
        if api_key.is_valid():
            profile = UserProfile.objects.get(user=api_key.user)
            can_request, error = profile.can_make_request()

            return Response({
                'valid': can_request,
                'user': api_key.user.username,
                'subscription_tier': profile.subscription_tier,
                'remaining_daily': max(0, profile.daily_quota - profile.api_calls_today),
                'remaining_monthly': max(0, profile.monthly_quota - profile.api_calls_this_month),
                'error': error
            })
        else:
            return Response({'valid': False, 'error': 'API key is expired or inactive'}, status=status.HTTP_401_UNAUTHORIZED)
    except APIKey.DoesNotExist:
        return Response({'valid': False, 'error': 'Invalid API key'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def platform_stats(request):
    """Get platform-wide statistics"""
    from django.utils import timezone
    from django.db.models import Count, Sum
    from datetime import timedelta

    # Get total users
    total_users = User.objects.count()

    # Get active users (logged in last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()

    # Get total API requests
    total_requests = UsageLog.objects.count()

    # Get requests today
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    requests_today = UsageLog.objects.filter(timestamp__gte=today_start).count()

    # Get total cost
    total_cost = UsageLog.objects.aggregate(total=Sum('cost_usd'))['total'] or 0

    # Tool categories count (hardcoded as we don't store tools in DB)
    # This matches the toolCategories.length from frontend
    total_categories = 10

    # Total tools count (hardcoded, should match frontend)
    total_tools = 117

    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
        },
        'tools': {
            'total': total_tools,
            'categories': total_categories,
        },
        'requests': {
            'total': total_requests,
            'today': requests_today,
        },
        'uptime': '99.9%',  # Calculate from server start time in production
        'total_cost_usd': float(total_cost),
    })
