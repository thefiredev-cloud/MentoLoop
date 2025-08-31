'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function DiscountSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const initializeNPDiscountCode = useAction(api.payments.initializeNPDiscountCode)

  const handleInitialize = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await initializeNPDiscountCode()
      setResult(response)
      toast.success('Discount code NP12345 initialized successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize discount code'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Discount Code Setup</CardTitle>
          <CardDescription>
            Initialize the NP12345 discount code for 100% off
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Discount Code Details:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Code: <span className="font-mono font-bold">NP12345</span></li>
              <li>• Discount: <span className="font-bold">100% OFF</span></li>
              <li>• Duration: One-time use per customer</li>
              <li>• Description: Special discount for NP students</li>
            </ul>
          </div>

          <Button 
            onClick={handleInitialize}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Initializing...' : 'Initialize NP12345 Discount Code'}
          </Button>

          {result && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Success!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {result.message}
                  </p>
                  {result.couponId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Stripe Coupon ID: {result.couponId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-sm">How to test:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Click the button above to initialize the discount code</li>
              <li>2. Go to the student intake form</li>
              <li>3. Proceed to Step 4 (Payment)</li>
              <li>4. Enter discount code: <span className="font-mono font-bold">NP12345</span></li>
              <li>5. The total should show 100% off ($0)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}