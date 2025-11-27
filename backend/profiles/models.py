"""
Profile models for profiles app.
"""
from django.db import models
from django.conf import settings


class InterestTag(models.Model):
    """Interest tags for user profiles."""
    
    slug = models.SlugField(unique=True, max_length=50)
    display_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interest_tags'
        ordering = ['display_name']

    def __str__(self):
        return self.display_name


class Profile(models.Model):
    """User profile model."""
    
    DEPARTMENT_CHOICES = [
        ('CS', 'Computer Science'),
        ('EE', 'Electrical and Electronics Engineering'),
        ('IE', 'Industrial Engineering'),
        ('ME', 'Mechanical Engineering'),
        ('CE', 'Civil Engineering'),
        ('CHE', 'Chemical Engineering'),
        ('PHYS', 'Physics'),
        ('MATH', 'Mathematics'),
        ('ECON', 'Economics'),
        ('PSYC', 'Psychology'),
        ('LAW', 'Law'),
        ('MUSIC', 'Music'),
        ('ART', 'Art, Design and Architecture'),
        ('MAN', 'Management'),
        ('POL', 'Political Science'),
        ('LIT', 'Literature'),
        ('OTHER', 'Other'),
    ]

    STUDY_LEVEL_CHOICES = [
        ('UG', 'Undergraduate'),
        ('GR', 'Graduate'),
        ('PHD', 'PhD'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    initials = models.CharField(max_length=10)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    study_level = models.CharField(max_length=5, choices=STUDY_LEVEL_CHOICES)
    about_text = models.TextField(max_length=500, blank=True)
    interests = models.ManyToManyField(InterestTag, blank=True, related_name='profiles')
    profile_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.initials} - {self.user.email}'

    def save(self, *args, **kwargs):
        """Auto-generate initials if not provided."""
        if not self.initials:
            self.initials = self._generate_initials()
        super().save(*args, **kwargs)

    def _generate_initials(self):
        """Generate initials from user's name."""
        first = self.user.first_name[0].upper() if self.user.first_name else ''
        last = self.user.last_name[0].upper() if self.user.last_name else ''
        return f'{first}{last}'

