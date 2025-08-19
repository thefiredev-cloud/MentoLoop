'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Brain, Zap, Star, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

export default function AIMatchingTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  // Mock data for demonstration
  const mockStudents = [
    { id: 'student1', name: 'Sarah Johnson', specialty: 'FNP', location: 'California' },
    { id: 'student2', name: 'Michael Chen', specialty: 'PMHNP', location: 'Texas' },
    { id: 'student3', name: 'Emily Rodriguez', specialty: 'PNP', location: 'Florida' }
  ]

  const runAIMatchingTest = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student for testing')
      return
    }

    setIsRunning(true)
    setTestResults(null)

    try {
      // Mock AI analysis for demonstration
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate API delay
      
      const mockResults = {
        success: true,
        totalAnalyzed: 5,
        matches: [
          {
            preceptorId: 'prec1',
            preceptorName: 'Dr. Amanda Wilson',
            baseScore: 7.2,
            enhancedScore: 8.7,
            aiAnalysis: 'Excellent compatibility based on complementary teaching and learning styles. Strong alignment in communication preferences and clinical approach.',
            confidence: 'high',
            aiStrengths: [
              'Teaching style perfectly matches student learning preferences',
              'Strong communication alignment for effective feedback',
              'Complementary clinical approaches'
            ],
            aiConcerns: [
              'Geographic distance may require travel consideration',
              'Schedule coordination needed for optimal hours'
            ],
            aiRecommendations: [
              'Establish clear communication protocols',
              'Plan travel logistics in advance',
              'Set up regular check-in schedules'
            ]
          },
          {
            preceptorId: 'prec2',
            preceptorName: 'Dr. James Thompson',
            baseScore: 6.8,
            enhancedScore: 7.9,
            aiAnalysis: 'Good compatibility with room for growth. Preceptor\'s structured approach aligns with student\'s need for clear guidance.',
            confidence: 'medium',
            aiStrengths: [
              'Structured mentoring approach',
              'Experience with similar student profiles',
              'Strong clinical case variety'
            ],
            aiConcerns: [
              'Potential mismatch in feedback frequency preferences',
              'Different autonomy expectations'
            ],
            aiRecommendations: [
              'Discuss feedback preferences early',
              'Establish autonomy progression plan',
              'Regular goal setting sessions'
            ]
          },
          {
            preceptorId: 'prec3',
            preceptorName: 'Dr. Lisa Park',
            baseScore: 6.1,
            enhancedScore: 6.5,
            aiAnalysis: 'Moderate compatibility. Some areas of alignment with opportunities for growth through effective communication.',
            confidence: 'medium',
            aiStrengths: [
              'Diverse clinical experience',
              'Flexible scheduling availability',
              'Strong patient population variety'
            ],
            aiConcerns: [
              'Different learning style preferences',
              'Potential communication style mismatch',
              'Varying expectations for student initiative'
            ],
            aiRecommendations: [
              'Additional orientation and expectation setting',
              'More frequent check-ins initially',
              'Consider supplementary learning resources'
            ]
          }
        ],
        aiProvider: 'openai',
        timestamp: Date.now()
      }

      setTestResults(mockResults)
      toast.success('AI matching analysis completed!')
    } catch (error) {
      console.error('AI matching test failed:', error)
      toast.error('AI matching test failed')
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
                    {mockStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.specialty} ({student.location})
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {testResults.matches.map((match: any, index: number) => (
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
                              <p className="text-sm text-muted-foreground">{match.aiAnalysis}</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Strengths
                                </h4>
                                <ul className="space-y-1">
                                  {match.aiStrengths.map((strength: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {strength}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Concerns
                                </h4>
                                <ul className="space-y-1">
                                  {match.aiConcerns.map((concern: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {concern}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  Recommendations
                                </h4>
                                <ul className="space-y-1">
                                  {match.aiRecommendations.map((rec: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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