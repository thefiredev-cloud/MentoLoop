'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function PostSignupHandler() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const currentUser = useQuery(api.users.current)
  const updateUserType = useMutation(api.users.updateUserType)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handlePostSignup = async () => {
      // Wait for Clerk user to be loaded
      if (!isLoaded || !user) return
      
      // Wait for Convex user to be synced
      if (!currentUser) return
      
      // If user already has a type, redirect appropriately
      if (currentUser.userType) {
        redirectBasedOnRole(currentUser.userType)
        return
      }

      // Check if we have a stored role from signup (client-side only)
      const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('selectedUserRole') : null
      
      if (storedRole && !isProcessing) {
        setIsProcessing(true)
        
        try {
          // Update the user type in Convex
          await updateUserType({
            userId: currentUser._id,
            userType: storedRole as 'student' | 'preceptor' | 'enterprise'
          })
          
          // Clear the stored role (client-side only)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('selectedUserRole')
          }
          
          // Redirect based on role
          redirectBasedOnRole(storedRole)
        } catch (error) {
          console.error('Error setting user role:', error)
          setIsProcessing(false)
        }
      }
    }

    handlePostSignup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, currentUser, updateUserType, router, isProcessing])

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'student':
        router.push('/student-intake')
        break
      case 'preceptor':
        router.push('/preceptor-intake')
        break
      case 'enterprise':
        router.push('/dashboard/enterprise')
        break
      case 'admin':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/dashboard')
    }
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="flex items-center gap-4 p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Setting up your account...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}