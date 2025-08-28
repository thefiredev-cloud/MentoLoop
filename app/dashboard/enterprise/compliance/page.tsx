'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info,
  ClipboardCheck,
  FileCheck,
  Lock
} from 'lucide-react'

export default function EnterpriseCompliancePage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseComplianceContent />
    </RoleGuard>
  )
}

function EnterpriseComplianceContent() {
  const complianceScore = 95
  
  const complianceAreas = [
    {
      name: 'HIPAA Compliance',
      status: 'compliant',
      score: 100,
      lastAudit: '2024-01-15',
      nextAudit: '2024-04-15',
      items: [
        { name: 'Privacy Rule', status: 'pass' },
        { name: 'Security Rule', status: 'pass' },
        { name: 'Breach Notification', status: 'pass' },
        { name: 'Business Associate Agreements', status: 'pass' }
      ]
    },
    {
      name: 'FERPA Compliance',
      status: 'compliant',
      score: 100,
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      items: [
        { name: 'Student Records Protection', status: 'pass' },
        { name: 'Consent Management', status: 'pass' },
        { name: 'Access Controls', status: 'pass' },
        { name: 'Data Retention Policies', status: 'pass' }
      ]
    },
    {
      name: 'Clinical Education Standards',
      status: 'compliant',
      score: 92,
      lastAudit: '2023-12-01',
      nextAudit: '2024-06-01',
      items: [
        { name: 'CCNE Accreditation', status: 'pass' },
        { name: 'Clinical Site Requirements', status: 'pass' },
        { name: 'Preceptor Qualifications', status: 'warning' },
        { name: 'Student Evaluation Process', status: 'pass' }
      ]
    },
    {
      name: 'Data Security',
      status: 'compliant',
      score: 88,
      lastAudit: '2024-01-20',
      nextAudit: '2024-04-20',
      items: [
        { name: 'Encryption Standards', status: 'pass' },
        { name: 'Access Management', status: 'pass' },
        { name: 'Incident Response Plan', status: 'warning' },
        { name: 'Regular Security Audits', status: 'pass' }
      ]
    }
  ]

  const recentAudits = [
    {
      id: 1,
      type: 'HIPAA Security',
      date: '2024-01-15',
      result: 'Pass',
      findings: 0,
      auditor: 'Internal Team'
    },
    {
      id: 2,
      type: 'FERPA Compliance',
      date: '2024-01-10',
      result: 'Pass',
      findings: 0,
      auditor: 'External Auditor'
    },
    {
      id: 3,
      type: 'Clinical Standards',
      date: '2023-12-01',
      result: 'Pass with Recommendations',
      findings: 2,
      auditor: 'CCNE Review Board'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'compliant':
        return (
          <Badge variant="secondary" className="text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Compliant
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="outline" className="text-orange-600">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        )
      case 'non-compliant':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Non-Compliant
          </Badge>
        )
      default:
        return null
    }
  }

  const getItemStatusIcon = (status: string) => {
    switch(status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'fail':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Compliance Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Areas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/4</div>
            <p className="text-xs text-muted-foreground">
              All areas compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Minor recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Days until HIPAA audit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Areas */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
          <TabsTrigger value="ferpa">FERPA</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Standards</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {complianceAreas.map((area) => (
              <Card key={area.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{area.name}</CardTitle>
                    {getStatusBadge(area.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Compliance Score</span>
                        <span className="font-medium">{area.score}%</span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      {area.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getItemStatusIcon(item.status)}
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last Audit: {new Date(area.lastAudit).toLocaleDateString()}</span>
                        <span>Next: {new Date(area.nextAudit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hipaa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HIPAA Compliance Details</CardTitle>
              <CardDescription>
                Health Insurance Portability and Accountability Act compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Fully HIPAA Compliant</p>
                      <p className="text-sm text-muted-foreground">All requirements met</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600">100% Score</Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Compliance Checklist</h4>
                  {[
                    'Administrative Safeguards',
                    'Physical Safeguards',
                    'Technical Safeguards',
                    'Organizational Requirements',
                    'Policies and Procedures',
                    'Documentation Requirements'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ferpa" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">FERPA Compliance</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Family Educational Rights and Privacy Act compliance details
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">Clinical Standards</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clinical education standards and accreditation compliance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">Security Compliance</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Data security and privacy compliance details
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Audits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
          <CardDescription>
            Compliance audit history and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{audit.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(audit.date).toLocaleDateString()} • {audit.auditor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {audit.findings > 0 && (
                    <Badge variant="outline" className="text-orange-600">
                      {audit.findings} findings
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-green-600">
                    {audit.result}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Required Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Update Preceptor Qualification Documentation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  5 preceptor profiles need updated licensure verification
                </p>
                <Button size="sm" className="mt-2">Review Preceptors</Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Complete Incident Response Plan Review</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Annual review due by end of quarter
                </p>
                <Button size="sm" className="mt-2">Start Review</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}