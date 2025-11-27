"""
Serializers for content app.
"""
from rest_framework import serializers
from .models import EventConfig, FAQ, Rule


class EventConfigSerializer(serializers.ModelSerializer):
    """Serializer for EventConfig."""
    
    class Meta:
        model = EventConfig
        fields = [
            'event_year', 'registration_open', 'registration_close',
            'matching_start_date', 'min_budget', 'max_budget',
            'allowed_email_domains', 'is_active'
        ]


class EventConfigPublicSerializer(serializers.ModelSerializer):
    """Public serializer for EventConfig (no sensitive data)."""
    
    class Meta:
        model = EventConfig
        fields = [
            'event_year', 'registration_open', 'registration_close',
            'matching_start_date', 'min_budget', 'max_budget'
        ]


class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQ."""
    
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order']


class RuleSerializer(serializers.ModelSerializer):
    """Serializer for Rule."""
    
    class Meta:
        model = Rule
        fields = ['id', 'title', 'content', 'order']

