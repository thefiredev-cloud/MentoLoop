'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Plus,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react'

export default function StudentRotationsPage() {
  const user = useQuery(api.users.current)
  const student = useQuery(api.students.getCurrentStudent)
  const rotationStats = useQuery(api.students.getStudentRotationStats)
  const rotations = useQuery(api.matches.getStudentRotations,
    student ? { studentId: student._id } : "skip"
  )

  if (!user) {
    return <div>Loading...</div>
  }

  // Helper function to filter rotations by status
  const getRotationsByStatus = (status: string) => {
    if (!rotations) return []
    
    switch (status) {
      case 'active':
        return rotations.filter(r => r.status === 'active')
      case 'scheduled':
        return rotations.filter(r => r.status === 'confirmed' || r.status === 'pending')
      case 'completed':
        return rotations.filter(r => r.status === 'completed')
      default:
        return rotations
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalHoursCompleted = rotationStats?.totalHoursCompleted || 0
  const totalHoursRequired = rotationStats?.totalHoursRequired || 640
  const overallProgress = rotationStats?.overallProgress || 0
  const activeCount = rotationStats?.activeCount || 0
  const completedCount = rotationStats?.completedCount || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Rotations</h1>
          <p className="text-muted-foreground">
            Track your clinical rotation progress and requirements
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request New Rotation
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total Hours</span>
                <span className="font-medium">{totalHoursCompleted}/{totalHoursRequired}</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {totalHoursRequired - totalHoursCompleted} hours remaining
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedCount}
                </div>
                <p className="text-sm text-muted-foreground">Rotations Completed</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeCount}
                </div>
                <p className="text-sm text-muted-foreground">Currently Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rotations Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Rotations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {rotations && rotations.length > 0 ? rotations.map((rotation) => (
            <Card key={rotation._id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{rotation.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {rotation.preceptor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {rotation.location}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(rotation.status)}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Schedule & Dates */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Schedule</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(rotation.startDate)} - {formatDate(rotation.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rotation.schedule}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rotation.weeklyHours} hours/week
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Hours Completed</span>
                          <span className="font-medium">
                            {rotation.hoursCompleted}/{rotation.hoursRequired}
                          </span>
                        </div>
                        <Progress 
                          value={(rotation.hoursCompleted / rotation.hoursRequired) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {rotation.hoursRequired - rotation.hoursCompleted} hours remaining
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                        {rotation.status === 'active' && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Clock className="h-3 w-3 mr-2" />
                            Log Hours
                          </Button>
                        )}
                        {rotation.status === 'completed' && (
                          <Button variant="outline" size="sm" className="w-full">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rotations Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any rotations yet. Accept a match to start your clinical journey.
                </p>
                <Button asChild>
                  <a href="/dashboard/student/matches">
                    Find Matches
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {getRotationsByStatus('active').length > 0 ? getRotationsByStatus('active').map((rotation) => (
              <Card key={rotation._id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rotation.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {rotation.preceptor}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {rotation.location}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(rotation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {rotation.hoursCompleted}/{rotation.hoursRequired} hours
                        </span>
                      </div>
                      <Progress 
                        value={(rotation.hoursCompleted / rotation.hoursRequired) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Clock className="h-3 w-3 mr-2" />
                        Log Hours
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Rotations</h3>
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t have any active rotations currently.
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {getRotationsByStatus('scheduled').length > 0 ? getRotationsByStatus('scheduled').map((rotation) => (
              <Card key={rotation._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rotation.title}</CardTitle>
                      <CardDescription>
                        Starts {formatDate(rotation.startDate)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(rotation.status)}
                  </div>
                </CardHeader>
              </Card>
            )) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Rotations</h3>
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t have any scheduled rotations yet.
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getRotationsByStatus('completed').length > 0 ? getRotationsByStatus('completed').map((rotation) => (
              <Card key={rotation._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rotation.title}</CardTitle>
                      <CardDescription>
                        Completed {formatDate(rotation.endDate)} • {rotation.hoursCompleted} hours
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rotation.status)}
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Certificate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Rotations</h3>
                  <p className="text-muted-foreground mb-4">
                    Completed rotations will appear here once you finish them.
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}