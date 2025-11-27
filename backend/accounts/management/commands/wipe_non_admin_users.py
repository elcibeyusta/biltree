"""
Django management command to delete all users except admin users.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Q
from profiles.models import Profile
from matching.models import Match

User = get_user_model()


class Command(BaseCommand):
    help = 'Deletes all users except admin users (is_staff=True or is_superuser=True)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion (required to actually delete)',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete all non-admin users!\n'
                    'Run with --confirm to proceed.'
                )
            )
            return

        # Get all admin users
        admin_users = User.objects.filter(
            Q(is_staff=True) | Q(is_superuser=True)
        )
        admin_count = admin_users.count()
        admin_emails = list(admin_users.values_list('email', flat=True))

        if admin_count == 0:
            self.stdout.write(
                self.style.ERROR('No admin users found! Aborting to prevent accidental deletion.')
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f'Preserving {admin_count} admin user(s):\n' +
                '\n'.join(f'  - {email}' for email in admin_emails)
            )
        )

        # Get all non-admin users
        non_admin_users = User.objects.exclude(
            Q(is_staff=True) | Q(is_superuser=True)
        )
        non_admin_count = non_admin_users.count()

        if non_admin_count == 0:
            self.stdout.write(self.style.SUCCESS('No non-admin users to delete.'))
            return

        self.stdout.write(
            self.style.WARNING(f'Deleting {non_admin_count} non-admin user(s)...')
        )

        # Delete associated profiles and matches first
        user_ids = list(non_admin_users.values_list('id', flat=True))
        
        # Delete matches involving these users
        matches_deleted = Match.objects.filter(
            Q(user_a_id__in=user_ids) |
            Q(user_b_id__in=user_ids) |
            Q(user_c_id__in=user_ids)
        ).delete()[0]
        
        # Delete profiles
        profiles_deleted = Profile.objects.filter(user_id__in=user_ids).delete()[0]

        # Delete users
        users_deleted = non_admin_users.delete()[0]

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully deleted:\n'
                f'  - {users_deleted} user(s)\n'
                f'  - {profiles_deleted} profile(s)\n'
                f'  - {matches_deleted} match(es)\n'
                f'\nPreserved {admin_count} admin user(s).'
            )
        )

