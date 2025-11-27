"""
URLs for meetings app.
"""
from django.urls import path
from .views import (
    my_meeting,
    create_slots,
    confirm_slot,
    mark_exchanged,
    locations_list
)

urlpatterns = [
    path('me/', my_meeting, name='meeting_me'),
    path('me/slots/', create_slots, name='meeting_create_slots'),
    path('me/confirm-slot/<int:slot_id>/', confirm_slot, name='meeting_confirm_slot'),
    path('me/mark-exchanged/', mark_exchanged, name='meeting_mark_exchanged'),
    path('locations/', locations_list, name='meeting_locations'),
]

