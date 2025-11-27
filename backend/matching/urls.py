"""
URLs for matching app.
"""
from django.urls import path
from .views import my_match, run_matching

urlpatterns = [
    path('me/', my_match, name='matching_me'),
    path('run/', run_matching, name='matching_run'),
]

