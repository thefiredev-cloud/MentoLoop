'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  FileBarChart,
  FileCheck,
  FileClock,
  FileX
} from 'lucide-react'

export default function EnterpriseReportsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseReportsContent />
    </RoleGuard>
  )
}

function EnterpriseReportsContent() {
  const reports = [
    {
      id: '1',
      title: 'Monthly Progress Report',
      description: 'Student progress and completion metrics for December 2024',
      type: 'progress',
      status: 'ready',
      date: '2024-12-31',
      icon: FileBarChart
    },
    {
      id: '2',
      title: 'Compliance Report Q4 2024',
      description: 'Quarterly compliance and accreditation report',
      type: 'compliance',
      status: 'ready',
      date: '2024-12-31',
      icon: FileCheck
    },
    {
      id: '3',
      title: 'Student Performance Summary',
      description: 'Individual student performance and evaluation summary',
      type: 'performance',
      status: 'processing',
      date: '2025-01-15',
      icon: FileClock
    },
    {
      id: '4',
      title: 'Preceptor Network Report',
      description: 'Analysis of preceptor availability and performance',
      type: 'network',
      status: 'scheduled',
      date: '2025-01-20',
      icon: FileText
    }
  ]

  return (
    <DashboardContainer
      title="Reports"
      subtitle="Generate and download program reports"
      headerAction={
        <Button size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      }
    >
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="justify-start">
          <FileBarChart className="h-4 w-4 mr-2" />
          Progress Report
        </Button>
        <Button variant="outline" className="justify-start">
          <FileCheck className="h-4 w-4 mr-2" />
          Compliance Report
        </Button>
        <Button variant="outline" className="justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
        <Button variant="outline" className="justify-start">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Download or schedule your organization reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generated: {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      report.status === 'ready' ? 'default' :
                      report.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {report.status}
                    </Badge>
                    {report.status === 'ready' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardContainer>
  )
}