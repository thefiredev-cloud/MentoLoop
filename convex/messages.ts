import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getUserId } from "./auth";

// Create or get conversation between student and preceptor for a match
export const getOrCreateConversation = mutation({
  args: { 
    matchId: v.id("matches") 
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Get the match details
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    // Get student and preceptor records
    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    // Verify user is part of this match
    if (student.userId !== userId && preceptor.userId !== userId) {
      throw new Error("Unauthorized: You can only access conversations for your own matches");
    }

    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("byMatch", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      matchId: args.matchId,
      studentId: match.studentId,
      preceptorId: match.preceptorId,
      studentUserId: student.userId,
      preceptorUserId: preceptor.userId,
      status: "active",
      studentUnreadCount: 0,
      preceptorUnreadCount: 0,
      metadata: {
        rotationType: match.rotationDetails?.rotationType,
        rotationDates: match.rotationDetails ? {
          startDate: match.rotationDetails.startDate,
          endDate: match.rotationDetails.endDate,
        } : undefined,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send initial system message
    await ctx.db.insert("messages", {
      conversationId,
      senderId: "system",
      senderType: "system",
      messageType: "system_notification",
      content: `Conversation started for ${match.rotationDetails?.rotationType || 'rotation'} match. You can now communicate securely about rotation details, schedules, and expectations.`,
      metadata: {
        systemEventType: "conversation_created",
        systemEventData: {
          matchId: args.matchId,
          rotationType: match.rotationDetails?.rotationType,
        },
      },
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Send a message in a conversation
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("text"), v.literal("file"))),
    metadata: v.optional(v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      fileType: v.optional(v.string()),
      fileUrl: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");
    const { MessageSendManager } = require("./services/messages/MessageSendManager");
    const manager = new MessageSendManager();
    return await manager.sendMessage(ctx, {
      conversationId: args.conversationId as any,
      content: args.content,
      messageType: args.messageType || "text",
      metadata: args.metadata,
      userId,
    });
  },
});

// Get messages for a conversation with pagination
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Verify access to conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized: You can only view your own conversations");
    }

    const limit = Math.min(args.limit || 50, 100); // Max 100 messages per request
    
    let query = ctx.db
      .query("messages")
      .withIndex("byConversationAndTime", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("desc");

    if (args.cursor) {
      // Parse cursor for pagination (simplified implementation)
      const cursorTime = parseInt(args.cursor);
      query = query.filter((q) => q.lt(q.field("createdAt"), cursorTime));
    }

    const messages = await query
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return {
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[messages.length - 1].createdAt.toString() : null,
    };
  },
});

// Get all conversations for the current user
export const getUserConversations = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get user profile to determine if student or preceptor
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", userId))
      .first();

    if (!user) return [];

    let conversations;
    
    if (user.userType === "student") {
      if (args.status) {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("byStudentUserAndStatus", (q) => q.eq("studentUserId", userId).eq("status", args.status!))
          .order("desc")
          .collect();
      } else {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("byStudentUser", (q) => q.eq("studentUserId", userId))
          .filter((q) => q.neq(q.field("status"), "disabled"))
          .order("desc")
          .collect();
      }
    } else if (user.userType === "preceptor") {
      if (args.status) {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("byPreceptorUserAndStatus", (q) => q.eq("preceptorUserId", userId).eq("status", args.status!))
          .order("desc")
          .collect();
      } else {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("byPreceptorUser", (q) => q.eq("preceptorUserId", userId))
          .filter((q) => q.neq(q.field("status"), "disabled"))
          .order("desc")
          .collect();
      }
    } else {
      return [];
    }

    // Enrich with partner information
    const enrichedConversations = [];
    
    for (const conversation of conversations) {
      const student = await ctx.db.get(conversation.studentId);
      const preceptor = await ctx.db.get(conversation.preceptorId);
      const match = await ctx.db.get(conversation.matchId);

      if (student && preceptor && match) {
        const isStudent = user.userType === "student";
        const partner = isStudent ? preceptor : student;
        const unreadCount = isStudent ? conversation.studentUnreadCount : conversation.preceptorUnreadCount;

        enrichedConversations.push({
          ...conversation,
          partner: {
            id: partner._id,
            name: partner.personalInfo?.fullName || "Unknown",
            type: isStudent ? "preceptor" : "student",
          },
          match: {
            id: match._id,
            status: match.status,
            rotationType: match.rotationDetails?.rotationType,
            startDate: match.rotationDetails?.startDate,
            endDate: match.rotationDetails?.endDate,
          },
          unreadCount,
        });
      }
    }

    return enrichedConversations.sort((a, b) => 
      (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
    );
  },
});

