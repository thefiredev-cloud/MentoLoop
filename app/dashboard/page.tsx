'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { PostSignupHandler } from '@/components/post-signup-handler'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  
  const { user, isLoading, error, refetch } = useCurrentUser({
    autoSync: true,
    onError: (err) => {
      console.error('[Dashboard] User sync error:', {
        error: err.message,
        retryCount,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR'
      })
      
      // Auto-retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
        console.log(`[Dashboard] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          refetch()
        }, delay)
      } else {
        console.error('[Dashboard] Max retries reached, user sync failed')
        // Clear any stale cache
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userRole')
          localStorage.removeItem('userRoleConfirmed')
          sessionStorage.clear()
        }
      }
    }
  })
  const router = useRouter()
  const hasRedirected = useRef(false)
  const updateUserType = useMutation(api.users.updateUserType)
  const { userId } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [shouldAutoSelectRole, setShouldAutoSelectRole] = useState(false)
  const [savedUserRole, setSavedUserRole] = useState<string | null>(null)
  
  // Log dashboard access
  useEffect(() => {
    console.log('[Dashboard] Page loaded:', {
      isLoading,
      hasUser: !!user,
      userType: user?.userType,
      timestamp: new Date().toISOString()
    })
  }, [isLoading, user])

  // Check localStorage for saved role on mount (client-side only)
  useEffect(() => {
    if (!user || user.userType) return
    
    const savedRole = localStorage.getItem('userRole')
    const roleConfirmed = localStorage.getItem('userRoleConfirmed')
    
    if (savedRole && roleConfirmed === 'true' && (savedRole === 'student' || savedRole === 'preceptor')) {
      setSavedUserRole(savedRole)
      setShouldAutoSelectRole(true)
    }
  }, [user])

  // Admin users are handled through the ensureUserExists flow
  // which properly sets admin role based on email

  useEffect(() => {
    if (user && !hasRedirected.current) {
      console.log('[Dashboard] Routing user:', {
        userId: user._id,
        userType: user.userType,
        email: user.email,
        timestamp: new Date().toISOString()
      })
      
      // Redirect to appropriate dashboard based on user type
      switch (user.userType) {
        case 'student':
          hasRedirected.current = true
          console.log('[Dashboard] Redirecting to student dashboard')
          router.replace('/dashboard/student')
          break
        case 'preceptor':
          hasRedirected.current = true
          console.log('[Dashboard] Redirecting to preceptor dashboard')
          router.replace('/dashboard/preceptor')
          break
        case 'admin':
          hasRedirected.current = true
          console.log('[Dashboard] Redirecting to admin dashboard')
          router.replace('/dashboard/admin')
          break
        case 'enterprise':
          hasRedirected.current = true
          console.log('[Dashboard] Redirecting to enterprise dashboard')
          router.replace('/dashboard/enterprise')
          break
        default:
          // If no userType, stay on this page to show setup options
          console.log('[Dashboard] No userType set, showing setup options')
          break
      }
    }
  }, [user?.userType, router, user])

  // Handle role selection and persistence
  const handleRoleSelection = async (role: 'student' | 'preceptor') => {
    setSelectedRole(role)
    try {
      // Update user role in database
      await updateUserType({ userId: user!._id, userType: role })
      
      // Save to localStorage for future visits
      localStorage.setItem('userRole', role)
      localStorage.setItem('userRoleConfirmed', 'true')
      
      // Redirect to appropriate dashboard
      if (role === 'student') {
        router.replace('/dashboard/student')
      } else if (role === 'preceptor') {
        router.replace('/dashboard/preceptor')
      }
    } catch (error) {
      console.error('[Dashboard] Failed to update user role:', error)
      toast.error('Failed to save your role. Please try again.')
    }
  }

  // Auto-select saved role
  useEffect(() => {
    if (shouldAutoSelectRole && savedUserRole && user && !user.userType && !selectedRole) {
      handleRoleSelection(savedUserRole as 'student' | 'preceptor')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoSelectRole, savedUserRole, user, selectedRole])

  // Always render PostSignupHandler to maintain hook consistency
  const postSignupHandler = <PostSignupHandler />

  if (isLoading) {
    return (
      <>
        {postSignupHandler}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="flex items-center gap-4 p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your dashboard...</span>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        {postSignupHandler}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <h3 className="font-semibold">Failed to load user profile</h3>
              <p className="text-sm text-muted-foreground">
                We encountered an error while loading your profile. Please try again.
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        {postSignupHandler}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-warning mx-auto" />
              <h3 className="font-semibold">Setting up your profile</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we create your user profile...
              </p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }


  // If user has no type set, show setup options or loading state if auto-selecting
  if (!user.userType) {
    // If we're auto-selecting a saved role, show loading
    if (shouldAutoSelectRole && savedUserRole) {
      return (
        <>
          {postSignupHandler}
          <div className="flex items-center justify-center min-h-[400px]">
            <Card>
              <CardContent className="flex items-center gap-4 p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Setting up your {savedUserRole} dashboard...</span>
              </CardContent>
            </Card>
          </div>
        </>
      )
    }
    
    return (
      <>
        {postSignupHandler}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to MentoLoop!</h1>
          <p className="text-muted-foreground mt-2">
            Please select your account type. This will determine which dashboard you see when you log in.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You can change this later in your account settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">I&apos;m a Student</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Looking for clinical placements and preceptor matches
              </p>
              <button 
                onClick={() => handleRoleSelection('student')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={selectedRole !== null}
              >
                {selectedRole === 'student' ? 'Setting up...' : 'Continue as Student'}
              </button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">I&apos;m a Preceptor</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Healthcare professional ready to mentor students
              </p>
              <button 
                onClick={() => handleRoleSelection('preceptor')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                disabled={selectedRole !== null}
              >
                {selectedRole === 'preceptor' ? 'Setting up...' : 'Continue as Preceptor'}
              </button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Not sure which one you are?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Students are pursuing their NP degree and need clinical rotations. Preceptors are licensed healthcare professionals (NP, MD, DO, PA) who mentor students during clinical rotations.
            </p>
            <button 
              onClick={() => router.push('/help')}
              className="text-primary hover:underline"
            >
              Learn More
            </button>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  // This should not be reached due to the redirect, but just in case
  return (
    <>
      {postSignupHandler}
    <div className="flex items-center justify-center min-h-[400px]">
      <Card>
        <CardContent className="flex items-center gap-4 p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to your dashboard...</span>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
