"""
Matching algorithm implementation.
"""
import random
from django.contrib.auth import get_user_model
from .models import Match

User = get_user_model()


def run_matching_algorithm():
    """
    Run the matching algorithm to pair participants.
    
    Returns:
        List of Match objects created.
    
    Algorithm:
    1. Get all verified users with completed profiles
    2. Shuffle randomly
    3. Pair users [0,1], [2,3], ...
    4. If odd number: last user remains unmatched (admin will handle)
    """
    # Get eligible participants
    eligible_users = User.objects.filter(
        email_verified=True,
        is_active=True,
        profile__profile_completed=True
    ).select_related('profile').distinct()

    if eligible_users.count() < 2:
        raise ValueError('Need at least 2 participants to run matching.')

    # Convert to list and shuffle
    users_list = list(eligible_users)
    random.shuffle(users_list)
    
    matches = []
    n = len(users_list)

    # Create pairs (ignore last user if odd number)
    # Round down to even number for pairing
    pairs_count = n // 2
    
    for i in range(0, pairs_count * 2, 2):
        match = Match.objects.create(
            user_a=users_list[i],
            user_b=users_list[i + 1],
            status='pending'  # Create as pending, admin will deploy
        )
        matches.append(match)

    return matches

