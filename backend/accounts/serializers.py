"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
from content.models import EventConfig
from profiles.models import Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with profile data."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    # Profile fields
    department = serializers.CharField(max_length=10, required=True)
    study_level = serializers.CharField(max_length=5, required=True)
    about_text = serializers.CharField(max_length=500, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm',
                  'department', 'study_level', 'about_text']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_email(self, value):
        """Validate email domain against allowed domains."""
        config = EventConfig.get_config()
        allowed_domains = config.allowed_email_domains if config.allowed_email_domains else []
        
        if not allowed_domains:
            # Default Bilkent domains if not configured
            allowed_domains = ['ug.bilkent.edu.tr', 'cs.bilkent.edu.tr', 'bilkent.edu.tr']
        
        domain = value.split('@')[-1].lower()
        if domain not in allowed_domains:
            raise serializers.ValidationError(
                f'Email must be from one of these domains: {", ".join(allowed_domains)}'
            )
        
        return value

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        """Create user, profile, and generate verification token."""
        # Extract profile data
        department = validated_data.pop('department')
        study_level = validated_data.pop('study_level')
        about_text = validated_data.pop('about_text', '')
        
        # Create user
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        user.generate_verification_token()
        
        # Generate initials from first_name and last_name
        first_initial = user.first_name[0].upper() if user.first_name else ''
        last_initial = user.last_name[0].upper() if user.last_name else ''
        initials = f'{first_initial}{last_initial}'
        
        # Create profile
        Profile.objects.create(
            user=user,
            initials=initials,
            department=department,
            study_level=study_level,
            about_text=about_text,
            profile_completed=True  # Mark as completed since all fields are filled
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'email_verified', 'is_staff', 'created_at']
        read_only_fields = ['id', 'email', 'email_verified', 'is_staff', 'created_at']


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    
    token = serializers.CharField(required=True)

    def validate_token(self, value):
        """Validate verification token."""
        if not value or not value.strip():
            raise serializers.ValidationError('Token is required.')
        
        # Strip whitespace and handle URL encoding
        value = value.strip()
        
        try:
            # Try exact match first
            user = User.objects.get(email_verification_token=value)
            if user.email_verified:
                raise serializers.ValidationError('Email already verified.')
            return value
        except User.DoesNotExist:
            # Token might be URL-encoded, try to find with similar pattern
            # This is a fallback - the frontend should handle decoding
            raise serializers.ValidationError('Invalid verification token. Please check your email for the correct verification link or request a new one.')


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField(required=True)


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset."""
    
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, validators=[validate_password])
    password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

