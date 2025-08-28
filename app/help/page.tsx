'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  BookOpen, 
  UserCheck, 
  CreditCard, 
  Settings, 
  Shield,
  Search,
  FileText,
  HelpCircle
} from 'lucide-react'

export default function HelpCenter() {
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      color: 'bg-blue-500',
      items: [
        {
          title: 'Getting Started with MentoLoop',
          content: 'MentoLoop connects NP students with vetted preceptors through smart matching and hands-on support. Start by creating your student profile and completing the intake form-it only takes a few minutes.'
        },
        {
          title: 'How to Create Your Student Profile',
          content: `Complete the intake form with your:
• NP program & grad date
• Specialty/location/timeline needs
• Learning & communication preferences
After submission, you'll receive a confirmation and unlock matching access.`
        },
        {
          title: 'Finding Your First Preceptor Match',
          content: 'Once your profile is submitted, our proprietary matching system identifies compatible preceptors. You\'ll be notified of potential matches to review and confirm. Paperwork and onboarding follow once you accept.'
        },
        {
          title: 'Understanding Our Matching Process',
          content: 'Our proprietary matching system ensures compatibility by evaluating multiple factors including clinical specialty needs, availability, learning preferences, and alignment with your educational goals. You\'ll be notified when a suitable match is found.'
        },
        {
          title: 'Setting Up Your Preferences',
          content: 'Customize your rotation specialties, dates, location radius, and style preferences. A detailed profile leads to stronger, faster matches.'
        },
        {
          title: 'Completing Your Intake Form',
          content: 'Includes school/program verification, clinical needs, and learning style info. Helps us ensure a well-matched, fully supported placement.'
        }
      ]
    },
    {
      id: 'matching-process',
      title: 'Matching Process',
      icon: UserCheck,
      color: 'bg-green-500',
      items: [
        {
          title: 'How Our Matching System Works',
          content: `Our proprietary matching system ensures compatibility between students and preceptors by evaluating multiple compatibility factors including learning styles, communication preferences, supervision approaches, and professional values. The system provides match recommendations based on comprehensive compatibility analysis to optimize your clinical learning experience.`
        },
        {
          title: 'What Makes a Good Match?',
          content: 'Specialty alignment, strong communication fit, compatible schedules, and mutual willingness to mentor are key to a successful experience.'
        },
        {
          title: 'Dealing with Match Rejections',
          content: 'If a match is declined, we re-run your profile to find another high-quality option. You\'ll be notified and supported every step of the way.'
        },
        {
          title: 'Requesting Specific Preceptors',
          content: 'You can request a known preceptor. If they aren\'t in our system, we\'ll reach out and invite them to join (pending verification).'
        },
        {
          title: 'Match Timeline & Expectations',
          content: 'Most students receive a match in 1-3 weeks. Some specialties or rural areas may take longer. We\'ll keep you updated throughout.'
        }
      ]
    },
    {
      id: 'payments-billing',
      title: 'Payments & Billing',
      icon: CreditCard,
      color: 'bg-purple-500',
      items: [
        {
          title: 'Understanding Our Pricing',
          content: 'Your fee includes access to preceptors, match processing, and paperwork support. Preceptor honorariums vary by region/specialty. Pricing is transparent-nothing due until matched.'
        },
        {
          title: 'Payment Methods Accepted',
          content: 'We accept credit/debit cards, PayPal, HSA/FSA cards (if eligible), and approved institutional purchase orders.'
        },
        {
          title: 'Refund Policy Explained',
          content: 'Full refund if no match is made. Partial refunds apply if cancellation happens after a match is confirmed. We\'ll outline refund terms clearly before you commit.'
        },
        {
          title: 'Early Bird Special Terms',
          content: 'Discounted rates available if you enroll 45+ days before your rotation start date. Locked in at time of intake submission.'
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: Settings,
      color: 'bg-orange-500',
      items: [
        {
          title: 'Understanding Your Profile',
          content: 'Your profile includes your clinical needs, program info, and learning style. Update any time from your dashboard for better matches.'
        },
        {
          title: 'Managing Notifications',
          content: 'Choose email (default), SMS, or in-app alerts. Adjust preferences under "Notifications" in your account settings.'
        },
        {
          title: 'Privacy Settings',
          content: 'You can control what\'s visible to preceptors, delete your profile, or request full data removal at any time. Your privacy is our priority.'
        },
        {
          title: 'Deactivating Your Account',
          content: 'You may deactivate anytime. We\'ll retain your info for 30 days in case you change your mind, then delete it permanently.'
        },
        {
          title: 'Changing Your Email',
          content: 'Go to Account Settings > Email to update. You\'ll confirm the change through both your current and new address for security.'
        }
      ]
    },
    {
      id: 'safety-security',
      title: 'Safety & Security',
      icon: Shield,
      color: 'bg-red-500',
      items: [
        {
          title: 'Our Verification Process',
          content: 'We verify preceptors for licensure, experience, and mentoring readiness. Some placements also require background checks per school policy.'
        },
        {
          title: 'Reporting Inappropriate Behavior',
          content: 'If anything concerning occurs, report it via your dashboard or contact form. We investigate all reports promptly and confidentially.'
        },
        {
          title: 'Data Security Measures',
          content: 'All data is encrypted and stored on secure servers. We follow HIPAA standards and restrict access to sensitive information.'
        },
        {
          title: 'Background Check Requirements',
          content: 'If your school or site requires one, we\'ll walk you through the process and assist with documentation or forms.'
        },
        {
          title: 'Emergency Contact Procedures',
          content: 'You can add or update your emergency contact in your profile settings. We\'ll reach out to them in the event of a critical issue during your rotation.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: Search,
      color: 'bg-gray-500',
      items: [
        {
          title: 'I Haven\'t Received Any Matches',
          content: `If you haven't received matches within 2-3 weeks:

• Check that your profile is complete and verified
• Consider expanding your location radius or rotation types
• Review your availability dates - very specific timeframes limit options
• Contact support to review your profile for optimization opportunities
• Some specialized rotations (rural family practice, pediatrics) take longer

We're committed to finding you a match and will work with you to adjust preferences if needed.`
        },
        {
          title: 'Login and Account Issues',
          content: `Common login problems and solutions:

Password Reset: Click "Forgot Password" and check your email (including spam folder)
Email Not Recognized: Ensure you're using the same email address you registered with
Two-Factor Authentication: If enabled, check your authenticator app or SMS
Account Locked: Contact support if you've exceeded login attempts
Browser Issues: Clear cache/cookies or try a different browser

For persistent issues, email support@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'mentoloop.com'} with your registered email address.`
        },
        {
          title: 'Payment and Billing Problems',
          content: `Resolving payment issues:

Card Declined: Check with your bank - some flag healthcare/education payments as unusual
Payment Not Processing: Ensure billing address matches your bank records exactly
HSA/FSA Cards: Some accounts require additional verification for education expenses
Multiple Payments: Contact us immediately if you're charged more than once
Refund Delays: Processing typically takes 3-5 business days

All payments are secure and encrypted. We never store your full payment information.`
        },
        {
          title: 'Communication and Messaging',
          content: `Issues with messaging features:

Messages Not Sending: Check your internet connection and try refreshing the page
Missing Conversations: Ensure you haven't archived them - check the "Archived" tab
File Upload Fails: Files must be under 10MB in PDF, DOC, or image format
Notifications Not Working: Check your notification preferences in account settings
Can't Contact Preceptor: Full contact information is released only after payment confirmation

The messaging system is HIPAA-compliant and all conversations are encrypted.`
        },
        {
          title: 'Technical Support',
          content: `For technical issues:

Browser Compatibility: We support Chrome, Firefox, Safari, and Edge (latest versions)
Mobile Access: Use our mobile-optimized site or app for on-the-go access
Slow Loading: Clear browser cache or try incognito/private browsing mode
Error Messages: Take a screenshot and include it when contacting support
Feature Requests: We welcome feedback on improving the platform

Contact our technical team at tech@mentoloop.com for complex technical issues.`
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions and get the support you need to make the most of MentoLoop.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/faq" className="inline-flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                View All FAQs
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {sections.map((section) => {
            const IconComponent = section.icon
            return (
              <Card 
                key={section.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  const element = document.getElementById(section.id)
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.items.length} articles
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {sections.map((section) => {
            const IconComponent = section.icon
            return (
              <div key={section.id} id={section.id} className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {section.items.map((item, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-muted-foreground whitespace-pre-line text-sm">
                          {item.content}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/faq" className="inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Browse FAQs
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact" className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submit Question
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a 
                  href={`mailto:support@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'mentoloop.com'}`}
                  className="inline-flex items-center gap-2"
                >
                  Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}