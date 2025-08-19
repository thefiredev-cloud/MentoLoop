import { type User } from '@/convex/_generated/dataModel'

export type UserRole = 'student' | 'preceptor' | 'admin' | 'enterprise'

export interface RolePermissions {
  canViewOwnData: boolean
  canViewStudents: boolean
  canViewPreceptors: boolean
  canViewMatches: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManagePayments: boolean
  canViewAuditLogs: boolean
  canManageSystem: boolean
  canViewEnterprise: boolean
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    canViewOwnData: true,
    canViewStudents: false,
    canViewPreceptors: false,
    canViewMatches: true, // Only own matches
    canManageUsers: false,
    canViewAnalytics: false,
    canManagePayments: false,
    canViewAuditLogs: false,
    canManageSystem: false,
    canViewEnterprise: false,
  },
  preceptor: {
    canViewOwnData: true,
    canViewStudents: true, // Only matched students
    canViewPreceptors: false,
    canViewMatches: true, // Only own matches
    canManageUsers: false,
    canViewAnalytics: false,
    canManagePayments: false,
    canViewAuditLogs: false,
    canManageSystem: false,
    canViewEnterprise: false,
  },
  admin: {
    canViewOwnData: true,
    canViewStudents: true,
    canViewPreceptors: true,
    canViewMatches: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManagePayments: true,
    canViewAuditLogs: true,
    canManageSystem: true,
    canViewEnterprise: true,
  },
  enterprise: {
    canViewOwnData: true,
    canViewStudents: true, // Only organization students
    canViewPreceptors: true, // Only organization preceptors
    canViewMatches: true, // Only organization matches
    canManageUsers: false,
    canViewAnalytics: true, // Organization analytics
    canManagePayments: false,
    canViewAuditLogs: false,
    canManageSystem: false,
    canViewEnterprise: true,
  },
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions[permission]
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Student routes
  if (route.startsWith('/dashboard/student')) {
    return userRole === 'student' || userRole === 'admin'
  }
  
  // Preceptor routes
  if (route.startsWith('/dashboard/preceptor')) {
    return userRole === 'preceptor' || userRole === 'admin'
  }
  
  // Admin routes
  if (route.startsWith('/dashboard/admin')) {
    return userRole === 'admin'
  }
  
  // Enterprise routes
  if (route.startsWith('/dashboard/enterprise')) {
    return userRole === 'enterprise' || userRole === 'admin'
  }
  
  // General dashboard access
  if (route === '/dashboard') {
    return true // All authenticated users can access general dashboard
  }
  
  return false
}

export function getDefaultDashboardRoute(userRole: UserRole): string {
  switch (userRole) {
    case 'student':
      return '/dashboard/student'
    case 'preceptor':
      return '/dashboard/preceptor'
    case 'admin':
      return '/dashboard/admin'
    case 'enterprise':
      return '/dashboard/enterprise'
    default:
      return '/dashboard'
  }
}

export function validateEnterpriseAccess(
  userRole: UserRole,
  userEnterpriseId: string | undefined,
  targetEnterpriseId: string
): boolean {
  // Admin can access all enterprises
  if (userRole === 'admin') {
    return true
  }
  
  // Enterprise users can only access their own organization
  if (userRole === 'enterprise') {
    return userEnterpriseId === targetEnterpriseId
  }
  
  return false
}