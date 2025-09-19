'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
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
  Download,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

type EvaluationRecord = Doc<'evaluations'>
type EvaluationWithStudent = EvaluationRecord & { studentName?: string }
type EvaluationStats = {
  completed: number
  pending: number
  overdue: number
  avgScore: number
  totalEvaluations: number
}

export default function PreceptorEvaluations() {
  const user = useQuery(api.users.current)
  const evaluationsData = useQuery(api.evaluations.getPreceptorEvaluations) as EvaluationWithStudent[] | undefined
  const evaluationStats = useQuery(api.evaluations.getEvaluationStats) as EvaluationStats | null | undefined
  const evaluations: EvaluationWithStudent[] = evaluationsData ?? []
  const deleteEvaluation = useMutation(api.evaluations.deleteEvaluation)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!user) {
    return <div>Loading...</div>
  }

  const handleDeleteEvaluation = async (evaluationId: Id<"evaluations">) => {
    try {
      setDeletingId(evaluationId)
      await deleteEvaluation({ evaluationId })
      toast.success('Evaluation deleted successfully')
    } catch (error) {
      toast.error('Failed to delete evaluation')
      console.error('Error deleting evaluation:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string, dateDue?: string) => {
    // Check if overdue
    if (status === 'pending' && dateDue && new Date(dateDue) < new Date()) {
      return (
        <Badge variant="destructive" className="bg-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      )
    }
    
    if (status === 'completed') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

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
            <div className="text-2xl font-bold text-green-600">
              {evaluationStats?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {evaluationStats?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {evaluationStats?.overdue || 0}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationStats?.avgScore || 0}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Evaluations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={evaluations.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {evaluations.map(evaluation => (
            <Card key={evaluation._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{evaluation.studentName || 'Student'}</CardTitle>
                        <CardDescription>
                          {evaluation.studentProgram} • {evaluation.rotationSpecialty}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {evaluation.evaluationType}
                      </Badge>
                      <Badge variant="outline">
                        Week {evaluation.rotationWeek} of {evaluation.rotationTotalWeeks}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {evaluation.status === 'completed' && evaluation.overallScore ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{evaluation.overallScore}/5.0</span>
                        </div>
                        {getStatusBadge(evaluation.status, evaluation.dateDue)}
                      </div>
                    ) : (
                      getStatusBadge(evaluation.status, evaluation.dateDue)
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
                      <p className="ml-6">{new Date(evaluation.dateCreated).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Due Date</span>
                    </div>
                    <p className="ml-6">{new Date(evaluation.dateDue).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Type</span>
                    </div>
                    <p className="ml-6">{evaluation.evaluationType}</p>
                  </div>
                </div>

                {evaluation.feedback && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Feedback</h4>
                      <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                    </div>
                  </>
                )}

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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteEvaluation(evaluation._id)}
                        disabled={deletingId === evaluation._id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Complete Evaluation
                      </Button>
                      <Button size="sm" variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        View Student
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteEvaluation(evaluation._id)}
                        disabled={deletingId === evaluation._id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {evaluations.length === 0 && (
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
