'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { PostSignupHandler } from '@/components/post-signup-handler'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUser()
  const router = useRouter()
  const hasRedirected = useRef(false)
  const updateUserType = useMutation(api.users.updateUserType)

  // Track dashboard access
  useEffect(() => {
    // Dashboard page loaded
  }, [isLoading, user])

  // Handle user routing based on their type
  useEffect(() => {
    if (!user || hasRedirected.current) return
    
    if (user.userType) {
      hasRedirected.current = true
      // Redirecting user to role-specific dashboard
      
      const redirectPath = `/dashboard/${user.userType}`
      router.push(redirectPath)
    }
  }, [user, router])

  // Handle role selection
  const handleRoleSelection = async (role: 'student' | 'preceptor') => {
    if (!user) return
    
    try {
      // Update user role in database
      await updateUserType({ userId: user._id, userType: role })
      
      // Redirect to appropriate dashboard
      router.push(`/dashboard/${role}`)
    } catch (error) {
      // Failed to update user role
      toast.error('Failed to save your role. Please try again.')
    }
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <>
        <PostSignupHandler />
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

  // If user has no type set, show setup options
  if (!user.userType) {
    return (
      <>
        <PostSignupHandler />
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
              >
                Continue as Student
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
              >
                Continue as Preceptor
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

  // Show redirecting state (should not normally be reached)
  return (
    <>
      <PostSignupHandler />
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