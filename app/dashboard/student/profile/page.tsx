'use client'

import { useQuery } from 'convex/react'
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
  User, 
  GraduationCap, 
  Edit2,
  Save,
  Camera
} from 'lucide-react'
import { useState } from 'react'

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
  const [isEditing, setIsEditing] = useState(false)
  
  // Use student data if available, otherwise use user email
  const firstName = student?.personalInfo?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'
  const lastName = student?.personalInfo?.fullName?.split(' ').slice(1).join(' ') || ''
  const fullName = student?.personalInfo?.fullName || `${firstName} ${lastName}`.trim()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
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
                <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <button type="button" className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-semibold">{fullName}</h2>
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
                  defaultValue={firstName}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  defaultValue={lastName}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                defaultValue={user?.email}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="+1 (555) 123-4567"
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
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program Type</Label>
              <Input 
                id="program"
                placeholder="e.g., Family NP, Adult-Gerontology NP"
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
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Get text alerts for important updates</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Privacy Settings</p>
              <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
