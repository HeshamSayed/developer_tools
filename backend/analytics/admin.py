from django.contrib import admin
from .models import ToolCategory, ToolMetadata, ToolUsage, AdPlacement


@admin.register(ToolCategory)
class ToolCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'created_at']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']


@admin.register(ToolMetadata)
class ToolMetadataAdmin(admin.ModelAdmin):
    list_display = ['tool_name', 'category', 'tool_slug', 'is_active', 'order']
    list_filter = ['category', 'is_active']
    list_editable = ['is_active', 'order']
    search_fields = ['tool_name', 'tool_slug', 'description']
    prepopulated_fields = {'tool_slug': ('tool_name',)}


@admin.register(ToolUsage)
class ToolUsageAdmin(admin.ModelAdmin):
    list_display = ['tool_slug', 'created_at', 'success', 'processing_time', 'ip_address']
    list_filter = ['success', 'created_at', 'tool_slug']
    search_fields = ['tool_slug', 'ip_address', 'session_id']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']


@admin.register(AdPlacement)
class AdPlacementAdmin(admin.ModelAdmin):
    list_display = ['tool_slug', 'position', 'is_active', 'priority']
    list_filter = ['position', 'is_active']
    list_editable = ['is_active', 'priority']
    search_fields = ['tool_slug']
