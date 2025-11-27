"""
Views for matching app.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Match
from .serializers import MatchSerializer, MatchDetailSerializer
from .matching_algorithm import run_matching_algorithm


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_match(request):
    """Get current user's match."""
    try:
        match = Match.objects.filter(
            status='active'
        ).filter(
            user_a=request.user
        ).first()
        
        if not match:
            match = Match.objects.filter(
                status='active'
            ).filter(
                user_b=request.user
            ).first()
        
        if not match:
            match = Match.objects.filter(
                status='active'
            ).filter(
                user_c=request.user
            ).first()

        if match:
            serializer = MatchDetailSerializer(match, context={'request': request})
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No match found. Matching will begin after registration closes.'},
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def run_matching(request):
    """Run matching algorithm (admin only). Creates matches as 'pending'."""
    try:
        with transaction.atomic():
            # Delete existing pending matches (not active ones, in case they're already deployed)
            Match.objects.filter(status='pending').delete()
            
            # Run matching algorithm (creates matches as 'pending')
            matches = run_matching_algorithm()
            
            return Response(
                {
                    'message': f'Matching completed. {len(matches)} matches created (pending deployment).',
                    'matches_count': len(matches)
                },
                status=status.HTTP_200_OK
            )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

