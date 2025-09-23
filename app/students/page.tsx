'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import MentoLoopBackground from '@/components/mentoloop-background'
import { AnimatedText, GradientText, GlowingText } from '@/components/ui/animated-text'
import { motion } from 'motion/react'
import { 
  GraduationCap, 
  Clock, 
  DollarSign,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'

type TestimonialDoc = Doc<'testimonials'>

export default function StudentsPage() {

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Guaranteed Match",
      description: "Guaranteed Match or your money back."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Lower Cost",
      description: "Lower cost per hour than traditional hourly marketplaces."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Priority Matching",
      description: "Priority matching options for faster placement."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Bank Unused Hours",
      description: "Bank unused hours within the semester."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
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
  const studentTestimonialsData = useQuery(api.testimonials.getPublicTestimonials, {
    userType: 'student',
    limit: 3
  }) as TestimonialDoc[] | undefined

  const testimonialsFromDb = (studentTestimonialsData ?? []).map((testimonial) => ({
    name: testimonial.name,
    program: testimonial.title,
    rating: testimonial.rating,
    text: testimonial.content
  }))

  const testimonials = testimonialsFromDb.length > 0 ? testimonialsFromDb : [
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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        <MentoLoopBackground className="min-h-fit" showIcons={false} variant="full">
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
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/25 to-accent/15 rounded-full blur-3xl"
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
              className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-3xl"
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
                    href="/get-started/student"
                    className="group hover:bg-foreground/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 border border-foreground/20 backdrop-blur-md">
                    <div className="relative flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <span className="font-medium text-foreground">For Future NPs</span>
                    <ArrowRight className="w-4 h-4 text-foreground/70 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <div className="mt-8">
                  <AnimatedText
                    text="Find Your Perfect"
                    className="mx-auto max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-shadow-strong"
                    type="word"
                    delay={0.3}
                  />
                  <h1 className="mx-auto mt-2 max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-strong">
                    <GradientText gradient="from-foreground via-primary/70 to-accent/40">
                      NP Preceptor
                    </GradientText>
                  </h1>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-foreground/90 mx-auto my-6 max-w-xl text-balance text-xl md:text-2xl text-shadow-strong font-medium"
                >
                  <GlowingText className="text-foreground">
                    Fast. Fair. Guaranteed.
                  </GlowingText>
                </motion.p>
                <p className="text-foreground/80 mx-auto my-4 max-w-2xl text-balance text-lg">
                  Clinical placements shouldn&apos;t be stressful. With MentoLoop, you get matched to 
                  vetted preceptors in your specialty — with transparent pricing, flexible options, and full support.
                </p>
                <p className="text-foreground/80 mx-auto my-6 mb-8 max-w-2xl text-balance text-lg">
                  Join thousands of NP students who found their perfect clinical placement through our platform.
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
                    <Link href="/sign-up/student">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-primary" />
                      <span className="relative text-nowrap font-semibold">Get Matched Today</span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="flex items-center justify-center gap-8 text-sm text-foreground/90"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>No upfront fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>95% success rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>1,000+ preceptors</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </MentoLoopBackground>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Why Students Choose MentoLoop
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            We&apos;ve helped thousands of NP students find their perfect clinical placements
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground text-center">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-muted/20">
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

          <div className="text-center mt-12">
              <Button
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/85 text-primary-foreground px-8 py-6 text-lg"
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
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Membership & Pricing Snapshot
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Transparent pricing with flexible options
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-foreground">Starter Block</h3>
                <p className="text-3xl font-bold text-primary mb-1">$495</p>
                <p className="text-sm text-muted-foreground">60 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-foreground">Core Block</h3>
                <p className="text-3xl font-bold text-primary mb-1">$795</p>
                <p className="text-sm text-muted-foreground">90 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-foreground">Pro Block</h3>
                <p className="text-3xl font-bold text-primary mb-1">$1,495</p>
                <p className="text-sm text-muted-foreground">180 hours</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2 text-foreground">Elite Block</h3>
                <p className="text-3xl font-bold text-primary mb-1">$1,895</p>
                <p className="text-sm text-muted-foreground">240 hours</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-lg max-w-md mx-auto mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-xl mb-2 text-foreground">A La Carte Add-On</h3>
              <p className="text-3xl font-bold text-primary mb-1">$10/hr</p>
              <p className="text-sm text-muted-foreground">Flexible extras (30hr blocks)</p>
            </CardContent>
          </Card>
          
          <p className="text-center text-muted-foreground">
            Installment plans and student discounts available.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
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
                  <p className="text-muted-foreground mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.program}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-primary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">5,000+</p>
              <p className="text-foreground/70">Students Matched</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">1,000+</p>
              <p className="text-foreground/70">Verified Preceptors</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">95%</p>
              <p className="text-foreground/70">Success Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">1-3</p>
              <p className="text-foreground/70">Weeks to Match</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Preceptor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of NP students who have successfully found their clinical placements through MentoLoop
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-border hover:bg-foreground/10 px-8 py-6 text-lg"
            >
              <Link href="/contact">
                Talk to an Advisor
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Cancel anytime • 100% satisfaction guarantee
          </p>
        </div>
      </section>

    </div>
  )
}
