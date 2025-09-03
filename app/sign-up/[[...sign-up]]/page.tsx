'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Stethoscope, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [selectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: 'student',
      title: 'I\'m a Student',
      description: 'Looking for clinical placements and preceptor matches',
      icon: GraduationCap,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      signupUrl: '/sign-up/student'
    },
    {
      id: 'preceptor',
      title: 'I\'m a Preceptor',
      description: 'Healthcare professional ready to mentor students',
      icon: Stethoscope,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-600',
      signupUrl: '/sign-up/preceptor'
    },
    {
      id: 'institution',
      title: 'I\'m an Institution',
      description: 'School or clinic managing multiple students/preceptors',
      icon: Building2,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      signupUrl: '/sign-up/institution'
    }
  ]

  // If no role selected, show role selection
  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold">Join MentoLoop</CardTitle>
            <CardDescription className="text-lg mt-2">
              Select your role to create the right account for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {roles.map((role) => (
              <Card 
                key={role.id}
                className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary"
                onClick={() => router.push(role.signupUrl)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.lightColor}`}>
                    <role.icon className={`w-6 h-6 ${role.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}

            <div className="pt-6 text-center border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Already have an account?
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback to default SignUp if somehow role is selected (shouldn't happen)
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