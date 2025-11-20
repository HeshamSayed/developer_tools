from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class AIQuota(models.Model):
    """Track AI assistant quota for each user"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_quota')

    # Monthly quota allocation
    monthly_quota = models.IntegerField(default=20, help_text="Free monthly AI requests")
    additional_quota = models.IntegerField(default=0, help_text="Purchased additional requests")

    # Usage tracking
    used_this_month = models.IntegerField(default=0)
    last_reset = models.DateTimeField(auto_now_add=True)

    # Pricing
    price_per_request_usd = models.DecimalField(max_digits=6, decimal_places=3, default=0.10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI Quota"
        verbose_name_plural = "AI Quotas"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.remaining_quota}/{self.total_quota}"

    @property
    def total_quota(self):
        """Total available quota for the month"""
        return self.monthly_quota + self.additional_quota

    @property
    def remaining_quota(self):
        """Remaining quota for the month"""
        return max(0, self.total_quota - self.used_this_month)

    @property
    def is_quota_exceeded(self):
        """Check if quota is exceeded"""
        return self.used_this_month >= self.total_quota

    def reset_monthly_quota(self):
        """Reset quota at the start of each month"""
        now = timezone.now()
        # Check if a month has passed
        if (now - self.last_reset).days >= 30:
            self.used_this_month = 0
            self.additional_quota = 0  # Reset purchased quota
            self.last_reset = now
            self.save()

    def use_quota(self, amount=1):
        """Decrease quota by specified amount"""
        self.used_this_month += amount
        self.save()

    def add_quota(self, amount):
        """Add purchased quota"""
        self.additional_quota += amount
        self.save()


class AIUsageLog(models.Model):
    """Log all AI assistant interactions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_usage_logs')

    # Request details
    prompt = models.TextField(help_text="User's question/prompt")
    response = models.TextField(help_text="AI assistant's response")

    # Metadata
    tokens_used = models.IntegerField(default=0)
    response_time_ms = models.IntegerField(default=0, help_text="Response time in milliseconds")

    # Cost tracking
    cost_usd = models.DecimalField(max_digits=10, decimal_places=4, default=0.00)

    # Context
    context_type = models.CharField(
        max_length=50,
        choices=[
            ('code_explanation', 'Code Explanation'),
            ('error_fix', 'Error Fix'),
            ('best_practice', 'Best Practice Suggestion'),
            ('general_chat', 'General Chat'),
        ],
        default='general_chat'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "AI Usage Log"
        verbose_name_plural = "AI Usage Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.context_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class ContentFilterLog(models.Model):
    """Log filtered/blocked content for admin review"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_filter_logs')

    # Blocked content
    prompt = models.TextField(help_text="Blocked prompt")

    # Filter reason
    filter_reason = models.CharField(
        max_length=50,
        choices=[
            ('political', 'Political Content'),
            ('pornographic', 'Pornographic Content'),
            ('hacking', 'Hacking/Malicious Content'),
            ('spam', 'Spam'),
            ('other', 'Other Violation'),
        ]
    )

    # Severity
    severity = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='medium'
    )

    # Admin review
    reviewed = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_filters'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)

    # User action
    user_warned = models.BooleanField(default=False)
    user_blocked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Content Filter Log"
        verbose_name_plural = "Content Filter Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['reviewed', '-created_at']),
            models.Index(fields=['severity', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.filter_reason} - {self.created_at.strftime('%Y-%m-%d')}"


class AISettings(models.Model):
    """Global AI assistant settings (singleton)"""
    # Quota settings
    default_monthly_quota = models.IntegerField(default=20)
    price_per_additional_request = models.DecimalField(max_digits=6, decimal_places=3, default=0.10)

    # Content filtering
    enable_content_filter = models.BooleanField(default=True)
    strict_mode = models.BooleanField(default=False, help_text="More aggressive filtering")

    # Rate limiting
    max_requests_per_hour = models.IntegerField(default=10)
    max_requests_per_day = models.IntegerField(default=50)

    # Model settings (kept confidential - not exposed via API)
    model_name = models.CharField(max_length=100, default="assistant", help_text="Internal use only")
    model_temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=2000)

    # System prompt (never exposed to users)
    system_prompt = models.TextField(
        default="You are a helpful coding assistant. Provide clear, concise code explanations and suggestions.",
        help_text="Internal system prompt - never shown to users"
    )

    # Feature flags
    enabled = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "AI Settings"
        verbose_name_plural = "AI Settings"

    def __str__(self):
        return "AI Assistant Settings"

    @classmethod
    def get_settings(cls):
        """Get or create singleton settings instance"""
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings


class QuotaPurchase(models.Model):
    """Track quota purchases"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quota_purchases')

    # Purchase details
    quantity = models.IntegerField(help_text="Number of requests purchased")
    price_usd = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment
    payment_method = models.CharField(
        max_length=50,
        choices=[
            ('credit_card', 'Credit Card'),
            ('paypal', 'PayPal'),
            ('crypto', 'Cryptocurrency'),
            ('admin_grant', 'Admin Grant'),
        ]
    )
    payment_id = models.CharField(max_length=200, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Quota Purchase"
        verbose_name_plural = "Quota Purchases"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.quantity} requests - ${self.price_usd}"
