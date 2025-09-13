'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Minimize2, Loader2, Bot } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get user context
  const { user } = useUser()
  const pathname = usePathname()

  // Safely access chatbot API (will be available after Convex deployment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatbotApi = (api as any).chatbot
  const sendMessage = useAction(chatbotApi?.sendMessage || (() => Promise.resolve({ response: "Chatbot is initializing...", error: true })))
  const clearConversation = useAction(chatbotApi?.clearConversation || (() => Promise.resolve()))
  
  // Generate or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem('chatbot-session-id')
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('chatbot-session-id', id)
    }
    setSessionId(id)
  }, [])

  // Get conversation history
  const conversationHistory = useQuery(
    chatbotApi?.getConversationHistory,
    sessionId && chatbotApi ? { sessionId } : 'skip'
  ) || []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && conversationHistory) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [conversationHistory])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !sessionId) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    try {
      // Determine user role based on pathname
      let userRole = 'visitor'
      if (pathname?.includes('/student')) userRole = 'student'
      else if (pathname?.includes('/preceptor')) userRole = 'preceptor'
      else if (pathname?.includes('/admin')) userRole = 'admin'
      else if (pathname?.includes('/enterprise')) userRole = 'enterprise'

      await sendMessage({
        message: userMessage,
        sessionId,
        userContext: {
          userId: user?.id,
          userName: user?.firstName || user?.username,
          userRole,
          currentPage: pathname
        }
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = async () => {
    if (!sessionId) return
    await clearConversation({ sessionId })
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const messages = conversationHistory || []

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-105 transition-transform duration-200"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-4 right-4 z-50 shadow-xl transition-all duration-300",
          isMinimized ? "w-80 h-14" : "w-[450px] h-[600px]",
          "flex flex-col"
        )}>
          {/* Header */}
          <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold">MentoBot</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleChat}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium mb-2">Hi! I&apos;m MentoBot 👋</p>
                      <p>How can I help you today?</p>
                      <div className="mt-4 space-y-2 text-xs">
                        <p>I can help with:</p>
                        <ul className="text-left max-w-[250px] mx-auto space-y-1">
                          <li>• Finding preceptors</li>
                          <li>• Subscription plans</li>
                          <li>• Clinical rotations</li>
                          <li>• Technical support</li>
                          <li>• General questions</li>
                        </ul>
                      </div>
                      {/* Quick Actions */}
                      <div className="mt-6 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Quick questions:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={async () => {
                              const quickMessage = "How do I find a preceptor?"
                              setMessage(quickMessage)
                              setTimeout(() => {
                                handleSendMessage()
                              }, 100)
                            }}
                          >
                            Find Preceptor
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={async () => {
                              const quickMessage = "What are the subscription plans?"
                              setMessage(quickMessage)
                              setTimeout(() => {
                                handleSendMessage()
                              }, 100)
                            }}
                          >
                            Pricing Plans
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={async () => {
                              const quickMessage = "How do I track clinical hours?"
                              setMessage(quickMessage)
                              setTimeout(() => {
                                handleSendMessage()
                              }, 100)
                            }}
                          >
                            Track Hours
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={async () => {
                              const quickMessage = "I need technical support"
                              setMessage(quickMessage)
                              setTimeout(() => {
                                handleSendMessage()
                              }, 100)
                            }}
                          >
                            Get Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg: { role: string; content: string }, index: number) => (
                        <div
                          key={index}
                          className={cn(
                            "flex",
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                  ul: ({children}) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                                  ol: ({children}) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                                  li: ({children}) => <li className="mb-1">{children}</li>,
                                  code: ({className, children}) => {
                                    const isInline = !className
                                    return isInline ? (
                                      <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">{children}</code>
                                    ) : (
                                      <pre className="p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-x-auto">
                                        <code className="text-xs">{children}</code>
                                      </pre>
                                    )
                                  },
                                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                  a: ({href, children}) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      {children}
                                    </a>
                                  ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
                  >
                    Clear conversation
                  </button>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}