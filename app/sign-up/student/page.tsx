'use client'

import { SignUp } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function StudentSignUpPage() {
  useEffect(() => {
    // Store the selected role in sessionStorage for post-signup handling
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedUserRole', 'student')
      sessionStorage.setItem('signupRole', 'student')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/30">
      <div className="text-center mb-8 absolute top-12 left-0 right-0">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Student Account</h1>
        <p className="text-muted-foreground">Join MentoLoop to find your perfect preceptor match</p>
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
        fallbackRedirectUrl="/student-intake"
        forceRedirectUrl="/student-intake"
        signInUrl="/sign-in"
        unsafeMetadata={{
          userType: 'student'
        }}
      />
    </div>
  )
}
