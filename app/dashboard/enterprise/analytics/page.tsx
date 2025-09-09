'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer, DashboardGrid } from '@/components/dashboard/dashboard-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp,
  Users,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

export default function EnterpriseAnalyticsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseAnalyticsContent />
    </RoleGuard>
  )
}

function EnterpriseAnalyticsContent() {
  return (
    <DashboardContainer
      title="Analytics Dashboard"
      subtitle="Track your program's performance metrics"
    >
      {/* Key Metrics */}
      <DashboardGrid columns={4}>
        <StatsCard
          title="Success Rate"
          value="92%"
          icon={TrendingUp}
          description="Overall program success"
          badge={{
            text: '+3% from last month',
            variant: 'default'
          }}
        />

        <StatsCard
          title="Active Students"
          value="45"
          icon={Users}
          description="Currently enrolled"
        />

        <StatsCard
          title="Avg. Match Time"
          value="3.2 days"
          icon={Clock}
          description="Time to match students"
          badge={{
            text: 'Improved',
            variant: 'default'
          }}
        />

        <StatsCard
          title="Match Success"
          value="98%"
          icon={Target}
          description="Successful placements"
        />
      </DashboardGrid>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Student Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Student Satisfaction</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }} />
                </div>
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Preceptor Retention Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }} />
                </div>
                <span className="text-sm font-medium">88%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">On-Time Completion Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '91%' }} />
                </div>
                <span className="text-sm font-medium">91%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardContainer>
  )
}