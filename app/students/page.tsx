'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { 
  GraduationCap, 
  Clock, 
  DollarSign,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Award
} from 'lucide-react'

export default function StudentsPage() {
  const [showVideo, setShowVideo] = useState(false)

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Guaranteed Match",
      description: "Guaranteed Match or your money back."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-blue-600" />,
      title: "Lower Cost",
      description: "Lower cost per hour than traditional hourly marketplaces."
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Priority Matching",
      description: "Priority matching options for faster placement."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Bank Unused Hours",
      description: "Bank unused hours within the semester."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Dedicated Support",
      description: "Dedicated support throughout your rotation."
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

  // Get student testimonials from database
  const studentTestimonials = useQuery(api.testimonials.getPublicTestimonials, {
    userType: 'student',
    limit: 3
  })

  const testimonials = studentTestimonials?.map(t => ({
    name: t.name,
    program: t.title,
    rating: t.rating,
    text: t.content
  })) || [
    // Fallback data if database is loading
    {
      name: "Sarah Johnson",
      program: "FNP Student, UCLA", 
      rating: 5,
      text: "MentoLoop found me an amazing preceptor in just one week! The process was seamless and the support team was incredible."
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <GraduationCap className="w-16 h-16 text-blue-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your NP Preceptor. Fast. Fair. Guaranteed.
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Clinical placements shouldn&apos;t be stressful. With Mentoloop, you get matched to 
              vetted preceptors in your specialty — with transparent pricing, flexible options, and full support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                <Link href="/sign-up/student">
                  Get Matched Today
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowVideo(true)}
                className="border-gray-300 hover:bg-gray-50 px-8 py-6 text-lg"
              >
                Watch How It Works
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No upfront fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>95% success rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>1,000+ preceptors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Students Choose MentoLoop
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16">
            We&apos;ve helped thousands of NP students find their perfect clinical placements
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-900 text-center">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {process.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              <Link href="/sign-up/student">
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Snapshot Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Membership & Pricing Snapshot
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Transparent pricing with flexible options
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Starter Block</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">$495</p>
                <p className="text-sm text-gray-600">60 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Core Block</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">$795</p>
                <p className="text-sm text-gray-600">90 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Pro Block</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">$1,495</p>
                <p className="text-sm text-gray-600">180 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Elite Block</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">$1,895</p>
                <p className="text-sm text-gray-600">240 hours</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-lg max-w-md mx-auto mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-xl mb-2 text-gray-900">A La Carte Add-On</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">$10/hr</p>
              <p className="text-sm text-gray-600">Flexible extras (30hr blocks)</p>
            </CardContent>
          </Card>
          
          <p className="text-center text-gray-600">
            Installment plans and student discounts available.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            What Students Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.program}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-white mb-2">5,000+</p>
              <p className="text-blue-100">Students Matched</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">1,000+</p>
              <p className="text-blue-100">Verified Preceptors</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">95%</p>
              <p className="text-blue-100">Success Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">1-3</p>
              <p className="text-blue-100">Weeks to Match</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/help">
                View All FAQs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Find Your Perfect Preceptor?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of NP students who have successfully found their clinical placements through MentoLoop
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              <Link href="/sign-up/student">
                Sign up as a Student
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-gray-300 hover:bg-white px-8 py-6 text-lg"
            >
              <Link href="/contact">
                Talk to an Advisor
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Cancel anytime • 100% satisfaction guarantee
          </p>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowVideo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-lg overflow-hidden"
          >
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">Video placeholder - How MentoLoop Works</p>
            </div>
            <div className="p-4">
              <Button 
                onClick={() => setShowVideo(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}