'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, Users, AlertCircle, CheckCircle2, Plus, Edit, Save, X, CalendarDays, TimerIcon, UserCheck, Settings, BookOpen, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Types and default data
import { type AvailabilityMap, DEFAULT_AVAILABILITY, weekdayFromDate } from '@/components/preceptor-schedule/types'
import { useScheduleViewModel } from '@/components/preceptor-schedule/useScheduleViewModel'

export default function PreceptorSchedule() {
  const user = useQuery(api.users.current)
  const _preceptor = useQuery(api.preceptors.getByUserId, 
    user ? { userId: user._id } : "skip"
  )

  const [editingAvailability, setEditingAvailability] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityMap>(DEFAULT_AVAILABILITY)
  const [validationErrors, setValidationErrors] = useState<Record<keyof AvailabilityMap, string>>({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  })
  const [timezone, setTimezone] = useState<string>(
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC'
  )
  const updateAvailability = useMutation(api.preceptors.updateAvailability)

  // Helpers to compute overlap/conflicts
  const _dateInRange = (dateStr: string, startStr: string, endStr: string) => {
    const d = new Date(dateStr)
    const s = new Date(startStr)
    const e = new Date(endStr)
    return d >= s && d <= e
  }


  // NOTE: mock data defined below before passing into view model

  const mockUpcomingRotations = [
    {
      _id: "rotation_1",
      student: {
        name: "Emily Rodriguez",
        program: "FNP"
      },
      startDate: "2025-02-15",
      endDate: "2025-04-11",
      specialty: "Family Practice",
      schedule: "Mon-Thu, 8 AM - 5 PM",
      status: "confirmed"
    },
    {
      _id: "rotation_2", 
      student: {
        name: "Sarah Kim",
        program: "FNP"
      },
      startDate: "2025-03-01",
      endDate: "2025-04-25",
      specialty: "Family Practice", 
      schedule: "Mon-Thu, 8 AM - 5 PM",
      status: "pending"
    }
  ]

  const mockTimeOffRequests = [
    {
      _id: "timeoff_1",
      startDate: "2025-03-15",
      endDate: "2025-03-17", 
      reason: "Medical conference - Spring Family Practice Symposium",
      status: "approved",
      impactedStudents: 2
    }
  ]

  const { updateDay, computeDayConflicts } = useScheduleViewModel({
    availability,
    setAvailability,
    timezone,
    mockTimeOffRequests,
    mockUpcomingRotations,
    weekdayFromDate,
  })

  if (!user) {
    return <div>Loading...</div>
  }

  const daysOfWeek: Array<{ key: keyof AvailabilityMap; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const parseTime = (t: string): number => {
    // returns minutes since 00:00, -1 if invalid
    if (!t || typeof t !== 'string') return -1
    const m = t.match(/^(\d{2}):(\d{2})$/)
    if (!m) return -1
    const hh = Number(m[1])
    const mm = Number(m[2])
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return -1
    return hh * 60 + mm
  }

  const validateAvailability = (state: AvailabilityMap): boolean => {
    const nextErrors: Record<keyof AvailabilityMap, string> = {
      monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
    }
    let ok = true
    ;(Object.keys(state) as Array<keyof AvailabilityMap>).forEach((day: keyof AvailabilityMap) => {
      const d = state[day]
      nextErrors[day] = ''
      if (!d.available) return
      const start = parseTime(d.startTime)
      const end = parseTime(d.endTime)
      if (start === -1 || end === -1) {
        ok = false
        nextErrors[day] = 'Please enter valid start and end times (HH:MM)'
        return
      }
      if (end <= start) {
        ok = false
        nextErrors[day] = 'End time must be after start time'
        return
      }
      if (d.maxStudents < 1) {
        ok = false
        nextErrors[day] = 'Max students must be at least 1 when day is available'
        return
      }
      if (d.currentStudents > d.maxStudents) {
        ok = false
        nextErrors[day] = 'Current students exceed maximum capacity'
        return
      }
    })
    setValidationErrors(nextErrors)
    return ok
  }

  const handleSaveAvailability = () => {
    if (!validateAvailability(availability)) {
      toast.error('Please fix highlighted errors before saving')
      return
    }
    ;(async () => {
      try {
        await updateAvailability({
          currentlyAccepting: true,
          preferredStartDates: [],
          timezone,
          weeklySchedule: {
            monday: { available: availability.monday.available, startTime: availability.monday.startTime, endTime: availability.monday.endTime, maxStudents: availability.monday.maxStudents, notes: availability.monday.notes },
            tuesday: { available: availability.tuesday.available, startTime: availability.tuesday.startTime, endTime: availability.tuesday.endTime, maxStudents: availability.tuesday.maxStudents, notes: availability.tuesday.notes },
            wednesday: { available: availability.wednesday.available, startTime: availability.wednesday.startTime, endTime: availability.wednesday.endTime, maxStudents: availability.wednesday.maxStudents, notes: availability.wednesday.notes },
            thursday: { available: availability.thursday.available, startTime: availability.thursday.startTime, endTime: availability.thursday.endTime, maxStudents: availability.thursday.maxStudents, notes: availability.thursday.notes },
            friday: { available: availability.friday.available, startTime: availability.friday.startTime, endTime: availability.friday.endTime, maxStudents: availability.friday.maxStudents, notes: availability.friday.notes },
            saturday: { available: availability.saturday.available, startTime: availability.saturday.startTime, endTime: availability.saturday.endTime, maxStudents: availability.saturday.maxStudents, notes: availability.saturday.notes },
            sunday: { available: availability.sunday.available, startTime: availability.sunday.startTime, endTime: availability.sunday.endTime, maxStudents: availability.sunday.maxStudents, notes: availability.sunday.notes },
          },
        })
        toast.success('Availability saved')
        setEditingAvailability(false)
      } catch (e) {
        console.error(e)
        toast.error('Failed to save availability')
      }
    })()
  }

  

  const renderAvailabilityCard = (day: { key: keyof AvailabilityMap; label: string }) => {
    const dayAvailability = availability[day.key]
    
    return (
      <Card key={day.key} className={`${!dayAvailability.available ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{day.label}</CardTitle>
            <div className="flex items-center gap-2">
              {dayAvailability.available ? (
                <Badge className="bg-accent text-accent-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  <X className="h-3 w-3 mr-1" />
                  Unavailable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {validationErrors[day.key] && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                {validationErrors[day.key]}
              </AlertDescription>
            </Alert>
          )}
          {computeDayConflicts(day.key).length > 0 && (
            <Alert>
              <AlertDescription className="text-xs">
                {computeDayConflicts(day.key).join(' • ')}
              </AlertDescription>
            </Alert>
          )}
          {editingAvailability ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`available-${day.key}`}>Available</Label>
                  <Switch
                    id={`available-${day.key}`}
                    checked={dayAvailability.available}
                    onCheckedChange={(checked) => updateDay(day.key, 'available', checked)}
                  />
                </div>
              </div>

              {dayAvailability.available ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`start-${day.key}`}>Start</Label>
                    <Input
                      id={`start-${day.key}`}
                      type="time"
                      value={dayAvailability.startTime}
                      onChange={(e) => updateDay(day.key, 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`end-${day.key}`}>End</Label>
                    <Input
                      id={`end-${day.key}`}
                      type="time"
                      value={dayAvailability.endTime}
                      onChange={(e) => updateDay(day.key, 'endTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`max-${day.key}`}>Max Students</Label>
                    <Input
                      id={`max-${day.key}`}
                      type="number"
                      min={0}
                      value={dayAvailability.maxStudents}
                      onChange={(e) => updateDay(day.key, 'maxStudents', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor={`notes-${day.key}`}>Notes</Label>
                    <Textarea
                      id={`notes-${day.key}`}
                      value={dayAvailability.notes}
                      onChange={(e) => updateDay(day.key, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">Not available this day</p>
                </div>
              )}
            </div>
          ) : (
            dayAvailability.available ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{dayAvailability.startTime} - {dayAvailability.endTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Students: {dayAvailability.currentStudents}/{dayAvailability.maxStudents}</span>
                  </div>
                  {dayAvailability.currentStudents >= dayAvailability.maxStudents && (
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
                      Full
                    </Badge>
                  )}
                </div>
                {dayAvailability.notes && (
                  <p className="text-xs text-muted-foreground">{dayAvailability.notes}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">No availability set</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage your availability and student rotation schedules
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Days</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(availability).filter(day => day.available).length}
            </div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">Available for students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(availability).reduce((sum, day) => sum + day.currentStudents, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active preceptees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((Object.values(availability).reduce((sum, day) => sum + day.currentStudents, 0) / 
                Object.values(availability).reduce((sum, day) => sum + day.maxStudents, 0)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different schedule views */}
      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Weekly Availability
          </TabsTrigger>
          <TabsTrigger value="rotations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Upcoming Rotations
          </TabsTrigger>
          <TabsTrigger value="timeoff" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Off
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[320px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles'].map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs">Times below are interpreted as {timezone}</span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Weekly Availability</h2>
            <Button 
              variant={editingAvailability ? "outline" : "default"}
              onClick={() => setEditingAvailability(!editingAvailability)}
            >
              {editingAvailability ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Schedule
                </>
              )}
            </Button>
          </div>

          {editingAvailability && (
            <Card className="border border-primary/30 bg-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Edit Mode
                </CardTitle>
                <CardDescription>
                  Click on any day to modify your availability. Changes will be saved when you click &quot;Save Changes&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAvailability}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingAvailability(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {daysOfWeek.map((day) => renderAvailabilityCard(day))}
          </div>

          {/* Availability Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>Configure default settings for your schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-start">Default Start Time</Label>
                  <Input id="default-start" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-end">Default End Time</Label>
                  <Input id="default-end" type="time" defaultValue="17:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-students">Max Students/Day</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Student</SelectItem>
                      <SelectItem value="2">2 Students</SelectItem>
                      <SelectItem value="3">3 Students</SelectItem>
                      <SelectItem value="4">4 Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer-time">Buffer Between Students</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Buffer</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-notes">Schedule Notes</Label>
                <Textarea 
                  id="schedule-notes" 
                  placeholder="Add any special instructions or notes about your schedule..."
                  defaultValue="Family practice clinic hours. Students should arrive 15 minutes early for briefing."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-accept" />
                <Label htmlFor="auto-accept">Automatically accept matches that fit my availability</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Send me notifications for schedule changes</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Rotations</h2>
            <Button asChild>
              <Link href="/dashboard/preceptor/matches">
                <Plus className="h-4 w-4 mr-2" />
                View Pending Matches
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {mockUpcomingRotations.map(rotation => (
              <Card key={rotation._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rotation.student.name}</CardTitle>
                      <CardDescription>{rotation.student.program} • {rotation.specialty}</CardDescription>
                    </div>
                    <Badge
                      variant={rotation.status === 'confirmed' ? 'default' : 'outline'}
                      className={rotation.status === 'confirmed' ? 'bg-accent text-accent-foreground' : 'bg-muted/20 text-muted-foreground'}
                    >
                      {rotation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Start Date</span>
                      </div>
                      <p className="ml-6">{rotation.startDate}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">End Date</span>
                      </div>
                      <p className="ml-6">{rotation.endDate}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Schedule</span>
                      </div>
                      <p className="ml-6">{rotation.schedule}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/preceptor/students/${rotation._id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      Message Student
                    </Button>
                    {rotation.status === 'pending' && (
                      <Button size="sm">
                        Confirm Rotation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockUpcomingRotations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Rotations</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  You don&apos;t have any confirmed rotations scheduled. Check your pending matches to accept new students.
                </p>
                <Button asChild>
                  <Link href="/dashboard/preceptor/matches">
                    View Pending Matches
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeoff" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Time Off Requests</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </div>

          <div className="space-y-4">
            {mockTimeOffRequests.map(request => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.reason}</CardTitle>
                      <CardDescription>{request.startDate} - {request.endDate}</CardDescription>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.impactedStudents > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span>{request.impactedStudents} students will be affected</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Request
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
