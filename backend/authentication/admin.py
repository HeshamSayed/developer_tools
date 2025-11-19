from django.contrib import admin
from .models import UserProfile, APIKey, UsageLog, Subscription, Invoice


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'subscription_tier', 'api_calls_today', 'api_calls_this_month', 'email_verified', 'created_at')
    list_filter = ('subscription_tier', 'email_verified', 'is_active')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'key_prefix', 'is_active', 'last_used', 'total_requests', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__email', 'name', 'key')
    readonly_fields = ('key', 'key_prefix', 'created_at', 'last_used', 'total_requests')


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'endpoint', 'method', 'status_code', 'response_time_ms', 'cost_usd', 'timestamp')
    list_filter = ('method', 'status_code', 'timestamp')
    search_fields = ('user__email', 'endpoint', 'tool_name')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'tier', 'status', 'current_period_start', 'current_period_end', 'cancel_at_period_end')
    list_filter = ('tier', 'status', 'cancel_at_period_end')
    search_fields = ('user__email', 'stripe_subscription_id', 'stripe_customer_id')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('user', 'stripe_invoice_id', 'amount_due', 'amount_paid', 'status', 'invoice_date')
    list_filter = ('status', 'invoice_date')
    search_fields = ('user__email', 'stripe_invoice_id')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'invoice_date'
