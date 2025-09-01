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
  Stethoscope,
  Star
} from 'lucide-react'

export default function EnterprisePreceptorsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterprisePreceptorsContent />
    </RoleGuard>
  )
}

function EnterprisePreceptorsContent() {
  // Mock data for demonstration
  const preceptors = [
    {
      id: '1',
      name: 'Dr. Robert Smith',
      email: 'robert.smith@clinic.com',
      specialty: 'Family Medicine',
      status: 'active',
      currentStudents: 2,
      maxStudents: 3,
      rating: 4.8,
      completedRotations: 15,
      location: 'New York, NY'
    },
    {
      id: '2',
      name: 'Dr. Jennifer Wilson',
      email: 'jennifer.wilson@hospital.org',
      specialty: 'Pediatrics',
      status: 'active',
      currentStudents: 1,
      maxStudents: 2,
      rating: 4.9,
      completedRotations: 22,
      location: 'Los Angeles, CA'
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@practice.com',
      specialty: 'Adult-Gerontology',
      status: 'inactive',
      currentStudents: 0,
      maxStudents: 2,
      rating: 4.7,
      completedRotations: 18,
      location: 'Chicago, IL'
    }
  ]

  return (
    <DashboardContainer
      title="Preceptor Network"
      subtitle="Manage your organization's preceptor network"
      headerAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Preceptor
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
                placeholder="Search preceptors by name, specialty, or location..."
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

      {/* Preceptors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Preceptor Network ({preceptors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preceptor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preceptors.map((preceptor) => (
                <TableRow key={preceptor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{preceptor.name}</p>
                      <p className="text-sm text-muted-foreground">{preceptor.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{preceptor.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={preceptor.status === 'active' ? 'default' : 'secondary'}>
                      {preceptor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {preceptor.currentStudents}/{preceptor.maxStudents}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{preceptor.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{preceptor.completedRotations} rotations</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{preceptor.location}</span>
                  </TableCell>
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