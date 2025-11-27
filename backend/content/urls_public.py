"""
Public URLs for content app.
"""
from django.urls import path
from .views import public_stats

urlpatterns = [
    path('stats/', public_stats, name='public_stats'),
]

