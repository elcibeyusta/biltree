"""
URLs for profiles app.
"""
from django.urls import path
from .views import ProfileView, interests_list

urlpatterns = [
    path('me/', ProfileView.as_view(), name='profile_me'),
    path('interests/', interests_list, name='interests_list'),
]

