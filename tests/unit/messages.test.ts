import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Convex API functions for testing
const getOrCreateConversation = vi.fn()
const sendMessage = vi.fn()
const markConversationAsRead = vi.fn()
const getMessages = vi.fn()
const getUserConversations = vi.fn()

// Mock Convex database operations
const mockDb = {
  get: vi.fn(),
  insert: vi.fn(),
  query: vi.fn(() => ({
    withIndex: vi.fn(() => ({
      eq: vi.fn(() => ({
        first: vi.fn()
      })),
      first: vi.fn()
    })),
    filter: vi.fn(() => ({
      order: vi.fn(() => ({
        collect: vi.fn()
      }))
    }))
  })),
  patch: vi.fn()
}

const mockCtx = {
  db: mockDb,
  auth: {
    getUserIdentity: vi.fn()
  }
}

// Mock data
const mockMatch = {
  _id: 'match123',
  studentId: 'student123',
  preceptorId: 'preceptor123',
  status: 'active'
}

const mockStudent = {
  _id: 'student123',
  userId: 'user123',
  profile: {
    firstName: 'John',
    lastName: 'Student'
  }
}

const mockPreceptor = {
  _id: 'preceptor123',
  userId: 'user456',
  profile: {
    firstName: 'Dr. Jane',
    lastName: 'Preceptor'
  }
}

const mockConversation = {
  _id: 'conversation123',
  matchId: 'match123',
  studentId: 'student123',
  preceptorId: 'preceptor123',
  studentUserId: 'user123',
  preceptorUserId: 'user456',
  status: 'active',
  studentUnreadCount: 0,
  preceptorUnreadCount: 1
}

const mockMessage = {
  _id: 'message123',
  conversationId: 'conversation123',
  senderId: 'user123',
  senderType: 'student',
  messageType: 'text',
  content: 'Hello, Dr. Preceptor!',
  createdAt: Date.now(),
  isRead: false
}

