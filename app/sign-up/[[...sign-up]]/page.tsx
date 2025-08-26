'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-xl",
          }
        }}
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  )
}