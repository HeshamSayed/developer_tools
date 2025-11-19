from rest_framework import permissions
from .models import TeamMember, TeamRole


class IsTeamMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the team
    """
    def has_object_permission(self, request, view, obj):
        # Get team from object (handles Team, TeamMember, etc.)
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user
        ).exists()


class IsTeamOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to check if user is owner or admin of the team
    """
    def has_object_permission(self, request, view, obj):
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user,
            role__in=[TeamRole.OWNER, TeamRole.ADMIN]
        ).exists()


class IsTeamOwner(permissions.BasePermission):
    """
    Permission to check if user is owner of the team
    """
    def has_object_permission(self, request, view, obj):
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user,
            role=TeamRole.OWNER
        ).exists()


class CanManageAPIKeys(permissions.BasePermission):
    """
    Permission to check if user can manage API keys (Owner, Admin, Developer)
    """
    def has_object_permission(self, request, view, obj):
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user,
            role__in=[TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER]
        ).exists()


class CanViewAnalytics(permissions.BasePermission):
    """
    Permission to check if user can view analytics (all roles)
    """
    def has_object_permission(self, request, view, obj):
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user
        ).exists()


class CanViewAuditLog(permissions.BasePermission):
    """
    Permission to check if user can view audit log (Owner, Admin only)
    """
    def has_object_permission(self, request, view, obj):
        team = getattr(obj, 'team', obj)

        return TeamMember.objects.filter(
            team=team,
            user=request.user,
            role__in=[TeamRole.OWNER, TeamRole.ADMIN]
        ).exists()


def get_user_role_in_team(user, team):
    """
    Helper function to get user's role in a team
    Returns role or None if not a member
    """
    try:
        member = TeamMember.objects.get(team=team, user=user)
        return member.role
    except TeamMember.DoesNotExist:
        return None


def has_permission(user, team, permission_name):
    """
    Check if user has specific permission in team based on role
    """
    role = get_user_role_in_team(user, team)
    if not role:
        return False

    # Permission matrix
    ROLE_PERMISSIONS = {
        TeamRole.OWNER: {
            'can_manage_team': True,
            'can_delete_team': True,
            'can_invite_members': True,
            'can_remove_members': True,
            'can_change_roles': True,
            'can_manage_api_keys': True,
            'can_view_analytics': True,
            'can_view_audit_log': True,
            'can_use_tools': True,
        },
        TeamRole.ADMIN: {
            'can_manage_team': True,
            'can_delete_team': False,
            'can_invite_members': True,
            'can_remove_members': True,
            'can_change_roles': True,
            'can_manage_api_keys': True,
            'can_view_analytics': True,
            'can_view_audit_log': True,
            'can_use_tools': True,
        },
        TeamRole.DEVELOPER: {
            'can_manage_team': False,
            'can_delete_team': False,
            'can_invite_members': False,
            'can_remove_members': False,
            'can_change_roles': False,
            'can_manage_api_keys': True,
            'can_view_analytics': True,
            'can_view_audit_log': False,
            'can_use_tools': True,
        },
        TeamRole.VIEWER: {
            'can_manage_team': False,
            'can_delete_team': False,
            'can_invite_members': False,
            'can_remove_members': False,
            'can_change_roles': False,
            'can_manage_api_keys': False,
            'can_view_analytics': True,
            'can_view_audit_log': False,
            'can_use_tools': True,
        },
    }

    role_perms = ROLE_PERMISSIONS.get(role, {})
    return role_perms.get(permission_name, False)
