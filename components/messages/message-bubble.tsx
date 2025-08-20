'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Clock,
  Stethoscope,
  BookOpen,
  Check,
  CheckCheck
} from 'lucide-react'

interface MessageBubbleProps {
  message: {
    _id: string
    senderId: string
    senderType: 'student' | 'preceptor' | 'system'
    messageType: 'text' | 'file' | 'system_notification'
    content: string
    createdAt: number
    editedAt?: number
    metadata?: {
      systemEventType?: string
      fileName?: string
      fileSize?: number
      fileType?: string
      fileUrl?: string
    }
    readBy?: Array<{
      userId: string
      readAt: number
    }>
  }
  currentUserId: string
  partnerName?: string
  partnerType?: 'student' | 'preceptor'
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ 
    message, 
    currentUserId, 
    partnerName,
    partnerType,
    onEdit, 
    onDelete, 
    showAvatar = true,
    showTimestamp = true,
    className,
    ...props 
  }, ref) => {
    const isOwnMessage = message.senderId === currentUserId
    const isSystemMessage = message.senderType === 'system'
    const isRead = message.readBy?.some(r => r.userId !== currentUserId) || false

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

    const getSenderIcon = () => {
      if (message.senderType === 'system') return <MessageSquare className="h-3 w-3" />
      if (message.senderType === 'preceptor') return <Stethoscope className="h-4 w-4" />
      return <BookOpen className="h-4 w-4" />
    }

    const getReadReceiptIcon = () => {
      if (!isOwnMessage) return null
      return isRead ? (
        <CheckCheck className="h-3 w-3 text-blue-500" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground" />
      )
    }

    if (isSystemMessage) {
      return (
        <div 
          ref={ref}
          className={cn(
            "flex justify-center my-4",
            className
          )}
          {...props}
        >
          <div className="bg-muted px-3 py-2 rounded-lg text-sm text-center max-w-md">
            <div className="flex items-center justify-center gap-2 mb-1">
              {getSenderIcon()}
              <span className="text-xs font-medium">System</span>
            </div>
            <p className="text-muted-foreground">{message.content}</p>
            {message.metadata?.systemEventType && (
              <Badge variant="outline" className="text-xs mt-1">
                {message.metadata.systemEventType.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 group",
          isOwnMessage ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      >
        {/* Avatar - only show for partner messages */}
        {showAvatar && !isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {getSenderIcon()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn(
          "flex flex-col max-w-sm lg:max-w-md",
          isOwnMessage ? "items-end" : "items-start"
        )}>
          {/* Sender name for partner messages */}
          {!isOwnMessage && partnerName && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {partnerName}
              </span>
              {partnerType && (
                <Badge variant="outline" className="text-xs">
                  {partnerType}
                </Badge>
              )}
            </div>
          )}

          {/* Message content */}
          <div
            className={cn(
              "px-3 py-2 rounded-lg break-words",
              isOwnMessage
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
              message.messageType === 'file' && "border-2 border-dashed"
            )}
          >
            {message.messageType === 'file' ? (
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded bg-muted-foreground/10 flex items-center justify-center">
                    <span className="text-xs font-mono">
                      {message.metadata?.fileType?.toUpperCase().slice(0, 3) || 'FILE'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message.metadata?.fileName || 'Unknown file'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {message.metadata?.fileSize ? 
                      `${(message.metadata.fileSize / 1024).toFixed(1)} KB` : 
                      'Unknown size'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* Message metadata */}
          <div className={cn(
            "flex items-center gap-2 mt-1",
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          )}>
            {/* Timestamp */}
            {showTimestamp && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatMessageTime(message.createdAt)}
                  {message.editedAt && (
                    <span className="ml-1 italic">(edited)</span>
                  )}
                </span>
              </div>
            )}

            {/* Read receipt */}
            {getReadReceiptIcon()}

            {/* Message actions - only for own messages */}
            {isOwnMessage && !isSystemMessage && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && message.messageType === 'text' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const newContent = prompt('Edit message:', message.content)
                      if (newContent && newContent !== message.content) {
                        onEdit(message._id, newContent)
                      }
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Delete this message?')) {
                        onDelete(message._id)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spacer for own messages to maintain alignment */}
        {showAvatar && isOwnMessage && (
          <div className="w-8 flex-shrink-0" />
        )}
      </div>
    )
  }
)

MessageBubble.displayName = "MessageBubble"