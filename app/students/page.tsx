'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  GraduationCap, 
  Target, 
  Clock, 
  DollarSign,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Calendar,
  MapPin,
  Award
} from 'lucide-react'

export default function StudentsPage() {
  const [showVideo, setShowVideo] = useState(false)

  const benefits = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Smart Matching",
      description: "AI-powered system matches you with the perfect preceptor based on your specialty, location, and learning style"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Vetted Preceptors",
      description: "All preceptors are thoroughly verified for credentials, experience, and mentoring excellence"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Fast Placement",
      description: "Most students are matched within 1-3 weeks, with expedited options available"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-blue-600" />,
      title: "Transparent Pricing",
      description: "Clear, upfront pricing with no hidden fees. Payment only after successful match"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Ongoing Support",
      description: "Dedicated support throughout your clinical rotation from start to finish"
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Success Guarantee",
      description: "95% success rate with full refund if we can't find you a match"
    }
  ]

  const process = [
    {
      step: 1,
      title: "Create Your Profile",
      description: "Complete a brief intake form with your program details, specialty needs, and preferences"
    },
    {
      step: 2,
      title: "Get Matched",
      description: "Our AI analyzes your needs and connects you with compatible preceptors in our network"
    },
    {
      step: 3,
      title: "Review & Accept",
      description: "Review preceptor profiles, confirm your match, and complete the onboarding process"
    },
    {
      step: 4,
      title: "Start Your Rotation",
      description: "Begin your clinical experience with full support and resources throughout"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      program: "FNP Student, UCLA",
      rating: 5,
      text: "MentoLoop found me an amazing preceptor in just one week! The process was seamless and the support team was incredible."
    },
    {
      name: "Michael Chen",
      program: "AGNP Student, Johns Hopkins",
      rating: 5,
      text: "After struggling for months to find a preceptor, MentoLoop matched me with the perfect mentor. Worth every penny!"
    },
    {
      name: "Emily Rodriguez",
      program: "PNP Student, Duke",
      rating: 5,
      text: "The matching algorithm really works! My preceptor was exactly what I needed for my pediatric rotation."
    }
  ]

  const faqs = [
    {
      question: "How quickly can I get matched?",
      answer: "Most students are matched within 1-3 weeks. We offer expedited matching for urgent needs."
    },
    {
      question: "What specialties are available?",
      answer: "We cover all major NP specialties including FNP, AGNP, PNP, PMHNP, and specialty rotations."
    },
    {
      question: "Is financial aid available?",
      answer: "Yes! We offer payment plans, early bird discounts, and accept some institutional funding."
    },
    {
      question: "What if I&apos;m not satisfied with my match?",
      answer: "We work with you to find an alternative match at no additional cost, or provide a full refund."
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
              For NP Students
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stop spending months searching for preceptors. Get matched with verified, 
              high-quality clinical placements in as little as one week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                <Link href="/get-started/student">
                  Get Started - Student
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
              <Link href="/get-started/student">
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
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
            Join thousands of NP students who&apos;ve successfully found their clinical placements through MentoLoop
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              <Link href="/get-started/student">
                Get Started Now
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