'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SUPPORTED_STATES } from '@/lib/states-config'

export default function LocationRestrictedPage() {
  const supportedStatesList = Object.values(SUPPORTED_STATES).map(state => ({
    name: state.name,
    code: state.code
  }))

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Service Limited to Select States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              MentoLoop is currently available to users located in the following states. We&apos;re working to expand our services to additional states in the future.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">Currently Serving:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                {supportedStatesList.map((state) => (
                  <div key={state.code} className="flex items-center">
                    <span className="font-medium">•</span>
                    <span className="ml-2">{state.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                Our platform connects nursing students with preceptors across these states, ensuring quality clinical education opportunities.
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                If you&apos;re a resident of one of these states accessing from outside your home state, please contact our support team.
              </p>
              
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <a href="mailto:support@mentoloop.com">
                    Contact Support
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}