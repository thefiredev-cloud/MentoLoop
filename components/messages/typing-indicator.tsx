'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Stethoscope, BookOpen } from 'lucide-react'

interface TypingIndicatorProps {
  isTyping: boolean
  typingUsers?: Array<{
    id: string
    name: string
    type: 'student' | 'preceptor'
  }>
  className?: string
}

export function TypingIndicator({ 
  isTyping, 
  typingUsers = [], 
  className 
}: TypingIndicatorProps) {
  if (!isTyping || typingUsers.length === 0) {
    return null
  }

  const firstUser = typingUsers[0]
  const otherCount = typingUsers.length - 1

  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      {/* Avatar */}
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {firstUser.type === 'preceptor' ? (
            <Stethoscope className="h-3 w-3" />
          ) : (
            <BookOpen className="h-3 w-3" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Typing message */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {typingUsers.length === 1 
            ? `${firstUser.name} is typing` 
            : typingUsers.length === 2
            ? `${firstUser.name} and ${typingUsers[1].name} are typing`
            : `${firstUser.name} and ${otherCount} other${otherCount > 1 ? 's' : ''} are typing`
          }
        </span>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}