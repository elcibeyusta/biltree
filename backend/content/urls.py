"""
URLs for content app.
"""
from django.urls import path
from .views import event_config, faqs_list, rules_list

urlpatterns = [
    path('config/', event_config, name='event_config'),
    path('faqs/', faqs_list, name='faqs_list'),
    path('rules/', rules_list, name='rules_list'),
]

