'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  User, 
  GraduationCap, 
  Edit2,
  Save,
  Camera,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

const DEGREE_TRACK_OPTIONS = ['FNP', 'PNP', 'PMHNP', 'AGNP', 'ACNP', 'WHNP', 'NNP', 'DNP'] as const
const PROGRAM_FORMAT_OPTIONS = ['online', 'in-person', 'hybrid'] as const

export default function StudentProfilePage() {
  return (
    <RoleGuard requiredRole="student">
      <StudentProfileContent />
    </RoleGuard>
  )
}

function StudentProfileContent() {
  const user = useQuery(api.users.current)
  const student = useQuery(api.students.getByUserId, user ? { userId: user._id } : 'skip')
  const updateProfile = useMutation(api.students.updateProfileBasics)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSettingsModal, setActiveSettingsModal] = useState<null | 'email' | 'sms' | 'privacy'>(null)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState({
    emailNotifications: true,
    smsNotifications: true,
    profileVisibility: 'network' as 'network' | 'private',
  })
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    linkedinOrResume: '',
    programName: '',
    degreeTrack: '',
    expectedGraduation: '',
    programFormat: '',
  })

  useEffect(() => {
    if (!student) return

    const [studentFirstName = '', ...rest] = (student.personalInfo?.fullName || '').split(' ')
    setFormState({
      firstName: studentFirstName,
      lastName: rest.join(' ').trim(),
      phone: student.personalInfo?.phone ?? '',
      linkedinOrResume: student.personalInfo?.linkedinOrResume ?? '',
      programName: student.schoolInfo?.programName ?? '',
      degreeTrack: student.schoolInfo?.degreeTrack ?? '',
      expectedGraduation: student.schoolInfo?.expectedGraduation ?? '',
      programFormat: student.schoolInfo?.programFormat ?? '',
    })
  }, [student])

  useEffect(() => {
    if (!student) return
    setSettingsDraft({
      emailNotifications: student.personalInfo.preferredContact !== 'text',
      smsNotifications: student.personalInfo.preferredContact !== 'email',
      profileVisibility: student.rotationNeeds.willingToTravel ? 'network' : 'private',
    })
  }, [student])

  const openSettingsModal = (type: 'email' | 'sms' | 'privacy') => {
    if (!student) {
      toast.error('Profile must finish loading before adjusting settings')
      return
    }
    setActiveSettingsModal(type)
  }

  const handleSettingsSave = async () => {
    setSettingsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success('Account settings updated')
      setActiveSettingsModal(null)
    } catch (error) {
      console.error('Failed to persist settings draft', error)
      toast.error('Unable to update settings right now')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const derivedFirstName = formState.firstName || student?.personalInfo?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'
  const derivedLastName = formState.lastName || student?.personalInfo?.fullName?.split(' ').slice(1).join(' ')?.trim() || ''
  const displayFullName = `${derivedFirstName} ${derivedLastName}`.trim()

  const handleSave = async () => {
    if (!student) return

    const trimmedFirst = formState.firstName.trim()
    const trimmedLast = formState.lastName.trim()
    const trimmedPhone = formState.phone.trim()

    if (!trimmedFirst || !trimmedLast) {
      toast.error('First and last name are required')
      return
    }

    if (!trimmedPhone) {
      toast.error('Phone number is required')
      return
    }

    const personalUpdates: Record<string, string> = {}
    const schoolUpdates: Record<string, string> = {}

    const nextFullName = `${trimmedFirst} ${trimmedLast}`.trim()
    if (nextFullName !== student.personalInfo.fullName) {
      personalUpdates.fullName = nextFullName
    }

    if (trimmedPhone !== student.personalInfo.phone) {
      personalUpdates.phone = trimmedPhone
    }

    const trimmedLinkedin = formState.linkedinOrResume.trim()
    if (trimmedLinkedin !== (student.personalInfo.linkedinOrResume ?? '')) {
      personalUpdates.linkedinOrResume = trimmedLinkedin
    }

    const trimmedProgramName = formState.programName.trim()
    if (trimmedProgramName && trimmedProgramName !== student.schoolInfo.programName) {
      schoolUpdates.programName = trimmedProgramName
    }

    const normalizedDegree = formState.degreeTrack.trim().toUpperCase()
    if (normalizedDegree && normalizedDegree !== student.schoolInfo.degreeTrack) {
      const validDegree = (DEGREE_TRACK_OPTIONS as readonly string[]).includes(normalizedDegree)
      if (!validDegree) {
        toast.error('Degree track must be one of: ' + DEGREE_TRACK_OPTIONS.join(', '))
        return
      }
      schoolUpdates.degreeTrack = normalizedDegree
    }

    if (formState.expectedGraduation && formState.expectedGraduation !== student.schoolInfo.expectedGraduation) {
      schoolUpdates.expectedGraduation = formState.expectedGraduation
    }

    const normalizedFormat = formState.programFormat.trim().toLowerCase()
    if (normalizedFormat && normalizedFormat !== student.schoolInfo.programFormat) {
      const validFormat = (PROGRAM_FORMAT_OPTIONS as readonly string[]).includes(normalizedFormat)
      if (!validFormat) {
        toast.error('Program format must be online, in-person, or hybrid')
        return
      }
      schoolUpdates.programFormat = normalizedFormat
    }

    if (Object.keys(personalUpdates).length === 0 && Object.keys(schoolUpdates).length === 0) {
      toast.info('No changes to save')
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      await updateProfile({
        personalInfo: Object.keys(personalUpdates).length ? personalUpdates : undefined,
        schoolInfo: Object.keys(schoolUpdates).length ? schoolUpdates : undefined,
      })
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Button
          onClick={() => {
            if (isEditing) {
              handleSave()
            } else {
              setIsEditing(true)
            }
          }}
          variant={isEditing ? 'default' : 'outline'}
          disabled={isEditing && isSaving}
        >
          {isEditing ? (
            isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )
          ) : (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  {derivedFirstName?.[0]?.toUpperCase() || 'U'}
                  {derivedLastName?.[0]?.toUpperCase() || ''}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button type="button" className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-semibold">{displayFullName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex gap-2 pt-2">
                <Badge variant="secondary">NP Student</Badge>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formState.firstName}
                  onChange={handleInputChange('firstName')}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formState.lastName}
                  onChange={handleInputChange('lastName')}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={user?.email ?? ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formState.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                placeholder="Enter your address"
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school">Nursing School</Label>
              <Input 
                id="school"
                placeholder="Your nursing school"
                value={formState.programName}
                onChange={handleInputChange('programName')}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program Type</Label>
              <Input 
                id="program"
                placeholder="e.g., FNP, PMHNP, AGNP"
                value={formState.degreeTrack}
                onChange={handleInputChange('degreeTrack')}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate"
                  type="date"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradDate">Expected Graduation</Label>
                <Input 
                  id="gradDate"
                  type="date"
                  value={formState.expectedGraduation}
                  onChange={handleInputChange('expectedGraduation')}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialty Interests</Label>
              <Textarea 
                id="specialties"
                placeholder="List your specialty interests"
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Goals & Bio</CardTitle>
          <CardDescription>
            Tell us about your career goals and professional interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Share your professional goals, interests, and what you hope to achieve during your clinical rotations..."
            disabled={!isEditing}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about matches and rotations</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openSettingsModal('email')}>
              Configure
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Get text alerts for important updates</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openSettingsModal('sms')}>
              Configure
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Privacy Settings</p>
              <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openSettingsModal('privacy')}>
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={activeSettingsModal !== null} onOpenChange={(isOpen) => !isOpen && !settingsSaving && setActiveSettingsModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeSettingsModal === 'email' && 'Email Notifications'}
              {activeSettingsModal === 'sms' && 'SMS Notifications'}
              {activeSettingsModal === 'privacy' && 'Privacy Controls'}
            </DialogTitle>
            <DialogDescription>
              {activeSettingsModal === 'email' && 'Choose when MentoLoop sends a recap to your inbox.'}
              {activeSettingsModal === 'sms' && 'Toggle rotation alerts and time-sensitive updates.'}
              {activeSettingsModal === 'privacy' && 'Decide who can view your profile details inside the network.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {activeSettingsModal === 'email' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Match offers</p>
                    <p className="text-xs text-muted-foreground">Send an email whenever a new match is assigned.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.emailNotifications}
                    onCheckedChange={(checked) => setSettingsDraft((prev) => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Weekly summary</p>
                    <p className="text-xs text-muted-foreground">Recap outstanding tasks each Monday morning.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.emailNotifications}
                    onCheckedChange={(checked) => setSettingsDraft((prev) => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
              </div>
            )}

            {activeSettingsModal === 'sms' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Rotation reminders</p>
                    <p className="text-xs text-muted-foreground">Text me 24 hours before a scheduled rotation.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.smsNotifications}
                    onCheckedChange={(checked) => setSettingsDraft((prev) => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Billing alerts</p>
                    <p className="text-xs text-muted-foreground">Notify me when payments are processed or due.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.smsNotifications}
                    onCheckedChange={(checked) => setSettingsDraft((prev) => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
              </div>
            )}

            {activeSettingsModal === 'privacy' && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="profile-visibility">Profile visibility</Label>
                  <Select
                    value={settingsDraft.profileVisibility}
                    onValueChange={(value) => setSettingsDraft((prev) => ({ ...prev, profileVisibility: value as 'network' | 'private' }))}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="network">Visible to matched preceptors</SelectItem>
                      <SelectItem value="private">Visible only to admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-xs text-muted-foreground">
                  Visibility changes only affect future match suggestions. Existing rotations keep their access.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => !settingsSaving && setActiveSettingsModal(null)} disabled={settingsSaving}>
              Cancel
            </Button>
            <Button onClick={handleSettingsSave} disabled={settingsSaving}>
              {settingsSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
