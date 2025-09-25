'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  GraduationCap, 
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Calendar,
  Users,
  ArrowRight,
  Info
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GetStartedStudentPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Sign up with your email and create a secure password",
      icon: <Users className="w-5 h-5" />,
      time: "2 minutes"
    },
    {
      number: 2,
      title: "Complete Profile",
      description: "Fill out your student intake form with program details and preferences",
      icon: <FileText className="w-5 h-5" />,
      time: "10-15 minutes"
    },
    {
      number: 3,
      title: "MentorFit Assessment",
      description: "Complete our proprietary matching assessment for optimal preceptor pairing",
      icon: <GraduationCap className="w-5 h-5" />,
      time: "5 minutes"
    },
    {
      number: 4,
      title: "Review & Payment",
      description: "Select your membership plan and complete payment",
      icon: <CreditCard className="w-5 h-5" />,
      time: "3 minutes"
    },
    {
      number: 5,
      title: "Get Matched",
      description: "Receive your preceptor match within 1-3 weeks",
      icon: <Calendar className="w-5 h-5" />,
      time: "1-3 weeks"
    }
  ]

  const requirements = [
    "Current enrollment in an accredited NP program",
    "Valid student ID or enrollment verification",
    "Clinical rotation dates and requirements",
    "Preferred locations and specialties",
    "Payment method (credit card, debit card, or HSA/FSA)"
  ]

  const faqs = [
    {
      question: "How long does the entire process take?",
      answer: "Account setup and intake takes about 20-25 minutes. Matching typically occurs within 1-3 weeks."
    },
    {
      question: "When do I need to pay?",
      answer: "Payment is required after completing your intake form, but you&apos;re only charged once we confirm a match."
    },
    {
      question: "Can I save and return later?",
      answer: "Yes! Your progress is automatically saved, and you can complete the intake form at your own pace."
    },
    {
      question: "What if I need help during signup?",
      answer: "Our support team is available via chat or email to assist you throughout the process."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background py-12">
      <div className="container mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get Started as a Student
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You&apos;re just a few steps away from finding your perfect preceptor match. 
            Here&apos;s everything you need to know before signing up.
          </p>
        </div>

        {/* Alert */}
        <Alert className="mb-8 bg-primary/10">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-primary">
            <strong>Early Bird Special:</strong> Sign up 45+ days before your rotation 
            starts and save 20% on all membership plans!
          </AlertDescription>
        </Alert>

        {/* Process Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Your Journey to Finding a Preceptor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    activeStep === index 
                      ? 'bg-primary/10 border-2 border-primary/50' 
                      : 'hover:bg-muted/20'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-muted/20 text-muted-foreground'
                    }`}>
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <span className="text-sm text-muted-foreground ml-auto">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {step.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-accent/10 rounded-lg">
              <p className="text-accent text-center font-medium">
                Total time to complete: ~25 minutes + matching period
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">What You&apos;ll Need</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Before you begin, make sure you have the following information ready:
            </p>
            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Membership Options Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Membership Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Basic</h3>
                <p className="text-2xl font-bold text-foreground mb-2">$499</p>
                <p className="text-sm text-muted-foreground">Single rotation match</p>
              </div>
              <div className="p-4 border-2 border-blue-500 rounded-lg relative">
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary/100 text-white text-xs px-2 py-1 rounded">
                  MOST POPULAR
                </span>
                <h3 className="font-semibold mb-2">Premium</h3>
                <p className="text-2xl font-bold text-foreground mb-2">$899</p>
                <p className="text-sm text-muted-foreground">Full year access, unlimited matches</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Elite</h3>
                <p className="text-2xl font-bold text-foreground mb-2">$1,299</p>
                <p className="text-sm text-muted-foreground">Priority matching + extras</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              * Final pricing shown during checkout. Discounts automatically applied.
            </p>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Begin?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of NP students who&apos;ve successfully found their clinical placements
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <Link href="/sign-up/student">
                Continue to Sign Up
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/students">
                <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                Back to Overview
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>No credit card required to start</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>100% satisfaction guarantee</span>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Have more questions? Visit our{' '}
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            {' '}or{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
