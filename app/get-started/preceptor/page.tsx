'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Stethoscope, 
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  DollarSign,
  Award,
  ArrowRight,
  Info,
  Calendar,
  Users
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GetStartedPreceptorPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Sign up with your professional email and create a secure password",
      icon: <Users className="w-5 h-5" />,
      time: "2 minutes"
    },
    {
      number: 2,
      title: "Complete Application",
      description: "Provide your credentials, experience, and availability preferences",
      icon: <FileText className="w-5 h-5" />,
      time: "10-15 minutes"
    },
    {
      number: 3,
      title: "Verification Process",
      description: "We verify your license and credentials (usually within 24-48 hours)",
      icon: <Shield className="w-5 h-5" />,
      time: "24-48 hours"
    },
    {
      number: 4,
      title: "Profile Setup",
      description: "Complete your teaching profile and mentoring preferences",
      icon: <Award className="w-5 h-5" />,
      time: "5 minutes"
    },
    {
      number: 5,
      title: "Start Matching",
      description: "Receive student matches based on your preferences",
      icon: <Calendar className="w-5 h-5" />,
      time: "Ongoing"
    }
  ]

  const requirements = [
    "Active, unrestricted NP license (we&apos;ll verify this)",
    "Minimum 2 years of clinical practice experience",
    "Professional liability insurance (or willingness to obtain)",
    "CV or resume with your clinical experience",
    "One professional reference (name and contact)",
    "Availability calendar for the next 6 months"
  ]

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      title: "$500-1,200/month",
      description: "Competitive honorariums based on specialty and location"
    },
    {
      icon: <Award className="w-6 h-6 text-green-600" />,
      title: "CEU Credits",
      description: "Earn continuing education credits while precepting"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Full Support",
      description: "We handle paperwork, contracts, and administrative tasks"
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "Flexible Schedule",
      description: "Set your own availability and choose students that fit"
    }
  ]

  const faqs = [
    {
      question: "How quickly can I start precepting?",
      answer: "After verification (24-48 hours), you can start receiving student matches immediately based on your availability."
    },
    {
      question: "What&apos;s the time commitment?",
      answer: "You set your own schedule. Most preceptors work with 1-2 students per rotation period (8-12 weeks)."
    },
    {
      question: "How much can I earn?",
      answer: "Honorariums range from $500-1,200 per month depending on specialty, location, and hours committed."
    },
    {
      question: "Do I need special insurance?",
      answer: "Professional liability insurance is required, but we can help you obtain coverage at discounted rates."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Stethoscope className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Started as a Preceptor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our network of healthcare professionals making a difference. 
            Here&apos;s everything you need to know about becoming a MentoLoop preceptor.
          </p>
        </div>

        {/* Alert */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Limited Time Bonus:</strong> New preceptors who complete their first 
            student rotation receive a $200 welcome bonus!
          </AlertDescription>
        </Alert>

        {/* Benefits Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Why Become a Preceptor?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Your Path to Becoming a Preceptor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    activeStep === index 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep === index 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <span className="text-sm text-gray-500 ml-auto">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {step.time}
                      </span>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-center font-medium">
                Application time: ~20 minutes • Approval: 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">What You&apos;ll Need to Apply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Before you begin your application, please have the following ready:
            </p>
            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Note:</strong> Don&apos;t have liability insurance? No problem! 
                We can connect you with our insurance partners for discounted rates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Compensation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Compensation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Primary Care (FNP, AGNP)</h3>
                  <span className="text-xl font-bold text-green-600">$500-800/mo</span>
                </div>
                <p className="text-sm text-gray-600">Standard rotations, 3-4 days/week</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Specialty Care (PMHNP, PNP)</h3>
                  <span className="text-xl font-bold text-green-600">$600-1,000/mo</span>
                </div>
                <p className="text-sm text-gray-600">Higher demand specialties</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Acute/Emergency Care</h3>
                  <span className="text-xl font-bold text-green-600">$700-1,200/mo</span>
                </div>
                <p className="text-sm text-gray-600">Critical care settings</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              * Plus potential bonuses for rural areas and high-need specialties
            </p>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Making a Difference?
          </h2>
          <p className="text-gray-600 mb-6">
            Join 1,000+ preceptors already mentoring through MentoLoop
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Link href="/sign-up/preceptor">
                Continue to Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/preceptors">
                <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                Back to Overview
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Quick 24-48hr approval</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>No fees to join</span>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Have more questions? Visit our{' '}
            <Link href="/help" className="text-green-600 hover:underline">
              Help Center
            </Link>
            {' '}or{' '}
            <Link href="/contact" className="text-green-600 hover:underline">
              contact our team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}