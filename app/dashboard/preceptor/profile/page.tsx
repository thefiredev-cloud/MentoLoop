'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Stethoscope,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function PreceptorProfile() {
  const user = useQuery(api.users.current)
  const preceptor = useQuery(api.preceptors.getByUserId, 
    user ? { userId: user._id } : "skip"
  )

  const [editMode, setEditMode] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  if (!preceptor) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Complete your preceptor profile</p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Complete</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              You haven&apos;t completed your preceptor intake yet. Complete it to start receiving student matches.
            </p>
            <Button asChild>
              <Link href="/preceptor-intake">
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your preceptor information</p>
          </div>
          <Button 
            variant={editMode ? "outline" : "default"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                  <p className="text-base">{preceptor.personalInfo.fullName}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Professional Title</span>
                  <p className="text-base">{preceptor.personalInfo.licenseType} - {preceptor.personalInfo.specialty}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <p className="text-base">{preceptor.personalInfo.email}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Phone</span>
                  <p className="text-base">{preceptor.personalInfo.mobilePhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Practice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Clinic/Practice Name</span>
                  <p className="text-base">{preceptor.practiceInfo.practiceName}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Specialty</span>
                  <p className="text-base">{preceptor.personalInfo.specialty}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Practice Setting</span>
                  <p className="text-base">{preceptor.practiceInfo.practiceSettings.join(', ')}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Years in Practice</span>
                  <p className="text-base">Not specified</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Practice Address</span>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-base">{preceptor.practiceInfo.address}</p>
                    <p className="text-base">
                      {preceptor.practiceInfo.city}, {preceptor.practiceInfo.state} {preceptor.practiceInfo.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Credentials & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">NPI Number</span>
                  <p className="text-base font-mono">{preceptor.personalInfo.npiNumber}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">License Number</span>
                  <p className="text-base font-mono">Not specified</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">License State</span>
                  <p className="text-base">{preceptor.personalInfo.statesLicensed.join(', ')}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">License Expiration</span>
                  <p className="text-base">Not specified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentoring Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Mentoring Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Teaching Style</span>
                <p className="text-base">{preceptor.mentoringStyle.mentoringApproach}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Communication Preference</span>
                <p className="text-base">{preceptor.mentoringStyle.feedbackApproach}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Previous Mentoring Experience</span>
                <p className="text-base">{preceptor.mentoringStyle.studentsPrecepted || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Profile Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">NPI Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">License Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Background Check</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mentorship Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Students Mentored</span>
                <Badge variant="outline">47</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Average Rating</span>
                <Badge variant="outline">4.8/5.0</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <Badge variant="outline">96%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Years Mentoring</span>
                <Badge variant="outline">8 years</Badge>
              </div>
            </CardContent>
          </Card>

          {/* MentorFit Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">MentorFit™ Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">9.2/10</div>
                <p className="text-xs text-muted-foreground">Compatibility Score</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Teaching Style</span>
                  <span className="font-mono">Hands-on</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Communication</span>
                  <span className="font-mono">Direct</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Specialty Focus</span>
                  <span className="font-mono">Family</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/preceptor-intake">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/dashboard/preceptor/schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/dashboard/billing">
                  <Building className="h-4 w-4 mr-2" />
                  Billing Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}