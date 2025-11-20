from django.contrib import admin
from .models import AIQuota, AIUsageLog, ContentFilterLog, AISettings, QuotaPurchase


@admin.register(AIQuota)
class AIQuotaAdmin(admin.ModelAdmin):
    list_display = ['user', 'monthly_quota', 'additional_quota', 'used_this_month', 'remaining_quota', 'last_reset']
    list_filter = ['last_reset', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['total_quota', 'remaining_quota', 'is_quota_exceeded', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Quota Allocation', {
            'fields': ('monthly_quota', 'additional_quota', 'used_this_month', 'total_quota', 'remaining_quota')
        }),
        ('Pricing', {
            'fields': ('price_per_request_usd',)
        }),
        ('Status', {
            'fields': ('is_quota_exceeded', 'last_reset', 'created_at', 'updated_at')
        }),
    )

    actions = ['reset_quotas', 'add_bonus_quota']

    def reset_quotas(self, request, queryset):
        for quota in queryset:
            quota.reset_monthly_quota()
        self.message_user(request, f"Reset {queryset.count()} user quotas")
    reset_quotas.short_description = "Reset selected quotas"

    def add_bonus_quota(self, request, queryset):
        for quota in queryset:
            quota.add_quota(10)
        self.message_user(request, f"Added 10 bonus requests to {queryset.count()} users")
    add_bonus_quota.short_description = "Add 10 bonus requests"


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'context_type', 'tokens_used', 'response_time_ms', 'cost_usd', 'created_at']
    list_filter = ['context_type', 'created_at']
    search_fields = ['user__username', 'prompt', 'response']
    readonly_fields = ['user', 'prompt', 'response', 'tokens_used', 'response_time_ms', 'cost_usd', 'context_type', 'created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Context', {
            'fields': ('user', 'context_type', 'created_at')
        }),
        ('Conversation', {
            'fields': ('prompt', 'response')
        }),
        ('Metrics', {
            'fields': ('tokens_used', 'response_time_ms', 'cost_usd')
        }),
    )


@admin.register(ContentFilterLog)
class ContentFilterLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'filter_reason', 'severity', 'reviewed', 'user_warned', 'user_blocked', 'created_at']
    list_filter = ['filter_reason', 'severity', 'reviewed', 'user_warned', 'user_blocked', 'created_at']
    search_fields = ['user__username', 'prompt', 'admin_notes']
    readonly_fields = ['user', 'prompt', 'filter_reason', 'severity', 'created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Violation Details', {
            'fields': ('user', 'filter_reason', 'severity', 'prompt', 'created_at')
        }),
        ('Admin Review', {
            'fields': ('reviewed', 'reviewed_by', 'reviewed_at', 'admin_notes')
        }),
        ('Actions Taken', {
            'fields': ('user_warned', 'user_blocked')
        }),
    )

    actions = ['mark_reviewed', 'warn_users', 'block_users']

    def mark_reviewed(self, request, queryset):
        queryset.update(reviewed=True, reviewed_by=request.user)
        self.message_user(request, f"Marked {queryset.count()} logs as reviewed")
    mark_reviewed.short_description = "Mark as reviewed"

    def warn_users(self, request, queryset):
        queryset.update(user_warned=True)
        self.message_user(request, f"Warned {queryset.count()} users")
    warn_users.short_description = "Warn users"

    def block_users(self, request, queryset):
        queryset.update(user_blocked=True)
        self.message_user(request, f"Blocked {queryset.count()} users")
    block_users.short_description = "Block users"


@admin.register(AISettings)
class AISettingsAdmin(admin.ModelAdmin):
    list_display = ['default_monthly_quota', 'price_per_additional_request', 'enabled', 'maintenance_mode', 'updated_at']
    readonly_fields = ['updated_at']
    
    fieldsets = (
        ('Quota Settings', {
            'fields': ('default_monthly_quota', 'price_per_additional_request')
        }),
        ('Content Filtering', {
            'fields': ('enable_content_filter', 'strict_mode')
        }),
        ('Rate Limiting', {
            'fields': ('max_requests_per_hour', 'max_requests_per_day')
        }),
        ('Model Configuration (CONFIDENTIAL)', {
            'fields': ('model_name', 'model_temperature', 'max_tokens', 'system_prompt'),
            'description': 'These settings are internal only and never exposed to users'
        }),
        ('Feature Flags', {
            'fields': ('enabled', 'maintenance_mode', 'maintenance_message')
        }),
        ('Audit', {
            'fields': ('updated_at', 'updated_by')
        }),
    )

    def has_add_permission(self, request):
        # Only allow one settings instance
        return not AISettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of settings
        return False


@admin.register(QuotaPurchase)
class QuotaPurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'quantity', 'price_usd', 'payment_method', 'payment_status', 'created_at']
    list_filter = ['payment_method', 'payment_status', 'created_at']
    search_fields = ['user__username', 'payment_id']
    readonly_fields = ['user', 'quantity', 'price_usd', 'payment_method', 'payment_id', 'created_at', 'completed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Purchase Details', {
            'fields': ('user', 'quantity', 'price_usd', 'created_at')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_id', 'payment_status', 'completed_at')
        }),
    )

    actions = ['mark_completed', 'mark_failed']

    def mark_completed(self, request, queryset):
        from django.utils import timezone
        queryset.update(payment_status='completed', completed_at=timezone.now())
        self.message_user(request, f"Marked {queryset.count()} purchases as completed")
    mark_completed.short_description = "Mark as completed"

    def mark_failed(self, request, queryset):
        queryset.update(payment_status='failed')
        self.message_user(request, f"Marked {queryset.count()} purchases as failed")
    mark_failed.short_description = "Mark as failed"
