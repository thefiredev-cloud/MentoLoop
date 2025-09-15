'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar as CalendarIcon,
  Plus,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

export default function StudentHoursPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showLogForm, setShowLogForm] = useState(false)
  const [hoursWorked, setHoursWorked] = useState('')
  const [selectedRotation, setSelectedRotation] = useState('')
  const [activities, setActivities] = useState('')
  
  const user = useQuery(api.users.current)
  const student = useQuery(api.students.getCurrentStudent)
  const hoursSummary = useQuery(api.clinicalHours.getStudentHoursSummary)
  const recentHours = useQuery(api.clinicalHours.getStudentHours, { limit: 10 })
  const weeklyBreakdown = useQuery(api.clinicalHours.getWeeklyHoursBreakdown, { weeksBack: 8 })
  const activeRotations = useQuery(api.matches.getStudentRotations, 
    student ? { studentId: student._id } : "skip"
  )
  
  const createHoursEntry = useMutation(api.clinicalHours.createHoursEntry)

  if (!user) {
    return <div>Loading...</div>
  }

  // Handle form submission
  const handleSaveEntry = async () => {
    if (!date || !hoursWorked || !selectedRotation || !activities) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const selectedRotationData = activeRotations?.find(r => r._id === selectedRotation)
      
      await createHoursEntry({
        date: date.toISOString().split('T')[0],
        hoursWorked: parseFloat(hoursWorked),
        rotationType: selectedRotationData?.rotationType || 'clinical',
        site: selectedRotationData?.location || 'Clinical Site',
        preceptorName: selectedRotationData?.preceptor,
        activities,
        status: 'submitted',
        matchId: selectedRotationData?._id,
      })
      
      // Reset form
      setDate(new Date())
      setHoursWorked('')
      setSelectedRotation('')
      setActivities('')
      setShowLogForm(false)
      
      toast.success('Hours logged successfully!')
    } catch (_error) {
      // Failed to log hours
      toast.error('Failed to log hours. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'submitted':
        return <Badge variant="secondary">Pending</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'needs-revision':
        return <Badge className="bg-yellow-500">Needs Revision</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const progressPercentage = hoursSummary?.progressPercentage || 0

  const creditsRemaining = hoursSummary?.credits?.totalRemaining || 0
  const nextExpiration = hoursSummary?.credits?.nextExpiration
    ? new Date(hoursSummary.credits.nextExpiration).toLocaleDateString()
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hours Tracking</h1>
          <p className="text-muted-foreground">
            Log and track your clinical rotation hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowLogForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Hours
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoursSummary?.thisWeekHours || 0}h</div>
            <p className="text-xs text-muted-foreground">
              Target: 32h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hoursSummary?.totalHours || 0}h
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(hoursSummary?.totalRequiredHours || 640) - (hoursSummary?.totalHours || 0)}h remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoursSummary?.averageWeeklyHours || 0}h</div>
            <p className="text-xs text-muted-foreground">
              Per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditsRemaining}h</div>
            <p className="text-xs text-muted-foreground">
              {nextExpiration ? `Next expires: ${nextExpiration}` : 'No active credits'}
            </p>
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => {
                window.location.href = '/student-intake'
              }}>Buy More Hours</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hours Log Form Modal */}
      {showLogForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Log Clinical Hours</span>
              <Button variant="ghost" onClick={() => setShowLogForm(false)}>×</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <Input
                        type="date"
                        value={date ? format(date, "yyyy-MM-dd") : ""}
                        onChange={(e) => setDate(new Date(e.target.value))}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Worked</Label>
                <Input
                  id="hours"
                  type="number"
                  placeholder="8"
                  min="0"
                  max="12"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotation">Rotation/Site</Label>
              <Select value={selectedRotation} onValueChange={setSelectedRotation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rotation" />
                </SelectTrigger>
                <SelectContent>
                  {activeRotations?.filter(r => r.status === 'active' || r.status === 'confirmed').map((rotation) => (
                    <SelectItem key={rotation._id} value={rotation._id}>
                      {rotation.title} - {rotation.preceptor}
                    </SelectItem>
                  ))}
                  {(!activeRotations || activeRotations.length === 0) && (
                    <SelectItem value="general" disabled>
                      No active rotations found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities & Learning Objectives</Label>
              <Textarea
                id="activities"
                placeholder="Describe your clinical activities, procedures performed, and learning objectives met..."
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry}>
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hours Log */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Entries</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Hour Entries</CardTitle>
              <CardDescription>Your latest clinical hour submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHours && recentHours.length > 0 ? recentHours.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatDate(entry.date)}</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.hoursWorked}h • {entry.site}
                        </span>
                        {getStatusBadge(entry.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.activities}
                      </p>
                      {entry.preceptorName && (
                        <p className="text-xs text-muted-foreground">
                          Preceptor: {entry.preceptorName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hours logged yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowLogForm(true)}
                    >
                      Log Your First Entry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Hours Summary</CardTitle>
              <CardDescription>Hours logged by week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyBreakdown && weeklyBreakdown.length > 0 ? (
                  <div className="grid gap-4">
                    {weeklyBreakdown.map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{week.weekLabel}</div>
                          <div className="text-sm text-muted-foreground">
                            {week.entriesCount} {week.entriesCount === 1 ? 'entry' : 'entries'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{week.totalHours}h</div>
                          <div className={`text-sm ${
                            week.totalHours >= 32 ? 'text-green-600' : 
                            week.totalHours >= 20 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {week.totalHours >= 32 ? 'Complete' : 
                             week.totalHours >= 20 ? 'Partial' : 'Low'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No weekly data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hours Analytics
              </CardTitle>
              <CardDescription>Track your progress and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {hoursSummary?.hoursByRotation && Object.keys(hoursSummary.hoursByRotation).length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3">Progress by Rotation Type</h4>
                    <div className="space-y-2">
                      {Object.entries(hoursSummary.hoursByRotation).map(([rotationType, hours]) => {
                        const targetHours = 160; // Standard rotation hours
                        const percentage = Math.min((hours / targetHours) * 100, 100);
                        return (
                          <div key={rotationType}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{rotationType.replace('-', ' ')}</span>
                              <span>{hours}/{targetHours} hours</span>
                            </div>
                            <Progress value={percentage} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No rotation data available yet</p>
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Average Weekly Hours</h4>
                    <div className="text-2xl font-bold">{hoursSummary?.averageWeeklyHours || 0}h</div>
                    <p className="text-sm text-muted-foreground">Based on recent weeks</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Total Entries</h4>
                    <div className="text-2xl font-bold">{hoursSummary?.entriesCount || 0}</div>
                    <p className="text-sm text-muted-foreground">Hours logged to date</p>
                  </div>
                </div>
                
                {(hoursSummary?.pendingApprovals ?? 0) > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        {hoursSummary?.pendingApprovals ?? 0} entries awaiting approval
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
