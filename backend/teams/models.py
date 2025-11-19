import secrets
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import EmailValidator


class TeamRole(models.TextChoices):
    """Team member roles with hierarchical permissions"""
    OWNER = 'owner', 'Owner'
    ADMIN = 'admin', 'Admin'
    DEVELOPER = 'developer', 'Developer'
    VIEWER = 'viewer', 'Viewer'


class SubscriptionTier(models.TextChoices):
    """Team subscription tiers"""
    FREE = 'free', 'Free'
    PRO = 'pro', 'Pro'
    ENTERPRISE = 'enterprise', 'Enterprise'


class Team(models.Model):
    """Team entity for collaboration"""
    id = models.CharField(max_length=32, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_teams'
    )
    subscription_tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            # Generate team ID
            self.id = secrets.token_hex(16)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.subscription_tier})"

    @property
    def member_count(self):
        """Get total number of members in team"""
        return self.members.count()

    @property
    def daily_quota(self):
        """Get daily API call quota based on subscription tier"""
        quotas = {
            SubscriptionTier.FREE: 100,
            SubscriptionTier.PRO: 10000,
            SubscriptionTier.ENTERPRISE: 999999
        }
        return quotas.get(self.subscription_tier, 100)

    @property
    def monthly_quota(self):
        """Get monthly API call quota"""
        quotas = {
            SubscriptionTier.FREE: 1000,
            SubscriptionTier.PRO: 100000,
            SubscriptionTier.ENTERPRISE: 9999999
        }
        return quotas.get(self.subscription_tier, 1000)


class TeamMember(models.Model):
    """Team membership with roles"""
    id = models.CharField(max_length=32, primary_key=True, editable=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='team_memberships'
    )
    role = models.CharField(
        max_length=20,
        choices=TeamRole.choices,
        default=TeamRole.DEVELOPER
    )

    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'team_members'
        unique_together = ['team', 'user']
        ordering = ['role', '-joined_at']
        indexes = [
            models.Index(fields=['team', 'user']),
            models.Index(fields=['user', 'team']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = secrets.token_hex(16)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.team.name} ({self.role})"

    @property
    def username(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email

    def update_last_active(self):
        """Update last active timestamp"""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])


class TeamInvitation(models.Model):
    """Team member invitations"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]

    id = models.CharField(max_length=32, primary_key=True, editable=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    email = models.EmailField(validators=[EmailValidator()])
    role = models.CharField(
        max_length=20,
        choices=TeamRole.choices,
        default=TeamRole.DEVELOPER
    )
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'team_invitations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['team', 'status']),
            models.Index(fields=['email', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = secrets.token_hex(16)
        if not self.expires_at:
            # Invitations expire after 7 days
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invite: {self.email} to {self.team.name} ({self.status})"

    @property
    def invited_by_username(self):
        return self.invited_by.username if self.invited_by else 'System'

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def accept(self, user):
        """Accept invitation and create team member"""
        if self.is_expired:
            self.status = 'expired'
            self.save()
            return False, "Invitation has expired"

        if self.status != 'pending':
            return False, "Invitation is no longer valid"

        # Create team member
        TeamMember.objects.create(
            team=self.team,
            user=user,
            role=self.role
        )

        self.status = 'accepted'
        self.accepted_at = timezone.now()
        self.save()
        return True, "Invitation accepted"


class TeamAPIKey(models.Model):
    """Team-level API keys"""
    id = models.CharField(max_length=32, primary_key=True, editable=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='api_keys'
    )
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=64, unique=True, db_index=True)
    key_prefix = models.CharField(max_length=8)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_team_api_keys'
    )

    # Usage tracking
    last_used = models.DateTimeField(null=True, blank=True)
    total_requests = models.IntegerField(default=0)

    # Status and expiration
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'team_api_keys'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['team', 'is_active']),
        ]

    @staticmethod
    def generate_key():
        return 'team_' + secrets.token_urlsafe(48)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = secrets.token_hex(16)
        if not self.key:
            self.key = self.generate_key()
            self.key_prefix = self.key[:12]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.team.name} - {self.name} ({self.key_prefix}...)"

    @property
    def created_by_username(self):
        return self.created_by.username if self.created_by else 'System'

    def is_valid(self):
        """Check if API key is valid"""
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def record_usage(self):
        """Update last_used and increment total_requests"""
        self.last_used = timezone.now()
        self.total_requests += 1
        self.save(update_fields=['last_used', 'total_requests'])


class TeamAuditLog(models.Model):
    """Audit log for team actions"""
    id = models.CharField(max_length=32, primary_key=True, editable=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='team_actions'
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'team_audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['team', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = secrets.token_hex(16)
        super().save(*args, **kwargs)

    def __str__(self):
        username = self.user.username if self.user else 'System'
        return f"{self.team.name} - {username}: {self.action}"

    @property
    def username(self):
        return self.user.username if self.user else 'System'


class TeamUsageLog(models.Model):
    """Track API usage per team"""
    id = models.CharField(max_length=32, primary_key=True, editable=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='usage_logs'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='team_usage_logs'
    )
    api_key = models.ForeignKey(
        TeamAPIKey,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usage_logs'
    )

    # Request details
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    tool_slug = models.CharField(max_length=100, blank=True)
    tool_name = models.CharField(max_length=100, blank=True)

    # Response details
    status_code = models.IntegerField()
    response_time_ms = models.FloatField()
    file_size_bytes = models.BigIntegerField(default=0)

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'team_usage_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['team', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['tool_slug']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = secrets.token_hex(16)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.team.name} - {self.endpoint} ({self.created_at})"
