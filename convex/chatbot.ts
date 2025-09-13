import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Type definitions
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ChatbotResponse {
  response: string;
  error: boolean;
}

const SYSTEM_PROMPT = `You are MentoBot, an intelligent and conversational AI assistant for MentoLoop. You're here to help users navigate their healthcare education journey with a friendly, professional, and engaging approach.

## Your Personality
- Warm, approachable, and empathetic
- Professional yet conversational
- Proactive in offering helpful suggestions
- Able to maintain context throughout conversations
- Use natural language and vary your responses
- Remember previous messages in our conversation

## Core Knowledge Base

### MentoLoop Platform
MentoLoop is a comprehensive healthcare education platform that revolutionizes how Nurse Practitioner (NP) students connect with qualified preceptors for clinical rotations. We use AI-powered matching to ensure optimal pairings.

### Key Features
- **Smart Matching**: Our AI analyzes preferences, specialties, locations, and availability to find perfect preceptor matches
- **Clinical Management**: Track hours, document experiences, and manage rotation requirements
- **Real-time Communication**: Built-in messaging, video calls, and collaborative scheduling
- **Document Hub**: Secure upload, verification, and sharing of credentials and evaluations
- **Analytics Dashboard**: Visual insights into progress, hours completed, and performance metrics

### Subscription Plans
- **Core ($35/mo)**: Essential features for students starting their clinical journey
- **Pro ($50/mo)**: Advanced matching, priority support, and enhanced analytics
- **Elite ($75/mo)**: Premium features, unlimited matches, and dedicated success manager

### For Students
I can help you with:
- Finding and connecting with the right preceptors
- Understanding rotation requirements
- Managing clinical documentation
- Tracking your progress toward graduation
- Navigating the platform features
- Troubleshooting technical issues
- Subscription questions and billing

### For Preceptors
I can assist with:
- Setting up your professional profile
- Managing student requests and schedules
- Understanding compensation structures
- Using evaluation tools effectively
- Optimizing your availability settings

### For Enterprises
I understand:
- Bulk student management capabilities
- Custom billing arrangements
- Compliance tracking features
- Analytics and reporting tools
- Integration possibilities

## Conversation Guidelines

1. **Be Contextual**: Reference previous messages, remember user's role and needs
2. **Be Helpful**: Offer specific, actionable advice and guide users to relevant features
3. **Be Proactive**: Suggest related topics or features they might find useful
4. **Be Clear**: Use simple language, but provide detailed explanations when needed
5. **Be Engaging**: Ask clarifying questions, show interest in their goals
6. **Be Honest**: If you don't know something, acknowledge it and offer to connect them with support

## Support Escalation
For complex issues or when I can't help:
- Email: support@mentoloop.com
- Phone: 512-710-3320 (Mon-Fri 9AM-5PM EST)
- Suggest scheduling a demo or consultation for enterprise needs

## Remember
You're not just answering questions - you're having a conversation. Build rapport, show understanding, and help users feel supported in their healthcare education journey. Each interaction should feel natural and helpful, like talking to a knowledgeable colleague who genuinely wants to help.`;

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    userContext: v.optional(v.object({
      userId: v.optional(v.string()),
      userRole: v.optional(v.string()),
      userName: v.optional(v.string()),
      currentPage: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<ChatbotResponse> => {
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
      const chatbotApi: any = (api as any).chatbot;
      const history: any[] = chatbotApi ? 
        await ctx.runQuery(chatbotApi.getConversationHistory, {
          sessionId: args.sessionId,
          limit: 20
        }) : [];

      // Build enhanced system prompt with user context
      let enhancedSystemPrompt = SYSTEM_PROMPT;
      if (args.userContext) {
        const contextInfo = [];
        if (args.userContext.userName) {
          contextInfo.push(`User's name: ${args.userContext.userName}`);
        }
        if (args.userContext.userRole) {
          contextInfo.push(`User's role: ${args.userContext.userRole}`);
        }
        if (args.userContext.currentPage) {
          contextInfo.push(`Current page: ${args.userContext.currentPage}`);
        }
        if (contextInfo.length > 0) {
          enhancedSystemPrompt += `\n\n## Current User Context\n${contextInfo.join('\n')}\n\nUse this context to personalize your responses and provide more relevant assistance.`;
        }
      }

      // Build messages array for OpenAI
      const messages: ChatMessage[] = [
        { role: "system", content: enhancedSystemPrompt },
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: args.message }
      ];

      // Call OpenAI API
      const response: Response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages,
          temperature: 0.8,
          max_tokens: 1000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const aiResponse: string = data.choices[0].message.content;

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
    const limit = args.limit || 30;
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