import { v } from "convex/values";
import { action, internalAction, query } from "./_generated/server";
import { internal } from "./_generated/api";

// AI-powered matching enhancement for MentorFit algorithm
export const generateAIMatchAnalysis = action({
  args: {
    studentProfile: v.any(),
    preceptorProfile: v.any(),
    baseScore: v.number(),
  },
  handler: async (ctx, args) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      console.error("No AI API keys configured");
      return {
        success: false,
        enhancedScore: args.baseScore,
        analysis: "AI analysis unavailable - using base MentorFit score",
        confidence: "low",
        recommendations: []
      };
    }

    try {
      // Prepare student and preceptor data for AI analysis
      const studentContext = {
        specialty: args.studentProfile.rotationNeeds?.rotationType || [],
        learningStyle: args.studentProfile.learningStyle || {},
        preferences: args.studentProfile.matchingPreferences || {},
        experience: args.studentProfile.schoolInfo?.programFormat || "",
        location: args.studentProfile.rotationNeeds?.preferredLocation || "",
        schedule: {
          availability: args.studentProfile.rotationNeeds?.daysAvailable || [],
          startDate: args.studentProfile.rotationNeeds?.startDate || "",
          hours: args.studentProfile.rotationNeeds?.weeklyHours || ""
        }
      };

      const preceptorContext = {
        specialty: args.preceptorProfile.availability?.availableRotations || [],
        mentoring: args.preceptorProfile.mentoringStyle || {},
        practice: args.preceptorProfile.practiceInfo || {},
        availability: args.preceptorProfile.availability || {},
        experience: args.preceptorProfile.availability?.maxStudents || 1
      };

      // Try OpenAI first, fallback to Gemini
      let aiResponse;
      if (openaiApiKey) {
        aiResponse = await callOpenAI(studentContext, preceptorContext, args.baseScore, openaiApiKey);
      } else if (geminiApiKey) {
        aiResponse = await callGemini(studentContext, preceptorContext, args.baseScore, geminiApiKey);
      }

      if (!aiResponse) {
        throw new Error("AI analysis failed");
      }

      return {
        success: true,
        enhancedScore: aiResponse.enhancedScore,
        analysis: aiResponse.analysis,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        strengths: aiResponse.strengths,
        concerns: aiResponse.concerns,
        aiProvider: openaiApiKey ? "openai" : "gemini"
      };

    } catch (error) {
      console.error("AI matching analysis failed:", error);
      return {
        success: false,
        enhancedScore: args.baseScore,
        analysis: `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        confidence: "low",
        recommendations: ["Review match manually due to AI analysis failure"]
      };
    }
  },
});

async function callOpenAI(student: any, preceptor: any, baseScore: number, apiKey: string) {
  const prompt = createMatchingPrompt(student, preceptor, baseScore);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in nurse practitioner clinical education and student-preceptor matching. Analyze the compatibility between students and preceptors for optimal learning outcomes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiAnalysis = data.choices[0]?.message?.content;
  
  return parseAIResponse(aiAnalysis, baseScore);
}

async function callGemini(student: any, preceptor: any, baseScore: number, apiKey: string) {
  const prompt = createMatchingPrompt(student, preceptor, baseScore);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert in nurse practitioner clinical education and student-preceptor matching. Analyze the compatibility between students and preceptors for optimal learning outcomes.\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiAnalysis = data.candidates[0]?.content?.parts[0]?.text;
  
  return parseAIResponse(aiAnalysis, baseScore);
}

function createMatchingPrompt(student: any, preceptor: any, baseScore: number): string {
  return `Analyze this student-preceptor pairing for NP clinical education:

STUDENT PROFILE:
- Specialty Interest: ${JSON.stringify(student.specialty)}
- Learning Style: ${JSON.stringify(student.learningStyle)}
- Experience Level: ${student.experience}
- Schedule: ${JSON.stringify(student.schedule)}
- Location: ${student.location}
- Preferences: ${JSON.stringify(student.preferences)}

PRECEPTOR PROFILE:
- Specialties Offered: ${JSON.stringify(preceptor.specialty)}
- Mentoring Style: ${JSON.stringify(preceptor.mentoring)}
- Practice Setting: ${JSON.stringify(preceptor.practice)}
- Availability: ${JSON.stringify(preceptor.availability)}
- Experience with Students: ${preceptor.experience}

CURRENT MENTORFIT SCORE: ${baseScore}/10

Please provide a JSON response with the following structure:
{
  "enhancedScore": <number 0-10>,
  "confidence": "<high|medium|low>",
  "analysis": "<detailed analysis>",
  "strengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>", "<concern2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}

Consider factors like:
- Teaching/learning style compatibility
- Specialty alignment and clinical exposure
- Schedule and logistics compatibility
- Experience level match
- Communication preferences
- Professional development opportunities
- Potential challenges and how to address them

Focus on educational outcomes and student success.`;
}

function parseAIResponse(aiResponse: string, fallbackScore: number) {
  try {
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      enhancedScore: Math.max(0, Math.min(10, parsed.enhancedScore || fallbackScore)),
      confidence: parsed.confidence || "medium",
      analysis: parsed.analysis || "AI analysis completed",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return {
      enhancedScore: fallbackScore,
      confidence: "low",
      analysis: "AI response parsing failed, using base score",
      strengths: [],
      concerns: ["AI analysis could not be processed"],
      recommendations: ["Manual review recommended"]
    };
  }
}

// Batch AI analysis for multiple potential matches
export const batchAnalyzeMatches = action({
  args: {
    studentId: v.id("students"),
    potentialMatches: v.array(v.object({
      preceptorId: v.id("preceptors"),
      baseScore: v.number(),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const results = [];
    
    try {
      // Get student profile
      const student = await ctx.runQuery(internal.students.getStudentById, { 
        studentId: args.studentId 
      });
      
      if (!student) {
        throw new Error("Student not found");
      }

      // Process matches in batches to avoid timeout
      const matchesToProcess = args.potentialMatches.slice(0, limit);
      
      for (const match of matchesToProcess) {
        try {
          // Get preceptor profile
          const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, { 
            preceptorId: match.preceptorId 
          });
          
          if (!preceptor) {
            console.error(`Preceptor ${match.preceptorId} not found`);
            continue;
          }

          // Run AI analysis
          const aiAnalysis = await generateAIMatchAnalysis(ctx, {
            studentProfile: student,
            preceptorProfile: preceptor,
            baseScore: match.baseScore,
          });

          results.push({
            preceptorId: match.preceptorId,
            preceptorName: preceptor.personalInfo?.fullName || "Unknown",
            baseScore: match.baseScore,
            ...aiAnalysis
          });

        } catch (error) {
          console.error(`Failed to analyze match for preceptor ${match.preceptorId}:`, error);
          results.push({
            preceptorId: match.preceptorId,
            baseScore: match.baseScore,
            success: false,
            enhancedScore: match.baseScore,
            analysis: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            confidence: "low",
            recommendations: ["Manual review required"]
          });
        }
      }

      // Sort by enhanced score
      results.sort((a, b) => b.enhancedScore - a.enhancedScore);

      return {
        success: true,
        totalAnalyzed: results.length,
        matches: results,
        aiProvider: process.env.OPENAI_API_KEY ? "openai" : "gemini",
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("Batch AI analysis failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        matches: [],
        timestamp: Date.now()
      };
    }
  },
});

// Get AI matching insights for analytics
export const getAIMatchingAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, return mock analytics - we'll implement proper tracking later
    return {
      totalAIAnalyses: 0,
      averageEnhancement: 0,
      topRecommendations: [],
      confidenceDistribution: {
        high: 0,
        medium: 0,
        low: 0
      },
      aiProviderUsage: {
        openai: 0,
        gemini: 0
      },
      successRate: 0
    };
  },
});

// Internal action to enhance existing matches with AI analysis
export const enhanceExistingMatches = internalAction({
  args: {
    matchIds: v.array(v.id("matches")),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const matchId of args.matchIds) {
      try {
        const match = await ctx.runQuery(internal.matches.getMatchById, { matchId });
        if (!match) continue;

        const student = await ctx.runQuery(internal.students.getStudentById, { 
          studentId: match.studentId 
        });
        const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, { 
          preceptorId: match.preceptorId 
        });

        if (!student || !preceptor) continue;

        const aiAnalysis = await ctx.runAction(generateAIMatchAnalysis, {
          studentProfile: student,
          preceptorProfile: preceptor,
          baseScore: match.mentorFitScore || 5,
        });

        // Update match with AI insights
        await ctx.runMutation(internal.matches.updateMatchWithAI, {
          matchId,
          aiAnalysis: {
            enhancedScore: aiAnalysis.enhancedScore,
            analysis: aiAnalysis.analysis,
            confidence: aiAnalysis.confidence,
            recommendations: aiAnalysis.recommendations,
            strengths: aiAnalysis.strengths || [],
            concerns: aiAnalysis.concerns || [],
            analyzedAt: Date.now()
          }
        });

        results.push({ matchId, success: true, enhancedScore: aiAnalysis.enhancedScore });
      } catch (error) {
        console.error(`Failed to enhance match ${matchId}:`, error);
        results.push({ matchId, success: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return results;
  },
});