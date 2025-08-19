import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Effective Date: August 1, 2025
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-muted-foreground">
                We value your privacy. This policy explains how MentoLoop™ collects, uses, and protects your information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect names, emails, NP specialty, school name, location, availability dates, and payment information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. How We Use It</h2>
              <p className="text-muted-foreground">
                To match NP students with preceptors, process payments, and improve our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
              <p className="text-muted-foreground">
                We never sell your data. We only share information with your explicit consent (e.g., with matched parties).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Security</h2>
              <p className="text-muted-foreground">
                Data is stored in secure databases. All payments are encrypted and processed through trusted gateways (Stripe & PayPal).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground">
                You can request to view, edit, or delete your data at any time by contacting support@mentoloop.com
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. HIPAA & FERPA Compliance</h2>
              <p className="text-muted-foreground">
                We prioritize student safety and data privacy with every interaction. Our platform follows HIPAA standards 
                for healthcare data protection and is FERPA-aware for educational records.
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