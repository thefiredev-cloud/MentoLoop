'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer, DashboardGrid } from '@/components/dashboard/dashboard-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Download,
  RefreshCw
} from 'lucide-react'

export default function EnterpriseCompliancePage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseComplianceContent />
    </RoleGuard>
  )
}

function EnterpriseComplianceContent() {
  const complianceItems = [
    {
      id: '1',
      category: 'Accreditation',
      item: 'CCNE Accreditation Standards',
      status: 'compliant',
      lastReview: '2024-11-15',
      nextReview: '2025-05-15'
    },
    {
      id: '2',
      category: 'Documentation',
      item: 'Student Clinical Documentation',
      status: 'compliant',
      lastReview: '2024-12-01',
      nextReview: '2025-03-01'
    },
    {
      id: '3',
      category: 'Training',
      item: 'Preceptor Orientation Completion',
      status: 'warning',
      lastReview: '2024-10-01',
      nextReview: '2025-01-15'
    },
    {
      id: '4',
      category: 'Insurance',
      item: 'Professional Liability Coverage',
      status: 'compliant',
      lastReview: '2024-09-01',
      nextReview: '2025-09-01'
    }
  ]

  return (
    <DashboardContainer
      title="Compliance Reports"
      subtitle="Monitor and maintain regulatory compliance"
      headerAction={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Audit
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      }
    >
      {/* Compliance Overview */}
      <DashboardGrid columns={3}>
        <StatsCard
          title="Overall Compliance"
          value="94%"
          icon={Shield}
          progress={{
            value: 94,
            max: 100
          }}
          badge={{
            text: 'Good Standing',
            variant: 'default'
          }}
        />

        <StatsCard
          title="Items Reviewed"
          value="12/15"
          icon={FileCheck}
          description="This quarter"
        />

        <StatsCard
          title="Action Items"
          value="2"
          icon={AlertTriangle}
          description="Require attention"
          badge={{
            text: 'Pending',
            variant: 'destructive'
          }}
        />
      </DashboardGrid>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>
            Review your organization's compliance with regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <Badge variant={
                    item.status === 'compliant' ? 'default' :
                    item.status === 'warning' ? 'secondary' :
                    'destructive'
                  }>
                    {item.status === 'compliant' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {item.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Last Review: {new Date(item.lastReview).toLocaleDateString()}</p>
                  <p>Next Review: {new Date(item.nextReview).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Documentation Completeness</span>
              <span>98%</span>
            </div>
            <Progress value={98} />
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Training Compliance</span>
              <span>85%</span>
            </div>
            <Progress value={85} />
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Regulatory Adherence</span>
              <span>95%</span>
            </div>
            <Progress value={95} />
          </div>
        </CardContent>
      </Card>
    </DashboardContainer>
  )
}