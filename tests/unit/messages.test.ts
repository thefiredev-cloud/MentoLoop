import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Convex database operations
const mockDb = {
  get: vi.fn(),
  insert: vi.fn(),
  query: vi.fn(() => ({
    withIndex: vi.fn(() => ({
      eq: vi.fn(() => ({
        first: vi.fn(),
        collect: vi.fn(),
        order: vi.fn(() => ({
          collect: vi.fn()
        }))
      }))
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
      mockDb.get.mockResolvedValueOnce(mockMatch)
      mockDb.get.mockResolvedValueOnce(mockStudent)
      mockDb.get.mockResolvedValueOnce(mockPreceptor)
      mockDb.query().withIndex().eq().first.mockResolvedValueOnce(mockConversation)

      const result = await getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'user123')
      
      expect(result).toBe('conversation123')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should create new conversation if none exists', async () => {
      mockDb.get.mockResolvedValueOnce(mockMatch)
      mockDb.get.mockResolvedValueOnce(mockStudent)
      mockDb.get.mockResolvedValueOnce(mockPreceptor)
      mockDb.query().withIndex().eq().first.mockResolvedValueOnce(null)
      mockDb.insert.mockResolvedValueOnce('new-conversation-id')

      const result = await getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'user123')
      
      expect(result).toBe('new-conversation-id')
      expect(mockDb.insert).toHaveBeenCalledWith('conversations', {
        matchId: 'match123',
        studentId: 'student123',
        preceptorId: 'preceptor123',
        studentUserId: 'user123',
        preceptorUserId: 'user456',
        status: 'active',
        studentUnreadCount: 0,
        preceptorUnreadCount: 0,
        lastMessageAt: expect.any(Number),
        createdAt: expect.any(Number)
      })
    })

    it('should throw error if match not found', async () => {
      mockDb.get.mockResolvedValueOnce(null)

      await expect(
        getOrCreateConversation(mockCtx, { matchId: 'invalid-match' }, 'user123')
      ).rejects.toThrow('Match not found')
    })

    it('should throw error if user is not part of the match', async () => {
      mockDb.get.mockResolvedValueOnce(mockMatch)
      mockDb.get.mockResolvedValueOnce(mockStudent)
      mockDb.get.mockResolvedValueOnce(mockPreceptor)

      await expect(
        getOrCreateConversation(mockCtx, { matchId: 'match123' }, 'unauthorized-user')
      ).rejects.toThrow('Unauthorized: You can only access conversations for your own matches')
    })
  })

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)
      mockDb.insert.mockResolvedValueOnce('new-message-id')
      mockDb.patch.mockResolvedValueOnce(undefined)

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
      expect(mockDb.insert).toHaveBeenCalledWith('messages', {
        conversationId: 'conversation123',
        senderId: 'user123',
        senderType: 'student',
        messageType: 'text',
        content: 'Hello there!',
        createdAt: expect.any(Number),
        isRead: false
      })
    })

    it('should update unread count for recipient', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)
      mockDb.insert.mockResolvedValueOnce('new-message-id')
      mockDb.patch.mockResolvedValueOnce(undefined)

      await sendMessage(
        mockCtx,
        {
          conversationId: 'conversation123',
          content: 'Hello there!',
          messageType: 'text'
        },
        'user123' // student sending
      )

      // Should increment preceptor's unread count
      expect(mockDb.patch).toHaveBeenCalledWith('conversation123', {
        preceptorUnreadCount: 2, // was 1, now 2
        lastMessageAt: expect.any(Number)
      })
    })

    it('should handle file message type', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)
      mockDb.insert.mockResolvedValueOnce('new-message-id')
      mockDb.patch.mockResolvedValueOnce(undefined)

      await sendMessage(
        mockCtx,
        {
          conversationId: 'conversation123',
          content: 'https://example.com/file.pdf',
          messageType: 'file',
          metadata: {
            fileName: 'document.pdf',
            fileSize: 1024
          }
        },
        'user456' // preceptor sending
      )

      expect(mockDb.insert).toHaveBeenCalledWith('messages', {
        conversationId: 'conversation123',
        senderId: 'user456',
        senderType: 'preceptor',
        messageType: 'file',
        content: 'https://example.com/file.pdf',
        metadata: {
          fileName: 'document.pdf',
          fileSize: 1024
        },
        createdAt: expect.any(Number),
        isRead: false
      })
    })

    it('should throw error if conversation not found', async () => {
      mockDb.get.mockResolvedValueOnce(null)

      await expect(
        sendMessage(
          mockCtx,
          {
            conversationId: 'invalid-conversation',
            content: 'Hello',
            messageType: 'text'
          },
          'user123'
        )
      ).rejects.toThrow('Conversation not found')
    })

    it('should throw error if user not part of conversation', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)

      await expect(
        sendMessage(
          mockCtx,
          {
            conversationId: 'conversation123',
            content: 'Hello',
            messageType: 'text'
          },
          'unauthorized-user'
        )
      ).rejects.toThrow('Unauthorized: You can only send messages in your own conversations')
    })
  })

  describe('getMessages', () => {
    it('should return messages for authorized user', async () => {
      const mockMessages = [mockMessage]
      mockDb.get.mockResolvedValueOnce(mockConversation)
      mockDb.query().filter().order().collect.mockResolvedValueOnce(mockMessages)

      const result = await getMessages(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )

      expect(result).toEqual(mockMessages)
    })

    it('should throw error if user not part of conversation', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)

      await expect(
        getMessages(
          mockCtx,
          { conversationId: 'conversation123' },
          'unauthorized-user'
        )
      ).rejects.toThrow('Unauthorized: You can only view messages in your own conversations')
    })
  })

  describe('markMessagesAsRead', () => {
    it('should mark messages as read and reset unread count', async () => {
      mockDb.get.mockResolvedValueOnce(mockConversation)
      const mockUnreadMessages = [
        { _id: 'msg1', isRead: false },
        { _id: 'msg2', isRead: false }
      ]
      mockDb.query.mockReturnValue({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            first: vi.fn(),
            collect: vi.fn(),
            order: vi.fn(() => ({
              collect: vi.fn()
            }))
          }))
        })),
        filter: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValueOnce(mockUnreadMessages)
        })
      })
      mockDb.patch.mockResolvedValue(undefined)

      await markMessagesAsRead(
        mockCtx,
        { conversationId: 'conversation123' },
        'user123'
      )

      // Should mark individual messages as read
      expect(mockDb.patch).toHaveBeenCalledWith('msg1', { isRead: true })
      expect(mockDb.patch).toHaveBeenCalledWith('msg2', { isRead: true })
      
      // Should reset unread count for student
      expect(mockDb.patch).toHaveBeenCalledWith('conversation123', {
        studentUnreadCount: 0
      })
    })
  })

  describe('getUserConversations', () => {
    it('should return conversations for authenticated user', async () => {
      const mockConversations = [mockConversation]
      mockDb.query().filter().order().collect.mockResolvedValueOnce(mockConversations)

      const result = await getUserConversations(mockCtx, {}, 'user123')

      expect(result).toEqual(mockConversations)
    })

    it('should handle empty conversations list', async () => {
      mockDb.query().filter().order().collect.mockResolvedValueOnce([])

      const result = await getUserConversations(mockCtx, {}, 'user123')

      expect(result).toEqual([])
    })
  })

  describe('Message Validation', () => {
    it('should validate message content length', () => {
      const shortMessage = 'Hi'
      const longMessage = 'a'.repeat(5001) // Exceeds typical limit
      
      expect(validateMessageContent(shortMessage)).toBe(true)
      expect(validateMessageContent(longMessage)).toBe(false)
    })

    it('should validate message type', () => {
      expect(validateMessageType('text')).toBe(true)
      expect(validateMessageType('file')).toBe(true)
      expect(validateMessageType('system_notification')).toBe(true)
      expect(validateMessageType('invalid')).toBe(false)
    })

    it('should sanitize message content', () => {
      const unsafeContent = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeMessageContent(unsafeContent)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello')
    })
  })
})

