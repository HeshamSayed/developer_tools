from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Team, TeamMember, TeamInvitation, TeamAPIKey,
    TeamAuditLog, TeamUsageLog, TeamRole
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information for team display"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class TeamSerializer(serializers.ModelSerializer):
    """Team serializer"""
    member_count = serializers.ReadOnlyField()
    owner_id = serializers.PrimaryKeyRelatedField(
        source='owner',
        queryset=User.objects.all(),
        write_only=True,
        required=False
    )
    owner_username = serializers.CharField(
        source='owner.username',
        read_only=True
    )

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'owner_id', 'owner_username',
            'subscription_tier', 'member_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'member_count']

    def create(self, validated_data):
        # Set owner to current user if not provided
        if 'owner' not in validated_data:
            validated_data['owner'] = self.context['request'].user

        team = Team.objects.create(**validated_data)

        # Automatically add owner as a team member
        TeamMember.objects.create(
            team=team,
            user=validated_data['owner'],
            role=TeamRole.OWNER
        )

        # Log team creation
        TeamAuditLog.objects.create(
            team=team,
            user=validated_data['owner'],
            action='team_created',
            resource_type='team',
            resource_id=team.id,
            ip_address=self.context['request'].META.get('REMOTE_ADDR'),
            details={
                'name': team.name,
                'subscription_tier': team.subscription_tier
            }
        )

        return team


class TeamMemberSerializer(serializers.ModelSerializer):
    """Team member serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta:
        model = TeamMember
        fields = [
            'id', 'team', 'user_id', 'username', 'email',
            'role', 'joined_at', 'last_active'
        ]
        read_only_fields = ['id', 'joined_at', 'last_active']


class TeamInvitationSerializer(serializers.ModelSerializer):
    """Team invitation serializer"""
    invited_by_username = serializers.CharField(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'team', 'team_name', 'email', 'role',
            'invited_by', 'invited_by_username', 'status',
            'created_at', 'expires_at', 'accepted_at'
        ]
        read_only_fields = [
            'id', 'invited_by', 'invited_by_username',
            'status', 'created_at', 'expires_at', 'accepted_at'
        ]

    def create(self, validated_data):
        # Set invited_by to current user
        validated_data['invited_by'] = self.context['request'].user

        invitation = TeamInvitation.objects.create(**validated_data)

        # Log invitation
        TeamAuditLog.objects.create(
            team=invitation.team,
            user=self.context['request'].user,
            action='member_invited',
            resource_type='invitation',
            resource_id=invitation.id,
            ip_address=self.context['request'].META.get('REMOTE_ADDR'),
            details={
                'email': invitation.email,
                'role': invitation.role
            }
        )

        return invitation


class TeamAPIKeySerializer(serializers.ModelSerializer):
    """Team API key serializer"""
    created_by_username = serializers.CharField(read_only=True)
    key = serializers.CharField(read_only=True)  # Only shown on creation

    class Meta:
        model = TeamAPIKey
        fields = [
            'id', 'team', 'name', 'key', 'key_prefix',
            'created_by', 'created_by_username', 'last_used',
            'total_requests', 'is_active', 'expires_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'key', 'key_prefix', 'created_by', 'created_by_username',
            'last_used', 'total_requests', 'created_at'
        ]

    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user

        api_key = TeamAPIKey.objects.create(**validated_data)

        # Log API key creation
        TeamAuditLog.objects.create(
            team=api_key.team,
            user=self.context['request'].user,
            action='api_key_created',
            resource_type='api_key',
            resource_id=api_key.id,
            ip_address=self.context['request'].META.get('REMOTE_ADDR'),
            details={
                'name': api_key.name,
                'key_prefix': api_key.key_prefix
            }
        )

        return api_key


class TeamAuditLogSerializer(serializers.ModelSerializer):
    """Team audit log serializer"""
    username = serializers.CharField(read_only=True)

    class Meta:
        model = TeamAuditLog
        fields = [
            'id', 'team', 'user', 'username', 'action',
            'resource_type', 'resource_id', 'ip_address',
            'details', 'created_at'
        ]
        read_only_fields = fields


class TopToolUsageSerializer(serializers.Serializer):
    """Serializer for top tool usage statistics"""
    tool_slug = serializers.CharField()
    tool_name = serializers.CharField()
    usage_count = serializers.IntegerField()


class MemberActivitySerializer(serializers.Serializer):
    """Serializer for member activity statistics"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    usage_count = serializers.IntegerField()
    last_active = serializers.DateTimeField()


class TeamStatsSerializer(serializers.Serializer):
    """Team statistics serializer"""
    total_members = serializers.IntegerField()
    active_members = serializers.IntegerField()
    total_api_calls = serializers.IntegerField()
    total_api_calls_today = serializers.IntegerField()
    total_api_calls_this_month = serializers.IntegerField()
    quota_used = serializers.IntegerField()
    quota_limit = serializers.IntegerField()
    quota_remaining = serializers.IntegerField()
    top_tools = TopToolUsageSerializer(many=True)
    member_activity = MemberActivitySerializer(many=True)


class InviteMemberSerializer(serializers.Serializer):
    """Serializer for inviting a member"""
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=[
            (TeamRole.ADMIN, 'Admin'),
            (TeamRole.DEVELOPER, 'Developer'),
            (TeamRole.VIEWER, 'Viewer'),
        ],
        default=TeamRole.DEVELOPER
    )

    def validate_role(self, value):
        """Don't allow inviting as owner"""
        if value == TeamRole.OWNER:
            raise serializers.ValidationError("Cannot invite members as owner")
        return value


class UpdateMemberRoleSerializer(serializers.Serializer):
    """Serializer for updating member role"""
    role = serializers.ChoiceField(
        choices=[
            (TeamRole.ADMIN, 'Admin'),
            (TeamRole.DEVELOPER, 'Developer'),
            (TeamRole.VIEWER, 'Viewer'),
        ]
    )

    def validate_role(self, value):
        """Don't allow changing to owner"""
        if value == TeamRole.OWNER:
            raise serializers.ValidationError("Cannot change role to owner")
        return value
