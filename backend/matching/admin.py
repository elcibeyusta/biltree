"""
Admin configuration for matching app.
"""
from django.contrib import admin
from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Admin interface for Match model."""
    list_display = ['id', 'user_a', 'user_b', 'user_c', 'status', 'created_at', 'notified_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user_a__email', 'user_b__email', 'user_c__email']
    readonly_fields = ['created_at', 'notified_at']
    raw_id_fields = ['user_a', 'user_b', 'user_c']

