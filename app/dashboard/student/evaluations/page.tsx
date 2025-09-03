'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Star, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  TrendingUp,
  Award
} from 'lucide-react'
import { useMemo } from 'react'

export default function StudentEvaluationsPage() {
  return (
    <RoleGuard requiredRole="student">
      <StudentEvaluationsContent />
    </RoleGuard>
  )
}

function StudentEvaluationsContent() {
  // Use stable values instead of Math.random() to avoid hydration mismatches
  const skillRatings = useMemo(() => ({
    'Clinical Skills': { rating: 4.2, progress: 84 },
    'Patient Communication': { rating: 4.5, progress: 90 },
    'Professionalism': { rating: 4.8, progress: 96 },
    'Medical Knowledge': { rating: 4.0, progress: 80 }
  }), [])

  const evaluations = [
    {
      id: 1,
      preceptor: 'Dr. Sarah Johnson',
      rotation: 'Family Medicine',
      date: '2024-01-20',
      status: 'completed',
      rating: 4.5,
      strengths: ['Clinical reasoning', 'Patient communication', 'Professionalism'],
      improvements: ['Time management', 'Documentation speed']
    },
    {
      id: 2,
      preceptor: 'Dr. Michael Chen',
      rotation: 'Internal Medicine',
      date: '2024-02-15',
      status: 'pending',
      rating: null,
      strengths: [],
      improvements: []
    },
    {
      id: 3,
      preceptor: 'Dr. Emily Rodriguez',
      rotation: 'Pediatrics',
      date: '2023-12-10',
      status: 'completed',
      rating: 4.8,
      strengths: ['Pediatric assessment', 'Family education', 'Clinical skills'],
      improvements: ['Medication dosing calculations']
    }
  ]

  const completedEvals = evaluations.filter(e => e.status === 'completed')
  const averageRating = completedEvals.length > 0 
    ? completedEvals.reduce((sum, e) => sum + (e.rating || 0), 0) / completedEvals.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clinical Evaluations</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluations.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedEvals.length} completed, {evaluations.length - completedEvals.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= averageRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              Improvement from last semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Excellence awards earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Evaluations</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{evaluation.rotation}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3" />
                      {evaluation.preceptor}
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      {new Date(evaluation.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluation.status === 'completed' ? (
                      <>
                        <Badge variant="secondary" className="text-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                        <div className="flex items-center gap-1">
                          {evaluation.rating && (
                            <>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{evaluation.rating}</span>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Review
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {evaluation.status === 'completed' && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.strengths.map((strength, idx) => (
                          <Badge key={idx} variant="secondary">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {evaluation.improvements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Areas for Improvement</p>
                        <div className="flex flex-wrap gap-2">
                          {evaluation.improvements.map((improvement, idx) => (
                            <Badge key={idx} variant="outline">
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Evaluation
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedEvals.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{evaluation.rotation}</CardTitle>
                    <CardDescription>{evaluation.preceptor}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{evaluation.rating}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-medium">1 Evaluation Pending</p>
                  <p className="text-sm text-muted-foreground">
                    Your preceptor will submit your evaluation once the rotation is complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Your clinical skills development over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(skillRatings).map(([skill, data]) => (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{skill}</span>
                  <span className="font-medium">{data.rating}/5.0</span>
                </div>
                <Progress value={data.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}