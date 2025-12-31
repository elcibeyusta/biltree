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
    2. Exclude superusers (event admins) and elcibey.usta@ug.bilkent.edu.tr
    3. Shuffle remaining users randomly
    4. If count is even: pair normally [0,1], [2,3], ...
       If count is odd: add elcibey usta and pair everyone
    """
    ELCIBEY_EMAIL = 'elcibey.usta@ug.bilkent.edu.tr'

    # Get eligible participants (exclude superusers and elcibey)
    eligible_users = User.objects.filter(
        email_verified=True,
        is_active=True,
        profile__profile_completed=True,
        is_superuser=False
    ).exclude(email=ELCIBEY_EMAIL).select_related('profile').distinct()

    # Get elcibey usta if they exist and are eligible
    elcibey_user = User.objects.filter(
        email=ELCIBEY_EMAIL,
        email_verified=True,
        is_active=True,
        profile__profile_completed=True
    ).first()

    if eligible_users.count() < 2:
        raise ValueError('Need at least 2 participants to run matching.')

    # Convert to list and shuffle
    users_list = list(eligible_users)
    random.shuffle(users_list)

    matches = []
    n = len(users_list)

    # If odd number, add elcibey to make it even
    if n % 2 == 1:
        if elcibey_user:
            users_list.append(elcibey_user)
            n += 1

    pairs_count = n // 2

    for i in range(0, pairs_count * 2, 2):
        match = Match.objects.create(
            user_a=users_list[i],
            user_b=users_list[i + 1],
            status='pending'  # Create as pending, admin will deploy
        )
        matches.append(match)

    return matches

