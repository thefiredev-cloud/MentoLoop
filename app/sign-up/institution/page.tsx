'use client'

import { SignUp } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function InstitutionSignUpPage() {
  useEffect(() => {
    // Store the selected role in sessionStorage for post-signup handling
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedUserRole', 'enterprise')
      sessionStorage.setItem('signupRole', 'institution')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="text-center mb-8 absolute top-12 left-0 right-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Institution Account</h1>
        <p className="text-gray-600">Manage your students and preceptors in one centralized platform</p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
          }
        }}
        fallbackRedirectUrl="/dashboard/enterprise"
        forceRedirectUrl="/dashboard/enterprise"
        signInUrl="/sign-in"
        unsafeMetadata={{
          userType: 'enterprise'
        }}
      />
    </div>
  )
}