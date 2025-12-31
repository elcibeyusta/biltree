"""
Serializers for profiles app.
"""
from rest_framework import serializers
from .models import Profile, InterestTag
from accounts.serializers import UserSerializer


class InterestTagSerializer(serializers.ModelSerializer):
    """Serializer for InterestTag."""
    
    class Meta:
        model = InterestTag
        fields = ['id', 'slug', 'display_name']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile."""
    
    interests = InterestTagSerializer(many=True, read_only=True)
    interest_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=InterestTag.objects.filter(is_active=True),
        write_only=True,
        required=False
    )
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'initials', 'department', 'study_level',
            'about_text', 'interests', 'interest_ids', 'profile_completed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'profile_completed', 'created_at', 'updated_at']

    def validate_about_text(self, value):
        """Validate about text length."""
        if len(value) > 500:
            raise serializers.ValidationError('About text cannot exceed 500 characters.')
        return value

    def update(self, instance, validated_data):
        """Update profile and handle interests."""
        interest_ids = validated_data.pop('interest_ids', None)
        instance = super().update(instance, validated_data)
        
        if interest_ids is not None:
            instance.interests.set(interest_ids)
        
        # Mark as completed if all required fields are filled
        if instance.department and instance.study_level and instance.initials:
            instance.profile_completed = True
            instance.save()
        
        return instance


class ProfilePublicSerializer(serializers.ModelSerializer):
    """Public serializer for profile (visible to match partner)."""

    class Meta:
        model = Profile
        fields = ['initials', 'department', 'study_level', 'about_text']
        read_only_fields = ['initials', 'department', 'study_level', 'about_text']

