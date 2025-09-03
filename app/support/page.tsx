'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  Headphones,
  Send,
  ExternalLink,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

const supportChannels = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@mentoloop.com',
    responseTime: '24 hours',
    availability: 'Mon-Fri 9am-5pm EST',
    action: 'Send Email',
    href: 'mailto:support@mentoloop.com'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    contact: 'Available on dashboard',
    responseTime: '< 5 minutes',
    availability: 'Mon-Fri 9am-8pm EST',
    action: 'Start Chat',
    href: '#',
    badge: 'Online'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with a support specialist',
    contact: '1-800-MENTOR-1',
    responseTime: 'Immediate',
    availability: 'Mon-Fri 10am-6pm EST',
    action: 'Call Now',
    href: 'tel:1-800-636-8671'
  }
]

const commonIssues = [
  {
    category: 'Account & Access',
    issues: [
      'Cannot log into my account',
      'Forgot my password',
      'Need to update email address',
      'Account verification issues'
    ]
  },
  {
    category: 'Payments & Billing',
    issues: [
      'Payment not processing',
      'Need a receipt or invoice',
      'Refund request',
      'Update payment method'
    ]
  },
  {
    category: 'Matching & Preceptors',
    issues: [
      'No matches found',
      'Preceptor not responding',
      'Need to change preceptor',
      'Match dispute'
    ]
  },
  {
    category: 'Technical Issues',
    issues: [
      'Page not loading',
      'Error messages',
      'Cannot upload documents',
      'Dashboard not updating'
    ]
  }
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const user = useQuery(api.users.current)

  // Pre-fill form if user is logged in
  if (user && !formData.email) {
    setFormData(prev => ({
      ...prev,
      name: '',
      email: user.email || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Support Center</h1>
        <p className="text-muted-foreground">
          We&apos;re here to help you succeed in your clinical journey
        </p>
      </div>

      {/* Support Channels */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {supportChannels.map((channel) => {
          const Icon = channel.icon
          return (
            <Card key={channel.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {channel.badge && (
                    <Badge className="bg-green-500">
                      {channel.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{channel.title}</CardTitle>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Contact: </span>
                    <span className="font-medium">{channel.contact}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Response: </span>
                    <span className="font-medium">{channel.responseTime}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hours: </span>
                    <span className="font-medium">{channel.availability}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant={channel.badge ? 'default' : 'outline'}
                  asChild={channel.href !== '#'}
                  disabled={channel.href === '#' && !channel.badge}
                >
                  {channel.href !== '#' ? (
                    <a href={channel.href}>
                      {channel.action}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  ) : (
                    <>
                      {channel.action}
                      {!channel.badge && ' (Offline)'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Message Sent Successfully!</h3>
                <p className="text-muted-foreground mb-4">
                  We&apos;ve received your message and will respond within 24 hours.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: '',
                      email: '',
                      subject: '',
                      category: '',
                      message: ''
                    })
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="account">Account & Access</option>
                    <option value="payment">Payments & Billing</option>
                    <option value="matching">Matching & Preceptors</option>
                    <option value="technical">Technical Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Common Issues */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>
                Quick solutions to frequently reported problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonIssues.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                      {category.category}
                    </h4>
                    <div className="space-y-1">
                      {category.issues.map((issue) => (
                        <Button
                          key={issue}
                          variant="ghost"
                          className="w-full justify-start text-sm font-normal"
                          asChild
                        >
                          <Link href={`/help?q=${encodeURIComponent(issue)}`}>
                            <AlertCircle className="h-3 w-3 mr-2 text-muted-foreground" />
                            {issue}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/help">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Help Center & FAQs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/resources">
                    <Users className="h-4 w-4 mr-2" />
                    Resource Library
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/help#video-tour">
                    <Headphones className="h-4 w-4 mr-2" />
                    Video Tutorials
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}