'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText,
  Plus,
  Calendar,
  User,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function PreceptorEvaluations() {
  const user = useQuery(api.users.current)

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock evaluations data - in real app would come from Convex
  const mockEvaluations = [
    {
      _id: "eval_1",
      student: {
        name: "Emily Rodriguez",
        program: "FNP"
      },
      type: "Mid-Rotation",
      dateCreated: "2025-01-17",
      dateDue: "2025-01-30",
      status: "completed",
      overallScore: 4.5,
      rotation: {
        specialty: "Family Practice",
        week: 4,
        totalWeeks: 8
      }
    },
    {
      _id: "eval_2", 
      student: {
        name: "Marcus Chen",
        program: "AGACNP"
      },
      type: "Initial Assessment",
      dateCreated: "2025-01-14",
      dateDue: "2025-01-21",
      status: "completed", 
      overallScore: 4.2,
      rotation: {
        specialty: "Acute Care",
        week: 1,
        totalWeeks: 10
      }
    },
    {
      _id: "eval_3",
      student: {
        name: "Emily Rodriguez", 
        program: "FNP"
      },
      type: "Final Evaluation",
      dateCreated: null,
      dateDue: "2025-03-12",
      status: "pending",
      overallScore: null,
      rotation: {
        specialty: "Family Practice",
        week: 8,
        totalWeeks: 8
      }
    }
  ]

  const completedCount = mockEvaluations.filter(e => e.status === 'completed').length
  const pendingCount = mockEvaluations.filter(e => e.status === 'pending').length
  const overdueCount = 0 // Would calculate based on due dates

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Evaluations</h1>
            <p className="text-muted-foreground">
              Track and manage student performance evaluations
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.4</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Evaluations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mockEvaluations.map(evaluation => (
            <Card key={evaluation._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{evaluation.student.name}</CardTitle>
                        <CardDescription>
                          {evaluation.student.program} • {evaluation.rotation.specialty}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {evaluation.type}
                      </Badge>
                      <Badge variant="outline">
                        Week {evaluation.rotation.week} of {evaluation.rotation.totalWeeks}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {evaluation.status === 'completed' ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{evaluation.overallScore}/5.0</span>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {evaluation.dateCreated && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Created</span>
                      </div>
                      <p className="ml-6">{evaluation.dateCreated}</p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Due Date</span>
                    </div>
                    <p className="ml-6">{evaluation.dateDue}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Type</span>
                    </div>
                    <p className="ml-6">{evaluation.type}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {evaluation.status === 'completed' ? (
                    <>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Evaluation
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Complete Evaluation
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/preceptor/students/${evaluation.student.name}`}>
                          <User className="h-4 w-4 mr-2" />
                          View Student
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockEvaluations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Evaluations</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                You haven&apos;t created any student evaluations yet. Start mentoring students to begin the evaluation process.
              </p>
              <Button asChild>
                <Link href="/dashboard/preceptor/matches">
                  View Student Matches
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common evaluation tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <Plus className="h-5 w-5" />
              <span className="text-xs">New Evaluation</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Templates</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <Download className="h-5 w-5" />
              <span className="text-xs">Bulk Export</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <Star className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}