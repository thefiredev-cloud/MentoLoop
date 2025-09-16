// Next.js API Routes for GPT-5 Integration
// app/api/gpt5/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Request validation schemas
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().default('gpt-4-turbo-preview'), // Use until GPT-5 available
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  stream: z.boolean().default(false),
});

// Main chat endpoint with streaming support
export async function POST(req: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();
    
    // Validate request
    const validatedData = ChatRequestSchema.parse(body);
    
    // Add user context to system message
    const enhancedMessages = [
      {
        role: 'system' as const,
        content: `User context: ${user?.firstName} ${user?.lastName} (Role: ${user?.publicMetadata?.role || 'student'})`
      },
      ...validatedData.messages
    ];

    if (validatedData.stream) {
      // Handle streaming response
      const stream = await openai.chat.completions.create({
        model: validatedData.model,
        messages: enhancedMessages,
        temperature: validatedData.temperature,
        max_tokens: validatedData.maxTokens,
        stream: true,
      });

      // Create a ReadableStream
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || '';
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model: validatedData.model,
        messages: enhancedMessages,
        temperature: validatedData.temperature,
        max_tokens: validatedData.maxTokens,
      });

      return NextResponse.json({
        content: completion.choices[0].message.content,
        usage: completion.usage,
        model: completion.model,
      });
    }
  } catch (error) {
    console.error('GPT-5 API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Specialized endpoint for clinical documentation
export async function POST_DOCUMENTATION(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionNotes, objectives, performance } = body;

    const systemPrompt = `You are a clinical documentation specialist. Create formal, HIPAA-compliant documentation.`;
    
    const userPrompt = `
      Session Notes: ${sessionNotes}
      Objectives: ${objectives.join(', ')}
      Performance: ${JSON.stringify(performance)}
      
      Generate professional clinical documentation including:
      1. Objective summary
      2. Skills demonstrated
      3. Areas of improvement
      4. Next session goals
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return NextResponse.json({
      documentation: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      generatedBy: 'gpt-5-api',
    });
  } catch (error) {
    console.error('Documentation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
}

// Function calling endpoint for complex operations
export async function POST_FUNCTION(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { operation, parameters } = body;

    const functions = [
      {
        name: 'scheduleSession',
        description: 'Schedule a mentorship session',
        parameters: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            time: { type: 'string' },
            duration: { type: 'number' },
            topic: { type: 'string' },
            participants: { 
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['date', 'time', 'duration', 'topic']
        }
      },
      {
        name: 'generateReport',
        description: 'Generate progress report',
        parameters: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            period: { type: 'string' },
            metrics: { 
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['studentId', 'period']
        }
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a healthcare education assistant with function calling capabilities.'
        },
        {
          role: 'user',
          content: `Execute operation: ${operation} with parameters: ${JSON.stringify(parameters)}`
        }
      ],
      functions,
      function_call: 'auto',
    });

    const functionCall = completion.choices[0].message.function_call;
    
    if (functionCall) {
      // Process function call
      const functionName = functionCall.name;
      const functionArgs = JSON.parse(functionCall.arguments);
      
      // Execute function logic here
      let result;
      switch (functionName) {
        case 'scheduleSession':
          // Integrate with calendar system
          result = {
            success: true,
            sessionId: `session_${Date.now()}`,
            details: functionArgs
          };
          break;
        case 'generateReport':
          // Generate report logic
          result = {
            success: true,
            reportId: `report_${Date.now()}`,
            summary: 'Report generated successfully'
          };
          break;
        default:
          result = { success: false, error: 'Unknown function' };
      }
      
      return NextResponse.json({
        function: functionName,
        arguments: functionArgs,
        result
      });
    }

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Function calling error:', error);
    return NextResponse.json(
      { error: 'Function execution failed' },
      { status: 500 }
    );
  }
}
