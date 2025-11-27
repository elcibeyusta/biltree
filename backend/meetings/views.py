"""
Views for meetings app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from matching.models import Match
from .models import Meeting, MeetingSlot, Location
from .serializers import (
    MeetingSerializer,
    MeetingSlotSerializer,
    MeetingSlotCreateSerializer,
    LocationSerializer
)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_meeting(request):
    """Get current user's meeting."""
    try:
        # Find user's match
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

        if not match:
            return Response(
                {'message': 'No active match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get or create meeting
        meeting, created = Meeting.objects.get_or_create(match=match)
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_slots(request):
    """Create meeting slot proposals."""
    try:
        # Find user's match
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

        if not match:
            return Response(
                {'error': 'No active match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        meeting, created = Meeting.objects.get_or_create(match=match)
        
        # Delete existing slots by this user
        MeetingSlot.objects.filter(meeting=meeting, proposed_by=request.user).delete()

        # Validate and create new slots
        serializer = MeetingSlotCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        slots_data = serializer.validated_data['slots']
        for slot_data in slots_data:
            MeetingSlot.objects.create(
                meeting=meeting,
                proposed_by=request.user,
                start_datetime=slot_data['start_datetime'],
                end_datetime=slot_data['end_datetime']
            )

        # Update meeting status
        if meeting.status == 'no_proposals':
            meeting.status = 'proposed'
        elif meeting.status == 'awaiting_confirmation':
            meeting.status = 'proposed'
        meeting.save()

        return Response(
            {'message': 'Slots created successfully.'},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_slot(request, slot_id):
    """Confirm a meeting slot from partner's proposals."""
    try:
        slot = MeetingSlot.objects.get(id=slot_id)
        meeting = slot.meeting

        # Verify user is part of the match
        match = meeting.match
        if request.user not in [match.user_a, match.user_b, match.user_c]:
            return Response(
                {'error': 'Not authorized to confirm this slot.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify slot is from partner
        if slot.proposed_by == request.user:
            return Response(
                {'error': 'Cannot confirm your own slot.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Confirm slot
        slot.is_selected = True
        slot.save()

        meeting.confirmed_slot = slot
        meeting.status = 'confirmed'
        
        # Set location if provided
        location_id = request.data.get('location_id')
        if location_id:
            try:
                location = Location.objects.get(id=location_id, is_active=True)
                meeting.selected_location = location
            except Location.DoesNotExist:
                pass

        location_notes = request.data.get('location_notes', '')
        if location_notes:
            meeting.location_notes = location_notes

        meeting.save()

        return Response(
            {'message': 'Meeting slot confirmed successfully.'},
            status=status.HTTP_200_OK
        )
    except MeetingSlot.DoesNotExist:
        return Response(
            {'error': 'Slot not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def mark_exchanged(request):
    """Mark gift as exchanged."""
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

        if not match:
            return Response(
                {'error': 'No active match found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        meeting, created = Meeting.objects.get_or_create(match=match)
        meeting.gift_exchanged = True
        meeting.save()

        return Response(
            {'message': 'Gift exchange marked as completed.'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def locations_list(request):
    """List all active locations."""
    locations = Location.objects.filter(is_active=True)
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)