// Mock implementation functions that would be imported from actual code
async function getOrCreateConversation(ctx: any, args: any, userId: string) {
  if (!userId) throw new Error("Must be authenticated");

  const match = await ctx.db.get(args.matchId);
  if (!match) throw new Error("Match not found");

  const student = await ctx.db.get(match.studentId);
  const preceptor = await ctx.db.get(match.preceptorId);
  
  if (!student || !preceptor) {
    throw new Error("Student or preceptor not found");
  }

  if (student.userId !== userId && preceptor.userId !== userId) {
    throw new Error("Unauthorized: You can only access conversations for your own matches");
  }

  const existingConversation = await ctx.db
    .query("conversations")
    .withIndex("byMatch", (q: any) => q.eq("matchId", args.matchId))
    .first();

  if (existingConversation) {
    return existingConversation._id;
  }

  const conversationId = await ctx.db.insert("conversations", {
    matchId: args.matchId,
    studentId: match.studentId,
    preceptorId: match.preceptorId,
    studentUserId: student.userId,
    preceptorUserId: preceptor.userId,
    status: "active",
    studentUnreadCount: 0,
    preceptorUnreadCount: 0,
    lastMessageAt: Date.now(),
    createdAt: Date.now()
  });

  return conversationId;
}

async function sendMessage(ctx: any, args: any, userId: string) {
  const conversation = await ctx.db.get(args.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
    throw new Error("Unauthorized: You can only send messages in your own conversations");
  }

  const senderType = conversation.studentUserId === userId ? 'student' : 'preceptor';
  const recipientUnreadField = senderType === 'student' ? 'preceptorUnreadCount' : 'studentUnreadCount';

  const messageId = await ctx.db.insert("messages", {
    conversationId: args.conversationId,
    senderId: userId,
    senderType,
    messageType: args.messageType,
    content: args.content,
    ...(args.metadata && { metadata: args.metadata }),
    createdAt: Date.now(),
    isRead: false
  });

  // Update conversation with unread count and last message time
  await ctx.db.patch(args.conversationId, {
    [recipientUnreadField]: conversation[recipientUnreadField] + 1,
    lastMessageAt: Date.now()
  });

  return messageId;
}

