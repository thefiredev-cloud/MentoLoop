'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { hasPermission, canAccessRoute, getDefaultDashboardRoute } from '@/lib/rbac'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'preceptor' | 'admin' | 'enterprise'
  requiredPermission?: string
  fallback?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallback 
}: RoleGuardProps) {
  const user = useQuery(api.users.current)
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const setUserType = useMutation(api.users.updateUserType)
  const fixingRole = useRef(false)

  useEffect(() => {
    // Auto-correct role to student if Clerk metadata indicates completed intake/payment
    const shouldBeStudent = requiredRole === 'student'
      && clerkUser?.publicMetadata?.intakeCompleted
      && clerkUser?.publicMetadata?.paymentCompleted
    if (user && shouldBeStudent && user.userType !== 'student' && !fixingRole.current) {
      fixingRole.current = true
      setUserType({ userId: user._id, userType: 'student' })
        .catch(() => {})
        .finally(() => { fixingRole.current = false })
    }
  }, [user, requiredRole, clerkUser?.publicMetadata?.intakeCompleted, clerkUser?.publicMetadata?.paymentCompleted, setUserType])

  useEffect(() => {
    // Redirect only when not in the student autocorrect case
    const shouldBeStudent = requiredRole === 'student'
      && clerkUser?.publicMetadata?.intakeCompleted
      && clerkUser?.publicMetadata?.paymentCompleted
    if (user && requiredRole && user.userType !== requiredRole && !shouldBeStudent) {
      const defaultRoute = getDefaultDashboardRoute(user.userType as 'student' | 'preceptor' | 'admin' | 'enterprise')
      router.replace(defaultRoute)
    }
  }, [user, requiredRole, router, clerkUser?.publicMetadata?.intakeCompleted, clerkUser?.publicMetadata?.paymentCompleted])

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Check if student has completed intake
  if (requiredRole === 'student' && user.userType === 'student' && clerkUser) {
    const intakeCompleted = clerkUser.publicMetadata?.intakeCompleted as boolean
    const paymentCompleted = clerkUser.publicMetadata?.paymentCompleted as boolean
    
    if (!intakeCompleted || !paymentCompleted) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Complete Your Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You need to complete your intake form and payment before accessing your dashboard.
              </p>
              <p className="text-sm text-muted-foreground">
                Our simple intake process takes just a few minutes and will help us match you with the perfect preceptor.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href="/student-intake" className="flex-1">
                  <Button className="w-full">Complete Intake Form</Button>
                </Link>
                <Link href="/help" className="flex-1">
                  <Button variant="outline" className="w-full">Get Help</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Check role access - admin users should not bypass role checks
  if (requiredRole && user.userType !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access this area. You&apos;ll be redirected to your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check permission access
  if (requiredPermission && user.userType && !hasPermission(user.userType as 'student' | 'preceptor' | 'admin' | 'enterprise', requiredPermission as keyof import('@/lib/rbac').RolePermissions)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Insufficient Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have the required permissions to view this content.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check route access
  if (user.userType && !canAccessRoute(user.userType as 'student' | 'preceptor' | 'admin' | 'enterprise', pathname)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Route Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This route is not accessible with your current role.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export function useRolePermissions() {
  const user = useQuery(api.users.current)
  
  return {
    user,
    userRole: user?.userType as 'student' | 'preceptor' | 'admin' | 'enterprise' | undefined,
    hasPermission: (permission: string) => {
      if (!user?.userType) return false
      return hasPermission(user.userType as 'student' | 'preceptor' | 'admin' | 'enterprise', permission as keyof import('@/lib/rbac').RolePermissions)
    },
    canAccess: (route: string) => {
      if (!user?.userType) return false
      return canAccessRoute(user.userType as 'student' | 'preceptor' | 'admin' | 'enterprise', route)
    }
  }
}