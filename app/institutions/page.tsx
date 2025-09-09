'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Users, Shield, BarChart3, Building2, 
  ChevronRight, GraduationCap, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function InstitutionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    numberOfStudents: '',
    message: ''
  })

  const createEnterpriseInquiry = useMutation(api.enterprises.createEnterpriseInquiry)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await createEnterpriseInquiry({
        name: formData.institutionName,
        contactName: formData.contactName,
        title: formData.title,
        email: formData.email,
        phone: formData.phone || undefined,
        numberOfStudents: formData.numberOfStudents,
        message: formData.message || undefined,
      })
      
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowForm(false)
        setSubmitSuccess(false)
        setFormData({
          institutionName: '',
          contactName: '',
          title: '',
          email: '',
          phone: '',
          numberOfStudents: '',
          message: ''
        })
      }, 2000)
    } catch (error) {
      // Error submitting inquiry
      toast.error('There was an error submitting your inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Student Management",
      description: "Seamlessly manage your entire student cohort through our platform",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Vetted Preceptors",
      description: "Access to our network of thoroughly vetted clinical preceptors",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: "Clinical Placements",
      description: "Efficient matching system for student clinical rotations",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Progress Tracking",
      description: "Monitor student progress and clinical hours in real-time",
    }
  ]

  const features = [
    "Direct access to student enrollment system",
    "Pre-vetted network of clinical preceptors",
    "Streamlined placement matching process",
    "Real-time progress monitoring dashboard",
    "Dedicated support team",
    "Compliance and documentation management"
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Building2 className="w-16 h-16 text-blue-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Institution Partnership
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simplify your clinical education program with MentoLoop&apos;s comprehensive platform. 
              Connect your students with qualified preceptors and manage the entire process in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                Schedule Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-gray-300 hover:bg-gray-50 px-8 py-6 text-lg"
              >
                <Link href="/contact">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            What Your Institution Gets
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Everything you need to manage your nursing education program efficiently
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-xl mb-2 text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Features List */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-lg text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-gray-900">Enroll Students</h3>
              <p className="text-gray-600">
                Add your nursing students to the platform with our bulk enrollment tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-gray-900">Match with Preceptors</h3>
              <p className="text-gray-600">
                Our system matches students with qualified preceptors based on their needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-gray-900">Track Progress</h3>
              <p className="text-gray-600">
                Monitor clinical hours, evaluations, and student progress in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Partnership Consultation
              </h3>
              <p className="text-gray-600">
                Let&apos;s discuss how MentoLoop can help your institution
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="institutionName" className="text-gray-700">
                    Institution Name
                  </Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="numberOfStudents" className="text-gray-700">
                    Number of Students
                  </Label>
                  <Input
                    id="numberOfStudents"
                    value={formData.numberOfStudents}
                    onChange={(e) => setFormData({...formData, numberOfStudents: e.target.value})}
                    placeholder="e.g., 100-200"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactName" className="text-gray-700">
                    Your Name
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title" className="text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Your role"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="message" className="text-gray-700">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us about your institution&apos;s needs..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : submitSuccess ? 'Success!' : 'Request Consultation'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join institutions across the country using MentoLoop to streamline their clinical education programs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              Schedule Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-gray-300 hover:bg-white px-8 py-6 text-lg"
            >
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}