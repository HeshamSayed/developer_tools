from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, APIKey, UsageLog, Subscription


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    daily_quota = serializers.IntegerField(read_only=True)
    monthly_quota = serializers.IntegerField(read_only=True)
    max_file_size_mb = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'email', 'username', 'subscription_tier',
            'api_calls_today', 'api_calls_this_month',
            'daily_quota', 'monthly_quota', 'max_file_size_mb',
            'email_verified', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'email', 'username', 'api_calls_today', 'api_calls_this_month',
            'daily_quota', 'monthly_quota', 'max_file_size_mb',
            'created_at', 'updated_at'
        )


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('id', 'name', 'key_prefix', 'last_used', 'total_requests', 'is_active', 'created_at', 'expires_at')
        read_only_fields = ('id', 'key_prefix', 'last_used', 'total_requests', 'created_at')


class APIKeyCreateSerializer(serializers.ModelSerializer):
    key = serializers.CharField(read_only=True)

    class Meta:
        model = APIKey
        fields = ('id', 'name', 'key', 'key_prefix', 'created_at')
        read_only_fields = ('id', 'key', 'key_prefix', 'created_at')


class UsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageLog
        fields = (
            'id', 'endpoint', 'method', 'tool_name',
            'status_code', 'response_time_ms', 'file_size_bytes',
            'cost_usd', 'timestamp'
        )
        read_only_fields = fields


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = (
            'tier', 'status', 'current_period_start',
            'current_period_end', 'cancel_at_period_end', 'created_at'
        )
        read_only_fields = fields
