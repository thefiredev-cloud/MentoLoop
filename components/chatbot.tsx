'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2, Bot, Sparkles } from 'lucide-react'
import { useAction, useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'motion/react'


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get user context
  const { user } = useUser()
  const pathname = usePathname()

  // Access chatbot API
  const sendMessage = useAction(api.chatbot.sendMessage)
  const clearConversation = useMutation(api.chatbot.clearConversation)
  
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
    api.chatbot.getConversationHistory,
    sessionId ? { sessionId } : 'skip'
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
    setShowTypingIndicator(true)

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
          userName: user?.firstName || user?.username || undefined,
          userRole,
          currentPage: pathname
        }
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      setShowTypingIndicator(false)
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
    <div>
      {/* Chat Button with Enhanced Animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.4
            }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full p-4 shadow-2xl hover:shadow-primary/25"
            aria-label="Open chat"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <MessageCircle className="w-7 h-7" />
            </motion.div>
            {/* Pulse animation for attention */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window with Smooth Animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3, x: 100 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.3, x: 100 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
            className={cn(
              "fixed z-50",
              isMaximized
                ? "inset-4"
                : "bottom-6 right-6",
              "flex"
            )}
          >
            <Card className={cn(
              "shadow-2xl transition-all duration-300 backdrop-blur-sm bg-background/95",
              isMinimized
                ? "w-80 h-14"
                : isMaximized
                  ? "w-full h-full"
                  : "w-[550px] h-[750px] lg:w-[600px] lg:h-[800px]",
              "flex flex-col border-2 border-primary/20"
            )}>
          {/* Enhanced Header */}
          <CardHeader className="px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex flex-row items-center justify-between space-y-0">
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="w-5 h-5 text-primary" />
              </motion.div>
              <CardTitle className="text-base font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MentoBot AI Assistant
              </CardTitle>
              <Sparkles className="w-4 h-4 text-primary/60" />
            </motion.div>
            <div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-destructive/10"
                  onClick={toggleChat}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex flex-col flex-1">
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-3 hover:bg-primary/10 hover:border-primary"
                              onClick={async () => {
                                const quickMessage = "How do I track clinical hours?"
                                setMessage(quickMessage)
                                setTimeout(() => {
                                  handleSendMessage()
                                }, 100)
                              }}
                            >
                              ⏱️ Track Hours
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-3 hover:bg-primary/10 hover:border-primary"
                              onClick={async () => {
                                const quickMessage = "I need technical support"
                                setMessage(quickMessage)
                                setTimeout(() => {
                                  handleSendMessage()
                                }, 100)
                              }}
                            >
                              🛠️ Get Support
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg: { role: string; content: string }, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={cn(
                            "flex",
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                                : 'bg-gradient-to-r from-muted to-muted/80 border border-border'
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
                          </motion.div>
                        </motion.div>
                      ))}
                      {showTypingIndicator && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gradient-to-r from-muted to-muted/80 rounded-2xl px-4 py-3 border border-border">
                            <div className="flex items-center gap-1">
                              <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                className="w-2 h-2 bg-primary rounded-full"
                              />
                              <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-primary rounded-full"
                              />
                              <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Enhanced Input Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t bg-gradient-to-r from-background to-muted/20 p-4"
              >
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about MentoLoop..."
                    disabled={isLoading}
                    className="flex-1 border-primary/20 focus:border-primary bg-background/50 placeholder:text-muted-foreground/60"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      size="icon"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Send className="w-4 h-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>
                {messages.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearChat}
                    className="text-xs text-muted-foreground hover:text-primary mt-3 transition-all flex items-center gap-1 mx-auto"
                  >
                    <X className="w-3 h-3" />
                    Clear conversation
                  </motion.button>
                )}
              </motion.div>
            </div>
          )}
        </Card>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}