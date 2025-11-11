from django.db import models
from django.utils import timezone


class ToolCategory(models.Model):
    """Categories for organizing tools"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Tool Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class ToolMetadata(models.Model):
    """SEO and metadata for each tool"""
    tool_slug = models.CharField(max_length=100, unique=True, db_index=True)
    tool_name = models.CharField(max_length=200)
    category = models.ForeignKey(ToolCategory, on_delete=models.CASCADE, related_name='tools')
    description = models.TextField()
    meta_title = models.CharField(max_length=200)
    meta_description = models.CharField(max_length=300)
    keywords = models.TextField(help_text='Comma-separated keywords')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Tool Metadata'
        ordering = ['category', 'order', 'tool_name']

    def __str__(self):
        return self.tool_name

    def get_keywords_list(self):
        return [k.strip() for k in self.keywords.split(',') if k.strip()]


class ToolUsage(models.Model):
    """Track tool usage for analytics and ad optimization"""
    tool_slug = models.CharField(max_length=100, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=100, blank=True, db_index=True)
    processing_time = models.FloatField(null=True, blank=True, help_text='Processing time in milliseconds')
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        verbose_name_plural = 'Tool Usage Records'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tool_slug', '-created_at']),
            models.Index(fields=['session_id', '-created_at']),
        ]

    def __str__(self):
        return f"{self.tool_slug} - {self.created_at}"


class AdPlacement(models.Model):
    """Store optimal ad positions per tool page"""
    AD_POSITIONS = [
        ('top_banner', 'Top Banner'),
        ('sidebar_top', 'Sidebar Top'),
        ('sidebar_sticky', 'Sidebar Sticky'),
        ('in_content', 'In Content'),
        ('below_results', 'Below Results'),
        ('footer', 'Footer'),
    ]

    tool_slug = models.CharField(max_length=100, db_index=True)
    position = models.CharField(max_length=50, choices=AD_POSITIONS)
    ad_code = models.TextField(help_text='AdSense ad unit code')
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['tool_slug', 'position']
        ordering = ['tool_slug', 'priority']

    def __str__(self):
        return f"{self.tool_slug} - {self.get_position_display()}"
