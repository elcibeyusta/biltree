"""
Admin configuration for profiles app.
"""
from django.contrib import admin
from .models import Profile, InterestTag


@admin.register(InterestTag)
class InterestTagAdmin(admin.ModelAdmin):
    """Admin interface for InterestTag model."""
    list_display = ['display_name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['display_name', 'slug']
    prepopulated_fields = {'slug': ('display_name',)}


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin interface for Profile model."""
    list_display = ['initials', 'user', 'department', 'study_level', 'profile_completed', 'created_at']
    list_filter = ['department', 'study_level', 'profile_completed', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'initials']
    filter_horizontal = ['interests']
    readonly_fields = ['created_at', 'updated_at']

