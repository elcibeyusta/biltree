"""
URLs for admin panel app.
"""
from django.urls import path
from .views import (
    users_list,
    delete_user,
    matches_list,
    meetings_list,
    admin_stats,
    update_config,
    update_match,
    delete_match,
    deploy_matches
)

urlpatterns = [
    path('users/', users_list, name='admin_users'),
    path('users/<int:user_id>/delete/', delete_user, name='admin_delete_user'),
    path('matches/', matches_list, name='admin_matches'),
    path('matches/<int:match_id>/', update_match, name='admin_update_match'),
    path('matches/<int:match_id>/delete/', delete_match, name='admin_delete_match'),
    path('matches/deploy/', deploy_matches, name='admin_deploy_matches'),
    path('meetings/', meetings_list, name='admin_meetings'),
    path('stats/', admin_stats, name='admin_stats'),
    path('config/', update_config, name='admin_update_config'),
]

