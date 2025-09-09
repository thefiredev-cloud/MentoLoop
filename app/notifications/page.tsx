'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Archive,
  Trash2,
  CheckCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Mock notifications for now - would be replaced with real data from Convex
const mockNotifications = [
  {
    id: '1',
    type: 'match',
    title: 'New Match Available',
    description: 'You have a new preceptor match to review',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: 'high',
    icon: Users,
    actionUrl: '/dashboard/student/matches'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    description: 'Your payment for the Pro Block has been processed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: 'normal',
    icon: DollarSign,
    actionUrl: '/dashboard/billing'
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Rotation Starting Soon',
    description: 'Your rotation with Dr. Smith starts in 3 days',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: false,
    priority: 'high',
    icon: Calendar,
    actionUrl: '/dashboard/student/rotations'
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message from Preceptor',
    description: 'Dr. Johnson sent you a message about your schedule',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    read: true,
    priority: 'normal',
    icon: MessageSquare,
    actionUrl: '/dashboard/messages'
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Update Required',
    description: 'Please update your clinical requirements for the new semester',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
    read: false,
    priority: 'low',
    icon: Info,
    actionUrl: '/dashboard/student/profile'
  }
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'match':
      return Users
    case 'payment':
      return DollarSign
    case 'reminder':
      return Calendar
    case 'message':
      return MessageSquare
    case 'system':
    default:
      return Info
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'normal':
      return 'text-blue-500'
    case 'low':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive" className="text-xs">High</Badge>
    case 'normal':
      return <Badge variant="default" className="text-xs">Normal</Badge>
    case 'low':
      return <Badge variant="secondary" className="text-xs">Low</Badge>
    default:
      return null
  }
}

export default function NotificationsPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  // In a real app, this would fetch from Convex
  const user = useQuery(api.users.current)
  const notifications = mockNotifications

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleMarkAsRead = () => {
    // In a real app, this would update the database
    // Marking as read
    setSelectedNotifications([])
  }

  const handleDelete = () => {
    // In a real app, this would update the database
    // Deleting notifications
    setSelectedNotifications([])
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view notifications</h3>
            <p className="text-muted-foreground">
              You need to be signed in to access your notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedNotifications.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 border-b">
                <Checkbox 
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select all
                </span>
              </div>

              {/* Notifications List */}
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''} ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => handleSelectNotification(notification.id)}
                        />
                        <div className={`p-2 rounded-lg ${!notification.read ? 'bg-primary/10' : 'bg-secondary'}`}>
                          <Icon className={`h-5 w-5 ${getPriorityColor(notification.priority)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {notification.title}
                                {!notification.read && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                                {getPriorityBadge(notification.priority)}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                            {notification.actionUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={notification.actionUrl}>
                                  View
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/dashboard/settings#notifications">
              Manage Preferences
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}