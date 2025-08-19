'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LocationRestrictedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Service Currently Limited to Texas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              MentoLoop is currently only available to users located in Texas. We're working to expand our services to other states in the future.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Currently Serving Texas:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Dallas-Fort Worth Metro</li>
                <li>• Houston Metro</li>
                <li>• Austin Metro</li>
                <li>• San Antonio Metro</li>
                <li>• All other Texas cities</li>
              </ul>
            </div>
            
            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                If you're a Texas resident accessing from outside the state, please contact our support team.
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