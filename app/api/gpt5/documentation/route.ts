// Next.js API Route for GPT-5 clinical documentation generation
// POST /api/gpt5/documentation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { z } from "zod";
import { validateHealthcarePrompt } from "@/lib/prompts";

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

// Simple per-user rate limiting (in-memory token bucket)
const docsRateLimiter = new Map<string, { tokens: number; ts: number }>();
function rateLimit(key: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = docsRateLimiter.get(key) || { tokens: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.tokens = 0;
    entry.ts = now;
  }
  entry.tokens += 1;
  docsRateLimiter.set(key, entry);
  return entry.tokens <= max;
}

const DocumentationSchema = z.object({
  sessionNotes: z.string().min(1),
  objectives: z.array(z.string()).default([]),
  performance: z.record(z.any()).default({}),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(userId)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: "Model service unavailable" }, { status: 503 });
    }

    const body = await req.json();
    const { sessionNotes, objectives, performance, model, temperature, maxTokens } = DocumentationSchema.parse(body);

    // PHI/PII guardrail on input
    const phiCheck = validateHealthcarePrompt(sessionNotes);
    if (!phiCheck.valid) {
      return NextResponse.json(
        { error: "Invalid content", issues: phiCheck.issues },
        { status: 400 }
      );
    }

    const systemPrompt = "You are a clinical documentation specialist. Create formal, HIPAA-compliant documentation for nursing education contexts.";

    const userPrompt = `Generate professional clinical documentation for a nursing education session.\n\nSession Notes: ${sessionNotes}\nLearning Objectives: ${objectives.join(", ")}\nStudent Performance: ${JSON.stringify(performance, null, 2)}\n\nCreate:\n1. Formal clinical evaluation summary\n2. SMART goals for next session\n3. Competency assessment aligned with nursing standards\n4. Recommendations for continued learning\n\nEnsure HIPAA compliance and educational best practices.`;

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: temperature ?? 0.3,
      max_tokens: maxTokens ?? 1500,
    });

    const documentation = completion.choices[0].message.content;

    const res = NextResponse.json({
      documentation,
      timestamp: new Date().toISOString(),
      model: completion.model,
    });
    res.headers.set("cache-control", "no-store");
    return res;
  } catch (error) {
    // Sanitize logs to avoid PHI/PII leakage
    console.error("Documentation generation error");
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to generate documentation" }, { status: 500 });
  }
}
