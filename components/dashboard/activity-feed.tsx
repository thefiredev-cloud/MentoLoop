'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Target, Calendar, FileCheck, CreditCard, MessageSquare, Settings, ClipboardList } from "lucide-react"

interface ActivityItem {
  id: string
  type: 'match' | 'rotation' | 'evaluation' | 'payment' | 'message' | 'system'
  title: string
  description: string
  timestamp: number
  status?: 'success' | 'warning' | 'error' | 'info'
  actor?: {
    name: string
    type: 'student' | 'preceptor' | 'admin' | 'system'
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
  showAll?: boolean
  maxItems?: number
}

export function ActivityFeed({ 
  activities, 
  title = "Recent Activity",
  showAll = false,
  maxItems = 5 
}: ActivityFeedProps) {
  const displayedActivities = showAll ? activities : activities.slice(0, maxItems)

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'match':
        return <Target className="w-4 h-4 text-muted-foreground" />
      case 'rotation':
        return <Calendar className="w-4 h-4 text-muted-foreground" />
      case 'evaluation':
        return <FileCheck className="w-4 h-4 text-muted-foreground" />
      case 'payment':
        return <CreditCard className="w-4 h-4 text-muted-foreground" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-muted-foreground" />
      case 'system':
        return <Settings className="w-4 h-4 text-muted-foreground" />
      default:
        return <ClipboardList className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null
    
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      info: 'outline'
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    )
  }

  const getActorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {!showAll && activities.length > maxItems && (
            <span className="text-sm text-muted-foreground font-normal">
              +{activities.length - maxItems} more
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <p>No recent activity</p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center">{getActivityIcon(activity.type)}</span>
                  {activity.actor && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getActorInitials(activity.actor.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.actor && (
                    <p className="text-xs text-muted-foreground mt-1">
                      by {activity.actor.name}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}