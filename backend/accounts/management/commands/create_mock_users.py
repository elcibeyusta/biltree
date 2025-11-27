"""
Django management command to create mock users for testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from profiles.models import Profile, InterestTag
import random

User = get_user_model()


def transliterate_turkish_to_ascii(text):
    """Convert Turkish characters to ASCII equivalents for email compatibility."""
    replacements = {
        'ç': 'c', 'Ç': 'C',
        'ı': 'i', 'İ': 'I',
        'ş': 's', 'Ş': 'S',
        'ğ': 'g', 'Ğ': 'G',
        'ö': 'o', 'Ö': 'O',
        'ü': 'u', 'Ü': 'U',
    }
    for turkish, ascii_char in replacements.items():
        text = text.replace(turkish, ascii_char)
    return text


class Command(BaseCommand):
    help = 'Creates 10 mock users with completed profiles for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of mock users to create (default: 10)',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Sample data for mock users (ASCII-only to avoid email validation issues)
        first_names = [
            'Ahmet', 'Ayse', 'Mehmet', 'Fatma', 'Ali', 'Zeynep',
            'Mustafa', 'Elif', 'Hasan', 'Merve', 'Emre', 'Selin',
            'Can', 'Deniz', 'Burak', 'Ceren', 'Kerem', 'Asli'
        ]
        
        last_names = [
            'Yilmaz', 'Kaya', 'Demir', 'Sahin', 'Celik', 'Yildiz',
            'Yildirim', 'Ozturk', 'Aydin', 'Ozdemir', 'Arslan', 'Dogan',
            'Kilic', 'Simsek', 'Polat', 'Erdogan', 'Koc', 'Akar'
        ]
        
        departments = ['CS', 'EE', 'IE', 'ME', 'CE', 'CHE', 'PHYS', 'MATH', 'ECON', 'PSYC', 'LAW', 'MUSIC', 'ART', 'MAN', 'POL', 'LIT', 'OTHER']
        study_levels = ['UG', 'GR', 'PHD']
        
        about_texts = [
            'I love coding and technology. Passionate about software development and open source projects.',
            'Interested in engineering and innovation. Love working on challenging problems.',
            'Music enthusiast and art lover. Enjoy creative activities and cultural events.',
            'Sports fan and fitness enthusiast. Love outdoor activities and team sports.',
            'Bookworm and literature lover. Enjoy reading and discussing ideas.',
            'Science enthusiast. Fascinated by physics and mathematics.',
            'Business-minded and entrepreneurial. Interested in startups and innovation.',
            'Creative person who loves design and visual arts.',
            'Social person who enjoys meeting new people and networking.',
            'Tech-savvy and always learning new things. Love gadgets and technology.',
        ]
        
        # Get or create some interest tags
        interest_tags_data = [
            ('coding', 'Coding'),
            ('music', 'Music'),
            ('sports', 'Sports'),
            ('reading', 'Reading'),
            ('art', 'Art'),
            ('technology', 'Technology'),
            ('gaming', 'Gaming'),
            ('travel', 'Travel'),
            ('photography', 'Photography'),
            ('cooking', 'Cooking'),
            ('fitness', 'Fitness'),
            ('movies', 'Movies'),
        ]
        
        interest_tags = []
        for slug, display_name in interest_tags_data:
            tag, created = InterestTag.objects.get_or_create(
                slug=slug,
                defaults={'display_name': display_name, 'is_active': True}
            )
            interest_tags.append(tag)
        
        # Create mock users
        created_count = 0
        for i in range(count):
            # Generate unique email (ensure ASCII-only for email validation)
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            email_domains = ['ug.bilkent.edu.tr', 'cs.bilkent.edu.tr', 'bilkent.edu.tr']
            # Transliterate to ASCII to avoid email validation issues
            first_name_ascii = transliterate_turkish_to_ascii(first_name.lower())
            last_name_ascii = transliterate_turkish_to_ascii(last_name.lower())
            email = f'{first_name_ascii}.{last_name_ascii}{i}@{random.choice(email_domains)}'
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User {email} already exists, skipping...'))
                continue
            
            # Create user
            user = User.objects.create_user(
                email=email,
                password='testpass123',  # Default password for all mock users
                first_name=first_name,
                last_name=last_name,
                email_verified=True,  # Auto-verify for testing
                is_active=True
            )
            
            # Create profile
            profile = Profile.objects.create(
                user=user,
                department=random.choice(departments),
                study_level=random.choice(study_levels),
                about_text=random.choice(about_texts),
                profile_completed=True  # Mark as completed
            )
            
            # Add random interest tags (2-4 tags per user)
            num_interests = random.randint(2, 4)
            selected_interests = random.sample(interest_tags, num_interests)
            profile.interests.set(selected_interests)
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created user {i+1}/{count}: {user.email} ({profile.initials}) - '
                    f'{profile.get_department_display()}, {profile.get_study_level_display()}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} mock users!\n'
                f'All users have password: testpass123\n'
                f'All users have verified emails and completed profiles.'
            )
        )

