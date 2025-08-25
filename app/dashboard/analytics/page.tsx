'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Star,
  Award,
  Clock,
  MapPin,
  BookOpen,
  Brain,
  LineChart,
  Filter,
  Download
} from 'lucide-react'
export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30d')
  const [specialty, setSpecialty] = useState('all')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Get analytics data from Convex
  // const overviewStats = useQuery(api.analytics.getOverviewStats, { dateRange })
  // const surveyInsights = useQuery(api.analytics.getSurveyInsights, { dateRange, specialty })
  // const qualityMetrics = useQuery(api.analytics.getQualityMetrics, { dateRange, specialty })
  // const specialtyBreakdown = useQuery(api.analytics.getSpecialtyBreakdown, { dateRange })
  // const performanceTrends = useQuery(api.analytics.getPerformanceTrends, { dateRange, specialty })
  // const geographicData = useQuery(api.analytics.getGeographicDistribution, { dateRange, specialty })

  // Mock analytics data - fallback for when queries are loading
  const mockAnalytics = {
    overview: {
      totalMatches: 452,
      successfulMatches: 398,
      averageScore: 8.3,
      studentSatisfaction: 94.2,
      preceptorSatisfaction: 91.8,
      completionRate: 88.1
    },
    surveyInsights: {
      responseRate: 87.5,
      averageResponseTime: '4.2 days',
      commonFeedback: [
        { category: 'Communication', score: 9.1, mentions: 234 },
        { category: 'Clinical Knowledge', score: 8.8, mentions: 198 },
        { category: 'Professional Growth', score: 9.3, mentions: 267 },
        { category: 'Site Accessibility', score: 7.9, mentions: 145 },
        { category: 'Learning Environment', score: 8.7, mentions: 189 }
      ]
    },
    qualityMetrics: {
      aiAccuracy: 94.5,
      matchRetention: 91.2,
      rotationCompletion: 88.1,
      earlyTermination: 4.3,
      conflictResolution: 96.7
    },
    trendsData: [
      { month: 'Jan', matches: 67, satisfaction: 89.2, aiScore: 8.1 },
      { month: 'Feb', matches: 72, satisfaction: 91.1, aiScore: 8.3 },
      { month: 'Mar', matches: 84, satisfaction: 92.3, aiScore: 8.4 },
      { month: 'Apr', matches: 91, satisfaction: 93.8, aiScore: 8.6 },
      { month: 'May', matches: 96, satisfaction: 94.2, aiScore: 8.7 },
      { month: 'Jun', matches: 102, satisfaction: 94.9, aiScore: 8.8 }
    ]
  }

  const specialtyData = [
    { name: 'Family Nurse Practitioner (FNP)', matches: 156, avgScore: 8.4, satisfaction: 95.1 },
    { name: 'Psychiatric Mental Health NP (PMHNP)', matches: 89, avgScore: 8.1, satisfaction: 93.2 },
    { name: 'Pediatric Nurse Practitioner (PNP)', matches: 67, avgScore: 8.6, satisfaction: 96.3 },
    { name: 'Adult-Gerontology NP (AGNP)', matches: 78, avgScore: 8.3, satisfaction: 92.8 },
    { name: 'Women\'s Health NP (WHNP)', matches: 42, avgScore: 8.7, satisfaction: 97.1 },
    { name: 'Acute Care NP (ACNP)', matches: 20, avgScore: 8.0, satisfaction: 89.5 }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 8) return 'text-blue-600'
    if (score >= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Deep insights into match quality, survey feedback, and platform performance across Texas
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <MapPin className="h-3 w-3 mr-1" />
              Texas Only Operations
            </Badge>
            <span className="text-xs text-muted-foreground">Serving 4 major metro areas • 15 counties • 452+ total matches</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="fnp">Family NP (FNP)</SelectItem>
              <SelectItem value="pmhnp">Psychiatric Mental Health NP</SelectItem>
              <SelectItem value="pnp">Pediatric NP (PNP)</SelectItem>
              <SelectItem value="agnp">Adult-Gerontology NP</SelectItem>
              <SelectItem value="whnp">Women&apos;s Health NP</SelectItem>
              <SelectItem value="acnp">Acute Care NP</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="survey-insights">Survey Insights</TabsTrigger>
            <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
            <TabsTrigger value="specialty-breakdown">Specialty Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.overview.totalMatches}</div>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">+12% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.overview.successfulMatches / mockAnalytics.overview.totalMatches * 100)}</div>
                  <div className="text-xs text-muted-foreground">
                    {mockAnalytics.overview.successfulMatches} of {mockAnalytics.overview.totalMatches} matches
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.overview.averageScore}/10</div>
                  <div className="text-xs text-green-600">Excellent quality threshold</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Satisfaction</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.overview.studentSatisfaction)}</div>
                  <Progress value={mockAnalytics.overview.studentSatisfaction} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Preceptor Satisfaction</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.overview.preceptorSatisfaction)}</div>
                  <Progress value={mockAnalytics.overview.preceptorSatisfaction} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.overview.completionRate)}</div>
                  <div className="text-xs text-muted-foreground">Rotations completed successfully</div>
                </CardContent>
              </Card>
            </div>

            {/* Trends Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <div className="font-medium">Interactive Chart</div>
                    <div className="text-sm">Monthly trends for matches, satisfaction, and AI scores</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey-insights" className="space-y-6">
            {/* Survey Response Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.surveyInsights.responseRate)}</div>
                  <div className="text-xs text-green-600">Above target (80%)</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.surveyInsights.averageResponseTime}</div>
                  <div className="text-xs text-muted-foreground">Time to complete survey</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-xs text-muted-foreground">This period</div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Feedback Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Average scores and mention frequency across key feedback categories
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.surveyInsights.commonFeedback.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.mentions} mentions in surveys
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                          {item.score}/10
                        </div>
                        <Progress value={item.score * 10} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Very Positive</span>
                      <div className="flex items-center gap-2">
                        <Progress value={68} className="w-24" />
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Positive</span>
                      <div className="flex items-center gap-2">
                        <Progress value={23} className="w-24" />
                        <span className="text-sm font-medium">23%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Neutral</span>
                      <div className="flex items-center gap-2">
                        <Progress value={7} className="w-24" />
                        <span className="text-sm font-medium">7%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Negative</span>
                      <div className="flex items-center gap-2">
                        <Progress value={2} className="w-24" />
                        <span className="text-sm font-medium">2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Communication Timing</div>
                      <div className="text-xs text-muted-foreground">Mentioned in 34 surveys</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Site Parking</div>
                      <div className="text-xs text-muted-foreground">Mentioned in 28 surveys</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Electronic Health Records Training</div>
                      <div className="text-xs text-muted-foreground">Mentioned in 22 surveys</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Case Volume Consistency</div>
                      <div className="text-xs text-muted-foreground">Mentioned in 19 surveys</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality-metrics" className="space-y-6">
            {/* Quality Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Matching Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.qualityMetrics.aiAccuracy)}</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Brain className="h-3 w-3" />
                    Above 90% target
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Match Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.qualityMetrics.matchRetention)}</div>
                  <div className="text-xs text-muted-foreground">Students who stay with matched preceptor</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Rotation Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.qualityMetrics.rotationCompletion)}</div>
                  <div className="text-xs text-green-600">Strong completion rate</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Early Termination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.qualityMetrics.earlyTermination)}</div>
                  <div className="text-xs text-green-600">Below 5% target</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conflict Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(mockAnalytics.qualityMetrics.conflictResolution)}</div>
                  <div className="text-xs text-muted-foreground">Successful issue resolution</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quality Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">A+</div>
                  <div className="text-xs text-green-600">Excellent overall quality</div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <div className="font-medium">Quality Metrics Chart</div>
                    <div className="text-sm">Track AI accuracy, retention, and completion rates over time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Alerts & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">AI Accuracy Exceeding Target</div>
                      <div className="text-xs text-muted-foreground">
                        AI matching accuracy is 4.5% above the 90% target. Consider documenting successful patterns.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Communication Response Time</div>
                      <div className="text-xs text-muted-foreground">
                        Average response time to student inquiries has increased by 0.3 hours this week.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Seasonal Rotation Demand</div>
                      <div className="text-xs text-muted-foreground">
                        Spring semester rotations showing 23% higher demand than last year.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialty-breakdown" className="space-y-6">
            {/* Specialty Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Specialty</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Match success rates, satisfaction scores, and volume by NP specialty
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialtyData.map((specialty, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{specialty.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {specialty.matches} matches this period
                          </div>
                        </div>
                        <Badge variant="outline">{formatPercentage(specialty.satisfaction)}</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Avg Match Score</div>
                          <div className={`font-bold text-lg ${getScoreColor(specialty.avgScore)}`}>
                            {specialty.avgScore}/10
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Satisfaction</div>
                          <div className="font-medium">{formatPercentage(specialty.satisfaction)}</div>
                          <Progress value={specialty.satisfaction} className="mt-1" />
                        </div>
                        <div>
                          <div className="text-muted-foreground">Market Share</div>
                          <div className="font-medium">
                            {((specialty.matches / 452) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Texas Geographic Distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Texas Regional Distribution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Serving only Texas - Regional breakdown of matches
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dallas-Fort Worth</span>
                      <div className="flex items-center gap-2">
                        <Progress value={28} className="w-20" />
                        <span className="text-sm font-medium">28%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Houston Metro</span>
                      <div className="flex items-center gap-2">
                        <Progress value={24} className="w-20" />
                        <span className="text-sm font-medium">24%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">San Antonio</span>
                      <div className="flex items-center gap-2">
                        <Progress value={18} className="w-20" />
                        <span className="text-sm font-medium">18%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Austin Metro</span>
                      <div className="flex items-center gap-2">
                        <Progress value={15} className="w-20" />
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Other Texas Cities</span>
                      <div className="flex items-center gap-2">
                        <Progress value={15} className="w-20" />
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs font-medium text-blue-900">Total Texas Matches: 452</div>
                    <div className="text-xs text-blue-700">Covering 15 counties across Texas</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Texas Counties</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Highest performing counties by match quality
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">Harris County (Houston)</div>
                          <div className="text-xs text-muted-foreground">89 matches, 8.9/10 avg score</div>
                        </div>
                        <Badge className="bg-green-500">Top</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">Dallas County</div>
                          <div className="text-xs text-muted-foreground">74 matches, 9.1/10 avg score</div>
                        </div>
                        <Badge className="bg-green-500">Top</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">Tarrant County (Fort Worth)</div>
                          <div className="text-xs text-muted-foreground">52 matches, 9.0/10 avg score</div>
                        </div>
                        <Badge variant="secondary">High</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">Bexar County (San Antonio)</div>
                          <div className="text-xs text-muted-foreground">48 matches, 8.7/10 avg score</div>
                        </div>
                        <Badge variant="secondary">High</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}