// Mark conversation as read for current user
export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // Determine which unread count to reset
    const isStudent = conversation.studentUserId === userId;
    const unreadField = isStudent ? "studentUnreadCount" : "preceptorUnreadCount";

    await ctx.db.patch(args.conversationId, {
      [unreadField]: 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Archive/unarchive conversation
export const updateConversationStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(v.literal("active"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get conversation by match ID
export const getConversationByMatch = query({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Verify user has access to this match
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (!student || !preceptor || 
        (student.userId !== userId && preceptor.userId !== userId)) {
      return null;
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("byMatch", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!conversation) return null;

    // Enrich with partner information
    const isStudent = student.userId === userId;
    const partner = isStudent ? preceptor : student;
    const unreadCount = isStudent ? conversation.studentUnreadCount : conversation.preceptorUnreadCount;

    return {
      ...conversation,
      partner: {
        id: partner._id,
        name: partner.personalInfo?.fullName || "Unknown",
        type: isStudent ? "preceptor" : "student",
      },
      unreadCount,
    };
  },
});

// Internal mutation to create conversation when match is accepted
export const createConversationForMatch = internalMutation({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("byMatch", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Get match details
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    // Create conversation
    const conversationId = await ctx.db.insert("conversations", {
      matchId: args.matchId,
      studentId: match.studentId,
      preceptorId: match.preceptorId,
      studentUserId: student.userId,
      preceptorUserId: preceptor.userId,
      status: "active",
      studentUnreadCount: 0,
      preceptorUnreadCount: 0,
      metadata: {
        rotationType: match.rotationDetails?.rotationType,
        rotationDates: match.rotationDetails ? {
          startDate: match.rotationDetails.startDate,
          endDate: match.rotationDetails.endDate,
        } : undefined,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send welcome system message
    await ctx.db.insert("messages", {
      conversationId,
      senderId: "system",
      senderType: "system",
      messageType: "system_notification",
      content: `🎉 Match confirmed! You can now communicate directly about your ${match.rotationDetails?.rotationType || 'rotation'} starting ${match.rotationDetails?.startDate || 'soon'}. Use this secure messaging to coordinate schedules, expectations, and rotation details.`,
      metadata: {
        systemEventType: "match_confirmed",
        systemEventData: {
          matchId: args.matchId,
          rotationType: match.rotationDetails?.rotationType,
          startDate: match.rotationDetails?.startDate,
        },
      },
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Get total unread message count for current user
export const getUnreadMessageCount = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;

    // Get user type
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", userId))
      .first();

    if (!user) return 0;

    let conversations;
    
    if (user.userType === "student") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byStudentUser", (q) => q.eq("studentUserId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      return conversations.reduce((total, conv) => total + (conv.studentUnreadCount || 0), 0);
    } else if (user.userType === "preceptor") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byPreceptorUser", (q) => q.eq("preceptorUserId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      return conversations.reduce((total, conv) => total + (conv.preceptorUnreadCount || 0), 0);
    }

    return 0;
  },
});

// Search messages across conversations
export const searchMessages = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get user's conversations first - inline the logic to avoid circular dependency
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", userId))
      .first();

    if (!user) return [];

    let conversations;
    
    if (user.userType === "student") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byStudentUserAndStatus", (q) => q.eq("studentUserId", userId).eq("status", "active"))
        .order("desc")
        .collect();
    } else if (user.userType === "preceptor") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byPreceptorUserAndStatus", (q) => q.eq("preceptorUserId", userId).eq("status", "active"))
        .order("desc")
        .collect();
    } else {
      return [];
    }

    const conversationIds = conversations.map(conv => conv._id);

    if (conversationIds.length === 0) return [];

    // Search for messages containing the query text
    // NOTE: Without a proper full-text index, we restrict to recent messages per conversation using byConversationAndTime
    const limitPerConversation = Math.max(1, Math.floor((args.limit || 20) / Math.max(1, conversationIds.length)));
    const messages: any[] = [];
    for (const convId of conversationIds) {
      const recent = await ctx.db
        .query("messages")
        .withIndex("byConversationAndTime", (q) => q.eq("conversationId", convId))
        .order("desc")
        .take(limitPerConversation);
      for (const m of recent) {
        if (m.deletedAt === undefined && m.senderType !== "system" && m.content.includes(args.query)) {
          messages.push(m);
        }
      }
    }

    // Enrich with conversation context
    const enrichedMessages = [];
    for (const message of messages) {
      const conversation = conversations.find(c => c._id === message.conversationId);
      if (conversation) {
        enrichedMessages.push({
          ...message,
          conversation: {
            matchId: conversation.matchId,
            studentId: conversation.studentId,
            preceptorId: conversation.preceptorId,
          },
        });
      }
    }

    return enrichedMessages;
  },
});

// Get recent activity for notifications
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get user's conversations - inline the logic to avoid circular dependency
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", userId))
      .first();

    if (!user) return [];

    let conversations;
    
    if (user.userType === "student") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byStudentUser", (q) => q.eq("studentUserId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .order("desc")
        .collect();
    } else if (user.userType === "preceptor") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("byPreceptorUser", (q) => q.eq("preceptorUserId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .order("desc")
        .collect();
    } else {
      return [];
    }

    const conversationIds = conversations.map(conv => conv._id);

    if (conversationIds.length === 0) return [];

    // Get recent messages from all conversations
    const recentMessages: any[] = [];
    for (const convId of conversationIds) {
      const recent = await ctx.db
        .query("messages")
        .withIndex("byConversationAndTime", (q) => q.eq("conversationId", convId))
        .order("desc")
        .take(5);
      for (const m of recent) {
        if (m.deletedAt === undefined && m.senderId !== userId) {
          recentMessages.push(m);
        }
      }
    }

    // Group by conversation and get latest message per conversation
    const activityByConversation = new Map();
    
    for (const message of recentMessages) {
      const conversation = conversations.find(c => c._id === message.conversationId);
      if (conversation && !activityByConversation.has(message.conversationId)) {
        activityByConversation.set(message.conversationId, {
          ...message,
          conversation: {
            matchId: conversation.matchId,
            studentId: conversation.studentId,
            preceptorId: conversation.preceptorId,
          },
        });
      }
    }

    return Array.from(activityByConversation.values())
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Mark message as read (for read receipts)
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Verify user has access to this conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // Add read receipt if not already present
    const readBy = message.readBy || [];
    const alreadyRead = readBy.find(r => r.userId === userId);
    
    if (!alreadyRead) {
      readBy.push({
        userId,
        readAt: Date.now(),
      });

      await ctx.db.patch(args.messageId, {
        readBy,
      });
    }

    return { success: true };
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Verify user owns this message
    if (message.senderId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Soft delete by setting deletedAt timestamp
    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newContent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Verify user owns this message
    if (message.senderId !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // Don't allow editing system messages
    if (message.senderType === "system") {
      throw new Error("Cannot edit system messages");
    }

    // Validate new content
    if (!args.newContent.trim()) {
      throw new Error("Message content cannot be empty");
    }

    if (args.newContent.length > 5000) {
      throw new Error("Message too long (max 5000 characters)");
    }

    await ctx.db.patch(args.messageId, {
      content: args.newContent.trim(),
      editedAt: Date.now(),
    });

    return { success: true };
  },
});

// Typing indicator functionality
export const startTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Verify user has access to this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // In a real implementation, you'd use Convex's presence API or a separate typing collection
    // For now, we'll implement a simple approach using the conversation metadata
    const currentTime = Date.now();

    // Update conversation with typing info
    await ctx.db.patch(args.conversationId, {
      lastTypingUpdate: currentTime,
      typingUserId: userId,
      updatedAt: currentTime,
    });

    return { success: true };
  },
});

