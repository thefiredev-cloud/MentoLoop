'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign,
  Activity,
  Target,
  Download,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

export default function EnterpriseAnalyticsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseAnalyticsContent />
    </RoleGuard>
  )
}

function EnterpriseAnalyticsContent() {
  // Mock data
  const stats = {
    totalStudents: 145,
    activeRotations: 32,
    completionRate: 89,
    satisfactionScore: 4.6,
    monthlyGrowth: 12,
    totalInvestment: 125000
  }

  const performanceData = [
    { month: 'Jan', students: 12, completions: 10 },
    { month: 'Feb', students: 15, completions: 13 },
    { month: 'Mar', students: 18, completions: 16 },
    { month: 'Apr', students: 22, completions: 20 },
    { month: 'May', students: 25, completions: 23 },
    { month: 'Jun', students: 28, completions: 26 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ChevronUp className="h-3 w-3" />
                +{stats.monthlyGrowth}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rotations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRotations}</div>
            <p className="text-xs text-muted-foreground">
              Across 12 specialties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfactionScore}/5.0</div>
            <p className="text-xs text-muted-foreground">
              Based on 89 reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalInvestment / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              Total program cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="rotations">Rotations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>
                  Monthly enrollment and completion trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceData.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{month.month}</span>
                        <div className="flex gap-1">
                          <div className="w-32 bg-blue-100 rounded">
                            <div 
                              className="h-6 bg-blue-600 rounded"
                              style={{ width: `${(month.students / 30) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">{month.students}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
                <CardDescription>
                  Student distribution across specialties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Family Medicine', count: 45, percentage: 31 },
                    { name: 'Internal Medicine', count: 38, percentage: 26 },
                    { name: 'Pediatrics', count: 32, percentage: 22 },
                    { name: 'Women\'s Health', count: 20, percentage: 14 },
                    { name: 'Mental Health', count: 10, percentage: 7 }
                  ].map((specialty) => (
                    <div key={specialty.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{specialty.name}</span>
                        <span className="font-medium">{specialty.count} students</span>
                      </div>
                      <Progress value={specialty.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for your program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">First-Time Pass Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-muted-foreground">AANP/ANCC exams</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Job Placement</p>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs text-muted-foreground">Within 6 months</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg Time to Match</p>
                  <p className="text-2xl font-bold">3.5 days</p>
                  <p className="text-xs text-muted-foreground">Preceptor matching</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Retention Rate</p>
                  <p className="text-2xl font-bold">91%</p>
                  <p className="text-xs text-muted-foreground">Program completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">Student Analytics</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed student performance metrics coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotations" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">Rotation Analytics</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clinical rotation insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-3 font-medium">Financial Analytics</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Program cost analysis coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}