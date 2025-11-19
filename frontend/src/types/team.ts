// Team-related types and interfaces

export type TeamRole = 'owner' | 'admin' | 'developer' | 'viewer'

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Team {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
  member_count: number
  subscription_tier: 'free' | 'team' | 'enterprise'
  owner_id: string
  settings: TeamSettings
}

export interface TeamSettings {
  allow_member_invites: boolean
  require_2fa: boolean
  default_member_role: TeamRole
  api_rate_limit: number
  enable_audit_log: boolean
  data_retention_days: number
}

export interface TeamMember {
  id: string
  user_id: string
  team_id: string
  username: string
  email: string
  role: TeamRole
  joined_at: string
  last_active: string | null
  avatar_url: string | null
  is_active: boolean
}

export interface TeamInvitation {
  id: string
  team_id: string
  team_name: string
  email: string
  role: TeamRole
  invited_by: string
  invited_by_username: string
  status: InvitationStatus
  created_at: string
  expires_at: string
  accepted_at: string | null
}

export interface TeamStats {
  team_id: string
  total_members: number
  active_members: number
  total_api_calls: number
  total_api_calls_today: number
  total_api_calls_this_month: number
  quota_limit: number
  quota_used: number
  quota_remaining: number
  top_tools: Array<{
    tool_slug: string
    tool_name: string
    usage_count: number
  }>
  member_activity: Array<{
    user_id: string
    username: string
    usage_count: number
    last_active: string
  }>
}

export interface TeamAuditLog {
  id: string
  team_id: string
  user_id: string
  username: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

export interface TeamAPIKey {
  id: string
  team_id: string
  name: string
  key_prefix: string
  created_by: string
  created_by_username: string
  created_at: string
  last_used: string | null
  total_requests: number
  is_active: boolean
}

// Role permissions
export const ROLE_PERMISSIONS = {
  owner: {
    can_manage_team: true,
    can_manage_members: true,
    can_manage_billing: true,
    can_delete_team: true,
    can_use_tools: true,
    can_view_analytics: true,
    can_manage_api_keys: true,
    can_view_audit_log: true,
  },
  admin: {
    can_manage_team: true,
    can_manage_members: true,
    can_manage_billing: false,
    can_delete_team: false,
    can_use_tools: true,
    can_view_analytics: true,
    can_manage_api_keys: true,
    can_view_audit_log: true,
  },
  developer: {
    can_manage_team: false,
    can_manage_members: false,
    can_manage_billing: false,
    can_delete_team: false,
    can_use_tools: true,
    can_view_analytics: true,
    can_manage_api_keys: true,
    can_view_audit_log: false,
  },
  viewer: {
    can_manage_team: false,
    can_manage_members: false,
    can_manage_billing: false,
    can_delete_team: false,
    can_use_tools: true,
    can_view_analytics: true,
    can_manage_api_keys: false,
    can_view_audit_log: false,
  },
} as const

export type RolePermissions = typeof ROLE_PERMISSIONS[TeamRole]

// Helper functions
export function hasPermission(role: TeamRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

export function getRoleBadgeColor(role: TeamRole): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'developer':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'viewer':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function getRoleIcon(role: TeamRole): string {
  switch (role) {
    case 'owner':
      return '👑'
    case 'admin':
      return '⚡'
    case 'developer':
      return '💻'
    case 'viewer':
      return '👁️'
    default:
      return '👤'
  }
}

export function getInvitationStatusColor(status: InvitationStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'declined':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'expired':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}
