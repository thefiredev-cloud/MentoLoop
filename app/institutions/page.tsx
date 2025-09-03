'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, Shield, Zap, BarChart3, Award, 
  Building2, ChevronRight, Headphones, FileText, 
  GraduationCap, Sparkles, Target, BookOpen,
  TrendingUp, Network, Layers
} from 'lucide-react'
import Link from 'next/link'
import MentoLoopBackground from '@/components/mentoloop-background'
import { AnimatedText, GradientText } from '@/components/ui/animated-text'
import { motion, AnimatePresence } from 'framer-motion'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'

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
    console.log('Institution inquiry:', formData)
    setShowForm(false)
  }

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-teal-600" />,
      title: "Cohort Management",
      description: "Streamlined enrollment and tracking for entire student cohorts",
      gradient: "from-teal-500/20 via-cyan-400/10 to-transparent"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Quality Assurance",
      description: "Thoroughly vetted preceptor network with continuous monitoring",
      gradient: "from-blue-500/20 via-blue-400/10 to-transparent"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: "Rapid Placement",
      description: "Accelerated matching process with dedicated support team",
      gradient: "from-purple-500/20 via-pink-400/10 to-transparent"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: "Analytics Platform",
      description: "Real-time insights into student progress and outcomes",
      gradient: "from-emerald-500/20 via-green-400/10 to-transparent"
    },
    {
      icon: <Network className="w-6 h-6 text-indigo-600" />,
      title: "Integrated Ecosystem",
      description: "Seamless connection between education and clinical practice",
      gradient: "from-indigo-500/20 via-indigo-400/10 to-transparent"
    },
    {
      icon: <Award className="w-6 h-6 text-amber-600" />,
      title: "Excellence Standards",
      description: "Commitment to superior clinical education experiences",
      gradient: "from-amber-500/20 via-yellow-400/10 to-transparent"
    }
  ]

  const stats = [
    { value: "500+", label: "Partner Programs", color: "from-blue-600 to-cyan-600" },
    { value: "15K+", label: "Successful Placements", color: "from-purple-600 to-pink-600" },
    { value: "48hr", label: "Average Response", color: "from-emerald-600 to-teal-600" },
    { value: "50+", label: "Specialties Covered", color: "from-amber-600 to-orange-600" }
  ]

  const processSteps = [
    {
      title: "Discovery",
      description: "Understanding your program&apos;s unique needs",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Integration",
      description: "Seamless platform customization",
      icon: <Layers className="w-5 h-5" />
    },
    {
      title: "Onboarding",
      description: "Guided cohort enrollment process",
      icon: <Users className="w-5 h-5" />
    },
    {
      title: "Partnership",
      description: "Ongoing collaboration and support",
      icon: <Network className="w-5 h-5" />
    }
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section with Background */}
      <section className="relative">
        <MentoLoopBackground className="min-h-fit" showIcons={false}>
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-40 left-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 30, 0],
                x: [0, -20, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"
            />
          </div>

          <div className="py-24 md:py-36">
            <div className="relative z-10 mx-auto max-w-6xl px-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex justify-center mb-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl blur-2xl" />
                    <Building2 className="w-20 h-20 text-white relative z-10" />
                  </div>
                </motion.div>

                <AnimatedText
                  text="Institutional"
                  className="text-center text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3"
                  type="character"
                  delay={0.3}
                />
                <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
                  <GradientText gradient="from-white via-blue-200 to-white">
                    Partnership
                  </GradientText>
                </h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-white/90 mx-auto max-w-3xl text-center text-xl md:text-2xl mb-6 font-light leading-relaxed"
                >
                  Transform your clinical education program with intelligent placement solutions and comprehensive support infrastructure
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
                >
                  <Button
                    size="lg"
                    onClick={() => setShowForm(true)}
                    className="group relative bg-white text-blue-700 hover:bg-white/90 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden px-8 py-6 text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    <span className="relative font-semibold">Schedule Consultation</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="group border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 px-8 py-6 text-lg"
                  >
                    <Link href="/contact">
                      <span className="font-semibold">Learn More</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </MentoLoopBackground>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 relative bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${stat.color.replace('from-', '').replace('to-', '')})`
                  }}
                />
                <div className="relative text-center p-6 rounded-2xl glass-subtle backdrop-blur-sm">
                  <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText gradient="from-foreground via-foreground/80 to-foreground">
                Partnership Benefits
              </GradientText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions designed for modern healthcare education
            </p>
          </motion.div>
          
          <BentoGrid className="md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <BentoGridItem
                  title={benefit.title}
                  description={benefit.description}
                  header={
                    <div className={`p-8 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center`}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-lg blur-xl" />
                        {benefit.icon}
                      </div>
                    </div>
                  }
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                />
              </motion.div>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Partnership Journey</h2>
            <p className="text-lg text-muted-foreground">
              A collaborative approach to clinical education excellence
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="relative"
                >
                  <div className="glass-subtle rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Enterprise-Grade Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Purpose-built infrastructure designed to scale with your program&apos;s growth 
                while maintaining the highest standards of educational excellence and operational efficiency.
              </p>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start gap-4 group"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Dedicated Success Team</h3>
                    <p className="text-muted-foreground">
                      Expert coordinators committed to your program&apos;s success
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4 group"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Compliance Architecture</h3>
                    <p className="text-muted-foreground">
                      Built to exceed accreditation requirements
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4 group"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Outcome Analytics</h3>
                    <p className="text-muted-foreground">
                      Data-driven insights for continuous improvement
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-2xl" />
              <div className="relative glass-subtle rounded-3xl p-10 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-medium">Custom Learning Pathways</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">Enterprise Security Standards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">Unlimited Student Seats</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Advanced Reporting Suite</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-primary" />
                    <span className="font-medium">API Integration Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span className="font-medium">White-Label Options</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="glass-strong rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Partnership Consultation</h3>
                  <p className="text-muted-foreground">
                    Let&apos;s discuss how MentoLoop can transform your clinical education program
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="institutionName" className="text-sm font-medium mb-2 block">
                        Institution Name
                      </Label>
                      <Input
                        id="institutionName"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="numberOfStudents" className="text-sm font-medium mb-2 block">
                        Program Size
                      </Label>
                      <Input
                        id="numberOfStudents"
                        value={formData.numberOfStudents}
                        onChange={(e) => setFormData({...formData, numberOfStudents: e.target.value})}
                        placeholder="Number of students"
                        className="bg-white/5 border-white/10 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactName" className="text-sm font-medium mb-2 block">
                        Your Name
                      </Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Your role"
                        className="bg-white/5 border-white/10 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                      Program Needs
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us about your clinical placement challenges and goals..."
                      className="min-h-[120px] bg-white/5 border-white/10 focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300"
                    >
                      Request Consultation
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => setShowForm(false)}
                      className="border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-t from-primary/5 to-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <GradientText gradient="from-foreground via-primary to-foreground">
              Ready to Transform Clinical Education?
            </GradientText>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join leading healthcare education programs in creating superior clinical experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="group relative overflow-hidden px-8 py-6 text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative font-semibold">Start Partnership Discussion</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="px-8 py-6 text-lg hover:bg-muted/50"
            >
              <Link href="/contact">
                <span className="font-semibold">Explore Options</span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}