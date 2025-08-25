'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  Stethoscope, 
  Building2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react'

export function DemoRoleSwitcher() {
  const router = useRouter()
  const user = useQuery(api.users.current)
  const updateUserType = useMutation(api.users.updateUserType)
  const [isChanging, setIsChanging] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!user) {
    return null
  }

  const roles = [
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      color: 'bg-blue-500',
      dashboard: '/dashboard/student'
    },
    {
      value: 'preceptor',
      label: 'Preceptor',
      icon: Stethoscope,
      color: 'bg-green-500',
      dashboard: '/dashboard/preceptor'
    },
    {
      value: 'enterprise',
      label: 'Institution',
      icon: Building2,
      color: 'bg-purple-500',
      dashboard: '/dashboard/enterprise'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: ShieldCheck,
      color: 'bg-red-500',
      dashboard: '/dashboard/admin'
    }
  ]

  const currentRole = roles.find(r => r.value === user.userType)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.userType) return
    
    setIsChanging(true)
    try {
      await updateUserType({
        userId: user._id,
        userType: newRole as 'student' | 'preceptor' | 'admin' | 'enterprise'
      })
      
      // Redirect to the appropriate dashboard
      const role = roles.find(r => r.value === newRole)
      if (role) {
        router.push(role.dashboard)
      }
    } catch (error) {
      console.error('Error changing role:', error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Demo Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Current Role
          </Badge>
          {currentRole && (
            <div className="flex items-center gap-1">
              <currentRole.icon className="h-3 w-3" />
              <span className="text-sm font-medium">{currentRole.label}</span>
            </div>
          )}
        </div>
        
        <Select
          value={user.userType || ''}
          onValueChange={handleRoleChange}
          disabled={isChanging}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Switch role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                <div className="flex items-center gap-2">
                  <role.icon className="h-4 w-4" />
                  <span>{role.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground">Quick Links</p>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() => router.push('/student-intake')}
            >
              Student Intake
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() => router.push('/preceptor-intake')}
            >
              Preceptor Intake
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() => router.push('/dashboard')}
            >
              Main Dashboard
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Development only</p>
          <p>User ID: {user.externalId.slice(0, 8)}...</p>
        </div>
      </CardContent>
    </Card>
  )
}