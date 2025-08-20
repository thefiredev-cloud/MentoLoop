'use client'

import { useState } from 'react'
import { useQuery, useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function EmailAnalyticsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [testEmail, setTestEmail] = useState('')
  const [testTemplate, setTestTemplate] = useState<string>('')
  
  // Date range - last 30 days by default
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  
  // Queries
  const analytics = useQuery(api.emails.getEmailAnalytics, {
    dateRange: {
      start: thirtyDaysAgo,
      end: Date.now()
    },
    templateKey: selectedTemplate === 'all' ? undefined : selectedTemplate
  })
  
  const recentLogs = useQuery(api.emails.getEmailLogs, {
    limit: 20,
    templateKey: selectedTemplate === 'all' ? undefined : selectedTemplate
  })
  
  // Actions
  const sendTestEmail = useAction(api.emails.sendEmail)
  
  const emailTemplates = [
    { key: 'WELCOME_STUDENT', label: 'Welcome Student' },
    { key: 'WELCOME_PRECEPTOR', label: 'Welcome Preceptor' },
    { key: 'MATCH_CONFIRMED_STUDENT', label: 'Match Confirmed (Student)' },
    { key: 'MATCH_CONFIRMED_PRECEPTOR', label: 'Match Confirmed (Preceptor)' },
    { key: 'PAYMENT_RECEIVED', label: 'Payment Received' },
    { key: 'ROTATION_COMPLETE_STUDENT', label: 'Rotation Complete (Student)' },
    { key: 'ROTATION_COMPLETE_PRECEPTOR', label: 'Rotation Complete (Preceptor)' }
  ]
  
  const handleSendTestEmail = async () => {
    if (!testEmail || !testTemplate) {
      toast.error('Please select template and enter email address')
      return
    }
    
    try {
      await sendTestEmail({
        to: testEmail,
        templateKey: testTemplate as any,
        variables: {
          firstName: 'Test User',
          preceptorName: 'Dr. Jane Smith',
          studentName: 'John Doe',
          specialty: 'Family Medicine',
          location: 'Sample Clinic',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          paymentLink: 'https://mentoloop.com/payment',
          term: 'Spring 2024',
          surveyLink: 'https://mentoloop.com/survey'
        }
      })
      toast.success('Test email sent successfully!')
      setTestEmail('')
    } catch (error) {
      console.error('Failed to send test email:', error)
      toast.error('Failed to send test email')
    }
  }
  
  const successRate = analytics ? 
    analytics.totalEmails > 0 ? 
      Math.round((analytics.successful / analytics.totalEmails) * 100) : 0
    : 0
    
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Email Analytics & Testing</h1>
              <p className="text-muted-foreground">
                Monitor email performance and test templates
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="template-filter">Filter by template:</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalEmails || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.successful || 0} successful, {analytics?.failed || 0} failed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.byRecipientType.student.sent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.byRecipientType.student.failed || 0} failed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preceptors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.byRecipientType.preceptor.sent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.byRecipientType.preceptor.failed || 0} failed
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Template Performance */}
          <div className="lg:col-span-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Template Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map(template => {
                    const stats = analytics?.byTemplate[template.key]
                    const total = (stats?.sent || 0) + (stats?.failed || 0)
                    const rate = total > 0 ? Math.round(((stats?.sent || 0) / total) * 100) : 0
                    
                    return (
                      <div key={template.key} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <h4 className="font-medium">{template.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stats?.sent || 0} sent • {stats?.failed || 0} failed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{rate}%</div>
                          <Badge variant={rate >= 95 ? "default" : rate >= 80 ? "secondary" : "destructive"}>
                            {total} total
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Test Email */}
          <div className="lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-template">Template</Label>
                  <Select value={testTemplate} onValueChange={setTestTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.key} value={template.key}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleSendTestEmail} 
                  className="w-full"
                  disabled={!testEmail || !testTemplate}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Test emails use sample data for template variables
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Email Logs */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Email Activity
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea key="email-logs-scroll" className="h-96">
              <div className="space-y-3">
                {recentLogs?.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {log.status === 'sent' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          To: {log.recipientEmail} • Template: {log.templateKey}
                        </p>
                        {log.status === 'failed' && log.failureReason && (
                          <p className="text-xs text-red-500">{log.failureReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(log.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!recentLogs || recentLogs.length === 0) && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No email logs found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}