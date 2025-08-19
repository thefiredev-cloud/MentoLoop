'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Settings,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  Clock,
  Database,
  UserCheck
} from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')

  // Mock audit log data - replace with actual Convex queries
  const mockAuditLogs = [
    {
      id: 'log_1',
      timestamp: '2025-01-19T14:30:00Z',
      action: 'USER_ROLE_CHANGED',
      entityType: 'user',
      entityId: 'user_123',
      performedBy: {
        name: 'John Admin',
        email: 'john@mentoloop.com',
        id: 'admin_1'
      },
      details: {
        previousValue: 'student',
        newValue: 'preceptor',
        reason: 'Graduated and became licensed NP',
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        }
      },
      severity: 'medium'
    },
    {
      id: 'log_2',
      timestamp: '2025-01-19T13:45:00Z',
      action: 'MATCH_OVERRIDE',
      entityType: 'match',
      entityId: 'match_456',
      performedBy: {
        name: 'Sarah Admin',
        email: 'sarah@mentoloop.com',
        id: 'admin_2'
      },
      details: {
        previousValue: { status: 'pending', score: 7.2 },
        newValue: { status: 'confirmed', score: 8.5 },
        reason: 'Manual adjustment based on specialized requirements',
        metadata: {
          studentId: 'student_789',
          preceptorId: 'preceptor_321'
        }
      },
      severity: 'high'
    },
    {
      id: 'log_3',
      timestamp: '2025-01-19T12:15:00Z',
      action: 'PAYMENT_REFUNDED',
      entityType: 'payment',
      entityId: 'payment_789',
      performedBy: {
        name: 'Mike Admin',
        email: 'mike@mentoloop.com',
        id: 'admin_3'
      },
      details: {
        previousValue: { status: 'paid', amount: 79900 },
        newValue: { status: 'refunded', amount: 79900 },
        reason: 'Student cancelled rotation due to personal circumstances',
        metadata: {
          refundAmount: 79900,
          refundMethod: 'original_payment_method'
        }
      },
      severity: 'high'
    },
    {
      id: 'log_4',
      timestamp: '2025-01-19T11:20:00Z',
      action: 'PRECEPTOR_VERIFIED',
      entityType: 'preceptor',
      entityId: 'preceptor_654',
      performedBy: {
        name: 'Lisa Admin',
        email: 'lisa@mentoloop.com',
        id: 'admin_4'
      },
      details: {
        previousValue: { verificationStatus: 'under-review' },
        newValue: { verificationStatus: 'verified' },
        reason: 'Credentials verified, references checked',
        metadata: {
          documentsReviewed: ['license', 'cv', 'references'],
          verificationMethod: 'manual_review'
        }
      },
      severity: 'medium'
    },
    {
      id: 'log_5',
      timestamp: '2025-01-19T10:30:00Z',
      action: 'ENTERPRISE_CREATED',
      entityType: 'enterprise',
      entityId: 'enterprise_111',
      performedBy: {
        name: 'John Admin',
        email: 'john@mentoloop.com',
        id: 'admin_1'
      },
      details: {
        previousValue: null,
        newValue: {
          name: 'Texas State University',
          type: 'school',
          status: 'active'
        },
        reason: 'New educational partner onboarding',
        metadata: {
          contractSigned: true,
          setupComplete: false
        }
      },
      severity: 'low'
    }
  ]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_ROLE_CHANGED':
        return <UserCheck className="h-4 w-4" />
      case 'MATCH_OVERRIDE':
        return <Edit className="h-4 w-4" />
      case 'PAYMENT_REFUNDED':
        return <Trash2 className="h-4 w-4" />
      case 'PRECEPTOR_VERIFIED':
        return <CheckCircle className="h-4 w-4" />
      case 'ENTERPRISE_CREATED':
        return <Plus className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction
    const matchesUser = selectedUser === 'all' || log.performedBy.id === selectedUser
    
    return matchesSearch && matchesAction && matchesUser
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all administrative actions and system changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Actions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">Good</div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search actions, users, or entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action-filter">Action Type</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="USER_ROLE_CHANGED">Role Changes</SelectItem>
                  <SelectItem value="MATCH_OVERRIDE">Match Overrides</SelectItem>
                  <SelectItem value="PAYMENT_REFUNDED">Payment Actions</SelectItem>
                  <SelectItem value="PRECEPTOR_VERIFIED">Verifications</SelectItem>
                  <SelectItem value="ENTERPRISE_CREATED">Enterprise Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-filter">Performed By</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin_1">John Admin</SelectItem>
                  <SelectItem value="admin_2">Sarah Admin</SelectItem>
                  <SelectItem value="admin_3">Mike Admin</SelectItem>
                  <SelectItem value="admin_4">Lisa Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-filter">Time Period</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {mockAuditLogs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatAction(log.action)}</span>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Performed By</div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3" />
                      <span>{log.performedBy.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">
                      {log.performedBy.email}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-muted-foreground">Target</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Database className="h-3 w-3" />
                      <span className="capitalize">{log.entityType}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.entityId}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-muted-foreground">Reason</div>
                    <div className="mt-1 text-xs">
                      {log.details.reason}
                    </div>
                  </div>
                </div>

                {/* Changes */}
                {(log.details.previousValue !== null || log.details.newValue) && (
                  <div className="space-y-2">
                    <div className="font-medium text-muted-foreground text-sm">Changes</div>
                    <div className="bg-gray-50 rounded p-3 text-xs">
                      {log.details.previousValue && (
                        <div className="mb-2">
                          <span className="font-medium text-red-600">Before: </span>
                          <code className="text-red-700">
                            {typeof log.details.previousValue === 'object' 
                              ? JSON.stringify(log.details.previousValue) 
                              : log.details.previousValue}
                          </code>
                        </div>
                      )}
                      {log.details.newValue && (
                        <div>
                          <span className="font-medium text-green-600">After: </span>
                          <code className="text-green-700">
                            {typeof log.details.newValue === 'object' 
                              ? JSON.stringify(log.details.newValue) 
                              : log.details.newValue}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {log.details.metadata && (
                  <div className="pt-2 border-t">
                    <div className="font-medium text-muted-foreground text-xs mb-2">Metadata</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(log.details.metadata).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
              <p className="text-muted-foreground">
                No audit entries match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}