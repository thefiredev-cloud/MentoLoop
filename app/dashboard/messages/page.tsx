'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Archive, 
  ArchiveRestore,
  Clock,
  // User,
  Stethoscope,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  _id: string
  senderId: string
  senderType: 'student' | 'preceptor' | 'system'
  messageType: 'text' | 'file' | 'system_notification'
  content: string
  createdAt: number
  metadata?: {
    systemEventType?: string
  }
}

interface Conversation {
  _id: string
  partner: {
    id: string
    name: string
    type: 'student' | 'preceptor'
  }
  match: {
    id: string
    status: string
    rotationType?: string
    startDate?: string
    endDate?: string
  }
  lastMessagePreview?: string
  lastMessageAt?: number
  unreadCount: number
  status: 'active' | 'archived'
}

export default function MessagesPage() {
  const user = useQuery(api.users.current)
  const isStudent = user?.userType === 'student'
  
  // For students, require intake completion before accessing messages
  if (isStudent) {
    return (
      <RoleGuard requiredRole="student">
        <MessagesContent />
      </RoleGuard>
    )
  }
  
  // For other user types, show messages directly
  return <MessagesContent />
}

function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Queries
  const conversations = useQuery(api.messages.getUserConversations, {
    status: showArchived ? 'archived' : 'active'
  }) as Conversation[] | undefined

  const messages = useQuery(
    api.messages.getMessages,
    selectedConversation
      ? {
          conversationId: selectedConversation as Id<'conversations'>,
          limit: 50,
        }
      : 'skip'
  )

  const totalUnread = useQuery(api.messages.getUnreadMessageCount) || 0

  // Mutations
  const sendMessage = useMutation(api.messages.sendMessage)
  const markAsRead = useMutation(api.messages.markConversationAsRead)
  const updateStatus = useMutation(api.messages.updateConversationStatus)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markAsRead({ conversationId: selectedConversation as Id<'conversations'> })
    }
  }, [selectedConversation, markAsRead])

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    try {
      await sendMessage({
        conversationId: selectedConversation as Id<'conversations'>,
        content: newMessage.trim(),
        messageType: 'text'
      })
      setNewMessage('')
      toast.success('Message sent!')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleArchiveConversation = async (conversationId: string, archive: boolean) => {
    try {
      await updateStatus({
        conversationId: conversationId as Id<'conversations'>,
        status: archive ? 'archived' : 'active'
      })
      toast.success(archive ? 'Conversation archived' : 'Conversation restored')
      
      // If we archived the currently selected conversation, deselect it
      if (archive && selectedConversation === conversationId) {
        setSelectedConversation(null)
      }
    } catch (error) {
      console.error('Failed to update conversation:', error)
      toast.error('Failed to update conversation')
    }
  }

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const selectedConv = conversations?.find(c => c._id === selectedConversation)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-muted-foreground">
                  Secure communication with your {conversations?.[0]?.partner?.type === 'preceptor' ? 'preceptors' : 'students'}
                </p>
              </div>
            </div>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">
                {totalUnread} unread
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-4">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className="text-sm"
                  >
                    {showArchived ? (
                      <>
                        <ArchiveRestore className="h-4 w-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-1" />
                        Archived
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea key="conversations-scroll" className="h-[600px]">
                  {conversations?.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {showArchived ? 'No archived conversations' : 'No active conversations'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations?.map((conversation) => (
                        <div
                          key={conversation._id}
                          className={`p-4 cursor-pointer border-b hover:bg-accent transition-colors ${
                            selectedConversation === conversation._id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation._id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {conversation.partner.type === 'preceptor' ? (
                                  <Stethoscope className="h-4 w-4" />
                                ) : (
                                  <BookOpen className="h-4 w-4" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate">
                                  {conversation.partner.name}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {conversation.match.rotationType || 'Rotation'}
                                </Badge>
                                <Badge 
                                  variant={conversation.match.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {conversation.match.status}
                                </Badge>
                              </div>
                              {conversation.lastMessagePreview && (
                                <p className="text-sm text-muted-foreground truncate mb-1">
                                  {conversation.lastMessagePreview}
                                </p>
                              )}
                              {conversation.lastMessageAt && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatMessageTime(conversation.lastMessageAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          {!showArchived && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleArchiveConversation(conversation._id, true)
                                }}
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {showArchived && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleArchiveConversation(conversation._id, false)
                                }}
                              >
                                <ArchiveRestore className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-8">
            {selectedConversation && selectedConv ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedConv.partner.type === 'preceptor' ? (
                            <Stethoscope className="h-4 w-4" />
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConv.partner.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedConv.match.rotationType || 'Rotation'}
                          </Badge>
                          {selectedConv.match.startDate && selectedConv.match.endDate && (
                            <span className="text-xs text-muted-foreground">
                              {selectedConv.match.startDate} - {selectedConv.match.endDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <Separator />
                
                {/* Messages */}
                <div className="flex-1 flex flex-col min-h-0">
                  <ScrollArea key={`messages-scroll-${selectedConversation}`} className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages?.messages.map((message: Message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.senderType === 'system' 
                              ? 'justify-center' 
                              : message.senderId === selectedConv?.partner.id 
                              ? 'justify-start' 
                              : 'justify-end'
                          }`}
                        >
                          {message.senderType === 'system' ? (
                            <div className="bg-muted px-3 py-2 rounded-lg text-sm text-center max-w-md">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-xs font-medium">System</span>
                              </div>
                              {message.content}
                            </div>
                          ) : (
                            <div
                              className={`max-w-md px-3 py-2 rounded-lg ${
                                message.senderId === selectedConv?.partner.id
                                  ? 'bg-muted text-foreground'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex-shrink-0 p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This is a secure, HIPAA-compliant conversation. Press Enter to send.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}