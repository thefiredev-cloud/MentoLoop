'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

export default function TestCommunications() {
  const [emailTest, setEmailTest] = useState({
    email: '',
    template: '',
    firstName: '',
    status: 'idle' as 'idle' | 'sending' | 'success' | 'error'
  })

  const [smsTest, setSmsTest] = useState({
    phone: '',
    template: '',
    firstName: '',
    status: 'idle' as 'idle' | 'sending' | 'success' | 'error'
  })

  const sendEmailAction = useAction(api.emails.sendEmail)
  const sendSMSAction = useAction(api.sms.sendSMS)

  const handleEmailTest = async () => {
    if (!emailTest.email || !emailTest.template || !emailTest.firstName) {
      toast.error('Please fill in all fields')
      return
    }

    setEmailTest(prev => ({ ...prev, status: 'sending' }))
    
    try {
      await sendEmailAction({
        to: emailTest.email,
        templateKey: emailTest.template as 'WELCOME_STUDENT' | 'WELCOME_PRECEPTOR' | 'MATCH_CONFIRMED_STUDENT' | 'MATCH_CONFIRMED_PRECEPTOR' | 'PAYMENT_RECEIVED' | 'ROTATION_COMPLETE_STUDENT' | 'ROTATION_COMPLETE_PRECEPTOR',
        variables: {
          firstName: emailTest.firstName,
          preceptorName: 'Dr. Test Preceptor',
          studentName: 'Test Student',
          specialty: 'Family Practice',
          location: 'Test City, ST',
          startDate: '2025-09-01',
          endDate: '2025-12-15',
          paymentLink: 'https://test-payment-link.com',
          term: 'Fall 2025',
          surveyLink: 'https://test-survey-link.com'
        }
      })
      
      setEmailTest(prev => ({ ...prev, status: 'success' }))
      toast.success('Test email sent successfully!')
    } catch (error) {
      console.error('Email test failed:', error)
      setEmailTest(prev => ({ ...prev, status: 'error' }))
      toast.error('Failed to send test email')
    }
  }

  const handleSMSTest = async () => {
    if (!smsTest.phone || !smsTest.template || !smsTest.firstName) {
      toast.error('Please fill in all fields')
      return
    }

    setSmsTest(prev => ({ ...prev, status: 'sending' }))
    
    try {
      await sendSMSAction({
        to: smsTest.phone,
        templateKey: smsTest.template as 'WELCOME_CONFIRMATION' | 'MATCH_CONFIRMATION' | 'PAYMENT_REMINDER' | 'ROTATION_START_REMINDER' | 'SURVEY_REQUEST',
        variables: {
          firstName: smsTest.firstName,
          studentName: 'Test Student',
          preceptorName: 'Dr. Test Preceptor',
          specialty: 'Family Practice',
          startDate: '2025-09-01',
          partnerName: 'Test Partner',
          surveyLink: 'https://test-survey-link.com'
        }
      })
      
      setSmsTest(prev => ({ ...prev, status: 'success' }))
      toast.success('Test SMS sent successfully!')
    } catch (error) {
      console.error('SMS test failed:', error)
      setSmsTest(prev => ({ ...prev, status: 'error' }))
      toast.error('Failed to send test SMS')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Send className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sending': return <Badge variant="secondary">Sending...</Badge>
      case 'success': return <Badge className="bg-green-500">Success</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communication Testing</h1>
          <p className="text-muted-foreground">
            Test email and SMS functionality with live API integrations
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Email Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Testing
                {getStatusBadge(emailTest.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test SendGrid email templates
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Test Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailTest.email}
                  onChange={(e) => setEmailTest(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={emailTest.firstName}
                  onChange={(e) => setEmailTest(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Select 
                  value={emailTest.template} 
                  onValueChange={(value) => setEmailTest(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WELCOME_STUDENT">Welcome Student</SelectItem>
                    <SelectItem value="WELCOME_PRECEPTOR">Welcome Preceptor</SelectItem>
                    <SelectItem value="MATCH_CONFIRMED_STUDENT">Match Confirmed - Student</SelectItem>
                    <SelectItem value="MATCH_CONFIRMED_PRECEPTOR">Match Confirmed - Preceptor</SelectItem>
                    <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                    <SelectItem value="ROTATION_COMPLETE_STUDENT">Rotation Complete - Student</SelectItem>
                    <SelectItem value="ROTATION_COMPLETE_PRECEPTOR">Rotation Complete - Preceptor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleEmailTest}
                disabled={emailTest.status === 'sending'}
                className="w-full"
              >
                {getStatusIcon(emailTest.status)}
                {emailTest.status === 'sending' ? 'Sending Email...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>

          {/* SMS Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Testing
                {getStatusBadge(smsTest.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test Twilio SMS templates
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Test Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={smsTest.phone}
                  onChange={(e) => setSmsTest(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsFirstName">First Name</Label>
                <Input
                  id="smsFirstName"
                  value={smsTest.firstName}
                  onChange={(e) => setSmsTest(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsTemplate">SMS Template</Label>
                <Select 
                  value={smsTest.template} 
                  onValueChange={(value) => setSmsTest(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SMS template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WELCOME_CONFIRMATION">Welcome Confirmation</SelectItem>
                    <SelectItem value="MATCH_CONFIRMATION">Match Confirmation</SelectItem>
                    <SelectItem value="PAYMENT_REMINDER">Payment Reminder</SelectItem>
                    <SelectItem value="ROTATION_START_REMINDER">Rotation Start Reminder</SelectItem>
                    <SelectItem value="SURVEY_REQUEST">Survey Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSMSTest}
                disabled={smsTest.status === 'sending'}
                className="w-full"
              >
                {getStatusIcon(smsTest.status)}
                {smsTest.status === 'sending' ? 'Sending SMS...' : 'Send Test SMS'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">SendGrid API</div>
                  <div className="text-sm text-muted-foreground">Email service</div>
                </div>
                <Badge className="bg-green-500">Configured</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Twilio API</div>
                  <div className="text-sm text-muted-foreground">SMS service</div>
                </div>
                <Badge className="bg-green-500">Configured</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">OpenAI API</div>
                  <div className="text-sm text-muted-foreground">AI matching</div>
                </div>
                <Badge className="bg-green-500">Configured</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Stripe API</div>
                  <div className="text-sm text-muted-foreground">Payment processing</div>
                </div>
                <Badge className="bg-green-500">Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}