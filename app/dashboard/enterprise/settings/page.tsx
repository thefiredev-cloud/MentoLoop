'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Building,
  Bell,
  Shield,
  Users,
  Mail,
  Save
} from 'lucide-react'

export default function EnterpriseSettingsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseSettingsContent />
    </RoleGuard>
  )
}

function EnterpriseSettingsContent() {
  return (
    <DashboardContainer
      title="Organization Settings"
      subtitle="Manage your organization's preferences and configuration"
    >
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Update your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" defaultValue="Healthcare Education Partners" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <Input id="org-id" defaultValue="HEP-2024-001" disabled />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" defaultValue="admin@hep.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input id="contact-phone" type="tel" defaultValue="(555) 123-4567" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="123 Education Blvd, Suite 100, New York, NY 10001" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Student Enrollments</p>
              <p className="text-sm text-muted-foreground">Alert when new students join</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Match Confirmations</p>
              <p className="text-sm text-muted-foreground">Notify when matches are confirmed</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage user permissions and access levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Student Self-Enrollment</p>
              <p className="text-sm text-muted-foreground">Students can enroll directly</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Approval for Matches</p>
              <p className="text-sm text-muted-foreground">Review matches before confirmation</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Preceptor Direct Contact</p>
              <p className="text-sm text-muted-foreground">Allow direct communication with preceptors</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </DashboardContainer>
  )
}