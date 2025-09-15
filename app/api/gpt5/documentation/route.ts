// Next.js API Route for GPT-5 Clinical Documentation
// POST /api/gpt5/documentation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { validateHealthcarePrompt } from "@/lib/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionNotes, objectives, performance } = body || {};

    const issues = validateHealthcarePrompt(`${sessionNotes}\n${JSON.stringify(objectives)}\n${JSON.stringify(performance)}`);
    if (!issues.valid) {
      return NextResponse.json({ error: "Invalid content", issues: issues.issues }, { status: 400 });
    }

    const systemPrompt =
      "You are a clinical documentation specialist. Create formal, HIPAA-compliant documentation.";

    const userPrompt = `
Session Notes: ${sessionNotes}
Objectives: ${(objectives || []).join(", ")}
Performance: ${JSON.stringify(performance || {})}

Generate professional clinical documentation including:
1. Objective summary
2. Skills demonstrated
3. Areas of improvement
4. Next session goals
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return NextResponse.json({
      documentation: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      generatedBy: "gpt-5-api",
    });
  } catch (error) {
    console.error("Documentation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate documentation" },
      { status: 500 }
    );
  }
}
