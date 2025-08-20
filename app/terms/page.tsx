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

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground text-lg">
                  By accessing or using the MentoLoop platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                  If you do not agree to these Terms, please do not use our Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms constitute a legally binding agreement between you and MentoLoop LLC. By accessing or using our platform, 
                you represent that you are at least 18 years old and have the legal capacity to enter into this agreement.
              </p>
              <p className="text-muted-foreground">
                Your continued use of the Service following any changes to these Terms will constitute acceptance of such changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                MentoLoop is a technology platform that connects nurse practitioner (NP) students with licensed healthcare providers 
                who serve as clinical preceptors. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Matching algorithms using our proprietary MentorFit™ technology</li>
                <li>Secure messaging and communication tools</li>
                <li>Payment processing for placement fees</li>
                <li>Administrative support for clinical placements</li>
                <li>Educational resources and documentation</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>Important:</strong> MentoLoop does not provide clinical education, medical advice, or direct patient care. 
                We are a technology platform that facilitates connections between students and preceptors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Eligibility and Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Students:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Must be enrolled in an accredited nurse practitioner program</li>
                  <li>Must provide accurate program verification and academic standing</li>
                  <li>Must complete all required health screenings and background checks as required by placement sites</li>
                  <li>Must maintain appropriate student liability insurance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Preceptors:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Must hold current, unrestricted professional license in the state where clinical supervision will occur</li>
                  <li>Must have appropriate experience and qualifications for supervising NP students</li>
                  <li>Must complete our verification process including license verification and background screening</li>
                  <li>Must maintain appropriate professional liability insurance</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                You agree to provide accurate, current information and to promptly update any changes. 
                Misrepresentation of credentials or eligibility may result in immediate account suspension.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Healthcare Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">HIPAA Compliance:</h4>
                <p className="text-muted-foreground">
                  While MentoLoop is not a covered entity under HIPAA, we implement HIPAA-level security standards for 
                  all communications and data handling. Users agree to maintain confidentiality of any protected health 
                  information they may encounter through clinical placements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">FERPA Awareness:</h4>
                <p className="text-muted-foreground">
                  We handle student educational records in compliance with FERPA requirements. Educational institutions 
                  may share necessary student information with MentoLoop for placement purposes under the &quot;school official&quot; exception.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">State Regulations:</h4>
                <p className="text-muted-foreground">
                  Clinical placements must comply with all applicable state regulations for nursing education and clinical supervision. 
                  Users are responsible for ensuring placements meet their state and institutional requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Payment Terms and Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Payment Structure:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Placement fees are due upon match confirmation</li>
                  <li>No charges apply until a match is successfully made</li>
                  <li>Preceptor honorariums are included in the placement fee</li>
                  <li>Additional fees may apply for expedited matching or specialized placements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Refund Policy:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Full Refund:</strong> No match made within 60 days of profile submission</li>
                  <li><strong>Partial Refund (50%):</strong> Cancellation more than 30 days before rotation start date</li>
                  <li><strong>No Refund:</strong> Cancellation within 30 days of rotation start date</li>
                  <li><strong>No Refund:</strong> Dismissal from rotation due to student conduct or performance issues</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                Refund requests must be submitted through our support system with appropriate documentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. User Conduct and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Prohibited Activities:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Providing false or misleading information about credentials, experience, or eligibility</li>
                  <li>Attempting to circumvent our matching system or fees</li>
                  <li>Harassment, discrimination, or unprofessional conduct toward other users</li>
                  <li>Sharing login credentials or accessing another user&apos;s account</li>
                  <li>Using the platform for any purpose other than legitimate clinical education</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Professional Standards:</h4>
                <p className="text-muted-foreground">
                  All users must maintain professional standards consistent with healthcare practice. Students must adhere 
                  to their academic institution&apos;s code of conduct. Preceptors must maintain appropriate professional boundaries 
                  and provide competent clinical supervision.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>MentoLoop serves as a matching platform only.</strong> We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>The quality of clinical education or supervision provided</li>
                <li>Actions, conduct, or performance of students or preceptors</li>
                <li>Meeting specific academic or licensing requirements</li>
                <li>Patient safety or clinical outcomes during placements</li>
                <li>Compliance with institutional or regulatory requirements</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>LIABILITY CAP:</strong> Our total liability for any claims arising from your use of the Service 
                shall not exceed the amount you paid to MentoLoop in the 12 months preceding the claim.
              </p>
              <p className="text-muted-foreground">
                <strong>DISCLAIMER:</strong> THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. 
                WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, 
                use, and protect your information. By using our Service, you consent to our privacy practices as described in our Privacy Policy.
              </p>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information and maintain confidentiality 
                consistent with healthcare industry standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The MentoLoop platform, including our MentorFit™ matching algorithm, logos, content, and features, 
                are owned by MentoLoop LLC and protected by intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not copy, modify, distribute, or create derivative works from our platform without explicit written permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may suspend or terminate your account at any time for violation of these Terms, fraudulent activity, 
                or other conduct that could harm MentoLoop or other users.
              </p>
              <p className="text-muted-foreground">
                You may terminate your account at any time through your account settings. Upon termination, 
                your access to the Service will cease, but these Terms will continue to apply to any pending obligations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association.
              </p>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of the State of Texas, without regard to conflict of law principles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via 
                email or platform notification at least 30 days before the changes take effect.
              </p>
              <p className="text-muted-foreground">
                Your continued use of the Service after changes take effect constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="border-t pt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Questions or Concerns?</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact our legal team: <a href="mailto:legal@mentoloop.com" className="text-primary hover:underline">legal@mentoloop.com</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  General support: <a href="mailto:support@mentoloop.com" className="text-primary hover:underline">support@mentoloop.com</a>
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Last Updated:</strong> August 20, 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}