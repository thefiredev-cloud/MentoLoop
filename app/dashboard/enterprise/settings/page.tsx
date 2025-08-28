'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  CreditCard, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Edit2
} from 'lucide-react'
import { useState } from 'react'

export default function EnterpriseSettingsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseSettingsContent />
    </RoleGuard>
  )
}

function EnterpriseSettingsContent() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
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
              Edit Settings
            </>
          )}
        </Button>
      </div>

      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Profile
          </CardTitle>
          <CardDescription>
            Manage your organization&apos;s basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input 
                id="orgName"
                defaultValue="Healthcare University System"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgType">Organization Type</Label>
              <Input 
                id="orgType"
                defaultValue="Academic Medical Center"
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              rows={3}
              defaultValue="Leading healthcare education institution providing comprehensive nurse practitioner training programs."
              disabled={!isEditing}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                type="url"
                defaultValue="https://healthcareuniversity.edu"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input 
                id="taxId"
                defaultValue="XX-XXXXXXX"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryContact">Primary Contact Name</Label>
              <Input 
                id="primaryContact"
                defaultValue="Dr. Jane Smith"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactTitle">Title</Label>
              <Input 
                id="contactTitle"
                defaultValue="Director of Clinical Education"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email"
                defaultValue="admin@healthcareuniversity.edu"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                defaultValue="+1 (555) 123-4567"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Mailing Address</Label>
            <Textarea 
              id="address"
              rows={2}
              defaultValue="123 Medical Center Drive, Suite 500, Healthcare City, HC 12345"
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Program Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Program Settings</CardTitle>
          <CardDescription>
            Configure your educational program parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input 
                id="maxStudents"
                type="number"
                defaultValue="200"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rotationLength">Default Rotation Length (weeks)</Label>
              <Input 
                id="rotationLength"
                type="number"
                defaultValue="12"
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve Student Enrollments</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve students who meet criteria
                </p>
              </div>
              <Switch disabled={!isEditing} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Preceptor Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Manually verify all preceptor applications
                </p>
              </div>
              <Switch defaultChecked disabled={!isEditing} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Student Self-Matching</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to search and request specific preceptors
                </p>
              </div>
              <Switch defaultChecked disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Student Enrollments</Label>
                <p className="text-sm text-muted-foreground">Get notified when students join</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={isEditing ? "default" : "secondary"}>Email</Badge>
                <Badge variant="outline">SMS</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rotation Completions</Label>
                <p className="text-sm text-muted-foreground">Notifications for completed rotations</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={isEditing ? "default" : "secondary"}>Email</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compliance Alerts</Label>
                <p className="text-sm text-muted-foreground">Important compliance notifications</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={isEditing ? "default" : "secondary"}>Email</Badge>
                <Badge variant={isEditing ? "default" : "secondary"}>SMS</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">Automated monthly report delivery</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={isEditing ? "default" : "secondary"}>Email</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all organization administrators
              </p>
            </div>
            <Switch defaultChecked disabled={!isEditing} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Single Sign-On (SSO)</p>
              <p className="text-sm text-muted-foreground">
                Configure SSO with your identity provider
              </p>
            </div>
            <Button variant="outline" size="sm" disabled={!isEditing}>Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">API Access</p>
              <p className="text-sm text-muted-foreground">
                Manage API keys for integrations
              </p>
            </div>
            <Button variant="outline" size="sm" disabled={!isEditing}>Manage Keys</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export All Data</p>
              <p className="text-sm text-muted-foreground">
                Download all organization data in CSV format
              </p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your organization and all data
              </p>
            </div>
            <Button variant="destructive" disabled>Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}