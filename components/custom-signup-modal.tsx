'use client'

import { useState } from 'react'
import { SignUpButton, SignInButton } from '@clerk/nextjs'
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
  ArrowRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomSignupModalProps {
  isOpen: boolean
  onClose: () => void
  defaultRole?: 'student' | 'preceptor' | 'institution'
}

export function CustomSignupModal({ 
  isOpen, 
  onClose, 
  defaultRole 
}: CustomSignupModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(defaultRole || null)
  const [showSignUp, setShowSignUp] = useState(false)

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
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-600',
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

  const selectedRoleData = roles.find(r => r.id === selectedRole)

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setShowSignUp(true)
  }

  const handleBack = () => {
    setShowSignUp(false)
  }

  const getRedirectUrl = () => {
    if (!selectedRole) return '/dashboard'
    const role = roles.find(r => r.id === selectedRole)
    return role?.redirectUrl || '/dashboard'
  }

  // Store role in sessionStorage for post-signup handling
  const storeSelectedRole = () => {
    if (selectedRole) {
      sessionStorage.setItem('selectedUserRole', selectedRole)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {!showSignUp ? (
          <>
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
              <SignInButton mode="modal" redirectUrl="/dashboard">
                <Button variant="link" className="p-0 h-auto">
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>Create Your Account</DialogTitle>
                  <DialogDescription>
                    Signing up as: {selectedRoleData?.title}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6">
              <div className="flex justify-center mb-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center",
                  selectedRoleData?.lightColor
                )}>
                  {selectedRoleData && (
                    <selectedRoleData.icon 
                      className={cn("w-10 h-10", selectedRoleData.textColor)} 
                    />
                  )}
                </div>
              </div>

              <SignUpButton 
                mode="modal"
                redirectUrl={getRedirectUrl()}
                afterSignUpUrl={getRedirectUrl()}
              >
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={storeSelectedRole}
                >
                  Continue as {selectedRoleData?.title}
                </Button>
              </SignUpButton>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>You&apos;ll be redirected to complete your profile after signing up</p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Already have an account?</span>
                  <SignInButton mode="modal" redirectUrl="/dashboard">
                    <Button variant="link" className="p-0 h-auto">
                      Sign in instead
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}