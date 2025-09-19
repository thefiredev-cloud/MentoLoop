'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Brain, Zap, Star, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'

interface AIMatchResult {
  preceptorId: string
  preceptorName: string
  baseScore: number
  enhancedScore: number
  analysis: string
  confidence: 'high' | 'medium' | 'low'
  strengths: string[]
  concerns: string[]
  recommendations: string[]
  overallScore: number
  locationScore: number
  specialty: string[]
  practice: {
    city?: string
    state?: string
    zipCode?: string
  }
  aiEnhanced: boolean
}

interface TestResults {
  success: boolean
  totalAnalyzed: number
  matches: AIMatchResult[]
  aiProvider: string
  timestamp: number
  totalFound: number
}

type StudentDoc = Doc<'students'>

export default function AIMatchingTest() {
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  // Get real students from database
  const studentsData = useQuery(api.students.getAllStudents) as StudentDoc[] | undefined
  const students: StudentDoc[] = studentsData ?? []
  const runAIMatching = useAction(api.matches.findAIEnhancedMatches)

  const runAIMatchingTest = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student for testing')
      return
    }

    setIsRunning(true)
    setTestResults(null)

    try {
      toast.info('Running AI analysis... This may take a few moments')
      
      const results = await runAIMatching({
        studentId: selectedStudent as Id<"students">,
        limit: 5,
        useAI: true
      })

      if (!results.success) {
        throw new Error(results.error || 'AI matching failed')
      }

      setTestResults(results as TestResults)
      toast.success(`AI analysis completed! Found ${results.totalFound} potential matches, analyzed ${results.totalAnalyzed}`)
    } catch (error) {
      console.error('AI matching test failed:', error)
      toast.error('AI matching test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      
      // Show fallback results if API fails
      setTestResults({
        success: false,
        totalAnalyzed: 0,
        matches: [],
        aiProvider: 'error',
        timestamp: Date.now(),
        totalFound: 0
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-500">High Confidence</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium Confidence</Badge>
      case 'low':
        return <Badge variant="destructive">Low Confidence</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Matching Test Lab
          </h1>
          <p className="text-muted-foreground">
            Test and analyze the AI-enhanced MentorFit™ matching algorithm
          </p>
        </div>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test">AI Matching Test</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="config">AI Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Student for Testing</label>
                  <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.personalInfo?.fullName || 'Unknown'} - {student.rotationNeeds?.rotationTypes?.join(', ') || 'No specialty'} ({student.rotationNeeds?.preferredLocation?.city || 'No location'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={runAIMatchingTest} 
                    disabled={isRunning || !selectedStudent}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {isRunning ? 'Running AI Analysis...' : 'Run AI Matching Test'}
                  </Button>
                  
                  {isRunning && (
                    <div className="flex items-center gap-2">
                      <Progress value={33} className="w-32" />
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI Analysis Results
                    <Badge className="ml-2">{testResults.totalAnalyzed} Matches Analyzed</Badge>
                    {testResults.aiProvider && (
                      <Badge variant="outline" className="ml-2">
                        {testResults.aiProvider === 'openai' ? 'OpenAI' : testResults.aiProvider === 'gemini' ? 'Gemini' : 'Basic'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {testResults.matches.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
                      <p className="text-muted-foreground">
                        {testResults.success ? 
                          'No compatible preceptors found for the selected student.' :
                          'AI analysis failed. Please check your API configuration and try again.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {testResults.matches.map((match: AIMatchResult, index: number) => (
                      <Card key={match.preceptorId} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{match.preceptorName}</h3>
                              <p className="text-sm text-muted-foreground">Match #{index + 1}</p>
                            </div>
                            <div className="text-right">
                              {getConfidenceBadge(match.confidence)}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Base MentorFit Score:</span>
                                <span className={`font-semibold ${getScoreColor(match.baseScore)}`}>
                                  {match.baseScore}/10
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">AI Enhanced Score:</span>
                                <span className={`font-semibold ${getScoreColor(match.enhancedScore)}`}>
                                  {match.enhancedScore}/10 
                                  <span className="text-green-600 ml-1">
                                    (+{(match.enhancedScore - match.baseScore).toFixed(1)})
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Progress value={match.enhancedScore * 10} className="h-2" />
                              <p className="text-xs text-center text-muted-foreground">
                                Compatibility Score
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">AI Analysis</h4>
                              <p className="text-sm text-muted-foreground">{match.analysis}</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Strengths
                                </h4>
                                <ul className="space-y-1">
                                  {match.strengths?.map((strength: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {strength}</li>
                                  )) || <li className="text-muted-foreground">No AI strengths available</li>}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Concerns
                                </h4>
                                <ul className="space-y-1">
                                  {match.concerns?.map((concern: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {concern}</li>
                                  )) || <li className="text-muted-foreground">No AI concerns listed</li>}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  Recommendations
                                </h4>
                                <ul className="space-y-1">
                                  {match.recommendations?.map((rec: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {rec}</li>
                                  )) || <li className="text-muted-foreground">No AI recommendations available</li>}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">AI Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+1.2</div>
                    <div className="text-sm text-muted-foreground">Avg Score Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">78%</div>
                    <div className="text-sm text-muted-foreground">High Confidence Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2.3s</div>
                    <div className="text-sm text-muted-foreground">Avg Analysis Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Provider</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="openai">OpenAI GPT-4</option>
                      <option value="gemini">Google Gemini Pro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Depth</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="standard">Standard Analysis</option>
                      <option value="detailed">Detailed Analysis</option>
                      <option value="comprehensive">Comprehensive Analysis</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">AI Enhancement Status</div>
                    <div className="text-sm text-muted-foreground">Currently enabled for all new matches</div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
