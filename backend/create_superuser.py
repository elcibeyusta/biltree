"""
Script to create a superuser programmatically.
Run with: docker compose exec backend python create_superuser.py
"""
import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

import django

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    # Also try loading from current directory
    load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bilkent_secret_gifts.settings')
django.setup()

from accounts.models import User


def require_env(name: str) -> str:
    """Fetch mandatory environment variable."""
    value = os.getenv(name)
    if not value:
        raise SystemExit(f'{name} is required. Set it before running this script.')
    return value


EMAIL = require_env('SUPERUSER_EMAIL')
PASSWORD = os.getenv('SUPERUSER_PASSWORD')
AUTO_PASSWORD = False

if not PASSWORD:
    PASSWORD = secrets.token_urlsafe(20)
    AUTO_PASSWORD = True

FIRST_NAME = os.getenv('SUPERUSER_FIRST_NAME', 'Admin')
LAST_NAME = os.getenv('SUPERUSER_LAST_NAME', 'User')

existing = User.objects.filter(email=EMAIL, is_superuser=True).first()
if existing:
    print(f'Superuser with email {EMAIL} already exists.')
else:
    User.objects.create_superuser(
        email=EMAIL,
        password=PASSWORD,
        first_name=FIRST_NAME,
        last_name=LAST_NAME,
    )
    print('Superuser created successfully!')
    print(f'Email: {EMAIL}')
    print(f'Password: {PASSWORD}')
    if AUTO_PASSWORD:
        print('NOTE: Password was auto-generated. Store it securely and rotate it after first login.')

