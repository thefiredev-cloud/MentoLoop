// Next.js API Route for GPT-5 function-calling patterns
// POST /api/gpt5/function

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// naive per-user rate limiting (in-memory)
const rl = (globalThis as any).__gpt5_fn_rl || new Map<string, { tokens: number; ts: number }>();
(globalThis as any).__gpt5_fn_rl = rl;
function rateLimit(key: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = rl.get(key) || { tokens: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.tokens = 0;
    entry.ts = now;
  }
  entry.tokens += 1;
  rl.set(key, entry);
  return entry.tokens <= max;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(userId)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const body = await req.json();
    const { operation, parameters } = body || {};

    const functions = [
      {
        name: "scheduleSession",
        description: "Schedule a mentorship session",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string" },
            time: { type: "string" },
            duration: { type: "number" },
            topic: { type: "string" },
            participants: { type: "array", items: { type: "string" } },
          },
          required: ["date", "time", "duration", "topic"],
        },
      },
      {
        name: "generateReport",
        description: "Generate progress report",
        parameters: {
          type: "object",
          properties: {
            studentId: { type: "string" },
            period: { type: "string" },
            metrics: { type: "array", items: { type: "string" } },
          },
          required: ["studentId", "period"],
        },
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare education assistant with function calling capabilities.",
        },
        {
          role: "user",
          content: `Execute operation: ${operation} with parameters: ${JSON.stringify(parameters)}`,
        },
      ],
      functions,
      function_call: "auto",
    });

    const functionCall = (completion.choices[0] as any)?.message?.function_call;
    if (functionCall) {
      const functionName = functionCall.name as string;
      const functionArgs = JSON.parse(functionCall.arguments || "{}");
      let result: any;
      switch (functionName) {
        case "scheduleSession":
          result = {
            success: true,
            sessionId: `session_${Date.now()}`,
            details: functionArgs,
          };
          break;
        case "generateReport":
          result = {
            success: true,
            reportId: `report_${Date.now()}`,
            summary: "Report generated successfully",
          };
          break;
        default:
          result = { success: false, error: "Unknown function" };
      }
      return NextResponse.json({ function: functionName, arguments: functionArgs, result });
    }

    return NextResponse.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error("Function calling error:", error);
    return NextResponse.json({ error: "Function execution failed" }, { status: 500 });
  }
}
