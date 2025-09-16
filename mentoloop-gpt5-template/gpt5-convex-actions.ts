// MentoLoop GPT-5 Convex Actions Template
// Integrates with your existing Convex backend for real-time AI operations

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Main GPT-5 mentorship matching action
export const performMentorMatch = action({
  args: {
    studentId: v.id("students"),
    preferences: v.object({
      specialty: v.string(),
      learningStyle: v.string(),
      availability: v.array(v.string()),
      clinicalGoals: v.string(),
    }),
    matchingCriteria: v.object({
      locationRadius: v.number(),
      experienceLevel: v.string(),
      languagePreferences: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Get student and available preceptors from database
    const student = await ctx.runQuery(internal.students.getById, { 
      id: args.studentId 
    });
    
    const availablePreceptors = await ctx.runQuery(
      internal.preceptors.getAvailable,
      { 
        specialty: args.preferences.specialty,
        radius: args.matchingCriteria.locationRadius 
      }
    );

    // Prepare GPT-5 prompt for advanced matching
    const systemPrompt = `You are MentorLoop's AI matching expert specializing in healthcare education.
    Analyze student profiles and preceptor capabilities to create optimal mentorship matches.
    
    Consider:
    - Clinical expertise alignment
    - Teaching style compatibility
    - Schedule availability
    - Geographic proximity
    - Learning objectives alignment
    - Previous feedback scores
    - HIPAA compliance requirements`;

    const userPrompt = `
    Student Profile:
    ${JSON.stringify(student, null, 2)}
    
    Student Preferences:
    ${JSON.stringify(args.preferences, null, 2)}
    
    Available Preceptors:
    ${JSON.stringify(availablePreceptors, null, 2)}
    
    Matching Criteria:
    ${JSON.stringify(args.matchingCriteria, null, 2)}
    
    Please provide:
    1. Top 3 preceptor matches with compatibility scores
    2. Detailed reasoning for each match
    3. Specific learning opportunities with each preceptor
    4. Potential challenges and mitigation strategies
    
    Return as JSON with structure:
    {
      "matches": [{
        "preceptorId": "string",
        "compatibilityScore": number (0-100),
        "reasoning": "string",
        "learningOpportunities": ["string"],
        "challenges": ["string"],
        "mitigationStrategies": ["string"]
      }],
      "overallRecommendation": "string"
    }`;

    try {
      // Call GPT-5 with structured output
      const completion = await openai.chat.completions.create({
        model: "gpt-5", // Will use gpt-4-turbo until GPT-5 is available
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const matchingResults = JSON.parse(
        completion.choices[0].message.content || "{}"
      );

      // Store matches in database
      await ctx.runMutation(internal.matches.create, {
        studentId: args.studentId,
        matches: matchingResults.matches,
        timestamp: Date.now(),
        aiModel: "gpt-5",
      });

      // Send notifications via SendGrid
      await ctx.runAction(internal.email.sendMatchNotification, {
        studentId: args.studentId,
        matches: matchingResults.matches,
      });

      return matchingResults;
      
    } catch (error) {
      console.error("GPT-5 matching error:", error);
      // Fallback to simpler matching algorithm
      return await ctx.runAction(internal.matching.fallbackMatch, args);
    }
  },
});

// Clinical documentation assistant
export const generateClinicalDocumentation = action({
  args: {
    sessionId: v.id("clinicalSessions"),
    sessionNotes: v.string(),
    objectives: v.array(v.string()),
    studentPerformance: v.object({
      strengths: v.array(v.string()),
      areasForImprovement: v.array(v.string()),
      clinicalSkillsAssessed: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate professional clinical documentation for a nursing education session.
    
    Session Notes: ${args.sessionNotes}
    Learning Objectives: ${args.objectives.join(", ")}
    Student Performance: ${JSON.stringify(args.studentPerformance, null, 2)}
    
    Create:
    1. Formal clinical evaluation summary
    2. SMART goals for next session
    3. Competency assessment aligned with nursing standards
    4. Recommendations for continued learning
    
    Ensure HIPAA compliance and educational best practices.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { 
          role: "system", 
          content: "You are a clinical education documentation specialist."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for formal documentation
      max_tokens: 1500,
    });

    const documentation = completion.choices[0].message.content;

    // Store in Convex with encryption
    await ctx.runMutation(internal.documentation.store, {
      sessionId: args.sessionId,
      content: documentation,
      aiGenerated: true,
      timestamp: Date.now(),
    });

    return documentation;
  },
});

// Real-time chat assistant for mentorship sessions
export const chatAssistant = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
    context: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("preceptor")),
  },
  handler: async (ctx, args) => {
    // Get conversation history
    const history = await ctx.runQuery(internal.conversations.getHistory, {
      conversationId: args.conversationId,
    });

    const systemPrompt = args.role === "student" 
      ? "You are a supportive clinical education assistant helping nursing students."
      : "You are a professional assistant helping preceptors with teaching strategies.";

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: args.message },
    ];

    // Stream response for real-time feel
    const stream = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      temperature: 0.8,
      max_tokens: 500,
      stream: true,
    });

    let fullResponse = "";
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
      
      // Update conversation in real-time via Convex
      await ctx.runMutation(internal.conversations.updateStream, {
        conversationId: args.conversationId,
        content: fullResponse,
        isComplete: false,
      });
    }

    // Store complete message
    await ctx.runMutation(internal.conversations.addMessage, {
      conversationId: args.conversationId,
      role: "assistant",
      content: fullResponse,
      timestamp: Date.now(),
    });

    return fullResponse;
  },
});

