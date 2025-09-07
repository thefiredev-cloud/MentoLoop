'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  CheckCircle, 
  ChevronRight,
  Star,
  Shield,
  DollarSign,
  Clock,
  Award,
  Users,
  Plus,
  Stethoscope,
  Trophy,
  MessageCircle,
  Gift
} from 'lucide-react'

export default function PreceptorLandingPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: "Earn honorariums per rotation (simple 1099 reporting)",
      description: "Get compensated for your mentoring with straightforward tax reporting."
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Set your own availability — take students only when you want",
      description: "Complete control over when and how many students you accept."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Students are vetted before being matched",
      description: "Work only with qualified, verified students who are ready to learn."
    },
    {
      icon: <Award className="w-8 h-8 text-green-600" />,
      title: "No admin burden — we handle contracts, scheduling, and tracking",
      description: "Focus on teaching while we handle all the paperwork and logistics."
    },
    {
      icon: <Star className="w-8 h-8 text-green-600" />,
      title: "Recognition through MentorFit™ badges (Bronze, Silver, Gold)",
      description: "Get recognized for your contributions with achievement badges."
    }
  ]

  const process = [
    {
      step: 1,
      title: "Create Your Profile",
      description: "Set your availability, location, and specialty areas."
    },
    {
      step: 2,
      title: "Get Matched",
      description: "Our MentorFit™ algorithm matches you with students who fit your scope."
    },
    {
      step: 3,
      title: "Teach & Get Recognized",
      description: "You mentor, we handle the admin. Earn honorariums and gain recognition badges."
    }
  ]

  const community = [
    {
      icon: <Trophy className="w-12 h-12 text-green-600" />,
      title: "MentorFit™ Badges",
      description: "for service milestones"
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-green-600" />,
      title: "LoopExchange™",
      description: "peer community and discussion forum"
    },
    {
      icon: <Award className="w-12 h-12 text-green-600" />,
      title: "CEU workshops",
      description: "& exclusive events for preceptors"
    },
    {
      icon: <Gift className="w-12 h-12 text-green-600" />,
      title: "Referral rewards",
      description: "for helping grow the network"
    }
  ]

  const faqs = [
    {
      question: "Do I have to take students every semester?",
      answer: "No — you control when and how many students you accept."
    },
    {
      question: "How are students vetted?",
      answer: "All students are verified for program enrollment, background, and readiness."
    },
    {
      question: "How much is the honorarium?",
      answer: "Honorariums vary by rotation length and block tier, but are competitive and transparent."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Stethoscope className="w-16 h-16 text-green-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Mentor the Next Generation of NPs. On Your Terms.
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Mentoloop makes precepting easy, rewarding, and flexible. Earn honorariums, 
              gain recognition, and help shape the future of healthcare — without the paperwork hassle.
            </p>
            
            <div className="mb-8">
              <Button
                size="lg"
                asChild
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                <Link href="/sign-up/preceptor">
                  Become a Preceptor
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
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {process.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Preceptors Join MentoLoop Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Preceptors Join Mentoloop
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 text-center">
                    <CheckCircle className="inline w-5 h-5 text-green-600 mr-2" />
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition & Community */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Recognition & Community
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Connect with peers and get recognized for your contributions
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {community.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            FAQ (Preview)
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Quick answers to common questions
          </p>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <button
                    className="w-full text-left flex justify-between items-center"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <h3 className="font-semibold text-lg text-gray-900">
                      Q: {faq.question}
                    </h3>
                    <Plus className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFAQ === index ? 'rotate-45' : ''
                    }`} />
                  </button>
                  {expandedFAQ === index && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-600">A: {faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing network of preceptors and start earning while mentoring 
            the next generation of nurse practitioners
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              asChild
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
            >
              <Link href="/sign-up/preceptor">
                Sign Up as a Preceptor
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Quick approval • Flexible commitment • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}