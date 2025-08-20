'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  Archive, 
  ArchiveRestore,
  Clock,
  Search,
  Stethoscope,
  BookOpen,
  X
} from 'lucide-react'

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

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string | null
  showArchived?: boolean
  totalUnread?: number
  onSelectConversation: (conversationId: string) => void
  onArchiveConversation?: (conversationId: string, archive: boolean) => void
  onToggleArchived?: () => void
  onSearch?: (query: string) => void
  className?: string
  isLoading?: boolean
}

export function ConversationList({
  conversations,
  selectedConversationId,
  showArchived = false,
  totalUnread = 0,
  onSelectConversation,
  onArchiveConversation,
  onToggleArchived,
  onSearch,
  className,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredConversations = conversations.filter(conversation =>
    searchQuery === '' ||
    conversation.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.match.rotationType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold">Messages</h2>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          
          {onToggleArchived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleArchived}
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
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">
              {searchQuery 
                ? 'No matching conversations' 
                : showArchived 
                ? 'No archived conversations' 
                : 'No active conversations'
              }
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery 
                ? 'Try a different search term'
                : showArchived 
                ? 'Archive conversations to see them here'
                : conversations.length === 0
                ? 'Start a conversation from your matches'
                : 'All conversations are archived'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation._id}
                  showArchived={showArchived}
                  onSelect={() => onSelectConversation(conversation._id)}
                  onArchive={onArchiveConversation}
                  formatTime={formatMessageTime}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  showArchived: boolean
  onSelect: () => void
  onArchive?: (conversationId: string, archive: boolean) => void
  formatTime: (timestamp: number) => string
}

function ConversationItem({
  conversation,
  isSelected,
  showArchived,
  onSelect,
  onArchive,
  formatTime,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
        isSelected && "bg-accent border border-primary/20"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback>
            {conversation.partner.type === 'preceptor' ? (
              <Stethoscope className="h-5 w-5" />
            ) : (
              <BookOpen className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium truncate text-sm">
              {conversation.partner.name}
            </p>
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-2 flex-shrink-0">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            )}
          </div>

          {/* Match info */}
          <div className="flex items-center gap-2 mb-2">
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

          {/* Last message preview */}
          {conversation.lastMessagePreview && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {conversation.lastMessagePreview}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Timestamp */}
            {conversation.lastMessageAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(conversation.lastMessageAt)}
              </div>
            )}

            {/* Archive action */}
            {onArchive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(conversation._id, !showArchived)
                }}
              >
                {showArchived ? (
                  <ArchiveRestore className="h-3 w-3" />
                ) : (
                  <Archive className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}