// Advanced evaluation generator
export const generateEvaluation = action({
  args: {
    studentId: v.id("students"),
    rotationId: v.id("rotations"),
    evaluationType: v.union(
      v.literal("midterm"),
      v.literal("final"),
      v.literal("weekly")
    ),
    performanceData: v.object({
      clinicalSkills: v.record(v.string(), v.number()), // skill -> score
      professionalBehavior: v.record(v.string(), v.number()),
      criticalThinking: v.record(v.string(), v.number()),
      communication: v.record(v.string(), v.number()),
    }),
    preceptorNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.runQuery(internal.students.getById, {
      id: args.studentId,
    });

    const prompt = `Generate a comprehensive ${args.evaluationType} evaluation for a nursing student.
    
    Student: ${student.name}
    Performance Metrics: ${JSON.stringify(args.performanceData, null, 2)}
    Preceptor Notes: ${args.preceptorNotes}
    
    Create a professional evaluation including:
    1. Overall performance summary
    2. Specific competency assessments
    3. Areas of excellence
    4. Areas requiring improvement
    5. Specific, actionable recommendations
    6. Progress since last evaluation (if applicable)
    
    Use nursing education best practices and maintain constructive, growth-oriented tone.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert nursing educator creating formal student evaluations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const evaluation = completion.choices[0].message.content;

    // Store evaluation
    const evaluationId = await ctx.runMutation(internal.evaluations.create, {
      studentId: args.studentId,
      rotationId: args.rotationId,
      type: args.evaluationType,
      content: evaluation,
      performanceData: args.performanceData,
      aiGenerated: true,
      timestamp: Date.now(),
    });

    // Send notification
    await ctx.runAction(internal.email.sendEvaluationComplete, {
      studentId: args.studentId,
      evaluationId,
    });

    return { evaluationId, content: evaluation };
  },
});

// Learning path generator
export const generateLearningPath = action({
  args: {
    studentId: v.id("students"),
    assessmentResults: v.object({
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      interests: v.array(v.string()),
      careerGoals: v.string(),
    }),
    timeframe: v.object({
      startDate: v.string(),
      endDate: v.string(),
      hoursPerWeek: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const prompt = `Design a personalized learning path for a nursing student.
    
    Assessment: ${JSON.stringify(args.assessmentResults, null, 2)}
    Timeframe: ${JSON.stringify(args.timeframe, null, 2)}
    
    Create a detailed learning path with:
    1. Weekly learning objectives
    2. Recommended clinical experiences
    3. Study resources and materials
    4. Skill-building exercises
    5. Milestone assessments
    6. Backup plans for common challenges
    
    Format as structured JSON for database storage.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a nursing education curriculum designer.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const learningPath = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Store learning path
    await ctx.runMutation(internal.learningPaths.create, {
      studentId: args.studentId,
      path: learningPath,
      startDate: args.timeframe.startDate,
      endDate: args.timeframe.endDate,
      aiGenerated: true,
    });

    return learningPath;
  },
});
