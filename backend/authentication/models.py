import secrets
import hashlib
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class SubscriptionTier(models.TextChoices):
    """Subscription tier choices"""
    FREE = 'free', 'Free'
    PRO = 'pro', 'Pro'
    ENTERPRISE = 'enterprise', 'Enterprise'


class UserProfile(models.Model):
    """Extended user profile with subscription information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    subscription_tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE
    )
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)

    # Usage tracking
    api_calls_today = models.IntegerField(default=0)
    api_calls_this_month = models.IntegerField(default=0)
    last_reset_date = models.DateField(default=timezone.now)

    # Account status
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.email} - {self.subscription_tier}"

    @property
    def daily_quota(self):
        quotas = {
            SubscriptionTier.FREE: 10,
            SubscriptionTier.PRO: 1000,
            SubscriptionTier.ENTERPRISE: 999999
        }
        return quotas.get(self.subscription_tier, 10)

    @property
    def monthly_quota(self):
        quotas = {
            SubscriptionTier.FREE: 100,
            SubscriptionTier.PRO: 10000,
            SubscriptionTier.ENTERPRISE: 9999999
        }
        return quotas.get(self.subscription_tier, 100)

    @property
    def max_file_size_mb(self):
        sizes = {
            SubscriptionTier.FREE: 2,
            SubscriptionTier.PRO: 10,
            SubscriptionTier.ENTERPRISE: 100
        }
        return sizes.get(self.subscription_tier, 2)

    def can_make_request(self):
        today = timezone.now().date()
        if self.last_reset_date < today:
            self.api_calls_today = 0
        if self.last_reset_date.month != today.month:
            self.api_calls_this_month = 0
            
        if self.api_calls_today >= self.daily_quota:
            return False, "Daily quota exceeded"
        if self.api_calls_this_month >= self.monthly_quota:
            return False, "Monthly quota exceeded"
        return True, None

    def increment_usage(self):
        self.api_calls_today += 1
        self.api_calls_this_month += 1
        self.save()


class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=64, unique=True, db_index=True)
    key_prefix = models.CharField(max_length=8)
    last_used = models.DateTimeField(null=True, blank=True)
    total_requests = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'api_keys'
        ordering = ['-created_at']

    @staticmethod
    def generate_key():
        return secrets.token_urlsafe(48)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
            self.key_prefix = self.key[:8]
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if API key is valid (active and not expired)"""
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def record_usage(self):
        """Update last_used timestamp and increment total_requests"""
        self.last_used = timezone.now()
        self.total_requests += 1
        self.save(update_fields=["last_used", "total_requests"])


class UsageLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usage_logs')
    api_key = models.ForeignKey(APIKey, on_delete=models.SET_NULL, null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    tool_name = models.CharField(max_length=100, blank=True)
    status_code = models.IntegerField()
    response_time_ms = models.FloatField()
    file_size_bytes = models.BigIntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'usage_logs'
        ordering = ['-timestamp']


class Subscription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('canceled', 'Canceled'),
        ('past_due', 'Past Due'),
        ('unpaid', 'Unpaid'),
        ('trialing', 'Trialing'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'

    def __str__(self):
        return f"{self.user.email} - {self.tier} ({self.status})"

    def is_active(self):
        return self.status in ['active', 'trialing']


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('void', 'Void'),
        ('uncollectible', 'Uncollectible'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    stripe_invoice_id = models.CharField(max_length=255, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    invoice_date = models.DateTimeField()
    due_date = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    invoice_pdf_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-invoice_date']

    def __str__(self):
        return f"Invoice {self.stripe_invoice_id} - {self.user.email}"

    def is_valid(self):
        """Check if API key is valid (active and not expired)"""
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def record_usage(self):
        """Update last_used timestamp and increment total_requests"""
        self.last_used = timezone.now()
        self.total_requests += 1
        self.save(update_fields=['last_used', 'total_requests'])
