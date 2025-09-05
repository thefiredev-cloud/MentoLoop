'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Stethoscope, 
  DollarSign, 
  Clock, 
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Award,
  Heart,
  TrendingUp,
  Calendar
} from 'lucide-react'

export default function PreceptorsPage() {
  const [showVideo, setShowVideo] = useState(false)

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: "Earn Extra Income",
      description: "Receive competitive honorariums for sharing your expertise and mentoring the next generation"
    },
    {
      icon: <Heart className="w-8 h-8 text-green-600" />,
      title: "Give Back",
      description: "Make a meaningful impact on future NPs while staying connected to education"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Flexible Schedule",
      description: "Set your own availability and choose students that fit your practice schedule"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Full Support",
      description: "We handle all paperwork, liability coverage, and administrative tasks for you"
    },
    {
      icon: <Award className="w-8 h-8 text-green-600" />,
      title: "CEU Credits",
      description: "Earn continuing education credits while precepting through our accredited programs"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Professional Growth",
      description: "Enhance your teaching skills and stay current with the latest in NP education"
    }
  ]

  const process = [
    {
      step: 1,
      title: "Apply Online",
      description: "Complete our simple application with your credentials and availability preferences"
    },
    {
      step: 2,
      title: "Get Verified",
      description: "We verify your credentials and ensure you meet all requirements (usually 24-48 hours)"
    },
    {
      step: 3,
      title: "Match with Students",
      description: "Receive matched student profiles based on your specialty and preferences"
    },
    {
      step: 4,
      title: "Start Mentoring",
      description: "Begin precepting with full support, resources, and compensation"
    }
  ]

  const testimonials = [
    {
      name: "Dr. Patricia Williams",
      role: "Family Nurse Practitioner",
      rating: 5,
      text: "MentoLoop makes precepting so easy! They handle everything so I can focus on teaching. The students are well-prepared and eager to learn."
    },
    {
      name: "Dr. James Martinez",
      role: "Adult-Gerontology NP",
      rating: 5,
      text: "I love giving back to the profession. The honorarium is a nice bonus, but the real reward is seeing students grow into confident practitioners."
    },
    {
      name: "Dr. Amanda Foster",
      role: "Psychiatric NP",
      rating: 5,
      text: "The platform matches me with students who truly align with my practice. It&apos;s been a wonderful experience mentoring through MentoLoop."
    }
  ]

  const requirements = [
    "Active, unrestricted NP license",
    "Minimum 2 years of clinical practice experience",
    "Commitment to quality education and mentorship",
    "Professional liability insurance (we can help arrange)",
    "Willingness to complete student evaluations"
  ]

  const compensationTiers = [
    {
      specialty: "Primary Care (FNP, AGNP)",
      range: "$500-800/month",
      description: "For full-time student rotations"
    },
    {
      specialty: "Specialized Care (PMHNP, PNP)",
      range: "$600-1000/month",
      description: "Higher demand specialties"
    },
    {
      specialty: "Acute Care & Emergency",
      range: "$700-1200/month",
      description: "Critical care settings"
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
              For Preceptors
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Share your expertise, earn extra income, and shape the future of nursing 
              by mentoring NP students through MentoLoop.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                asChild
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                <Link href="/get-started/preceptor">
                  Get Started - Preceptor
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowVideo(true)}
                className="border-gray-300 hover:bg-gray-50 px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Quick approval</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Competitive pay</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Full support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Become a MentoLoop Preceptor?
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Join our network of 1,000+ healthcare professionals making a difference
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

      {/* Compensation Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Competitive Compensation
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Earn meaningful income while mentoring the next generation of NPs
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {compensationTiers.map((tier, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    {tier.specialty}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {tier.range}
                  </p>
                  <p className="text-sm text-gray-600">
                    {tier.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-8 text-gray-600">
            * Compensation varies by location, specialty, and student needs. 
            Additional bonuses available for high-demand areas.
          </p>
        </div>
      </section>

      {/* Process Section */}
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

          <div className="text-center mt-12">
            <Button
              size="lg"
              asChild
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              <Link href="/get-started/preceptor">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Requirements
          </h2>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <p className="text-gray-600 mb-6">
                To ensure quality education for our students, we require:
              </p>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Don&apos;t have liability insurance? We can help you obtain 
                  coverage at discounted rates through our partners.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            What Preceptors Say
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
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-green-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-white mb-2">1,000+</p>
              <p className="text-green-100">Active Preceptors</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">$800</p>
              <p className="text-green-100">Average Monthly Earnings</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">98%</p>
              <p className="text-green-100">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">24-48hr</p>
              <p className="text-green-100">Approval Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing network of preceptors and start earning while mentoring 
            the next generation of nurse practitioners
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
            >
              <Link href="/get-started/preceptor">
                Apply to Precept
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
                Have Questions?
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Quick approval • Flexible commitment • Cancel anytime
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
              <p className="text-gray-600">Video placeholder - Becoming a MentoLoop Preceptor</p>
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