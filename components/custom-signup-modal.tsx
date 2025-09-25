'use client'

import { useEffect } from 'react'
import { SignInButton, useUser } from '@clerk/nextjs'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  Stethoscope, 
  Building2, 
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomSignupModalProps {
  isOpen: boolean
  onClose: () => void
  defaultRole?: 'student' | 'preceptor' | 'institution'
}

export function CustomSignupModal({ 
  isOpen, 
  onClose
}: CustomSignupModalProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Prevent modal from opening if user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && isOpen) {
      console.warn('CustomSignupModal: User is already signed in, redirecting to dashboard')
      onClose()
      // Optionally redirect to dashboard
      window.location.href = '/dashboard'
    }
  }, [isLoaded, isSignedIn, isOpen, onClose])

  const roles = [
    {
      id: 'student',
      title: 'I\'m a Student',
      description: 'Looking for clinical placements and preceptor matches',
      icon: GraduationCap,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      redirectUrl: '/student-intake'
    },
    {
      id: 'preceptor',
      title: 'I\'m a Preceptor',
      description: 'Healthcare professional ready to mentor students',
      icon: Stethoscope,
      color: 'bg-success',
      lightColor: 'bg-success/10',
      textColor: 'text-success',
      redirectUrl: '/preceptor-intake'
    },
    {
      id: 'institution',
      title: 'I\'m an Institution',
      description: 'School or clinic managing multiple students/preceptors',
      icon: Building2,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      redirectUrl: '/dashboard/enterprise'
    }
  ]

  const handleRoleSelect = (roleId: string) => {
    // Redirect to role-specific sign-up page
    const signupUrl = roleId === 'student' ? '/sign-up/student' : 
                     roleId === 'preceptor' ? '/sign-up/preceptor' : 
                     roleId === 'institution' ? '/sign-up/institution' : '/sign-up'
    window.location.href = signupUrl
  }


  // Don't render the modal if user is already signed in
  if (isLoaded && isSignedIn) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Join MentoLoop</DialogTitle>
          <DialogDescription>
            Choose your role to get started with the right experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                "border-2 hover:border-primary"
              )}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  role.lightColor
                )}>
                  <role.icon className={cn("w-6 h-6", role.textColor)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="link" className="p-0 h-auto">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}