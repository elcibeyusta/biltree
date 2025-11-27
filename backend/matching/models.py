"""
Matching models for matching app.
"""
from django.db import models
from django.conf import settings


class Match(models.Model):
    """Match between participants."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
    ]

    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_a'
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_b'
    )
    user_c = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_c',
        null=True,
        blank=True,
        help_text='For groups of 3 (A gives to B, B gives to C, C gives to A)'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'matches'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(user_a__isnull=False) & models.Q(user_b__isnull=False),
                name='user_a_and_b_required'
            ),
        ]

    def __str__(self):
        if self.user_c:
            return f'Match {self.id}: {self.user_a.email} ↔ {self.user_b.email} ↔ {self.user_c.email}'
        return f'Match {self.id}: {self.user_a.email} ↔ {self.user_b.email}'

    def get_partner(self, user):
        """Get the partner of a given user in this match."""
        if user == self.user_a:
            return self.user_b
        elif user == self.user_b:
            return self.user_a
        elif user == self.user_c:
            return None  # In groups of 3, user_c's partner depends on direction
        return None

    def get_gift_recipient(self, user):
        """Get who this user should give a gift to."""
        if not self.user_c:
            # Simple pair: A gives to B, B gives to A
            return self.get_partner(user)
        else:
            # Group of 3: A gives to B, B gives to C, C gives to A
            if user == self.user_a:
                return self.user_b
            elif user == self.user_b:
                return self.user_c
            elif user == self.user_c:
                return self.user_a
        return None

