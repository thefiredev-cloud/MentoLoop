'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search,
  Filter,
  Download,
  UserPlus,
  MoreHorizontal,
  GraduationCap
} from 'lucide-react'

export default function EnterpriseStudentsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseStudentsContent />
    </RoleGuard>
  )
}

function EnterpriseStudentsContent() {
  // Mock data for demonstration
  const students = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      program: 'FNP',
      status: 'active',
      rotationStatus: 'in-progress',
      completedHours: 240,
      requiredHours: 600,
      startDate: '2024-01-15',
      expectedGraduation: '2025-05'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@school.edu',
      program: 'AGNP',
      status: 'active',
      rotationStatus: 'completed',
      completedHours: 480,
      requiredHours: 600,
      startDate: '2023-09-01',
      expectedGraduation: '2025-05'
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@school.edu',
      program: 'PNP',
      status: 'active',
      rotationStatus: 'pending',
      completedHours: 120,
      requiredHours: 600,
      startDate: '2024-03-01',
      expectedGraduation: '2025-12'
    }
  ]

  return (
    <DashboardContainer
      title="Student Management"
      subtitle="Manage and track your enrolled students"
      headerAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      }
    >
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Enrolled Students ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rotation</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Expected Graduation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.program}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        student.rotationStatus === 'in-progress' ? 'default' : 
                        student.rotationStatus === 'completed' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {student.rotationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(student.completedHours / student.requiredHours) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((student.completedHours / student.requiredHours) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{student.expectedGraduation}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardContainer>
  )
}