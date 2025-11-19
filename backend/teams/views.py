from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import (
    Team, TeamMember, TeamInvitation, TeamAPIKey,
    TeamAuditLog, TeamUsageLog, TeamRole
)
from .serializers import (
    TeamSerializer, TeamMemberSerializer, TeamInvitationSerializer,
    TeamAPIKeySerializer, TeamAuditLogSerializer, TeamStatsSerializer,
    InviteMemberSerializer, UpdateMemberRoleSerializer
)
from .permissions import (
    IsTeamMember, IsTeamOwnerOrAdmin, IsTeamOwner,
    CanManageAPIKeys, CanViewAnalytics, CanViewAuditLog,
    has_permission
)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for team operations
    """
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get teams where user is a member"""
        return Team.objects.filter(
            members__user=self.request.user
        ).distinct()

    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsTeamOwnerOrAdmin()]
        elif self.action == 'destroy':
            return [IsAuthenticated(), IsTeamOwner()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Create team and add creator as owner"""
        serializer.save()

    def perform_update(self, serializer):
        """Update team and log the action"""
        team = serializer.save()

        TeamAuditLog.objects.create(
            team=team,
            user=self.request.user,
            action='team_updated',
            resource_type='team',
            resource_id=team.id,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        """Delete team and log the action"""
        TeamAuditLog.objects.create(
            team=instance,
            user=self.request.user,
            action='team_deleted',
            resource_type='team',
            resource_id=instance.id,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            details={'name': instance.name}
        )
        instance.delete()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeamMember])
    def members(self, request, pk=None):
        """Get list of team members"""
        team = self.get_object()
        members = TeamMember.objects.filter(team=team).select_related('user')
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeamOwnerOrAdmin])
    def invite(self, request, pk=None):
        """Invite a member to the team"""
        team = self.get_object()

        serializer = InviteMemberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role']

        # Check if user is already a member
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(email=email)
            if TeamMember.objects.filter(team=team, user=user).exists():
                return Response(
                    {'detail': 'User is already a member of this team'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            pass

        # Check for existing pending invitation
        existing = TeamInvitation.objects.filter(
            team=team,
            email=email,
            status='pending'
        ).first()

        if existing:
            return Response(
                {'detail': 'Invitation already sent to this email'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create invitation
        invitation_serializer = TeamInvitationSerializer(
            data={
                'team': team.id,
                'email': email,
                'role': role
            },
            context={'request': request}
        )

        if invitation_serializer.is_valid():
            invitation_serializer.save()
            return Response(invitation_serializer.data, status=status.HTTP_201_CREATED)

        return Response(invitation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeamOwnerOrAdmin])
    def invitations(self, request, pk=None):
        """Get list of team invitations"""
        team = self.get_object()
        invitations = TeamInvitation.objects.filter(team=team)

        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            invitations = invitations.filter(status=status_filter)

        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='invitations/(?P<invitation_id>[^/.]+)',
            permission_classes=[IsAuthenticated, IsTeamOwnerOrAdmin])
    def cancel_invitation(self, request, pk=None, invitation_id=None):
        """Cancel a pending invitation"""
        team = self.get_object()
        invitation = get_object_or_404(
            TeamInvitation,
            id=invitation_id,
            team=team,
            status='pending'
        )

        invitation.status = 'expired'
        invitation.save()

        TeamAuditLog.objects.create(
            team=team,
            user=request.user,
            action='invitation_cancelled',
            resource_type='invitation',
            resource_id=invitation.id,
            ip_address=request.META.get('REMOTE_ADDR'),
            details={'email': invitation.email}
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)/role',
            permission_classes=[IsAuthenticated, IsTeamOwnerOrAdmin])
    def update_member_role(self, request, pk=None, member_id=None):
        """Update member role"""
        team = self.get_object()
        member = get_object_or_404(TeamMember, id=member_id, team=team)

        # Can't change owner role
        if member.role == TeamRole.OWNER:
            return Response(
                {'detail': 'Cannot change owner role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UpdateMemberRoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        old_role = member.role
        member.role = serializer.validated_data['role']
        member.save()

        TeamAuditLog.objects.create(
            team=team,
            user=request.user,
            action='member_role_updated',
            resource_type='member',
            resource_id=member.id,
            ip_address=request.META.get('REMOTE_ADDR'),
            details={
                'member_username': member.username,
                'old_role': old_role,
                'new_role': member.role
            }
        )

        serializer = TeamMemberSerializer(member)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)',
            permission_classes=[IsAuthenticated, IsTeamOwnerOrAdmin])
    def remove_member(self, request, pk=None, member_id=None):
        """Remove member from team"""
        team = self.get_object()
        member = get_object_or_404(TeamMember, id=member_id, team=team)

        # Can't remove owner
        if member.role == TeamRole.OWNER:
            return Response(
                {'detail': 'Cannot remove team owner'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = member.username

        TeamAuditLog.objects.create(
            team=team,
            user=request.user,
            action='member_removed',
            resource_type='member',
            resource_id=member.id,
            ip_address=request.META.get('REMOTE_ADDR'),
            details={'member_username': username}
        )

        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, CanViewAnalytics])
    def stats(self, request, pk=None):
        """Get team statistics"""
        team = self.get_object()

        # Calculate date ranges
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Total members
        total_members = TeamMember.objects.filter(team=team).count()

        # Active members (used API in last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        active_members = TeamUsageLog.objects.filter(
            team=team,
            created_at__gte=seven_days_ago
        ).values('user').distinct().count()

        # API call statistics
        total_api_calls = TeamUsageLog.objects.filter(team=team).count()
        total_api_calls_today = TeamUsageLog.objects.filter(
            team=team,
            created_at__date=today
        ).count()
        total_api_calls_this_month = TeamUsageLog.objects.filter(
            team=team,
            created_at__date__gte=month_start
        ).count()

        # Quota information
        quota_limit = team.monthly_quota
        quota_used = total_api_calls_this_month
        quota_remaining = max(0, quota_limit - quota_used)

        # Top tools (top 5)
        top_tools_data = TeamUsageLog.objects.filter(
            team=team
        ).values('tool_slug', 'tool_name').annotate(
            usage_count=Count('id')
        ).order_by('-usage_count')[:5]

        # Member activity (top 10 most active)
        member_activity_data = TeamUsageLog.objects.filter(
            team=team,
            user__isnull=False
        ).values('user__id', 'user__username').annotate(
            usage_count=Count('id')
        ).order_by('-usage_count')[:10]

        # Add last_active to member activity
        member_activity = []
        for activity in member_activity_data:
            last_log = TeamUsageLog.objects.filter(
                team=team,
                user_id=activity['user__id']
            ).order_by('-created_at').first()

            member_activity.append({
                'user_id': activity['user__id'],
                'username': activity['user__username'],
                'usage_count': activity['usage_count'],
                'last_active': last_log.created_at if last_log else timezone.now()
            })

        stats_data = {
            'total_members': total_members,
            'active_members': active_members,
            'total_api_calls': total_api_calls,
            'total_api_calls_today': total_api_calls_today,
            'total_api_calls_this_month': total_api_calls_this_month,
            'quota_used': quota_used,
            'quota_limit': quota_limit,
            'quota_remaining': quota_remaining,
            'top_tools': list(top_tools_data),
            'member_activity': member_activity
        }

        serializer = TeamStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, CanManageAPIKeys])
    def api_keys(self, request, pk=None):
        """Get list of team API keys"""
        team = self.get_object()
        api_keys = TeamAPIKey.objects.filter(team=team)
        serializer = TeamAPIKeySerializer(api_keys, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='api-keys',
            permission_classes=[IsAuthenticated, CanManageAPIKeys])
    def create_api_key(self, request, pk=None):
        """Create a new team API key"""
        team = self.get_object()

        serializer = TeamAPIKeySerializer(
            data={
                **request.data,
                'team': team.id
            },
            context={'request': request}
        )

        if serializer.is_valid():
            api_key = serializer.save()
            # Return the full key only on creation
            data = serializer.data
            data['key'] = api_key.key
            return Response(data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='api-keys/(?P<key_id>[^/.]+)',
            permission_classes=[IsAuthenticated, CanManageAPIKeys])
    def revoke_api_key(self, request, pk=None, key_id=None):
        """Revoke a team API key"""
        team = self.get_object()
        api_key = get_object_or_404(TeamAPIKey, id=key_id, team=team)

        TeamAuditLog.objects.create(
            team=team,
            user=request.user,
            action='api_key_revoked',
            resource_type='api_key',
            resource_id=api_key.id,
            ip_address=request.META.get('REMOTE_ADDR'),
            details={
                'name': api_key.name,
                'key_prefix': api_key.key_prefix
            }
        )

        api_key.is_active = False
        api_key.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='audit-log',
            permission_classes=[IsAuthenticated, CanViewAuditLog])
    def audit_log(self, request, pk=None):
        """Get team audit log"""
        team = self.get_object()

        # Get limit from query params (default 50, max 200)
        try:
            limit = int(request.query_params.get('limit', 50))
            limit = min(limit, 200)
        except ValueError:
            limit = 50

        # Get offset from query params
        try:
            offset = int(request.query_params.get('offset', 0))
        except ValueError:
            offset = 0

        logs = TeamAuditLog.objects.filter(team=team).select_related('user')[offset:offset + limit]
        serializer = TeamAuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class InvitationViewSet(viewsets.ViewSet):
    """
    ViewSet for invitation operations
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='my-invitations')
    def my_invitations(self, request):
        """Get all invitations for current user"""
        invitations = TeamInvitation.objects.filter(
            email=request.user.email,
            status='pending'
        ).select_related('team', 'invited_by')

        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_invitation(self, request, pk=None):
        """Accept an invitation"""
        invitation = get_object_or_404(
            TeamInvitation,
            id=pk,
            email=request.user.email,
            status='pending'
        )

        success, message = invitation.accept(request.user)

        if success:
            TeamAuditLog.objects.create(
                team=invitation.team,
                user=request.user,
                action='invitation_accepted',
                resource_type='invitation',
                resource_id=invitation.id,
                ip_address=request.META.get('REMOTE_ADDR'),
                details={'email': invitation.email, 'role': invitation.role}
            )

            return Response({'detail': message}, status=status.HTTP_200_OK)

        return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='decline')
    def decline_invitation(self, request, pk=None):
        """Decline an invitation"""
        invitation = get_object_or_404(
            TeamInvitation,
            id=pk,
            email=request.user.email,
            status='pending'
        )

        invitation.status = 'declined'
        invitation.save()

        TeamAuditLog.objects.create(
            team=invitation.team,
            user=request.user,
            action='invitation_declined',
            resource_type='invitation',
            resource_id=invitation.id,
            ip_address=request.META.get('REMOTE_ADDR'),
            details={'email': invitation.email}
        )

        return Response({'detail': 'Invitation declined'}, status=status.HTTP_200_OK)
