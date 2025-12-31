"""
URLs for matching app.
"""
from django.urls import path
from .views import my_match, run_matching, mark_match_seen, get_messages, send_message, mark_messages_read

urlpatterns = [
    path('me/', my_match, name='matching_me'),
    path('seen/', mark_match_seen, name='matching_seen'),
    path('messages/', get_messages, name='get_messages'),
    path('messages/send/', send_message, name='send_message'),
    path('messages/read/', mark_messages_read, name='mark_messages_read'),
    path('run/', run_matching, name='matching_run'),
]

