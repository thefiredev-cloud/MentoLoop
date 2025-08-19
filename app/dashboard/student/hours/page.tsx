'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  
  const user = useQuery(api.users.current)

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock hours data - replace with actual data
  const mockHoursData = {
    weeklyEntries: [
      {
        id: '1',
        date: '2025-01-13',
        rotation: 'Family Practice - Dr. Johnson',
        hours: 8,
        activities: 'Patient consultations, wound care, medication reviews',
        status: 'approved',
        submittedAt: '2025-01-13T17:00:00Z'
      },
      {
        id: '2',
        date: '2025-01-14',
        rotation: 'Family Practice - Dr. Johnson',
        hours: 8,
        activities: 'Physical exams, health screenings, patient education',
        status: 'approved',
        submittedAt: '2025-01-14T17:00:00Z'
      },
      {
        id: '3',
        date: '2025-01-15',
        rotation: 'Family Practice - Dr. Johnson',
        hours: 8,
        activities: 'Chronic disease management, documentation',
        status: 'pending',
        submittedAt: '2025-01-15T17:00:00Z'
      },
      {
        id: '4',
        date: '2025-01-16',
        rotation: 'Family Practice - Dr. Johnson',
        hours: 8,
        activities: 'Emergency evaluations, diagnostic procedures',
        status: 'pending',
        submittedAt: '2025-01-16T17:00:00Z'
      }
    ],
    summary: {
      thisWeek: 32,
      totalCompleted: 128,
      totalRequired: 200,
      averageWeekly: 28,
      onTrack: true
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
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

  const progressPercentage = (mockHoursData.summary.totalCompleted / mockHoursData.summary.totalRequired) * 100

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
            <div className="text-2xl font-bold">{mockHoursData.summary.thisWeek}h</div>
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
              {mockHoursData.summary.totalCompleted}h
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockHoursData.summary.totalRequired - mockHoursData.summary.totalCompleted}h remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockHoursData.summary.averageWeekly}h</div>
            <p className="text-xs text-muted-foreground">
              Per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {mockHoursData.summary.onTrack ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">On Track</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Behind</span>
                </>
              )}
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotation">Rotation/Site</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select rotation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family-practice">Family Practice - Dr. Johnson</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics - Dr. Thompson</SelectItem>
                  <SelectItem value="mental-health">Mental Health - Dr. Park</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities & Learning Objectives</Label>
              <Textarea
                id="activities"
                placeholder="Describe your clinical activities, procedures performed, and learning objectives met..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogForm(false)}>
                Cancel
              </Button>
              <Button>
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
                {mockHoursData.weeklyEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatDate(entry.date)}</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.hours}h • {entry.rotation}
                        </span>
                        {getStatusBadge(entry.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.activities}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Week of Jan 13, 2025</div>
                      <div className="text-sm text-muted-foreground">Family Practice</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">32h</div>
                      <div className="text-sm text-green-600">Complete</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Week of Jan 6, 2025</div>
                      <div className="text-sm text-muted-foreground">Family Practice</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">28h</div>
                      <div className="text-sm text-yellow-600">Partial</div>
                    </div>
                  </div>
                </div>
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
                <div>
                  <h4 className="font-medium mb-3">Progress by Rotation Type</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Family Practice</span>
                        <span>128/160 hours</span>
                      </div>
                      <Progress value={80} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pediatrics</span>
                        <span>0/40 hours</span>
                      </div>
                      <Progress value={0} />
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Average Daily Hours</h4>
                    <div className="text-2xl font-bold">7.2h</div>
                    <p className="text-sm text-muted-foreground">Based on active days</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Completion Timeline</h4>
                    <div className="text-2xl font-bold">3 weeks</div>
                    <p className="text-sm text-muted-foreground">At current pace</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}