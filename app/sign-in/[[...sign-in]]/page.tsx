'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/30">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card shadow-xl",
          }
        }}
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