export const stopTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Verify user has access to this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // Clear typing indicator if it's from this user
    if (conversation.typingUserId === userId) {
      await ctx.db.patch(args.conversationId, {
        lastTypingUpdate: undefined,
        typingUserId: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getTypingIndicator = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Verify user has access to this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      return null;
    }

    // Check if someone else is typing
    const typingTimeout = 3000; // 3 seconds
    const currentTime = Date.now();
    
    if (
      conversation.typingUserId && 
      conversation.typingUserId !== userId &&
      conversation.lastTypingUpdate &&
      (currentTime - conversation.lastTypingUpdate) < typingTimeout
    ) {
      // Get the typing user's info
      const isTypingUserStudent = conversation.typingUserId === conversation.studentUserId;
      let typingUserName = "Someone";
      let typingUserType: "student" | "preceptor" = "student";

      if (isTypingUserStudent) {
        const student = await ctx.db.get(conversation.studentId);
        typingUserName = student?.personalInfo?.fullName || "Student";
        typingUserType = "student";
      } else {
        const preceptor = await ctx.db.get(conversation.preceptorId);
        typingUserName = preceptor?.personalInfo?.fullName || "Preceptor";
        typingUserType = "preceptor";
      }

      return {
        isTyping: true,
        typingUser: {
          id: conversation.typingUserId,
          name: typingUserName,
          type: typingUserType,
        },
      };
    }

    return { isTyping: false };
  },
});