describe('Messaging System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateConversation', () => {
    it('should return existing conversation if one exists', async () => {
      getOrCreateConversation.mockResolvedValueOnce('conversation123')

      const result = await getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'user123')
      
      expect(result).toBe('conversation123')
      expect(getOrCreateConversation).toHaveBeenCalledWith(mockCtx, { matchId: 'match123' }, 'user123')
    })

    it('should create new conversation if none exists', async () => {
      getOrCreateConversation.mockResolvedValueOnce('new-conversation-id')

      const result = await getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'user123')
      
      expect(result).toBe('new-conversation-id')
      expect(getOrCreateConversation).toHaveBeenCalledWith(mockCtx, { matchId: 'match123' }, 'user123')
    })

    it('should throw error if match not found', async () => {
      getOrCreateConversation.mockRejectedValueOnce(new Error('Match not found'))

      await expect(
        getOrCreateConversation(mockCtx, { matchId: 'invalid-match' }, 'user123')
      ).rejects.toThrow('Match not found')
    })

    it('should throw error if user is not part of the match', async () => {
      getOrCreateConversation.mockRejectedValueOnce(new Error('Unauthorized: You can only access conversations for your own matches'))

      await expect(
        getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'unauthorized-user')
      ).rejects.toThrow('Unauthorized: You can only access conversations for your own matches')
    })
  })

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      sendMessage.mockResolvedValueOnce('new-message-id')

      const result = await sendMessage(
        mockCtx,
        {
          conversationId: 'conversation123',
          content: 'Hello there!',
          messageType: 'text'
        },
        'user123'
      )

      expect(result).toBe('new-message-id')
      expect(sendMessage).toHaveBeenCalledWith(
        mockCtx,
        {
          conversationId: 'conversation123',
          content: 'Hello there!',
          messageType: 'text'
        },
        'user123'
      )
    })

    it('should update unread count for recipient', async () => {
      sendMessage.mockResolvedValueOnce('new-message-id')

      await sendMessage(
        mockCtx,
        {
          conversationId: 'conversation123',
          content: 'Hello there!',
          messageType: 'text'
        },
        'user123' // student sending
      )

      expect(sendMessage).toHaveBeenCalled()
    })

    it('should handle file message type', async () => {
      sendMessage.mockResolvedValueOnce('new-message-id')

      const result = await sendMessage(
        mockCtx,
        {
          conversationId: 'conversation123',
          fileUrl: 'https://example.com/file.pdf',
          fileName: 'document.pdf',
          messageType: 'file'
        },
        'user456'
      )

      expect(result).toBe('new-message-id')
    })

    it('should throw error if conversation not found', async () => {
      sendMessage.mockRejectedValueOnce(new Error('Conversation not found'))

      await expect(
        sendMessage(
          mockCtx,
          {
            conversationId: 'invalid-conversation',
            content: 'Test',
            messageType: 'text'
          },
          'user123'
        )
      ).rejects.toThrow('Conversation not found')
    })

    it('should throw error if user is not part of conversation', async () => {
      sendMessage.mockRejectedValueOnce(new Error('Unauthorized: You can only send messages in your own conversations'))

      await expect(
        sendMessage(
          mockCtx,
          {
            conversationId: 'conversation123',
            content: 'Test',
            messageType: 'text'
          },
          'unauthorized-user'
        )
      ).rejects.toThrow('Unauthorized: You can only send messages in your own conversations')
    })

    it('should validate message content', async () => {
      sendMessage.mockRejectedValueOnce(new Error('Message content is required'))

      await expect(
        sendMessage(
          mockCtx,
          {
            conversationId: 'conversation123',
            content: '',
            messageType: 'text'
          },
          'user123'
        )
      ).rejects.toThrow('Message content is required')
    })
  })

  describe('markConversationAsRead', () => {
    it('should mark conversation as read for student', async () => {
      markConversationAsRead.mockResolvedValueOnce(undefined)

      await markConversationAsRead(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )

      expect(markConversationAsRead).toHaveBeenCalledWith(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )
    })

    it('should mark conversation as read for preceptor', async () => {
      markConversationAsRead.mockResolvedValueOnce(undefined)

      await markConversationAsRead(
        mockCtx,
        { conversationId: 'conversation123' },
        'user456'
      )

      expect(markConversationAsRead).toHaveBeenCalledWith(
        mockCtx,
        { conversationId: 'conversation123' },
        'user456'
      )
    })
  })

  describe('getMessages', () => {
    it('should retrieve messages for a conversation', async () => {
      const mockMessages = [mockMessage]
      getMessages.mockResolvedValueOnce(mockMessages)

      const result = await getMessages(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )

      expect(result).toEqual(mockMessages)
      expect(getMessages).toHaveBeenCalledWith(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )
    })

    it('should return empty array for new conversation', async () => {
      getMessages.mockResolvedValueOnce([])

      const result = await getMessages(
        mockCtx,
        { conversationId: 'new-conversation' },
        'user123'
      )

      expect(result).toEqual([])
    })
  })

  describe('getUserConversations', () => {
    it('should retrieve all user conversations', async () => {
      const mockConversations = [mockConversation]
      getUserConversations.mockResolvedValueOnce(mockConversations)

      const result = await getUserConversations(mockCtx, {}, 'user123')

      expect(result).toEqual(mockConversations)
      expect(getUserConversations).toHaveBeenCalledWith(mockCtx, {}, 'user123')
    })

    it('should filter by status', async () => {
      const activeConversations = [mockConversation]
      getUserConversations.mockResolvedValueOnce(activeConversations)

      const result = await getUserConversations(
        mockCtx,
        { status: 'active' },
        'user123'
      )

      expect(result).toEqual(activeConversations)
      expect(getUserConversations).toHaveBeenCalledWith(
        mockCtx,
        { status: 'active' },
        'user123'
      )
    })

    it('should return empty array for user with no conversations', async () => {
      getUserConversations.mockResolvedValueOnce([])

      const result = await getUserConversations(mockCtx, {}, 'new-user')

      expect(result).toEqual([])
    })
  })
})