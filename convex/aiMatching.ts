import { v } from "convex/values";
import { action, internalAction, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Calculate MentorFit compatibility score first, then enhance with AI analysis
export const generateMatchWithAI = internalAction({
  args: {
    studentId: v.id("students"),
    preceptorId: v.id("preceptors"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    mentorFitScore: number;
    enhancedScore: number;
    analysis: any;
    confidence: any;
    recommendations: any;
    strengths: any;
    concerns: any;
    aiProvider: string;
    compatibility: any;
  }> => {
    // First, calculate the MentorFit compatibility score
    const compatibility = await ctx.runQuery(api.mentorfit.calculateCompatibility, {
      studentId: args.studentId,
      preceptorId: args.preceptorId
    });

    const studentProfile = await ctx.runQuery(internal.students.getStudentById, { 
      studentId: args.studentId 
    });
    const preceptorProfile = await ctx.runQuery(internal.preceptors.getPreceptorById, { 
      preceptorId: args.preceptorId 
    });

    if (!studentProfile || !preceptorProfile) {
      throw new Error("Student or preceptor profile not found");
    }
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      console.error("No AI API keys configured");
      return {
        success: true,
        mentorFitScore: compatibility.score,
        enhancedScore: compatibility.score,
        analysis: `MentorFit™ Score: ${compatibility.score}/10 (${compatibility.tier}). ${compatibility.explanation}`,
        confidence: compatibility.tier === 'GOLD' ? 'high' : compatibility.tier === 'SILVER' ? 'medium' : 'low',
        recommendations: [`Review ${compatibility.tier.toLowerCase()} compatibility match details`],
        strengths: Object.entries(compatibility.breakdown)
          .filter(([_, score]) => (score as number) >= 1.5)
          .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').trim()),
        concerns: Object.entries(compatibility.breakdown)
          .filter(([_, score]) => (score as number) < 1)
          .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').trim()),
        aiProvider: "mentorfit",
        compatibility
      };
    }

    try {
      // Prepare student and preceptor data for AI analysis
      const studentContext = {
        specialty: studentProfile.rotationNeeds?.rotationTypes || [],
        learningStyle: studentProfile.learningStyle || {},
        preferences: studentProfile.matchingPreferences || {},
        experience: studentProfile.schoolInfo?.programFormat || "",
        location: studentProfile.rotationNeeds?.preferredLocation || "",
        schedule: {
          availability: studentProfile.rotationNeeds?.daysAvailable || [],
          startDate: studentProfile.rotationNeeds?.startDate || "",
          hours: studentProfile.rotationNeeds?.weeklyHours || ""
        }
      };

      const preceptorContext = {
        specialty: preceptorProfile.availability?.availableRotations || [],
        mentoring: preceptorProfile.mentoringStyle || {},
        practice: preceptorProfile.practiceInfo || {},
        availability: preceptorProfile.availability || {},
        experience: preceptorProfile.availability?.maxStudentsPerRotation || "1"
      };

      // Try OpenAI first, fallback to Gemini
      let aiResponse;
      if (openaiApiKey) {
        aiResponse = await callOpenAI(studentContext, preceptorContext, compatibility.score, openaiApiKey, compatibility);
      } else if (geminiApiKey) {
        aiResponse = await callGemini(studentContext, preceptorContext, compatibility.score, geminiApiKey, compatibility);
      }

      if (!aiResponse) {
        throw new Error("AI analysis failed");
      }

      return {
        success: true,
        mentorFitScore: compatibility.score,
        enhancedScore: aiResponse.enhancedScore,
        analysis: aiResponse.analysis,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        strengths: aiResponse.strengths,
        concerns: aiResponse.concerns,
        aiProvider: openaiApiKey ? "openai" : "gemini",
        compatibility
      };

    } catch (error) {
      console.error("AI matching analysis failed:", error);
      return {
        success: false,
        mentorFitScore: compatibility.score,
        enhancedScore: compatibility.score,
        analysis: `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Using MentorFit™ Score: ${compatibility.score}/10`,
        confidence: "low",
        recommendations: ["Review match manually due to AI analysis failure"],
        strengths: [],
        concerns: ["AI analysis failed"],
        aiProvider: "error",
        compatibility
      };
    }
  },
});

async function callOpenAI(student: any, preceptor: any, baseScore: number, apiKey: string, compatibility: any) {
  const prompt = createMatchingPrompt(student, preceptor, baseScore, compatibility);
  
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

async function callGemini(student: any, preceptor: any, baseScore: number, apiKey: string, compatibility: any) {
  const prompt = createMatchingPrompt(student, preceptor, baseScore, compatibility);
  
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

function createMatchingPrompt(student: any, preceptor: any, baseScore: number, compatibility: any): string {
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

MENTORFIT™ COMPATIBILITY ANALYSIS:
- Overall Score: ${baseScore}/10 (${compatibility.tier})
- Learning Style Match: ${compatibility.breakdown.learningStyleMatch}/2
- Feedback Alignment: ${compatibility.breakdown.feedbackMatch}/2
- Autonomy Match: ${compatibility.breakdown.autonomyMatch}/2
- Structure Preference: ${compatibility.breakdown.structureMatch}/2
- Resource Needs: ${compatibility.breakdown.resourceMatch}/2
- Observation Style: ${compatibility.breakdown.observationMatch}/2
- Correction Style: ${compatibility.breakdown.correctionMatch}/2
- Retention Method: ${compatibility.breakdown.retentionMatch}/2
- Relationship Dynamic: ${compatibility.breakdown.relationshipMatch}/2
- Professional Values: ${compatibility.breakdown.professionalValuesMatch}/2
- Compatibility Tier: ${compatibility.tier}
- Explanation: ${compatibility.explanation}

Based on the MentorFit™ analysis above, provide an enhanced AI analysis as JSON:
{
  "enhancedScore": <number 0-10 - consider the MentorFit score and add contextual insights>,
  "confidence": "<high|medium|low>",
  "analysis": "<detailed analysis building on MentorFit breakdown>",
  "strengths": ["<strength1 from compatibility>", "<strength2>"],
  "concerns": ["<concern1 from low scores>", "<concern2>"],
  "recommendations": ["<actionable recommendation1>", "<recommendation2>"]
}

Enhancement Guidelines:
- Start with MentorFit™ score as baseline (do not go below it unless serious concerns)
- Consider schedule/logistics compatibility not covered in MentorFit
- Factor in specialty alignment depth and clinical exposure opportunities  
- Evaluate experience level appropriateness for student's program stage
- Assess potential for professional growth and networking
- Identify any red flags or exceptional opportunities
- Focus on actionable insights for optimizing the mentorship

The enhanced score should rarely differ more than 1 point from MentorFit unless there are compelling logistical or specialty-specific factors.`;
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
  handler: async (ctx, args): Promise<any[]> => {
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

        const aiAnalysis = await ctx.runAction(internal.aiMatching.generateMatchWithAI, {
          studentId: student._id,
          preceptorId: preceptor._id,
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

// Enhanced matching algorithm with weighted criteria
export const calculateEnhancedMatch = internalAction({
  args: {
    studentId: v.id("students"),
    preceptorId: v.id("preceptors"),
  },
  handler: async (ctx, args): Promise<any> => {
    const student: any = await ctx.runQuery(internal.students.getStudentById, { 
      studentId: args.studentId 
    });
    const preceptor: any = await ctx.runQuery(internal.preceptors.getPreceptorById, { 
      preceptorId: args.preceptorId 
    });

    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    // Calculate weighted compatibility scores
    const scores: Record<string, number> = {
      specialty: calculateSpecialtyMatch(student, preceptor),
      location: calculateLocationMatch(student, preceptor),
      schedule: calculateScheduleMatch(student, preceptor),
      learningStyle: calculateLearningStyleMatch(student, preceptor),
      experience: calculateExperienceMatch(student, preceptor),
      values: calculateValuesMatch(student, preceptor),
      communication: calculateCommunicationMatch(student, preceptor),
      availability: calculateAvailabilityMatch(student, preceptor),
    };

    // Weighted scoring (total = 100%)
    const weights = {
      specialty: 0.25,      // 25% - Most important
      learningStyle: 0.20,  // 20% - Learning compatibility
      schedule: 0.15,       // 15% - Schedule alignment
      location: 0.15,       // 15% - Geographic proximity
      experience: 0.10,     // 10% - Experience level match
      values: 0.05,         // 5% - Professional values
      communication: 0.05,  // 5% - Communication style
      availability: 0.05,   // 5% - Current availability
    };

    // Calculate weighted total score
    const totalScore: number = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score as number * weights[key as keyof typeof weights]);
    }, 0);

    // Generate insights and recommendations
    const insights = generateMatchInsights(scores, student, preceptor);
    const recommendations = generateRecommendations(scores, student, preceptor);

    return {
      enhancedScore: Math.round(totalScore * 10), // Convert to 0-10 scale
      detailedScores: scores,
      weights,
      insights,
      recommendations,
      matchQuality: totalScore >= 0.8 ? 'excellent' : 
                   totalScore >= 0.7 ? 'good' : 
                   totalScore >= 0.6 ? 'fair' : 'poor',
      confidenceLevel: calculateConfidenceLevel(scores),
    };
  },
});

// Helper functions for enhanced matching
function calculateSpecialtyMatch(student: any, preceptor: any): number {
  const studentRotations = student.rotationNeeds?.rotationTypes || [];
  const preceptorRotations = preceptor.availability?.availableRotations || [];
  
  if (studentRotations.length === 0 || preceptorRotations.length === 0) return 0.5;
  
  const matches = studentRotations.filter((rotation: string) => 
    preceptorRotations.includes(rotation)
  );
  
  return matches.length / Math.max(studentRotations.length, 1);
}

function calculateLocationMatch(student: any, preceptor: any): number {
  const studentLocation = student.rotationNeeds?.preferredLocation;
  const preceptorLocation = preceptor.practiceInfo;
  
  if (!studentLocation || !preceptorLocation) return 0.5;
  
  // Same city = 1.0, same state = 0.7, different = 0.3
  if (studentLocation.city?.toLowerCase() === preceptorLocation.city?.toLowerCase()) {
    return 1.0;
  } else if (studentLocation.state?.toLowerCase() === preceptorLocation.state?.toLowerCase()) {
    return 0.7;
  } else {
    return 0.3;
  }
}

function calculateScheduleMatch(student: any, preceptor: any): number {
  const studentDays = student.rotationNeeds?.daysAvailable || [];
  const preceptorDays = preceptor.availability?.daysAvailable || [];
  
  if (studentDays.length === 0 || preceptorDays.length === 0) return 0.5;
  
  const matchingDays = studentDays.filter((day: string) => 
    preceptorDays.includes(day)
  );
  
  return matchingDays.length / Math.max(studentDays.length, 1);
}

function calculateLearningStyleMatch(student: any, preceptor: any): number {
  const studentStyle = student.learningStyle || {};
  const preceptorStyle = preceptor.mentoringStyle || {};
  
  let matchScore = 0;
  let totalCriteria = 0;
  
  // Compare feedback preferences
  if (studentStyle.feedbackPreference && preceptorStyle.feedbackApproach) {
    totalCriteria++;
    if (areCompatibleFeedbackStyles(studentStyle.feedbackPreference, preceptorStyle.feedbackApproach)) {
      matchScore++;
    }
  }
  
  // Compare learning vs mentoring approach
  if (studentStyle.learningMethod && preceptorStyle.mentoringApproach) {
    totalCriteria++;
    if (areCompatibleApproaches(studentStyle.learningMethod, preceptorStyle.mentoringApproach)) {
      matchScore++;
    }
  }
  
  return totalCriteria > 0 ? matchScore / totalCriteria : 0.5;
}

function calculateExperienceMatch(student: any, preceptor: any): number {
  const studentStage = student.learningStyle?.programStage;
  const preceptorExperience = preceptor.mentoringStyle?.studentsPrecepted;
  
  // New students need experienced preceptors, experienced students can work with newer preceptors
  if (studentStage === 'just-starting' && preceptorExperience === '10-plus') return 1.0;
  if (studentStage === 'mid-program' && preceptorExperience !== 'none-yet') return 0.8;
  if (studentStage === 'near-graduation') return 0.9; // Can work with most preceptors
  
  return 0.6; // Default moderate match
}

function calculateValuesMatch(student: any, preceptor: any): number {
  const studentValues = student.learningStyle?.professionalValues || [];
  const preceptorValues = preceptor.mentoringStyle?.professionalValues || [];
  
  if (studentValues.length === 0 || preceptorValues.length === 0) return 0.5;
  
  const sharedValues = studentValues.filter((value: string) => 
    preceptorValues.includes(value)
  );
  
  return sharedValues.length / Math.max(studentValues.length, preceptorValues.length);
}

function calculateCommunicationMatch(student: any, preceptor: any): number {
  const studentLanguages = student.matchingPreferences?.languagesSpoken || ['English'];
  const preceptorLanguages = preceptor.matchingPreferences?.languagesSpoken || ['English'];
  
  const sharedLanguages = studentLanguages.filter((lang: string) => 
    preceptorLanguages.includes(lang)
  );
  
  return sharedLanguages.length > 0 ? 1.0 : 0.5;
}

function calculateAvailabilityMatch(student: any, preceptor: any): number {
  if (!preceptor.availability?.currentlyAccepting) return 0.0;
  
  const maxStudents = parseInt(preceptor.availability?.maxStudentsPerRotation || "1");
  // Assume current capacity check would be done elsewhere
  return maxStudents > 1 ? 1.0 : 0.8;
}

function areCompatibleFeedbackStyles(studentPref: string, preceptorStyle: string): boolean {
  const compatibilityMatrix: Record<string, string[]> = {
    'real-time': ['real-time', 'daily-checkins'],
    'end-of-day': ['daily-checkins', 'weekly-written'],
    'minimal': ['weekly-written'],
  };
  
  return compatibilityMatrix[studentPref]?.includes(preceptorStyle) || false;
}

function areCompatibleApproaches(studentMethod: string, preceptorApproach: string): boolean {
  const compatibilityMatrix: Record<string, string[]> = {
    'hands-on': ['coach-guide', 'support-needed'],
    'step-by-step': ['coach-guide', 'support-needed'],
    'independent': ['expect-initiative', 'support-needed'],
  };
  
  return compatibilityMatrix[studentMethod]?.includes(preceptorApproach) || false;
}

function generateMatchInsights(scores: any, student: any, preceptor: any): string[] {
  const insights = [];
  
  if (scores.specialty > 0.8) {
    insights.push("Excellent specialty alignment - strong clinical focus match");
  } else if (scores.specialty < 0.3) {
    insights.push("Limited specialty overlap - may require additional coordination");
  }
  
  if (scores.learningStyle > 0.7) {
    insights.push("Learning and mentoring styles are well-aligned");
  } else if (scores.learningStyle < 0.4) {
    insights.push("Different teaching/learning preferences - will need clear communication");
  }
  
  if (scores.location > 0.8) {
    insights.push("Convenient location match - minimal travel required");
  } else if (scores.location < 0.5) {
    insights.push("Distance may be a factor - consider travel logistics");
  }
  
  return insights;
}

function generateRecommendations(scores: any, student: any, preceptor: any): string[] {
  const recommendations = [];
  
  if (scores.communication < 0.7) {
    recommendations.push("Schedule a preliminary video call to establish communication preferences");
  }
  
  if (scores.schedule < 0.6) {
    recommendations.push("Discuss schedule flexibility and find mutually convenient times");
  }
  
  if (scores.learningStyle < 0.5) {
    recommendations.push("Review learning objectives and mentoring approach before starting");
  }
  
  recommendations.push("Set clear expectations for rotation goals and evaluation criteria");
  
  return recommendations;
}

function calculateConfidenceLevel(scores: any): string {
  const avgScore = Object.values(scores).reduce((sum: number, score) => sum + (score as number), 0) / Object.keys(scores).length;
  
  if (avgScore >= 0.8) return 'high';
  if (avgScore >= 0.6) return 'medium';
  return 'low';
}

// Batch analyze multiple matches with AI
export const batchAnalyzeMatches = internalAction({
  args: {
    studentId: v.id("students"),
    potentialMatches: v.array(v.object({
      preceptorId: v.id("preceptors"),
      baseScore: v.number(),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const matches = [];
    const limit = args.limit || 5;
    
    try {
      for (let i = 0; i < Math.min(args.potentialMatches.length, limit); i++) {
        const match = args.potentialMatches[i];
        
        // Use existing generateMatchWithAI for each match
        const aiResult = await ctx.runAction(internal.aiMatching.generateMatchWithAI, {
          studentId: args.studentId,
          preceptorId: match.preceptorId,
        });
        
        if (aiResult.success) {
          matches.push({
            preceptorId: match.preceptorId,
            preceptorName: `Preceptor ${i + 1}`, // Would fetch from preceptor data
            baseScore: match.baseScore,
            enhancedScore: aiResult.enhancedScore,
            analysis: aiResult.analysis,
            confidence: aiResult.confidence,
            strengths: aiResult.strengths,
            concerns: aiResult.concerns,
            recommendations: aiResult.recommendations,
          });
        }
      }
      
      return {
        success: true,
        matches,
        totalAnalyzed: matches.length,
        aiProvider: "claude",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        matches: [],
        totalAnalyzed: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});
