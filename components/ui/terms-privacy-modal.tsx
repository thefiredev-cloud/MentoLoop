'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface TermsPrivacyModalProps {
  type: 'terms' | 'privacy'
  triggerText?: string
  triggerClassName?: string
  onAccept?: () => void
  showAcceptButton?: boolean
}

export function TermsPrivacyModal({
  type,
  triggerText,
  triggerClassName = 'underline hover:text-primary',
  onAccept,
  showAcceptButton = false,
}: TermsPrivacyModalProps) {
  const [open, setOpen] = useState(false)

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy'
  const defaultTriggerText = type === 'terms' ? 'Terms of Service' : 'Privacy Policy'

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    setOpen(false)
  }

  const content = type === 'terms' ? (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
        <p className="text-sm text-muted-foreground">
          By accessing and using MentoLoop, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">2. Service Description</h3>
        <p className="text-sm text-muted-foreground">
          MentoLoop provides a platform connecting nurse practitioner students with qualified preceptors for clinical rotations.
          Our services include AI-powered matching, payment processing, hour tracking, and communication tools.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">3. User Responsibilities</h3>
        <p className="text-sm text-muted-foreground">
          Users are responsible for maintaining the confidentiality of their account information and for all activities
          that occur under their account. You agree to provide accurate and complete information.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">4. Payment Terms</h3>
        <p className="text-sm text-muted-foreground">
          All payments are processed through Stripe. Membership fees are non-refundable except as outlined in our
          cancellation policy. Hours must be used within the specified timeframe.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">5. Cancellation Policy</h3>
        <p className="text-sm text-muted-foreground">
          Cancellations must be made at least 14 days before the rotation start date for a full refund.
          Cancellations within 14 days are subject to a 50% cancellation fee.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">6. Liability Disclaimer</h3>
        <p className="text-sm text-muted-foreground">
          MentoLoop acts as a facilitator and is not responsible for the quality of clinical education provided.
          Users participate in clinical rotations at their own risk.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">7. Privacy & HIPAA Compliance</h3>
        <p className="text-sm text-muted-foreground">
          We are committed to protecting your privacy and maintaining HIPAA compliance for all health-related information.
          See our Privacy Policy for detailed information.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">8. Modifications</h3>
        <p className="text-sm text-muted-foreground">
          MentoLoop reserves the right to modify these terms at any time. Users will be notified of significant changes.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">9. Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          For questions about these terms, please contact us at legal@mentoloop.com
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">1. Information We Collect</h3>
        <p className="text-sm text-muted-foreground">
          We collect personal information you provide directly to us, including name, email, phone number,
          educational information, and professional credentials. We also collect usage data and analytics.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">2. How We Use Your Information</h3>
        <p className="text-sm text-muted-foreground">
          We use your information to provide our services, match students with preceptors, process payments,
          communicate with you, and improve our platform. We use AI technology to optimize matching.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">3. Information Sharing</h3>
        <p className="text-sm text-muted-foreground">
          We share your information with matched users (students/preceptors), payment processors (Stripe),
          and service providers. We do not sell your personal information to third parties.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">4. HIPAA Compliance</h3>
        <p className="text-sm text-muted-foreground">
          We maintain HIPAA compliance for all protected health information. Access to health information
          is strictly limited to authorized personnel and encrypted at rest and in transit.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">5. Data Security</h3>
        <p className="text-sm text-muted-foreground">
          We implement industry-standard security measures including encryption, secure servers, and regular
          security audits. However, no method of transmission over the Internet is 100% secure.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">6. Your Rights</h3>
        <p className="text-sm text-muted-foreground">
          You have the right to access, update, or delete your personal information. You may also opt-out
          of certain communications. Contact us at privacy@mentoloop.com to exercise these rights.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">7. Cookies and Tracking</h3>
        <p className="text-sm text-muted-foreground">
          We use cookies and similar tracking technologies to improve user experience and analyze platform usage.
          You can control cookie settings through your browser.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">8. Children&apos;s Privacy</h3>
        <p className="text-sm text-muted-foreground">
          Our services are not intended for individuals under 18 years of age. We do not knowingly collect
          personal information from children.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">9. Changes to This Policy</h3>
        <p className="text-sm text-muted-foreground">
          We may update this privacy policy from time to time. We will notify you of changes by posting
          the new policy on this page and updating the &quot;last updated&quot; date.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">10. Contact Us</h3>
        <p className="text-sm text-muted-foreground">
          If you have questions about this privacy policy, please contact us at privacy@mentoloop.com
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={triggerClassName}>
          {triggerText || defaultTriggerText}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-4">
          {content}
        </ScrollArea>
        {showAcceptButton && (
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept}>
              Accept {title}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}