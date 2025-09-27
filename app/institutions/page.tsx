'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import MentoLoopBackground from '@/components/mentoloop-background'
import { AnimatedText, GradientText, GlowingText } from '@/components/ui/animated-text'
import { motion } from 'motion/react'
import { 
  Users, Shield, CheckCircle,
  TrendingUp, Award, Briefcase, ArrowRight,
  Globe, Zap, Target
} from 'lucide-react'
import Link from 'next/link'
import { env } from '@/lib/env'
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
      console.error('Failed to submit enterprise inquiry', error)
      toast.error('There was an error submitting your inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: <Users className="w-10 h-10 text-purple-600" />,
      title: "Enterprise Dashboard",
      description: "Comprehensive analytics and management tools for your entire program",
    },
    {
      icon: <Shield className="w-10 h-10 text-purple-600" />,
      title: "Compliance Management",
      description: "Automated compliance tracking and documentation for accreditation",
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-purple-600" />,
      title: "Performance Analytics",
      description: "Real-time insights into student progress and program outcomes",
    },
    {
      icon: <Globe className="w-10 h-10 text-purple-600" />,
      title: "Nationwide Network",
      description: "Access to 1,000+ verified preceptors across all specialties",
    },
    {
      icon: <Zap className="w-10 h-10 text-purple-600" />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms ensure optimal student-preceptor pairings",
    },
    {
      icon: <Target className="w-10 h-10 text-purple-600" />,
      title: "Custom Solutions",
      description: "Tailored implementation to meet your institution's unique needs",
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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        <MentoLoopBackground className="min-h-fit" showIcons={false}>
          {/* Floating 3D Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl"
            />
          </div>

          <div className="py-20 md:py-32">
            <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8 md:p-12 shadow-2xl hover-lift transform-3d"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Link
                    href="/sign-up/institution"
                    className="group hover:bg-foreground/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 border border-foreground/20 backdrop-blur-md">
                    <div className="relative flex items-center justify-center">
                      <Award className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                    <span className="font-medium text-white">Enterprise Solutions</span>
                    <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <div className="mt-8">
                  <AnimatedText
                    text="Transform Your"
                    className="mx-auto max-w-4xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white text-shadow-strong"
                    type="word"
                    delay={0.3}
                  />
                  <h1 className="mx-auto mt-2 max-w-4xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-strong">
                    <GradientText gradient="from-white via-purple-200 to-indigo-200">
                      Clinical Education Program
                    </GradientText>
                  </h1>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-white/90 mx-auto my-6 max-w-xl text-balance text-xl md:text-2xl text-shadow-strong font-medium"
                >
                  <GlowingText className="text-white">
                    Enterprise-Grade Platform for Healthcare Education
                  </GlowingText>
                </motion.p>
                <p className="text-white/80 mx-auto my-4 max-w-3xl text-balance text-lg">
                  Partner with MentoLoop to revolutionize your nursing education program. 
                  Our comprehensive platform streamlines clinical placements, ensures compliance, 
                  and provides actionable insights to improve student outcomes.
                </p>
                <p className="text-white/80 mx-auto my-6 mb-8 max-w-3xl text-balance text-lg">
                  Trusted by leading healthcare institutions nationwide to deliver exceptional clinical education experiences.
                </p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                >
                  <Button
                    asChild
                    size="lg"
                    className="group relative bg-card text-primary hover:bg-card/90 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden px-8 py-6 text-lg">
                    <Link href={env.NEXT_PUBLIC_CALENDLY_ENTERPRISE_URL || '/contact'}>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Briefcase className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-primary" />
                      <span className="relative text-nowrap font-semibold">Schedule Enterprise Demo</span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="flex items-center justify-center gap-8 text-sm text-white/90"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>FERPA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>SOC 2 Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>24/7 Support</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </MentoLoopBackground>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Comprehensive solutions designed for healthcare institutions at scale
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 bg-purple-100 rounded-2xl">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground text-center">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Platform Capabilities
          </h2>
          
          <Card className="border-0 shadow-xl">
            <CardContent className="p-10">
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-1 bg-purple-100 rounded-full flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-lg text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-foreground">Enroll Students</h3>
              <p className="text-muted-foreground">
                Add your nursing students to the platform with our bulk enrollment tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-foreground">Match with Preceptors</h3>
              <p className="text-muted-foreground">
                Our system matches students with qualified preceptors based on their needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-foreground">Track Progress</h3>
              <p className="text-muted-foreground">
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
            className="w-full max-w-2xl bg-card rounded-2xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Partnership Consultation
              </h3>
              <p className="text-muted-foreground">
                Let&apos;s discuss how MentoLoop can help your institution
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="institutionName" className="text-foreground">
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
                  <Label htmlFor="numberOfStudents" className="text-foreground">
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
                  <Label htmlFor="contactName" className="text-foreground">
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
                  <Label htmlFor="title" className="text-foreground">
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
                  <Label htmlFor="email" className="text-foreground">
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
                  <Label htmlFor="phone" className="text-foreground">
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
                <Label htmlFor="message" className="text-foreground">
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

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-white mb-2">50+</p>
              <p className="text-purple-100">Partner Institutions</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">10,000+</p>
              <p className="text-purple-100">Students Managed</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">99.8%</p>
              <p className="text-purple-100">Platform Uptime</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">4.9/5</p>
              <p className="text-purple-100">Institution Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Program?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading healthcare institutions using MentoLoop to deliver exceptional clinical education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg"
            >
              Request Enterprise Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-purple-300 hover:bg-purple-50 px-8 py-6 text-lg"
            >
              <Link href="/contact">
                Contact Sales Team
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Custom pricing • Dedicated support • Implementation assistance
          </p>
        </div>
      </section>
    </div>
  )
}
