"""
Meeting models for meetings app.
"""
from django.db import models
from django.conf import settings
from matching.models import Match


class Location(models.Model):
    """Predefined campus locations."""
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations'
        ordering = ['name']

    def __str__(self):
        return self.name


class Meeting(models.Model):
    """Meeting coordination for a match."""
    
    STATUS_CHOICES = [
        ('no_proposals', 'No Proposals'),
        ('proposed', 'Proposed'),
        ('awaiting_confirmation', 'Awaiting Confirmation'),
        ('confirmed', 'Confirmed'),
    ]

    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name='meeting'
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='no_proposals')
    selected_location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='meetings'
    )
    location_notes = models.TextField(blank=True, help_text='Additional location details')
    confirmed_slot = models.ForeignKey(
        'MeetingSlot',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_meeting'
    )
    gift_exchanged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meetings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Meeting for Match {self.match.id} - {self.status}'


class MeetingSlot(models.Model):
    """Proposed meeting time slots."""
    
    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='slots'
    )
    proposed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='proposed_slots'
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meeting_slots'
        ordering = ['start_datetime']

    def __str__(self):
        return f'Slot {self.id}: {self.start_datetime} - {self.end_datetime}'

