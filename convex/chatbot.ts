import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { PlanCatalog } from "./constants/planCatalog";

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

const PLAN_SUMMARY = PlanCatalog.formatPlanSummary();

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

### Membership Plans
${PLAN_SUMMARY}

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

const PRICING_INTENTS = [
  "plan",
  "pricing",
  "cost",
  "price",
  "hour",
  "subscription",
  "membership",
  "discount",
  "coupon",
  "np12345",
  "mento12345",
  "a la carte",
  "add hours",
];

const normalize = (text: string): string => text.toLowerCase();

const isPricingIntent = (message: string): boolean => {
  const normalized = normalize(message);
  return PRICING_INTENTS.some((intent) => normalized.includes(intent));
};

export const buildPricingResponse = () => {
  const summaries = PlanCatalog.publicSummaries();
  const headline = "Here’s our current membership catalog:";
  const planLines = summaries
    .filter((plan) => plan.category === "block")
    .map(
      (plan) =>
        `• ${plan.name} (${plan.priceDisplay}) – ${plan.hours ? `${plan.hours} clinical hours` : "Flexible"}. ${plan.description}`,
    );
  const addon = summaries.find((plan) => plan.key === "a_la_carte");
  if (addon) {
    planLines.push(
      `• ${addon.name} (${addon.priceUsd === 10 ? "$10/hr" : addon.priceDisplay}${
        addon.priceDetail ? `, ${addon.priceDetail}` : ""
      }) – ${addon.description}`,
    );
  }

  const ctas = [
    "Ready to move forward? Head to your dashboard or the student intake flow to confirm your block.",
    "Need a discount? NP12345 gives 100% off intake. MENTO12345 unlocks the penny verification test path.",
    "Have questions? I can help compare plans or route you to our team at support@mentoloop.com.",
  ];

  return [headline, ...planLines, "", ...ctas].join("\n");
};

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

      if (isPricingIntent(args.message)) {
        const pricingResponse = buildPricingResponse();

        if (chatbotApi) {
          await ctx.runMutation(chatbotApi.storeMessage, {
            sessionId: args.sessionId,
            role: "user",
            content: args.message,
          });

          await ctx.runMutation(chatbotApi.storeMessage, {
            sessionId: args.sessionId,
            role: "assistant",
            content: pricingResponse,
          });
        }

        return {
          response: pricingResponse,
          error: false,
        };
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

      // Call OpenAI API with speed-optimized models
      let response: Response;
      let modelUsed = "gpt-4-turbo";
      
      try {
        // Try GPT-4-turbo first (fast and highly capable - best balance)
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages,
            temperature: 0.8,
            max_tokens: 800,  // Reduced for faster responses
            presence_penalty: 0.1,
            frequency_penalty: 0.1
          })
        });
        
        if (!response.ok && response.status === 404) {
          // Fallback to gpt-3.5-turbo for maximum speed
          console.log("GPT-4-turbo not available, falling back to gpt-3.5-turbo for speed");
          modelUsed = "gpt-3.5-turbo";
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages,
              temperature: 0.8,
              max_tokens: 600,  // Even faster responses
              presence_penalty: 0.1,
              frequency_penalty: 0.1
            })
          });
        }
        
        // Optional: Could add GPT-4o as a final fallback if needed for complex queries
        // But prioritizing speed means we'll stick with the turbo models
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorBody);
        
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your OpenAI API key configuration.");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        } else if (response.status === 500 || response.status === 502 || response.status === 503) {
          throw new Error("OpenAI service is temporarily unavailable. Please try again later.");
        } else {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }
      }
      
      console.log(`Successfully used model: ${modelUsed}`);

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