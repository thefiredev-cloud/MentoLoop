// Next.js API Route for GPT-5 (chat with optional streaming)
// POST /api/gpt5

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { z } from "zod";
import { validateHealthcarePrompt } from "@/lib/prompts";

// naive per-user rate limiting (in-memory token bucket)
const chatRateLimiter = new Map<string, { tokens: number; ts: number }>();
function rateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = chatRateLimiter.get(key) || { tokens: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.tokens = 0;
    entry.ts = now;
  }
  entry.tokens += 1;
  chatRateLimiter.set(key, entry);
  return entry.tokens <= max;
}

let cachedOpenAI: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!cachedOpenAI) {
    cachedOpenAI = new OpenAI({ apiKey });
  }
  return cachedOpenAI;
}

// Request validation schema
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  model: z.string().default("gpt-4-turbo-preview"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  stream: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();
    const validated = ChatRequestSchema.parse(body);

    // basic PHI/PII guardrail on latest user content
    const lastUser = [...validated.messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      const check = validateHealthcarePrompt(lastUser.content);
      if (!check.valid) {
        return NextResponse.json({ error: "Invalid content", issues: check.issues }, { status: 400 });
      }
    }

    // rate limiting by user id
    if (!rateLimit(userId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: "Model service unavailable" }, { status: 503 });
    }

    // Prepend user context for better personalization
    const userRole =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (((user?.publicMetadata as any)?.role as string) || "student").toString();
    const enhancedMessages = [
      {
        role: "system" as const,
        // Avoid sending PII/PHI like names to the LLM
        content: `User context: (Role: ${userRole})`,
      },
      ...validated.messages,
    ];

    if (validated.stream) {
      // Streaming via Server-Sent Events (SSE)
      const stream = await openai.chat.completions.create({
        model: validated.model,
        messages: enhancedMessages,
        temperature: validated.temperature,
        max_tokens: validated.maxTokens,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || "";
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming
    const completion = await openai.chat.completions.create({
      model: validated.model,
      messages: enhancedMessages,
      temperature: validated.temperature,
      max_tokens: validated.maxTokens,
    });

    const res = NextResponse.json({
      content: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
    });
    res.headers.set("cache-control", "no-store");
    return res;
  } catch (error) {
    // Sanitize logs to avoid PHI/PII leakage
    console.error("GPT-5 API Error");
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
