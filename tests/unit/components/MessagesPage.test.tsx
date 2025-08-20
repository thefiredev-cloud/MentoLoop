import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessagesPage from '@/app/dashboard/messages/page'

// Mock Convex hooks
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation
}))

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  )
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span className={`badge-${variant}`}>{children}</span>
  )
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div className="scroll-area">{children}</div>
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div className="avatar">{children}</div>,
  AvatarFallback: ({ children }: any) => <div className="avatar-fallback">{children}</div>
}))

// Mock data
const mockConversations = [
  {
    _id: 'conv1',
    partner: {
      id: 'preceptor1',
      name: 'Dr. Jane Smith',
      type: 'preceptor' as const
    },
    match: {
      id: 'match1',
      status: 'active',
      rotationType: 'family-medicine',
      startDate: '2025-01-15',
      endDate: '2025-03-15'
    },
    lastMessagePreview: 'Looking forward to working with you!',
    lastMessageAt: Date.now() - 3600000, // 1 hour ago
    unreadCount: 2,
    status: 'active' as const
  },
  {
    _id: 'conv2',
    partner: {
      id: 'student1',
      name: 'John Doe',
      type: 'student' as const
    },
    match: {
      id: 'match2',
      status: 'completed',
      rotationType: 'pediatrics',
      startDate: '2024-11-01',
      endDate: '2024-12-31'
    },
    lastMessagePreview: 'Thank you for the great rotation!',
    lastMessageAt: Date.now() - 86400000, // 1 day ago
    unreadCount: 0,
    status: 'active' as const
  }
]

const mockMessages = [
  {
    _id: 'msg1',
    senderId: 'preceptor1',
    senderType: 'preceptor' as const,
    messageType: 'text' as const,
    content: 'Hello! Welcome to your family medicine rotation.',
    createdAt: Date.now() - 7200000, // 2 hours ago
    isRead: true
  },
  {
    _id: 'msg2',
    senderId: 'student1',
    senderType: 'student' as const,
    messageType: 'text' as const,
    content: 'Thank you! I\'m excited to start learning.',
    createdAt: Date.now() - 3600000, // 1 hour ago
    isRead: true
  },
  {
    _id: 'msg3',
    senderId: 'preceptor1',
    senderType: 'preceptor' as const,
    messageType: 'text' as const,
    content: 'Looking forward to working with you!',
    createdAt: Date.now() - 1800000, // 30 minutes ago
    isRead: false
  }
]

describe('MessagesPage Component', () => {
  const mockSendMessage = vi.fn()
  const mockMarkAsRead = vi.fn()
  const mockUpdateStatus = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockUseQuery
      .mockReturnValueOnce(mockConversations) // getUserConversations
      .mockReturnValueOnce(undefined) // getMessages (no conversation selected)
      .mockReturnValueOnce(3) // getUnreadMessageCount

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage) // sendMessage
      .mockReturnValueOnce(mockMarkAsRead) // markAsRead
      .mockReturnValueOnce(mockUpdateStatus) // updateStatus
  })

  it('renders conversations list', () => {
    render(<MessagesPage />)

    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Looking forward to working with you!')).toBeInTheDocument()
    expect(screen.getByText('Thank you for the great rotation!')).toBeInTheDocument()
  })

  it('displays unread message counts', () => {
    render(<MessagesPage />)

    // Should show unread count for conversation with unread messages
    expect(screen.getByText('2')).toBeInTheDocument() // unread count for conv1
  })

  it('shows conversation details when selected', async () => {
    const user = userEvent.setup()
    
    // Mock messages for selected conversation
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages) // messages for selected conversation
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    // Click on first conversation
    const conversationItem = screen.getByText('Dr. Jane Smith').closest('div')
    await user.click(conversationItem!)

    // Should show messages
    await waitFor(() => {
      expect(screen.getByText('Hello! Welcome to your family medicine rotation.')).toBeInTheDocument()
      expect(screen.getByText('Thank you! I\'m excited to start learning.')).toBeInTheDocument()
    })
  })

  it('allows sending new messages', async () => {
    const user = userEvent.setup()
    
    // Mock with selected conversation and messages
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    mockSendMessage.mockResolvedValueOnce('new-message-id')

    render(<MessagesPage />)

    // Type a message
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, 'Hello, this is a test message!')

    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    // Should call sendMessage mutation
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        conversationId: expect.any(String),
        content: 'Hello, this is a test message!',
        messageType: 'text'
      })
    })
  })

  it('toggles between active and archived conversations', async () => {
    const user = userEvent.setup()
    
    render(<MessagesPage />)

    // Should show toggle for archived messages
    const archivedToggle = screen.getByText(/show archived/i)
    await user.click(archivedToggle)

    // Should call useQuery with archived status
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Function),
      { status: 'archived' }
    )
  })

  it('archives conversation', async () => {
    const user = userEvent.setup()
    
    // Mock with selected conversation
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    mockUpdateStatus.mockResolvedValueOnce(undefined)

    render(<MessagesPage />)

    // Find and click archive button
    const archiveButton = screen.getByRole('button', { name: /archive/i })
    await user.click(archiveButton)

    // Should call updateStatus mutation
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        conversationId: expect.any(String),
        status: 'archived'
      })
    })
  })

  it('handles empty message input', async () => {
    const user = userEvent.setup()
    
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    // Try to send empty message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    // Should not call sendMessage
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('displays conversation metadata correctly', () => {
    render(<MessagesPage />)

    // Should show rotation type and dates
    expect(screen.getByText(/family-medicine/i)).toBeInTheDocument()
    expect(screen.getByText(/pediatrics/i)).toBeInTheDocument()
  })

  it('handles message loading states', () => {
    // Mock loading state
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(undefined) // messages loading
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    // Should handle loading state gracefully
    expect(screen.getByText('Messages')).toBeInTheDocument()
  })

  it('formats message timestamps correctly', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    // Should display relative timestamps
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('handles system notification messages', () => {
    const systemMessage = {
      _id: 'sys1',
      senderId: 'system',
      senderType: 'system' as const,
      messageType: 'system_notification' as const,
      content: 'Rotation has started',
      createdAt: Date.now(),
      metadata: {
        systemEventType: 'rotation_start'
      }
    }

    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce([...mockMessages, systemMessage])
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    expect(screen.getByText('Rotation has started')).toBeInTheDocument()
  })

  it('scrolls to bottom when new messages arrive', () => {
    const mockScrollIntoView = vi.fn()
    
    // Mock scrollIntoView
    Object.defineProperty(HTMLDivElement.prototype, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true
    })

    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
      .mockReturnValueOnce(3)

    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
      .mockReturnValueOnce(mockUpdateStatus)

    render(<MessagesPage />)

    // Should call scrollIntoView
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })
})