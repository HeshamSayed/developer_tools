from django.contrib import admin
from .models import (
    Team, TeamMember, TeamInvitation, TeamAPIKey,
    TeamAuditLog, TeamUsageLog
)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'subscription_tier', 'member_count', 'created_at']
    list_filter = ['subscription_tier', 'created_at']
    search_fields = ['name', 'owner__username', 'owner__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['username', 'team', 'role', 'joined_at', 'last_active']
    list_filter = ['role', 'joined_at']
    search_fields = ['user__username', 'user__email', 'team__name']
    readonly_fields = ['id', 'joined_at']
    date_hierarchy = 'joined_at'


@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'team', 'role', 'status', 'invited_by_username', 'created_at', 'expires_at']
    list_filter = ['status', 'role', 'created_at']
    search_fields = ['email', 'team__name']
    readonly_fields = ['id', 'created_at', 'accepted_at']
    date_hierarchy = 'created_at'


@admin.register(TeamAPIKey)
class TeamAPIKeyAdmin(admin.ModelAdmin):
    list_display = ['name', 'team', 'key_prefix', 'created_by_username', 'is_active', 'created_at', 'last_used']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'team__name', 'key_prefix']
    readonly_fields = ['id', 'key', 'key_prefix', 'created_at', 'last_used', 'total_requests']
    date_hierarchy = 'created_at'


@admin.register(TeamAuditLog)
class TeamAuditLogAdmin(admin.ModelAdmin):
    list_display = ['team', 'username', 'action', 'resource_type', 'ip_address', 'created_at']
    list_filter = ['action', 'resource_type', 'created_at']
    search_fields = ['team__name', 'user__username', 'action']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(TeamUsageLog)
class TeamUsageLogAdmin(admin.ModelAdmin):
    list_display = ['team', 'user', 'endpoint', 'tool_name', 'status_code', 'response_time_ms', 'created_at']
    list_filter = ['status_code', 'tool_slug', 'created_at']
    search_fields = ['team__name', 'user__username', 'endpoint', 'tool_name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'