// File upload for messages
export const generateUploadUrl = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Verify user has access to this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // Generate upload URL for file storage
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL after upload
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Send file message with storage ID
export const sendFileMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");
    const { MessageSendManager } = require("./services/messages/MessageSendManager");
    const manager = new MessageSendManager();
    return await manager.sendFileMessage(ctx, {
      conversationId: args.conversationId as any,
      content: args.content,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      storageId: args.storageId as any,
      userId,
    });
  },
});

// Set typing indicator for a conversation
export const setTypingIndicator = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Verify user is part of this conversation
    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    if (args.isTyping) {
      await ctx.db.patch(args.conversationId, {
        typingUserId: userId,
        lastTypingUpdate: Date.now(),
      });
    } else {
      await ctx.db.patch(args.conversationId, {
        typingUserId: undefined,
        lastTypingUpdate: undefined,
      });
    }
  },
});


// Add message reactions
export const addMessageReaction = mutation({
  args: {
    messageId: v.id("messages"),
    reaction: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Verify user is part of this conversation
    if (conversation.studentUserId !== userId && conversation.preceptorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get current reactions
    const currentReactions = message.metadata?.reactions || [];
    
    // Check if user already reacted with this emoji
    const existingReactionIndex = currentReactions.findIndex(
      (r: any) => r.userId === userId && r.reaction === args.reaction
    );

    let updatedReactions;
    if (existingReactionIndex >= 0) {
      // Remove existing reaction
      updatedReactions = currentReactions.filter((_: any, index: number) => index !== existingReactionIndex);
    } else {
      // Add new reaction
      updatedReactions = [...currentReactions, {
        userId,
        reaction: args.reaction,
        addedAt: Date.now(),
      }];
    }

    await ctx.db.patch(args.messageId, {
      metadata: {
        ...message.metadata,
        reactions: updatedReactions,
      },
    });

    return updatedReactions;
  },
});
