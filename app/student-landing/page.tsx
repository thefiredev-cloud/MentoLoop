'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  CheckCircle, 
  ChevronRight,
  Shield,
  DollarSign,
  Clock,
  Award,
  Users,
  Plus
} from 'lucide-react'

export default function StudentLandingPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Guaranteed Match or your money back",
      description: "We guarantee a preceptor match or provide a full refund."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Lower cost per hour than traditional hourly marketplaces",
      description: "Our block pricing offers better value than pay-per-hour services."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Priority matching options for faster placement",
      description: "Get matched faster with our priority placement options."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Bank unused hours within the semester",
      description: "Unused hours don't expire - use them when you need them."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Dedicated support throughout your rotation",
      description: "Get ongoing support from our dedicated student success team."
    }
  ]

  const process = [
    {
      step: 1,
      title: "Tell Us Your Needs",
      description: "Choose your specialty, hours, and location preferences."
    },
    {
      step: 2,
      title: "We Match You",
      description: "Our MentorFit™ algorithm and placement team connect you to vetted preceptors."
    },
    {
      step: 3,
      title: "Complete Your Rotation",
      description: "Track hours, manage paperwork, and focus on learning."
    }
  ]

  const pricingPlans = [
    {
      name: "Starter Block",
      hours: "60 hours",
      price: "$495",
      description: "Essential placement support"
    },
    {
      name: "Core Block", 
      hours: "90 hours",
      price: "$795",
      description: "Best value option"
    },
    {
      name: "Pro Block",
      hours: "180 hours", 
      price: "$1,495",
      description: "Full-semester support"
    },
    {
      name: "Elite Block",
      hours: "240 hours",
      price: "$1,895", 
      description: "Maximum hours & premium service"
    }
  ]

  const faqs = [
    {
      question: "What if my preceptor cancels?",
      answer: "We'll rematch you at no additional cost."
    },
    {
      question: "Can I pay in installments?",
      answer: "Yes — split payments are available."
    },
    {
      question: "Do I choose my preceptor?",
      answer: "You'll be matched based on specialty, location, and preferences. Profiles are shared for approval before placement."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/20 to-background py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Find Your NP Preceptor. Fast. Fair. Guaranteed.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Clinical placements shouldn&apos;t be stressful. With Mentoloop, you get matched to 
              vetted preceptors in your specialty — with transparent pricing, flexible options, and full support.
            </p>
            
            <div className="mb-8">
              <Button
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/85 text-primary-foreground px-8 py-6 text-lg"
              >
                <Link href="/sign-up/student">
                  Get Matched Today
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {process.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Choose MentoLoop Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Why Students Choose MentoLoop
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground text-center">
                    <CheckCircle className="inline w-5 h-5 text-accent mr-2" />
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership & Pricing Snapshot */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Membership & Pricing Snapshot
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Choose the block that fits your needs
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2 text-foreground">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary mb-1">{plan.price}</p>
                  <p className="text-sm text-muted-foreground mb-2">{plan.hours}</p>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="border-2 border-dashed border-blue-300 max-w-md mx-auto mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2 text-foreground">A La Carte Add-On</h3>
              <p className="text-2xl font-bold text-primary mb-1">$10/hr</p>
              <p className="text-sm text-muted-foreground">flexible extras (30hr blocks)</p>
              <p className="text-xs text-muted-foreground mt-1">aligns with institutional intervals</p>
            </CardContent>
          </Card>
          
          <p className="text-center text-muted-foreground">
            Installment plans and student discounts available.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            FAQ (Preview)
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Quick answers to common questions
          </p>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <button
                    type="button"
                    className="w-full text-left flex justify-between items-center"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <h3 className="font-semibold text-lg text-foreground">
                      Q: {faq.question}
                    </h3>
                    <Plus className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFAQ === index ? 'rotate-45' : ''
                    }`} />
                  </button>
                  {expandedFAQ === index && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-muted-foreground">A: {faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Preceptor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of NP students who have successfully found their clinical placements through MentoLoop
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              asChild
              className="bg-primary hover:bg-primary/85 text-primary-foreground px-8 py-6 text-lg"
            >
              <Link href="/sign-up/student">
                Sign up as a Student
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required • Cancel anytime • 100% satisfaction guarantee
          </p>
        </div>
      </section>
    </div>
  )
}
