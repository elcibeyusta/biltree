"""
Views for accounts app.
"""
import os
import secrets
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create user and send verification email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email
        # Use frontend URL for verification link
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email?token={user.email_verification_token}"
        send_mail(
            subject='Verify your Bilkent Secret Gifts account',
            message=f'Click the link to verify your email: {verification_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                'message': 'Registration successful. Please check your email to verify your account.',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """Verify user email with token."""
    try:
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        user = User.objects.get(email_verification_token=token)
        user.email_verified = True
        user.email_verification_token = None
        user.save()

        return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid verification token. Please check your email for the correct link.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Verification failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Request password reset."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        token = secrets.token_urlsafe(32)
        user.email_verification_token = token  # Reuse field for reset token
        user.save()

        # Use frontend URL for password reset link
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/reset-password?token={token}"
        send_mail(
            subject='Reset your Bilkent Secret Gifts password',
            message=f'Click the link to reset your password: {reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except User.DoesNotExist:
        pass  # Don't reveal if email exists

    return Response(
        {'message': 'If the email exists, a password reset link has been sent.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password with token."""
    serializer = PasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    token = serializer.validated_data['token']
    password = serializer.validated_data['password']
    
    try:
        user = User.objects.get(email_verification_token=token)
        user.set_password(password)
        user.email_verification_token = None
        user.save()
        return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid reset token.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(TokenObtainPairView):
    """Custom login view that returns user data with tokens."""
    
    def post(self, request, *args, **kwargs):
        """Login and return tokens + user data."""
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                response.data['user'] = UserSerializer(user).data
            except User.DoesNotExist:
                pass
        
        return response


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """Logout user (blacklist refresh token)."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Get current user details."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

