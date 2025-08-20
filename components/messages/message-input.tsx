'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Paperclip, 
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'file', metadata?: Record<string, unknown>) => Promise<void>
  onFileUpload?: (file: File) => Promise<string | null>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  showFileUpload?: boolean
  showEmojiPicker?: boolean
  className?: string
}

export function MessageInput({
  onSendMessage,
  onFileUpload,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 5000,
  showFileUpload = true,
  showEmojiPicker = false,
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    size: number
    type: string
    url?: string
  } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 120) // Max height of ~6 lines
      textarea.style.height = `${newHeight}px`
    }
  }, [])

  const handleInputChange = (value: string) => {
    if (value.length <= maxLength) {
      setMessage(value)
      setTimeout(adjustTextareaHeight, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (disabled) return

    if (uploadedFile) {
      // Send file message
      try {
        await onSendMessage(
          message.trim() || uploadedFile.name,
          'file',
          {
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            fileType: uploadedFile.type,
            fileUrl: uploadedFile.url,
          }
        )
        setMessage('')
        setUploadedFile(null)
        adjustTextareaHeight()
      } catch (error) {
        console.error('Failed to send file:', error)
      }
    } else if (message.trim()) {
      // Send text message
      try {
        await onSendMessage(message.trim(), 'text')
        setMessage('')
        adjustTextareaHeight()
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onFileUpload) return

    setIsUploading(true)
    try {
      const fileUrl = await onFileUpload(file)
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl || undefined,
      })
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canSend = (message.trim() || uploadedFile) && !disabled && !isUploading

  return (
    <div className={cn("border-t bg-background", className)}>
      {/* File upload preview */}
      {uploadedFile && (
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center gap-3 p-2 bg-background rounded border">
            <div className="flex-shrink-0">
              {getFileIcon(uploadedFile.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadedFile.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={removeUploadedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-end gap-2">
          {/* File upload button */}
          {showFileUpload && onFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Message input */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={uploadedFile ? "Add a caption (optional)..." : placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
              rows={1}
            />
            
            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Emoji picker button (placeholder) */}
          {showEmojiPicker && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 flex-shrink-0"
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>
          )}

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
          {isUploading && " • Uploading file..."}
        </p>
      </div>
    </div>
  )
}