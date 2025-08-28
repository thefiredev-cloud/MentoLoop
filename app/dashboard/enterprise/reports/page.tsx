'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  FileBarChart,
  FileSpreadsheet,
  FilePieChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react'
import { useState } from 'react'

export default function EnterpriseReportsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseReportsContent />
    </RoleGuard>
  )
}

function EnterpriseReportsContent() {
  const [searchTerm, setSearchTerm] = useState('')

  const reports = [
    {
      id: 1,
      name: 'Monthly Student Progress Report',
      type: 'progress',
      frequency: 'Monthly',
      lastGenerated: '2024-01-31',
      status: 'ready',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Clinical Rotation Summary',
      type: 'clinical',
      frequency: 'Quarterly',
      lastGenerated: '2024-01-15',
      status: 'ready',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Financial Overview Report',
      type: 'financial',
      frequency: 'Monthly',
      lastGenerated: '2024-01-31',
      status: 'ready',
      size: '956 KB'
    },
    {
      id: 4,
      name: 'Student Satisfaction Survey',
      type: 'survey',
      frequency: 'Quarterly',
      lastGenerated: '2023-12-31',
      status: 'ready',
      size: '1.2 MB'
    },
    {
      id: 5,
      name: 'Compliance & Accreditation Report',
      type: 'compliance',
      frequency: 'Annual',
      lastGenerated: '2023-12-01',
      status: 'processing',
      size: '-'
    }
  ]

  const getReportIcon = (type: string) => {
    switch(type) {
      case 'progress': return <FileBarChart className="h-5 w-5" />
      case 'clinical': return <FileSpreadsheet className="h-5 w-5" />
      case 'financial': return <FilePieChart className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ready':
        return (
          <Badge variant="secondary" className="text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Ready
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="outline" className="text-orange-600">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Custom Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-blue-100">
                <FileBarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Performance</p>
                <p className="text-sm text-muted-foreground">Student metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-green-100">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Clinical</p>
                <p className="text-sm text-muted-foreground">Rotation data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-purple-100">
                <FilePieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Financial</p>
                <p className="text-sm text-muted-foreground">Cost analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-orange-100">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Compliance</p>
                <p className="text-sm text-muted-foreground">Regulatory docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create a custom report based on your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Student Progress</SelectItem>
                  <SelectItem value="clinical">Clinical Summary</SelectItem>
                  <SelectItem value="financial">Financial Overview</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select>
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                Download or schedule your organizational reports
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-muted">
                    {getReportIcon(report.type)}
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.frequency}
                      </span>
                      <span>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                      {report.size !== '-' && <span>{report.size}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                  {report.status === 'ready' && (
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Manage your automated report generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Monthly Performance Report</p>
                  <p className="text-sm text-muted-foreground">
                    Generates on the 1st of every month at 8:00 AM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Active</Badge>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Quarterly Compliance Report</p>
                  <p className="text-sm text-muted-foreground">
                    Generates every quarter on the last day at 5:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Active</Badge>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Scheduled Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}