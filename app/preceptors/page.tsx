'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
const MentoLoopBackground = dynamic(() => import('@/components/mentoloop-background'), {
  ssr: false,
  loading: () => <div className="min-h-fit" />
})
import { AnimatedText, GradientText, GlowingText } from '@/components/ui/animated-text'
import { motion } from 'motion/react'
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
  ArrowRight
} from 'lucide-react'

type TestimonialDoc = Doc<'testimonials'>

export default function PreceptorsPage() {
  const [showVideo, setShowVideo] = useState(false)

  // Get preceptor testimonials from database
  const preceptorTestimonialsData = useQuery(api.testimonials.getPublicTestimonials, {
    userType: 'preceptor',
    limit: 3
  }) as TestimonialDoc[] | undefined

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-accent" />,
      title: "Earn Honorariums",
      description: "Earn honorariums per rotation (simple 1099 reporting)."
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "Set Your Own Availability",
      description: "Set your own availability — take students only when you want."
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Vetted Students",
      description: "Students are vetted before being matched."
    },
    {
      icon: <Award className="w-8 h-8 text-accent" />,
      title: "No Admin Burden",
      description: "No admin burden — we handle contracts, scheduling, and tracking."
    },
    {
      icon: <Star className="w-8 h-8 text-accent" />,
      title: "Recognition Badges",
      description: "Recognition through MentorFit™ badges (Bronze, Silver, Gold)."
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

  const testimonialsFromDb = (preceptorTestimonialsData ?? []).map((testimonial) => ({
    name: testimonial.name,
    role: testimonial.title,
    rating: testimonial.rating,
    text: testimonial.content
  }))

  const testimonials = testimonialsFromDb.length > 0 ? testimonialsFromDb : [
    {
      name: "Dr. Patricia Williams",
      role: "Family Nurse Practitioner",
      rating: 5,
      text: "MentoLoop makes precepting so easy! They handle everything so I can focus on teaching. The students are well-prepared and eager to learn."
    }
  ]

  const requirements = [
    "Active, unrestricted NP license",
    "Minimum 2 years of clinical practice experience",
    "Commitment to quality education and mentorship",
    "Professional liability insurance (we can help arrange)",
    "Willingness to complete student evaluations"
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
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-3xl"
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
              className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-accent/20 to-primary/15 rounded-full blur-3xl"
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
                    href="/sign-up/preceptor"
                    className="group hover:bg-foreground/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 border border-foreground/20 backdrop-blur-md">
                    <div className="relative flex items-center justify-center">
                      <Heart className="w-4 h-4 text-destructive animate-pulse" />
                    </div>
                    <span className="font-medium text-foreground">Shape the Future of Healthcare</span>
                    <ArrowRight className="w-4 h-4 text-foreground/70 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <div className="mt-8">
                  <AnimatedText
                    text="Mentor the Next"
                    className="mx-auto max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-shadow-strong"
                    type="word"
                    delay={0.3}
                  />
                  <h1 className="mx-auto mt-2 max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-strong">
                    <GradientText gradient="from-foreground via-accent/70 to-accent/40">
                      Generation of NPs
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
                    On Your Terms. Your Schedule. Your Way.
                  </GlowingText>
                </motion.p>
                <p className="text-foreground/80 mx-auto my-4 max-w-2xl text-balance text-lg">
                  MentoLoop makes precepting easy, rewarding, and flexible. Earn honorariums, 
                  gain recognition, and help shape the future of healthcare — without the paperwork hassle.
                </p>
                <p className="text-foreground/80 mx-auto my-6 mb-8 max-w-2xl text-balance text-lg">
                  Join our network of 1,000+ healthcare professionals making a difference every day.
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
                    className="group relative bg-card text-accent hover:bg-card/90 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden px-8 py-6 text-lg">
                    <Link href="/sign-up/preceptor">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Stethoscope className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-accent" />
                      <span className="relative text-nowrap font-semibold">Become a Preceptor</span>
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowVideo(true)}
                    className="group border border-foreground/30 text-foreground bg-foreground/10 hover:bg-foreground/20 hover:text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-foreground/50 px-8 py-6 text-lg">
                    <span className="text-nowrap font-semibold">Learn More</span>
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
                    <span>Quick approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Competitive pay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Full support</span>
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
            Why Preceptors Join Mentoloop
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Join our network of 1,000+ healthcare professionals making a difference
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

      {/* Recognition & Community Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Recognition & Community
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Get recognized for your contributions and connect with peers
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">MentorFit™ Badges</h3>
                <p className="text-sm text-muted-foreground">Service milestone recognition</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">LoopExchange™</h3>
                <p className="text-sm text-muted-foreground">Peer community & discussion forum</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">CEU Workshops</h3>
                <p className="text-sm text-muted-foreground">Exclusive events for preceptors</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">Referral Rewards</h3>
                <p className="text-sm text-muted-foreground">For helping grow the network</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {process.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-accent-foreground">{item.step}</span>
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
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
              >
              <Link href="/sign-up/preceptor">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Requirements
          </h2>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                To ensure quality education for our students, we require:
              </p>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-accent">
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
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            What Preceptors Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {preceptorTestimonialsData === undefined ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((__, i) => (
                        <Skeleton key={i} className="h-5 w-5 rounded-sm" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-chart-5 text-chart-5" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&quot;{testimonial.text}&quot;</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-primary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">1,000+</p>
              <p className="text-foreground/70">Active Preceptors</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">$800</p>
              <p className="text-foreground/70">Average Monthly Earnings</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">98%</p>
              <p className="text-foreground/70">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground mb-2">24-48hr</p>
              <p className="text-foreground/70">Approval Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing network of preceptors and start earning while mentoring 
            the next generation of nurse practitioners
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
            >
              <Link href="/sign-up/preceptor">
                Sign Up as a Preceptor
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
                Have Questions?
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Quick approval • Flexible commitment • Cancel anytime
          </p>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowVideo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-card rounded-lg overflow-hidden"
          >
            <div className="aspect-video bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Video placeholder - Becoming a MentoLoop Preceptor</p>
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
