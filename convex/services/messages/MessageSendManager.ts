export class MessageSendManager {
  async sendMessage(ctx: any, args: { conversationId: string; content: string; messageType?: "text" | "file"; metadata?: any; userId: string }): Promise<string> {
    const conversation = await ctx.db.get(args.conversationId as any);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.studentUserId !== args.userId && conversation.preceptorUserId !== args.userId) {
      throw new Error("Unauthorized: You can only send messages in your own conversations");
    }
    if (conversation.status !== "active") throw new Error("Cannot send messages in inactive conversations");

    const isStudent = conversation.studentUserId === args.userId;
    const senderType = isStudent ? "student" : "preceptor";

    const firstNonSystem = await ctx.db
      .query("messages")
      .withIndex("byConversationAndTime", (q: any) => q.eq("conversationId", args.conversationId))
      .filter((q: any) => q.neq(q.field("senderType"), "system"))
      .order("asc")
      .first();
    if (!firstNonSystem && isStudent) throw new Error("Please wait for your preceptor to send the first message.");

    const content = (args.content || '').trim();
    if (!content) throw new Error("Message content cannot be empty");
    if (content.length > 5000) throw new Error("Message too long (max 5000 characters)");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.userId,
      senderType,
      messageType: args.messageType || "text",
      content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    const otherUserUnreadField = isStudent ? "preceptorUnreadCount" : "studentUnreadCount";
    await ctx.db.patch(args.conversationId as any, {
      lastMessageAt: Date.now(),
      lastMessagePreview: content.length > 100 ? content.substring(0, 100) + "..." : content,
      [otherUserUnreadField]: (conversation[otherUserUnreadField] || 0) + 1,
      updatedAt: Date.now(),
    });

    return messageId as string;
  }

  async sendFileMessage(ctx: any, args: { conversationId: string; content: string; fileName: string; fileSize: number; fileType: string; storageId: string; userId: string }): Promise<string> {
    const conversation = await ctx.db.get(args.conversationId as any);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.studentUserId !== args.userId && conversation.preceptorUserId !== args.userId) {
      throw new Error("Unauthorized: You can only send messages in your own conversations");
    }
    if (conversation.status !== "active") throw new Error("Cannot send messages in inactive conversations");

    const isStudent = conversation.studentUserId === args.userId;
    const senderType = isStudent ? "student" : "preceptor";
    const fileUrl = await ctx.storage.getUrl(args.storageId as any);

    const content = (args.content || args.fileName);
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.userId,
      senderType,
      messageType: "file",
      content,
      metadata: { fileName: args.fileName, fileSize: args.fileSize, fileType: args.fileType, fileUrl: fileUrl || undefined, storageId: args.storageId },
      createdAt: Date.now(),
    });

    const otherUserUnreadField = isStudent ? "preceptorUnreadCount" : "studentUnreadCount";
    await ctx.db.patch(args.conversationId as any, {
      lastMessageAt: Date.now(),
      lastMessagePreview: `📎 ${args.fileName}`,
      [otherUserUnreadField]: (conversation[otherUserUnreadField] || 0) + 1,
      updatedAt: Date.now(),
    });

    return messageId as string;
  }
}
