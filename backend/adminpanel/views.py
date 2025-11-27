"""
Views for admin panel app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from accounts.models import User
from profiles.models import Profile
from matching.models import Match
from meetings.models import Meeting
from content.models import EventConfig
from accounts.serializers import UserSerializer
from profiles.serializers import ProfileSerializer
from matching.serializers import MatchSerializer
from content.serializers import EventConfigSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def users_list(request):
    """List users with filters."""
    queryset = User.objects.all()
    
    # Filters
    search = request.query_params.get('search', '')
    email_verified = request.query_params.get('email_verified', None)
    is_active = request.query_params.get('is_active', None)
    
    if search:
        queryset = queryset.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    if email_verified is not None:
        queryset = queryset.filter(email_verified=email_verified.lower() == 'true')
    
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active.lower() == 'true')
    
    # Pagination would be handled by DRF's pagination
    serializer = UserSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def matches_list(request):
    """List all matches."""
    matches = Match.objects.all().select_related('user_a', 'user_b', 'user_c').order_by('-created_at')
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)


@api_view(['PATCH', 'PUT'])
@permission_classes([permissions.IsAdminUser])
def update_match(request, match_id):
    """Update a match (admin only) with automatic user swapping to ensure one match per user."""
    from django.db import transaction
    
    try:
        match = Match.objects.get(id=match_id)
        
        # Determine final state after update (handle partial updates)
        final_user_a_id = request.data.get('user_a', match.user_a_id)
        final_user_b_id = request.data.get('user_b', match.user_b_id)
        final_user_c_id = request.data.get('user_c')
        if final_user_c_id == '' or final_user_c_id is None:
            final_user_c_id = None
        elif final_user_c_id is not None:
            final_user_c_id = int(final_user_c_id)
        
        # Current users in this match
        current_users = {match.user_a_id, match.user_b_id}
        if match.user_c_id:
            current_users.add(match.user_c_id)
        
        # Final users after update
        final_users = {int(final_user_a_id), int(final_user_b_id)}
        if final_user_c_id:
            final_users.add(final_user_c_id)
        
        # Users being added to this match (new users)
        users_being_added = final_users - current_users
        
        # Users being removed from this match
        users_being_removed = current_users - final_users
        
        with transaction.atomic():
            # Track which users have been swapped to avoid double-swapping
            swapped_users = set()
            
            # For each user being added to this match, handle their old match
            for user_id in users_being_added:
                # Find all other matches containing this user (refresh each time to get latest state)
                old_matches = Match.objects.exclude(id=match_id).filter(
                    Q(user_a_id=user_id) | Q(user_b_id=user_id) | Q(user_c_id=user_id)
                )
                
                for old_match in old_matches:
                    # Refresh from DB to get latest state after potential previous swaps
                    old_match.refresh_from_db()
                    
                    # Check if user is still in this match (might have been swapped already)
                    if old_match.user_a_id != user_id and old_match.user_b_id != user_id and old_match.user_c_id != user_id:
                        continue
                    
                    # Determine which field the user is in
                    if old_match.user_a_id == user_id:
                        old_field = 'user_a'
                    elif old_match.user_b_id == user_id:
                        old_field = 'user_b'
                    else:  # user_c
                        old_field = 'user_c'
                    
                    # Try to swap: replace the moved user with a user being removed from current match
                    if users_being_removed and user_id not in swapped_users:
                        swap_user_id = users_being_removed.pop()
                        
                        # Update old match: replace the moved user with the swap user
                        if old_field == 'user_a':
                            old_match.user_a_id = swap_user_id
                        elif old_field == 'user_b':
                            old_match.user_b_id = swap_user_id
                        else:  # user_c
                            old_match.user_c_id = swap_user_id
                        old_match.save()
                        swapped_users.add(user_id)
                    else:
                        # No swap candidate or already swapped - remove user from old match
                        if old_field == 'user_c':
                            # Can set user_c to None (group of 3 becomes pair)
                            old_match.user_c = None
                            old_match.save()
                        else:
                            # Removing user_a or user_b
                            # Get remaining users
                            remaining_users = []
                            if old_match.user_a_id and old_match.user_a_id != user_id:
                                remaining_users.append(old_match.user_a_id)
                            if old_match.user_b_id and old_match.user_b_id != user_id:
                                remaining_users.append(old_match.user_b_id)
                            if old_match.user_c_id:
                                remaining_users.append(old_match.user_c_id)
                            
                            if len(remaining_users) < 2:
                                # Match becomes invalid (need at least 2 users) - delete it
                                old_match.delete()
                            elif len(remaining_users) == 2:
                                # Reorganize: pair the two remaining users
                                old_match.user_a_id = remaining_users[0]
                                old_match.user_b_id = remaining_users[1]
                                old_match.user_c = None
                                old_match.save()
                            else:
                                # 3 users remaining - reorganize to keep as group of 3
                                old_match.user_a_id = remaining_users[0]
                                old_match.user_b_id = remaining_users[1]
                                old_match.user_c_id = remaining_users[2]
                                old_match.save()
            
            # Now update the current match
            serializer = MatchSerializer(match, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Match.DoesNotExist:
        return Response(
            {'error': 'Match not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except (ValueError, TypeError) as e:
        return Response(
            {'error': f'Invalid user ID: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_match(request, match_id):
    """Delete a match (admin only)."""
    try:
        match = Match.objects.get(id=match_id)
        match.delete()
        return Response(
            {'message': 'Match deleted successfully'},
            status=status.HTTP_200_OK
        )
    except Match.DoesNotExist:
        return Response(
            {'error': 'Match not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def deploy_matches(request):
    """Deploy pending matches to users (change status to active)."""
    try:
        pending_matches = Match.objects.filter(status='pending')
        count = pending_matches.count()
        
        if count == 0:
            return Response(
                {'message': 'No pending matches to deploy'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update all pending matches to active
        pending_matches.update(status='active', notified_at=timezone.now())
        
        # TODO: Send email notifications to users
        
        return Response(
            {
                'message': f'Successfully deployed {count} matches to users.',
                'deployed_count': count
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def meetings_list(request):
    """List all meetings."""
    from meetings.serializers import MeetingSerializer
    
    meetings = Meeting.objects.all().select_related('match', 'selected_location', 'confirmed_slot')
    serializer = MeetingSerializer(meetings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    """Get admin dashboard statistics."""
    total_users = User.objects.count()
    verified_users = User.objects.filter(email_verified=True).count()
    completed_profiles = Profile.objects.filter(profile_completed=True).count()
    pending_matches = Match.objects.filter(status='pending').count()
    active_matches = Match.objects.filter(status='active').count()
    confirmed_meetings = Meeting.objects.filter(status='confirmed').count()
    exchanged_gifts = Meeting.objects.filter(gift_exchanged=True).count()
    
    return Response({
        'total_users': total_users,
        'verified_users': verified_users,
        'completed_profiles': completed_profiles,
        'pending_matches': pending_matches,
        'active_matches': active_matches,
        'confirmed_meetings': confirmed_meetings,
        'gifts_exchanged': exchanged_gifts
    })


@api_view(['PUT'])
@permission_classes([permissions.IsAdminUser])
def update_config(request):
    """Update event configuration."""
    config = EventConfig.get_config()
    serializer = EventConfigSerializer(config, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
