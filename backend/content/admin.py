"""
Admin configuration for content app.
"""
from django.contrib import admin
from .models import EventConfig, FAQ, Rule


@admin.register(EventConfig)
class EventConfigAdmin(admin.ModelAdmin):
    """Admin interface for EventConfig model."""
    list_display = ['event_year', 'registration_open', 'registration_close', 'matching_start_date', 'is_active']
    list_filter = ['is_active', 'event_year']
    readonly_fields = ['updated_at']

    def has_add_permission(self, request):
        """Only allow one instance."""
        return not EventConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of the singleton."""
        return False


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    """Admin interface for FAQ model."""
    list_display = ['question', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['question', 'answer']
    ordering = ['order', 'created_at']


@admin.register(Rule)
class RuleAdmin(admin.ModelAdmin):
    """Admin interface for Rule model."""
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['order', 'created_at']

