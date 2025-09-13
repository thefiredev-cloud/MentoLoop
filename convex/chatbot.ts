import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const SYSTEM_PROMPT = `You are MentoBot, a helpful AI assistant for MentoLoop, a healthcare education platform that connects Nurse Practitioner (NP) students with qualified preceptors for clinical rotations.

Your knowledge includes:
1. MentoLoop Features:
   - AI-powered preceptor matching
   - Clinical hour tracking
   - Document management
   - Real-time messaging
   - Subscription plans (Core: $35/mo, Pro: $50/mo, Elite: $75/mo)
   - CEU courses

2. For Students:
   - Finding preceptors for clinical rotations
   - Tracking clinical hours
   - Document upload and verification
   - Progress dashboards

3. For Preceptors:
   - Managing student requests
   - Schedule management
   - Compensation tracking
   - Student evaluations

4. Support Information:
   - Email: support@mentoloop.com
   - Phone: 512-710-3320
   - Hours: Mon-Fri 9AM-5PM EST

5. Common Topics:
   - Privacy policy and data protection
   - Terms of use
   - Billing and subscriptions
   - Technical support
   - Getting started guides

Always be helpful, professional, and concise. If you don't know something specific, suggest contacting support.`;

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return {
        response: "I'm sorry, but I'm currently unavailable. Please contact support at support@mentoloop.com or call 512-710-3320.",
        error: true
      };
    }

    try {
      // Get conversation history
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chatbotApi = (api as any).chatbot;
      const history = chatbotApi ? 
        await ctx.runQuery(chatbotApi.getConversationHistory, {
          sessionId: args.sessionId,
          limit: 10
        }) : [];

      // Build messages array for OpenAI
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: args.message }
      ];

      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Store the conversation
      if (chatbotApi) {
        await ctx.runMutation(chatbotApi.storeMessage, {
          sessionId: args.sessionId,
          role: "user",
          content: args.message
        });

        await ctx.runMutation(chatbotApi.storeMessage, {
          sessionId: args.sessionId,
          role: "assistant",
          content: aiResponse
        });
      }

      return {
        response: aiResponse,
        error: false
      };
    } catch (error) {
      console.error("Chatbot error:", error);
      return {
        response: "I apologize, but I'm having trouble processing your request. Please try again or contact support at support@mentoloop.com",
        error: true
      };
    }
  }
});

export const storeMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      timestamp: Date.now()
    });
  }
});

export const getConversationHistory = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const messages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .order("desc")
      .take(limit);
    
    return messages.reverse();
  }
});

export const clearConversation = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  }
});