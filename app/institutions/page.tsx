'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Users, Shield, Zap, Award, GraduationCap, Building2, ChevronRight, BarChart3, Clock, Headphones, FileText } from 'lucide-react'
import Link from 'next/link'

export default function InstitutionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    numberOfStudents: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Institution inquiry:', formData)
    // Show success message
    setShowForm(false)
  }

  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Bulk Enrollment",
      description: "Streamlined registration for entire cohorts with customized onboarding"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Guaranteed Placements",
      description: "Priority matching ensures all your students find quality preceptors"
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Dedicated Support",
      description: "Institutional account manager for seamless coordination"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Analytics Dashboard",
      description: "Track student progress, hours, and rotation outcomes in real-time"
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Faster Placements",
      description: "Average placement time of 7-10 days vs industry standard of 3-6 months"
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Vetted Network",
      description: "All preceptors verified and matched using our MentorFit algorithm"
    }
  ]

  const features = [
    "Custom institutional portal",
    "Bulk student management",
    "Automated paperwork processing",
    "Clinical hours tracking",
    "Compliance documentation",
    "Priority placement queue",
    "Volume-based pricing",
    "Quarterly business reviews"
  ]

  const stats = [
    { value: "500+", label: "Partner Institutions" },
    { value: "95%", label: "Placement Success Rate" },
    { value: "10 days", label: "Average Match Time" },
    { value: "4.9/5", label: "Institution Rating" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex justify-center mb-6">
            <Building2 className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Partner with MentoLoop
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Ensure every student in your NP program finds the right clinical placement. 
            Join hundreds of institutions using MentoLoop to streamline their clinical coordination.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setShowForm(true)}>
              Schedule a Demo
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Institutions Choose MentoLoop</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive support for your entire clinical placement process
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple implementation, powerful results
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Schedule Demo", desc: "Meet with our team to discuss your needs" },
              { step: "2", title: "Custom Setup", desc: "We configure your institutional portal" },
              { step: "3", title: "Student Onboarding", desc: "Bulk enroll your cohort with our support" },
              { step: "4", title: "Ongoing Success", desc: "Dedicated support throughout the semester" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 3 && (
                  <ChevronRight className="w-6 h-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Everything Your Program Needs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                MentoLoop provides comprehensive tools and support to ensure clinical placement success 
                for your entire program.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Headphones className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Dedicated Support Team</h3>
                    <p className="text-sm text-muted-foreground">
                      Your institutional account manager handles all coordination
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FileText className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Compliance Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      All documentation meets accreditation requirements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <GraduationCap className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Student Success</h3>
                    <p className="text-sm text-muted-foreground">
                      Higher satisfaction rates and better clinical outcomes
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Modal/Section */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Request Institutional Partnership Information</CardTitle>
              <CardDescription>
                Fill out the form below and our team will contact you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numberOfStudents">Number of NP Students *</Label>
                    <Input
                      id="numberOfStudents"
                      value={formData.numberOfStudents}
                      onChange={(e) => setFormData({...formData, numberOfStudents: e.target.value})}
                      placeholder="e.g., 50-100"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title/Role *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Clinical Coordinator"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your clinical placement needs</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Current challenges, timeline, specific requirements..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Clinical Placement Process?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join leading NP programs nationwide in providing better clinical experiences for your students
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setShowForm(true)}>
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Questions? Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}