async function getMessages(ctx: any, args: any, userId: string) {
  const conversation = await ctx.db.get(args.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
    throw new Error("Unauthorized: You can only view messages in your own conversations");
  }

  return await ctx.db
    .query("messages")
    .filter((q: any) => q.eq(q.field("conversationId"), args.conversationId))
    .order("desc")
    .collect();
}

async function markMessagesAsRead(ctx: any, args: any, userId: string) {
  const conversation = await ctx.db.get(args.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
    throw new Error("Unauthorized");
  }

  const unreadMessages = await ctx.db
    .query("messages")
    .filter((q: any) => 
      q.and(
        q.eq(q.field("conversationId"), args.conversationId),
        q.eq(q.field("isRead"), false),
        q.neq(q.field("senderId"), userId)
      )
    )
    .collect();

  // Mark messages as read
  for (const message of unreadMessages) {
    await ctx.db.patch(message._id, { isRead: true });
  }

  // Reset unread count
  const unreadField = conversation.studentUserId === userId ? 'studentUnreadCount' : 'preceptorUnreadCount';
  await ctx.db.patch(args.conversationId, {
    [unreadField]: 0
  });
}

async function getUserConversations(ctx: any, args: any, userId: string) {
  return await ctx.db
    .query("conversations")
    .filter((q: any) => 
      q.or(
        q.eq(q.field("studentUserId"), userId),
        q.eq(q.field("preceptorUserId"), userId)
      )
    )
    .order("desc")
    .collect();
}

function validateMessageContent(content: string): boolean {
  return typeof content === 'string' && content.length > 0 && content.length <= 5000;
}

function validateMessageType(type: string): boolean {
  const validTypes = ['text', 'file', 'system_notification'];
  return validTypes.includes(type);
}

function sanitizeMessageContent(content: string): string {
  // Basic XSS prevention - remove script tags and other dangerous elements
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}