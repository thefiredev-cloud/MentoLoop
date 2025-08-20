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

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground text-lg">
                  MentoLoop LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our platform and services.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Effective Date:</strong> August 20, 2025
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Name, email address, phone number</li>
                  <li>Professional credentials and license information</li>
                  <li>Educational institution and program details</li>
                  <li>Clinical specialty and experience level</li>
                  <li>Geographic location and availability preferences</li>
                  <li>Learning style and mentoring preferences (MentorFit™ assessment)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Financial Information:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Payment method information (processed securely through Stripe)</li>
                  <li>Billing address and transaction history</li>
                  <li>HSA/FSA account information (if applicable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Platform Usage Data:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Login activity and platform usage patterns</li>
                  <li>Messages sent through our secure communication system</li>
                  <li>Match acceptance/decline decisions and feedback</li>
                  <li>Survey responses and quality ratings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Information:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>IP address, browser type, and device information</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Error logs and diagnostic information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Primary Business Purposes:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Matching students with compatible preceptors using our MentorFit™ algorithm</li>
                  <li>Facilitating communication between matched parties</li>
                  <li>Processing payments and managing financial transactions</li>
                  <li>Providing customer support and platform assistance</li>
                  <li>Verifying credentials and maintaining quality standards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Platform Improvement:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Analyzing platform usage to improve user experience</li>
                  <li>Refining our matching algorithm based on feedback</li>
                  <li>Conducting research on clinical education effectiveness</li>
                  <li>Developing new features and services</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication and Marketing:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Sending match notifications and platform updates</li>
                  <li>Providing educational resources and best practices</li>
                  <li>Marketing communications (with your consent)</li>
                  <li>Survey requests and feedback collection</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">With Your Consent:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Sharing contact information with matched students/preceptors after payment confirmation</li>
                  <li>Providing professional credentials to educational institutions as required</li>
                  <li>Sharing aggregated feedback with other users (anonymized)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Service Providers:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Payment processors (Stripe, PayPal) for financial transactions</li>
                  <li>Email service providers (SendGrid) for communication</li>
                  <li>SMS service providers (Twilio) for notifications</li>
                  <li>Cloud hosting services (Convex, Vercel) for data storage</li>
                  <li>Analytics services for platform improvement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Legal Requirements:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Compliance with subpoenas, court orders, or legal processes</li>
                  <li>Reporting of suspected fraud or illegal activity</li>
                  <li>Protection of our rights, property, or safety</li>
                  <li>Cooperation with law enforcement when required</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                <strong>We never sell your personal information to third parties.</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. HIPAA Compliance and Health Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Our HIPAA Status:</h4>
                <p className="text-muted-foreground">
                  While MentoLoop is not a covered entity under HIPAA, we implement HIPAA-level security standards 
                  for all data handling and communications. We understand the sensitivity of healthcare information 
                  and maintain appropriate safeguards.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Protected Health Information (PHI):</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>MentoLoop does not collect or store patient health information</li>
                  <li>Any PHI encountered during clinical rotations remains under the control of the healthcare facility</li>
                  <li>Users are responsible for maintaining HIPAA compliance in their clinical activities</li>
                  <li>Our messaging system provides HIPAA-level encryption for all communications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Measures:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Secure data storage with access controls and audit logs</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Employee training on privacy and security requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. FERPA Compliance and Educational Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Educational Record Protection:</h4>
                <p className="text-muted-foreground">
                  We handle student educational records in compliance with the Family Educational Rights and Privacy Act (FERPA). 
                  Educational institutions may share necessary student information with MentoLoop under the &quot;school official&quot; exception.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Student Rights Under FERPA:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Right to inspect and review your educational records</li>
                  <li>Right to request correction of inaccurate information</li>
                  <li>Right to consent to disclosure of personally identifiable information</li>
                  <li>Right to file complaints with the Department of Education</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Directory Information:</h4>
                <p className="text-muted-foreground">
                  With proper consent, we may share basic directory information (name, program, graduation date) 
                  necessary for clinical placement purposes. Students can opt out of directory information sharing 
                  through their educational institution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Security and Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Technical Safeguards:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>256-bit SSL/TLS encryption for all data transmission</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Multi-factor authentication for sensitive accounts</li>
                  <li>Regular automated backups with encryption</li>
                  <li>Network security monitoring and intrusion detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Administrative Safeguards:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Role-based access controls limiting data access</li>
                  <li>Background checks for employees with data access</li>
                  <li>Regular privacy and security training</li>
                  <li>Incident response procedures for data breaches</li>
                  <li>Third-party security audits and assessments</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Physical Safeguards:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Controlled access to servers and infrastructure</li>
                  <li>Environmental controls and redundancy systems</li>
                  <li>Secure disposal of hardware and media</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Privacy Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Access and Control:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of all personal information we maintain about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication Preferences:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Opt out of marketing communications (matching notifications will continue)</li>
                  <li>Choose email, SMS, or app notification preferences</li>
                  <li>Control frequency of non-essential communications</li>
                  <li>Manage survey and feedback requests</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Exercise Your Rights:</h4>
                <p className="text-muted-foreground">
                  To exercise these rights, contact us at <a href="mailto:privacy@mentoloop.com" className="text-primary hover:underline">privacy@mentoloop.com</a> 
                  or through your account settings. We will respond within 30 days and may require identity verification.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Data Retention and Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Retention Periods:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Active Accounts:</strong> Data retained while account is active and for legitimate business purposes</li>
                  <li><strong>Inactive Accounts:</strong> Data retained for 3 years after last login, then deleted</li>
                  <li><strong>Financial Records:</strong> Retained for 7 years for tax and legal compliance</li>
                  <li><strong>Communication Logs:</strong> Retained for 3 years for quality assurance</li>
                  <li><strong>Legal Hold:</strong> Data preserved longer if required for legal proceedings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Secure Deletion:</h4>
                <p className="text-muted-foreground">
                  When data is deleted, we use secure deletion methods to ensure it cannot be recovered. 
                  Backup systems are purged according to our retention schedule, and physical media is 
                  securely destroyed when decommissioned.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Types of Cookies We Use:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Analytics Cookies:</strong> Provide insights for platform improvement (anonymized)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Managing Cookies:</h4>
                <p className="text-muted-foreground">
                  You can control cookies through your browser settings. Note that disabling essential cookies 
                  may affect platform functionality. We do not use third-party advertising cookies or tracking pixels.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our primary data processing occurs within the United States. If you access our service from outside 
                the US, your information may be transferred to and processed in the United States, where data protection 
                laws may differ from your jurisdiction.
              </p>
              <p className="text-muted-foreground">
                We implement appropriate safeguards for international transfers, including encryption, access controls, 
                and contractual protections with service providers to ensure your data remains protected regardless of location.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect 
                personal information from children. If we become aware that we have collected personal information 
                from a child, we will take steps to delete such information promptly.
              </p>
              <p className="text-muted-foreground">
                If you believe we have collected information from a child, please contact us immediately at 
                <a href="mailto:privacy@mentoloop.com" className="text-primary hover:underline">privacy@mentoloop.com</a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Data Breach Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                In the unlikely event of a data breach that affects your personal information, we will:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Contain and investigate the breach immediately</li>
                <li>Notify affected users within 72 hours via email</li>
                <li>Report to relevant authorities as required by law</li>
                <li>Provide clear information about what happened and what we&apos;re doing to address it</li>
                <li>Offer identity protection services if appropriate</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically to reflect changes in our practices, technology, 
                legal requirements, or other factors. We will notify you of material changes via:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Email notification to your registered address</li>
                <li>Prominent notice on our platform</li>
                <li>Updated effective date at the top of this policy</li>
              </ul>
              <p className="text-muted-foreground">
                Your continued use of the service after changes take effect constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="border-t pt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Questions About This Privacy Policy?</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Privacy Officer: <a href="mailto:privacy@mentoloop.com" className="text-primary hover:underline">privacy@mentoloop.com</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  General Support: <a href="mailto:support@mentoloop.com" className="text-primary hover:underline">support@mentoloop.com</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Mailing Address: MentoLoop LLC, 1234 Healthcare Blvd, Suite 100, Austin, TX 78701
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