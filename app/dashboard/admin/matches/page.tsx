'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  Target,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  TrendingUp,
  Play,
  Pause,
} from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'

interface Match {
  _id: Id<'matches'>
  studentId: Id<'students'>
  preceptorId: Id<'preceptors'>
  status: 'suggested' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  mentorFitScore: number
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'cancelled'
  rotationDetails: {
    startDate: string
    endDate: string
    weeklyHours: number
    rotationType: string
    location?: string
  }
  aiAnalysis?: {
    enhancedScore: number
    analysis: string
    confidence: string
    recommendations: string[]
    strengths: string[]
    concerns: string[]
  }
  createdAt: number
  updatedAt: number
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
    school?: string
    personalInfo?: {
      fullName?: string
    }
  } | null
  preceptor: {
    _id: string
    firstName: string
    lastName: string
    email: string
    specialty?: string
    personalInfo?: {
      fullName?: string
    }
  } | null
}

export default function MatchManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showMatchDetails, setShowMatchDetails] = useState(false)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [showForceMatchDialog, setShowForceMatchDialog] = useState(false)
  const [overrideScore, setOverrideScore] = useState([5])
  const [overrideReason, setOverrideReason] = useState('')
  const [forceMatchData, setForceMatchData] = useState({
    studentId: '',
    preceptorId: '',
    startDate: '',
    endDate: '',
    weeklyHours: 40,
    rotationType: '',
    reason: ''
  })

  // Queries
  const matchesData = useQuery(api.matches.getAllMatches, {
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'suggested' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' : undefined,
  })

  const platformStats = useQuery(api.admin.getPlatformStats, {})

  // Mutations
  const overrideMatchScore = useMutation(api.admin.overrideMatchScore)
  const forceCreateMatch = useMutation(api.admin.forceCreateMatch)

  // Handle match selection
  const handleViewMatch = (match: {_id: string; [key: string]: unknown}) => {
    setSelectedMatch(match as unknown as Match)
    setShowMatchDetails(true)
  }

  const handleOverrideScore = (match: {_id: string; mentorFitScore?: number; [key: string]: unknown}) => {
    setSelectedMatch(match as unknown as Match)
    setOverrideScore([match.mentorFitScore || 5])
    setShowOverrideDialog(true)
  }

  // Handle score override
  const handleSubmitOverride = async () => {
    if (!selectedMatch) return

    try {
      await overrideMatchScore({
        matchId: selectedMatch._id,
        newScore: overrideScore[0],
        reason: overrideReason,
      })
      toast.success('Match score updated successfully')
      setShowOverrideDialog(false)
      setOverrideReason('')
    } catch {
      toast.error('Failed to update match score')
    }
  }

  // Handle force match creation
  const handleForceMatch = async () => {
    try {
      await forceCreateMatch({
        studentId: forceMatchData.studentId as Id<'students'>,
        preceptorId: forceMatchData.preceptorId as Id<'preceptors'>,
        rotationDetails: {
          startDate: forceMatchData.startDate,
          endDate: forceMatchData.endDate,
          weeklyHours: forceMatchData.weeklyHours,
          rotationType: forceMatchData.rotationType,
        },
        reason: forceMatchData.reason,
      })
      toast.success('Match created successfully')
      setShowForceMatchDialog(false)
      setForceMatchData({
        studentId: '',
        preceptorId: '',
        startDate: '',
        endDate: '',
        weeklyHours: 40,
        rotationType: '',
        reason: ''
      })
    } catch {
      toast.error('Failed to create match')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case 'active':
        return <Badge className="bg-blue-500"><Play className="h-3 w-3 mr-1" />Active</Badge>
      case 'completed':
        return <Badge className="bg-purple-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Pending</Badge>
      case 'suggested':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Suggested</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Match Management</h1>
          <p className="text-muted-foreground">
            Review, override, and manage student-preceptor matches
          </p>
        </div>
        <Button onClick={() => setShowForceMatchDialog(true)}>
          Force Create Match
        </Button>
      </div>

      {/* Stats Cards */}
      {platformStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.matches.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {platformStats.matches.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.matches.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.matches.avgScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                MentorFit compatibility
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((platformStats.matches.completed / Math.max(platformStats.matches.total, 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Matches</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="suggested">Suggested</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {matchesData ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Rotation</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchesData.map((match) => (
                    <TableRow key={match._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {match.student?.personalInfo?.fullName} → {match.preceptor?.personalInfo?.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.rotationDetails.rotationType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(match.rotationDetails.startDate)} - {formatDate(match.rotationDetails.endDate)}</div>
                          <div className="text-muted-foreground">{match.rotationDetails.weeklyHours}h/week</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match.mentorFitScore.toFixed(1)}/10</span>
                          {match.aiAnalysis && (
                            <Badge variant="outline" className="text-xs">
                              AI: {match.aiAnalysis.enhancedScore.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell>{getPaymentBadge(match.paymentStatus)}</TableCell>
                      <TableCell>{formatTimestamp(match.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMatch(match)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOverrideScore(match)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading matches...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Details Dialog */}
      <Dialog open={showMatchDetails} onOpenChange={setShowMatchDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Match Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> {getStatusBadge(selectedMatch.status)}</div>
                    <div><strong>MentorFit Score:</strong> {selectedMatch.mentorFitScore}/10</div>
                    <div><strong>Payment:</strong> {getPaymentBadge(selectedMatch.paymentStatus)}</div>
                    <div><strong>Created:</strong> {formatTimestamp(selectedMatch.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Rotation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedMatch.rotationDetails.rotationType}</div>
                    <div><strong>Duration:</strong> {formatDate(selectedMatch.rotationDetails.startDate)} - {formatDate(selectedMatch.rotationDetails.endDate)}</div>
                    <div><strong>Weekly Hours:</strong> {selectedMatch.rotationDetails.weeklyHours}</div>
                    {selectedMatch.rotationDetails.location && (
                      <div><strong>Location:</strong> {selectedMatch.rotationDetails.location}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedMatch.aiAnalysis && (
                <div>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Enhanced Score: {selectedMatch.aiAnalysis.enhancedScore}/10</span>
                      <Badge variant={selectedMatch.aiAnalysis.confidence === 'high' ? 'default' : 'secondary'}>
                        {selectedMatch.aiAnalysis.confidence} confidence
                      </Badge>
                    </div>
                    <div>
                      <strong>Analysis:</strong>
                      <p className="text-sm mt-1">{selectedMatch.aiAnalysis.analysis}</p>
                    </div>
                    {selectedMatch.aiAnalysis.strengths.length > 0 && (
                      <div>
                        <strong>Strengths:</strong>
                        <ul className="text-sm mt-1 ml-4">
                          {selectedMatch.aiAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="list-disc">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedMatch.aiAnalysis.concerns.length > 0 && (
                      <div>
                        <strong>Concerns:</strong>
                        <ul className="text-sm mt-1 ml-4">
                          {selectedMatch.aiAnalysis.concerns.map((concern, index) => (
                            <li key={index} className="list-disc text-orange-600">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedMatch.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <strong>Recommendations:</strong>
                        <ul className="text-sm mt-1 ml-4">
                          {selectedMatch.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="list-disc">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Override Score Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Match Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Score: {overrideScore[0]}/10</Label>
              <Slider
                value={overrideScore}
                onValueChange={setOverrideScore}
                max={10}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for override</Label>
              <Textarea
                id="reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you're overriding the score..."
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitOverride} disabled={!overrideReason.trim()}>
                Update Score
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Create Match Dialog */}
      <Dialog open={showForceMatchDialog} onOpenChange={setShowForceMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Create Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={forceMatchData.studentId}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, studentId: e.target.value }))}
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <Label htmlFor="preceptorId">Preceptor ID</Label>
                <Input
                  id="preceptorId"
                  value={forceMatchData.preceptorId}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, preceptorId: e.target.value }))}
                  placeholder="Enter preceptor ID"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={forceMatchData.startDate}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={forceMatchData.endDate}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={forceMatchData.weeklyHours}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="rotationType">Rotation Type</Label>
                <Input
                  id="rotationType"
                  value={forceMatchData.rotationType}
                  onChange={(e) => setForceMatchData(prev => ({ ...prev, rotationType: e.target.value }))}
                  placeholder="e.g., Family Practice"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="forceReason">Reason for force match</Label>
              <Textarea
                id="forceReason"
                value={forceMatchData.reason}
                onChange={(e) => setForceMatchData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why you're force-creating this match..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForceMatchDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleForceMatch}
                disabled={!forceMatchData.studentId || !forceMatchData.preceptorId || !forceMatchData.reason}
              >
                Create Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}