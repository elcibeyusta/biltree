"""
Content models for content app (EventConfig, FAQ, etc.).
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class EventConfig(models.Model):
    """Singleton model for event configuration."""
    
    event_year = models.IntegerField(default=2024)
    registration_open = models.DateTimeField()
    registration_close = models.DateTimeField()
    matching_start_date = models.DateTimeField()
    min_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    max_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    allowed_email_domains = models.JSONField(
        default=list,
        help_text='List of allowed email domains (e.g., ["ug.bilkent.edu.tr", "cs.bilkent.edu.tr"])'
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'event_config'
        verbose_name = 'Event Configuration'
        verbose_name_plural = 'Event Configuration'

    def __str__(self):
        return f'Event Config {self.event_year}'

    def save(self, *args, **kwargs):
        """Ensure only one instance exists."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """Get the singleton instance, create if doesn't exist."""
        defaults = {
            'event_year': 2024,
            'registration_open': timezone.now(),
            'registration_close': timezone.now() + timedelta(days=30),
            'matching_start_date': timezone.now() + timedelta(days=31),
            'min_budget': Decimal('200.00'),
            'max_budget': Decimal('500.00'),
            'allowed_email_domains': ['ug.bilkent.edu.tr', 'cs.bilkent.edu.tr', 'bilkent.edu.tr'],
            'is_active': True,
        }
        obj, created = cls.objects.get_or_create(pk=1, defaults=defaults)
        return obj


class FAQ(models.Model):
    """Frequently asked questions."""
    
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faqs'
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.question


class Rule(models.Model):
    """Rules and guidelines."""
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rules'
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title

