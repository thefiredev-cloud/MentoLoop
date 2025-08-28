'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Server,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  Brain,
  Globe,
  Shield,
  Activity
} from 'lucide-react'

interface ServiceStatus {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  responseTime?: number
  details?: Record<string, unknown>
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  environment: string
  checks: ServiceStatus[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
  dashboardAccess: {
    authenticated: boolean
    dashboardUrl: string
  }
}

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Clerk Auth': Shield,
  'Convex Database': Database,
  'Stripe Payments': CreditCard,
  'SendGrid Email': Mail,
  'Twilio SMS': MessageSquare,
  'OpenAI': Brain,
  'Google Gemini': Brain,
  'Environment': Server,
  'Default': Activity
}

export function SystemStatus() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const fetchHealthStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/dashboard-health')
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`)
      }
      
      const data: HealthCheckResponse = await response.json()
      setHealthData(data)
      setLastChecked(new Date())
    } catch (err) {
      console.error('Failed to fetch health status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch health status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchHealthStatus, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
      case 'unhealthy':
        return <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getOverallStatusColor = () => {
    if (!healthData) return 'bg-gray-500'
    switch (healthData.status) {
      case 'healthy':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'unhealthy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={fetchHealthStatus} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!healthData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(healthData.status)}
            <Button
              onClick={fetchHealthStatus}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Overall Health</span>
            <span>{healthData.summary.healthy}/{healthData.summary.total} Services</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${getOverallStatusColor()}`}
              style={{ width: `${(healthData.summary.healthy / healthData.summary.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Service Status List */}
        <div className="space-y-2">
          {healthData.checks.map((check) => {
            const Icon = serviceIcons[check.service] || serviceIcons.Default
            
            return (
              <div 
                key={check.service}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{check.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  {check.responseTime && (
                    <span className="text-xs text-muted-foreground">
                      {check.responseTime}ms
                    </span>
                  )}
                  {check.message && (
                    <span className="text-xs text-red-500">
                      {check.message}
                    </span>
                  )}
                  {check.details?.mode && typeof check.details.mode === 'string' ? (
                    <Badge variant="outline" className="text-xs">
                      {String(check.details.mode)}
                    </Badge>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* Environment Info */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Environment: {healthData.environment}</span>
            <span>
              {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        {/* Warning for unhealthy services */}
        {healthData.summary.unhealthy > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {healthData.summary.unhealthy} service(s) are experiencing issues. 
              Dashboard functionality may be limited.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}