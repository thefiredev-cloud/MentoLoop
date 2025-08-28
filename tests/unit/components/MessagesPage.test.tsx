import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn()
  })
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  )
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />
}))

// Import component after mocks
import MessagesPage from '@/app/dashboard/messages/page'
import { useQuery, useMutation } from 'convex/react'

const mockConversations = [
  {
    _id: 'conv1',
    matchId: 'match1',
    lastMessage: 'Hello there!',
    lastMessageAt: Date.now() - 3600000,
    unreadCount: 2,
    otherUser: {
      name: 'Dr. Jane Smith',
      role: 'preceptor'
    }
  },
  {
    _id: 'conv2',
    matchId: 'match2',
    lastMessage: 'See you tomorrow',
    lastMessageAt: Date.now() - 86400000,
    unreadCount: 0,
    otherUser: {
      name: 'John Student',
      role: 'student'
    }
  }
]

const mockMessages = [
  {
    _id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'Hello there!',
    createdAt: Date.now() - 3600000,
    isRead: false,
    senderName: 'Dr. Jane Smith'
  },
  {
    _id: 'msg2',
    conversationId: 'conv1',
    senderId: 'user2',
    content: 'Hi, how are you?',
    createdAt: Date.now() - 3000000,
    isRead: true,
    senderName: 'You'
  }
]

describe('MessagesPage', () => {
  const mockUseQuery = vi.mocked(useQuery)
  const mockUseMutation = vi.mocked(useMutation)
  const mockSendMessage = vi.fn()
  const mockMarkAsRead = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue(mockSendMessage)
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue(undefined)
    
    render(<MessagesPage />)
    
    expect(screen.getByText(/Loading messages/i)).toBeInTheDocument()
  })

  it('displays conversation list', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('John Student')).toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // unread count
  })

  it('displays messages in conversation', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
    expect(screen.getByText('Hi, how are you?')).toBeInTheDocument()
  })

  it('allows sending a message', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    mockSendMessage.mockResolvedValueOnce('new-msg-id')
    
    render(<MessagesPage />)
    
    const input = screen.getByPlaceholderText(/Type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await userEvent.type(input, 'New message')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(expect.objectContaining({
        content: 'New message'
      }))
    })
  })

  it('marks messages as read when conversation is selected', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    mockUseMutation
      .mockReturnValueOnce(mockSendMessage)
      .mockReturnValueOnce(mockMarkAsRead)
    
    render(<MessagesPage />)
    
    const conversation = screen.getByText('Dr. Jane Smith')
    fireEvent.click(conversation)
    
    expect(mockMarkAsRead).toHaveBeenCalled()
  })

  it('shows empty state when no conversations', () => {
    mockUseQuery
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
    
    render(<MessagesPage />)
    
    expect(screen.getByText(/No conversations yet/i)).toBeInTheDocument()
  })

  it('filters conversations by search term', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    const searchInput = screen.getByPlaceholderText(/Search conversations/i)
    
    await userEvent.type(searchInput, 'Jane')
    
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Student')).not.toBeInTheDocument()
  })

  it('displays message timestamps', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    // Should show relative timestamps
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('handles message send error', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    mockSendMessage.mockRejectedValueOnce(new Error('Failed to send'))
    
    render(<MessagesPage />)
    
    const input = screen.getByPlaceholderText(/Type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await userEvent.type(input, 'New message')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to send/i)).toBeInTheDocument()
    })
  })

  it('shows typing indicator when other user is typing', () => {
    const conversationsWithTyping = [
      {
        ...mockConversations[0],
        isOtherUserTyping: true
      }
    ]
    
    mockUseQuery
      .mockReturnValueOnce(conversationsWithTyping)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    expect(screen.getByText(/is typing/i)).toBeInTheDocument()
  })

  it('disables send button when message is empty', () => {
    mockUseQuery
      .mockReturnValueOnce(mockConversations)
      .mockReturnValueOnce(mockMessages)
    
    render(<MessagesPage />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    expect(sendButton).toBeDisabled()
  })
})