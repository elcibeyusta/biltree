"""
Views for profiles app.
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Profile, InterestTag
from .serializers import ProfileSerializer, ProfilePublicSerializer, InterestTagSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user's profile."""
    
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Get or create profile for current user."""
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interests_list(request):
    """List all active interest tags."""
    interests = InterestTag.objects.filter(is_active=True)
    serializer = InterestTagSerializer(interests, many=True)
    return Response(serializer.data)

