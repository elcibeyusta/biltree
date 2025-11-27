"""
Views for content app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import EventConfig, FAQ, Rule
from .serializers import (
    EventConfigSerializer,
    EventConfigPublicSerializer,
    FAQSerializer,
    RuleSerializer
)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def event_config(request):
    """Get public event configuration."""
    config = EventConfig.get_config()
    serializer = EventConfigPublicSerializer(config)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def faqs_list(request):
    """List all active FAQs."""
    faqs = FAQ.objects.filter(is_active=True)
    serializer = FAQSerializer(faqs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def rules_list(request):
    """List all active rules."""
    rules = Rule.objects.filter(is_active=True)
    serializer = RuleSerializer(rules, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_stats(request):
    """Get public statistics."""
    from accounts.models import User
    from profiles.models import Profile
    
    total_users = User.objects.filter(email_verified=True).count()
    completed_profiles = Profile.objects.filter(profile_completed=True).count()
    
    return Response({
        'total_participants': completed_profiles,
        'total_registered': total_users
    })

