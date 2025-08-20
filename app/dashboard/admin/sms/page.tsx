'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
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
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  RefreshCw,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'

export default function SMSAnalyticsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [testPhone, setTestPhone] = useState('')
  const [testTemplate, setTestTemplate] = useState<string>('')
  
  // Date range - last 30 days by default
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  
  // Queries
  const analytics = useQuery(api.sms.getSMSAnalytics, {
    dateRange: {
      start: thirtyDaysAgo,
      end: Date.now()
    },
    templateKey: selectedTemplate === 'all' ? undefined : selectedTemplate
  })
  
  const recentLogs = useQuery(api.sms.getSMSLogs, {
    limit: 20,
    templateKey: selectedTemplate === 'all' ? undefined : selectedTemplate
  })
  
  // Mutations
  const sendTestSMS = useMutation(api.sms.sendSMS)
  
  const smsTemplates = [
    { key: 'MATCH_CONFIRMATION', label: 'Match Confirmation' },
    { key: 'PAYMENT_REMINDER', label: 'Payment Reminder' },
    { key: 'ROTATION_START_REMINDER', label: 'Rotation Start Reminder' },
    { key: 'SURVEY_REQUEST', label: 'Survey Request' },
    { key: 'WELCOME_CONFIRMATION', label: 'Welcome Confirmation' }
  ]
  
  const handleSendTestSMS = async () => {
    if (!testPhone || !testTemplate) {
      toast.error('Please select template and enter phone number')
      return
    }
    
    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = testPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    
    try {
      await sendTestSMS({
        to: testPhone,
        templateKey: testTemplate as any,
        variables: {
          firstName: 'Test User',
          studentName: 'John Doe',
          preceptorName: 'Dr. Jane Smith',
          partnerName: 'Dr. Jane Smith',
          specialty: 'Family Medicine',
          startDate: '2024-01-15',
          surveyLink: 'https://mentoloop.com/survey/test'
        }
      })
      toast.success('Test SMS sent successfully!')
      setTestPhone('')
    } catch (error) {
      console.error('Failed to send test SMS:', error)
      toast.error('Failed to send test SMS')
    }
  }
  
  const successRate = analytics ? 
    analytics.totalSMS > 0 ? 
      Math.round((analytics.successful / analytics.totalSMS) * 100) : 0
    : 0
    
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +1234567890 -> +1 (234) 567-8890)
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">SMS Analytics & Testing</h1>
              <p className="text-muted-foreground">
                Monitor SMS performance and test message templates
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
                  {smsTemplates.map(template => (
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
              <CardTitle className="text-sm font-medium">Total SMS</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalSMS || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.successful || 0} delivered, {analytics?.failed || 0} failed
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
                  {smsTemplates.map(template => {
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
          
          {/* Test SMS */}
          <div className="lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test SMS
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
                      {smsTemplates.map(template => (
                        <SelectItem key={template.key} value={template.key}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="test-phone">Phone Number</Label>
                  <Input
                    id="test-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                
                <Button 
                  onClick={handleSendTestSMS} 
                  className="w-full"
                  disabled={!testPhone || !testTemplate}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test SMS
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Test messages use sample data for template variables
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent SMS Logs */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent SMS Activity
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
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
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(log.recipientPhone)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Template: {log.templateKey} • Recipient: {log.recipientType}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {log.message}
                        </p>
                        {log.status === 'failed' && log.failureReason && (
                          <p className="text-xs text-red-500">{log.failureReason}</p>
                        )}
                        {log.twilioSid && (
                          <p className="text-xs text-muted-foreground">
                            Twilio SID: {log.twilioSid}
                          </p>
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
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No SMS logs found</p>
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