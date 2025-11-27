"""
Serializers for matching app.
"""
from rest_framework import serializers
from .models import Match
from profiles.serializers import ProfilePublicSerializer
from accounts.serializers import UserSerializer


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match."""
    
    user_a_email = serializers.EmailField(source='user_a.email', read_only=True)
    user_b_email = serializers.EmailField(source='user_b.email', read_only=True)
    user_c_email = serializers.EmailField(source='user_c.email', read_only=True, allow_null=True)

    class Meta:
        model = Match
        fields = [
            'id', 'user_a', 'user_b', 'user_c',
            'user_a_email', 'user_b_email', 'user_c_email',
            'status', 'created_at', 'notified_at'
        ]
        read_only_fields = ['id', 'created_at', 'notified_at']


class MatchDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for match with partner profile."""
    
    partner_profile = serializers.SerializerMethodField()
    partner_email = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'status', 'partner_profile', 'partner_email', 'created_at']

    def get_partner_profile(self, obj):
        """Get partner's public profile."""
        user = self.context['request'].user
        partner = obj.get_gift_recipient(user)
        if partner and hasattr(partner, 'profile'):
            return ProfilePublicSerializer(partner.profile).data
        return None

    def get_partner_email(self, obj):
        """Never expose partner email - return None."""
        return None

