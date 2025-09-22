'use client'

import { SignUp } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function PreceptorSignUpPage() {
  useEffect(() => {
    // Store the selected role in sessionStorage for post-signup handling
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedUserRole', 'preceptor')
      sessionStorage.setItem('signupRole', 'preceptor')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/20 to-accent/40">
      <div className="text-center mb-8 absolute top-12 left-0 right-0">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Preceptor Account</h1>
        <p className="text-muted-foreground">Join our network of healthcare professionals mentoring the next generation</p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card shadow-xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
          }
        }}
        fallbackRedirectUrl="/preceptor-intake"
        forceRedirectUrl="/preceptor-intake"
        signInUrl="/sign-in"
        unsafeMetadata={{
          userType: 'preceptor'
        }}
      />
    </div>
  )
}
