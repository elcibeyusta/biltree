"""
Views for matching app.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Match, Message
from .serializers import MatchSerializer, MatchDetailSerializer, MessageSerializer, CreateMessageSerializer
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
@permission_classes([permissions.IsAuthenticated])
def mark_match_seen(request):
    """Mark the current user's match as seen."""
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

        if match:
            match.mark_as_seen(request.user)
            return Response({'message': 'Match marked as seen.'}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'No match found.'},
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



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_messages(request):
    """Get messages for current user's match."""
    try:
        # Find user's match
        match = Match.objects.filter(status='active').filter(
            user_a=request.user
        ).first()

        if not match:
            match = Match.objects.filter(status='active').filter(
                user_b=request.user
            ).first()

        if not match:
            return Response(
                {'error': 'No match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = match.messages.all()
        serializer = MessageSerializer(messages, many=True, context={'request': request})

        # Mark unread messages as read
        messages.filter(read=False).exclude(sender=request.user).update(read=True)

        return Response(serializer.data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_message(request):
    """Send a message to match partner."""
    try:
        # Find user's match
        match = Match.objects.filter(status='active').filter(
            user_a=request.user
        ).first()

        if not match:
            match = Match.objects.filter(status='active').filter(
                user_b=request.user
            ).first()

        if not match:
            return Response(
                {'error': 'No match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CreateMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(
                match=match,
                sender=request.user
            )
            response_serializer = MessageSerializer(message, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request):
    """Mark all messages from partner as read."""
    try:
        # Find user's match
        match = Match.objects.filter(status='active').filter(
            user_a=request.user
        ).first()

        if not match:
            match = Match.objects.filter(status='active').filter(
                user_b=request.user
            ).first()

        if not match:
            return Response(
                {'error': 'No match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Mark unread messages from partner as read
        count = match.messages.filter(read=False).exclude(sender=request.user).update(read=True)

        return Response({'marked_read': count}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
