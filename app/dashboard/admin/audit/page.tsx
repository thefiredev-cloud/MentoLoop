'use client'

import { useState } from 'react'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  Activity,
  User,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  FileText,
  Database,
  Settings
} from 'lucide-react'

export default function AuditLogs() {
  return (
    <RoleGuard requiredRole="admin">
      <AuditLogsContent />
    </RoleGuard>
  )
}

function AuditLogsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock audit log data - in production this would come from database
  const auditLogs = [
    {
      id: '1',
      timestamp: Date.now() - 1000 * 60 * 5,
      user: 'admin@mentoloop.com',
      action: 'USER_LOGIN',
      resource: 'Authentication',
      status: 'success',
      ip: '192.168.1.1',
      details: 'Admin login successful'
    },
    {
      id: '2', 
      timestamp: Date.now() - 1000 * 60 * 15,
      user: 'support@mentoloop.com',
      action: 'USER_UPDATE',
      resource: 'User Profile',
      status: 'success',
      ip: '192.168.1.2',
      details: 'Updated user role to preceptor'
    },
    {
      id: '3',
      timestamp: Date.now() - 1000 * 60 * 30,
      user: 'admin@mentoloop.com',
      action: 'MATCH_CREATE',
      resource: 'Matches',
      status: 'success',
      ip: '192.168.1.1',
      details: 'Created new match between student and preceptor'
    },
    {
      id: '4',
      timestamp: Date.now() - 1000 * 60 * 45,
      user: 'system',
      action: 'PAYMENT_PROCESS',
      resource: 'Payments',
      status: 'failed',
      ip: 'N/A',
      details: 'Payment processing failed - insufficient funds'
    },
    {
      id: '5',
      timestamp: Date.now() - 1000 * 60 * 60,
      user: 'admin@mentoloop.com',
      action: 'SETTINGS_UPDATE',
      resource: 'System Settings',
      status: 'success',
      ip: '192.168.1.1',
      details: 'Updated email notification settings'
    }
  ]

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        return <Key className="h-4 w-4" />
      case 'USER_UPDATE':
      case 'USER_CREATE':
        return <User className="h-4 w-4" />
      case 'SETTINGS_UPDATE':
        return <Settings className="h-4 w-4" />
      case 'PAYMENT_PROCESS':
        return <Database className="h-4 w-4" />
      case 'MATCH_CREATE':
      case 'MATCH_UPDATE':
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      'USER_LOGIN': 'User Login',
      'USER_LOGOUT': 'User Logout',
      'USER_CREATE': 'User Created',
      'USER_UPDATE': 'User Updated',
      'USER_DELETE': 'User Deleted',
      'MATCH_CREATE': 'Match Created',
      'MATCH_UPDATE': 'Match Updated',
      'MATCH_DELETE': 'Match Deleted',
      'PAYMENT_PROCESS': 'Payment Processed',
      'PAYMENT_REFUND': 'Payment Refunded',
      'SETTINGS_UPDATE': 'Settings Updated',
      'EMAIL_SENT': 'Email Sent',
      'SMS_SENT': 'SMS Sent'
    }
    return actionMap[action] || action
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track system activity, security events, and user actions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              3 require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-destructive">
              Review required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              In last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">User Actions</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Log</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search logs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{getActionName(log.action)}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          User: {log.user} • IP: {log.ip}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.details}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">Multiple Failed Login Attempts</div>
                      <div className="text-xs text-muted-foreground">
                        5 failed attempts from IP: 203.0.113.42
                      </div>
                      <div className="text-xs text-muted-foreground">
                        10 minutes ago
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Investigate</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="h-4 w-4 mt-1" />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">Password Changed</div>
                      <div className="text-xs text-muted-foreground">
                        User: student@example.com
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.filter(log => log.action.startsWith('USER_')).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-1" />
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{getActionName(log.action)}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.user} • {log.details}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                System event logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.filter(log => log.status === 'failed').map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-destructive mt-1" />
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{getActionName(log.action)}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.details}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Debug</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}