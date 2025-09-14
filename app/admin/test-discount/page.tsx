'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestDiscountPage() {
  const [loading, setLoading] = useState(false)
  const [testCode, setTestCode] = useState('NP12345')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [promotionCodeResult, setPromotionCodeResult] = useState<any>(null)

  const createPromotionCodes = useAction(api.payments.createPromotionCodesForExistingCoupons)
  const validateCode = useQuery(api.payments.validateDiscountCode,
    testCode ? { code: testCode, email: 'test@example.com' } : 'skip'
  )

  const handleCreatePromotionCodes = async () => {
    setLoading(true)
    setPromotionCodeResult(null)

    try {
      const response = await createPromotionCodes()
      setPromotionCodeResult(response)
      toast.success('Promotion codes processed successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create promotion codes'
      toast.error(errorMessage)
      setPromotionCodeResult({ error: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCode = () => {
    if (validateCode) {
      setValidationResult(validateCode)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discount Code Testing Dashboard</CardTitle>
          <CardDescription>
            Test and manage Stripe discount codes and promotion codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Promotion Codes Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Step 1: Create Promotion Codes for Existing Coupons
            </h3>
            <p className="text-sm text-muted-foreground">
              This will create Stripe promotion codes for all existing coupons (NP12345, MENTO10, MENTO25)
            </p>
            <Button
              onClick={handleCreatePromotionCodes}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Create Promotion Codes'}
            </Button>

            {promotionCodeResult && (
              <div className={`rounded-lg p-4 ${promotionCodeResult.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                {promotionCodeResult.error ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-red-700">{promotionCodeResult.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm w-full">
                      <p className="font-semibold text-green-900">Success!</p>
                      <p className="text-green-700">{promotionCodeResult.message}</p>
                      {promotionCodeResult.results && (
                        <div className="mt-3 space-y-2">
                          {promotionCodeResult.results.map((result: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-1 border-t border-green-200">
                              <span className="font-mono">{result.code}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                result.status === 'created' ? 'bg-green-100 text-green-700' :
                                result.status === 'already_has_promotion_code' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {result.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validate Discount Code Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 2: Validate Discount Code
            </h3>
            <p className="text-sm text-muted-foreground">
              Test if a discount code is valid and see the discount percentage
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="testCode">Discount Code</Label>
                <Input
                  id="testCode"
                  type="text"
                  value={testCode}
                  onChange={(e) => {
                    setTestCode(e.target.value.toUpperCase())
                    setValidationResult(null)
                  }}
                  placeholder="Enter discount code (e.g., NP12345)"
                />
              </div>
              <Button
                onClick={handleValidateCode}
                className="w-full"
                variant="outline"
              >
                Validate Code
              </Button>
            </div>

            {(validationResult || validateCode) && (
              <div className={`rounded-lg p-4 ${
                (validationResult || validateCode)?.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {(validationResult || validateCode)?.valid ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-green-900">Valid Code!</p>
                      <p className="text-green-700">
                        Code: <span className="font-mono">{(validationResult || validateCode).code}</span>
                      </p>
                      <p className="text-green-700">
                        Discount: <span className="font-bold">{(validationResult || validateCode).percentOff}% OFF</span>
                      </p>
                      {(validationResult || validateCode).percentOff === 100 && (
                        <p className="text-green-700 font-semibold mt-2">
                          ✨ This is a 100% discount - completely FREE!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900">Invalid Code</p>
                      <p className="text-red-700">
                        {(validationResult || validateCode)?.error || 'This discount code is not valid'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">Testing Instructions:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Click "Create Promotion Codes" to ensure all coupons have promotion codes</li>
              <li>2. Validate the NP12345 code to confirm it shows 100% off</li>
              <li>3. Go to the student intake form and test the checkout process</li>
              <li>4. Enter NP12345 at checkout - the Stripe page should show $0 total</li>
              <li>5. Test other codes: MENTO10 (10% off), MENTO25 (25% off)</li>
            </ol>
          </div>

          {/* Current Discount Codes */}
          <div className="bg-background border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-sm">Available Discount Codes:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-mono font-bold">NP12345</p>
                <p className="text-xs text-muted-foreground">100% OFF</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono font-bold">MENTO10</p>
                <p className="text-xs text-muted-foreground">10% OFF</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono font-bold">MENTO25</p>
                <p className="text-xs text-muted-foreground">25% OFF</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}