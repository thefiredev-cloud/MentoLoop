import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
          <p className="text-muted-foreground text-lg">
            Effective Date: August 1, 2025
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-muted-foreground">
                By accessing or using the MentoLoop platform, you agree to be bound by these Terms of Use. 
                If you do not agree, do not use the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">1. Services Provided</h2>
              <p className="text-muted-foreground">
                MentoLoop connects nurse practitioner (NP) students with available preceptors. 
                We do not guarantee placements or outcomes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
              <p className="text-muted-foreground">
                Users must be enrolled in an accredited NP program or be licensed NPs to use the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Payments & Refunds</h2>
              <p className="text-muted-foreground">
                All payments are processed securely. Refunds are evaluated case-by-case and may be subject to a processing fee.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <p className="text-muted-foreground">
                You agree not to misrepresent information or use the platform for fraudulent purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Liability</h2>
              <p className="text-muted-foreground">
                MentoLoop is not liable for interactions or outcomes between students and preceptors. 
                All clinical supervision remains the responsibility of the preceptor and educational institution.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms at any time. Continued use of the platform means you accept the changes.
              </p>
            </div>

            <div className="border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Contact: <a href="mailto:support@mentoloop.com" className="text-primary hover:underline">support@mentoloop.com</a>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Effective Date: August 1, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}