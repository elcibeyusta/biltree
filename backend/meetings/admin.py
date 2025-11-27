"""
Admin configuration for meetings app.
"""
from django.contrib import admin
from .models import Meeting, MeetingSlot, Location


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """Admin interface for Location model."""
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(MeetingSlot)
class MeetingSlotAdmin(admin.ModelAdmin):
    """Admin interface for MeetingSlot model."""
    list_display = ['id', 'meeting', 'proposed_by', 'start_datetime', 'end_datetime', 'is_selected', 'created_at']
    list_filter = ['is_selected', 'start_datetime', 'created_at']
    search_fields = ['meeting__match__user_a__email', 'meeting__match__user_b__email', 'proposed_by__email']
    raw_id_fields = ['meeting', 'proposed_by']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    """Admin interface for Meeting model."""
    list_display = ['id', 'match', 'status', 'selected_location', 'gift_exchanged', 'created_at', 'updated_at']
    list_filter = ['status', 'gift_exchanged', 'created_at']
    search_fields = ['match__user_a__email', 'match__user_b__email']
    raw_id_fields = ['match', 'selected_location', 'confirmed_slot']
    readonly_fields = ['created_at', 'updated_at']

