import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// MentorFit™ Compatibility Scoring Algorithm
// Calculates compatibility scores (0-10) between students and preceptors

interface CompatibilityScore {
  score: number;
  breakdown: {
    learningStyleMatch: number;
    feedbackMatch: number;
    autonomyMatch: number;
    structureMatch: number;
    resourceMatch: number;
    observationMatch: number;
    correctionMatch: number;
    retentionMatch: number;
    relationshipMatch: number;
    professionalValuesMatch: number;
  };
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  explanation: string;
}

// Core matching logic for basic questions (required)
function calculateBasicCompatibility(studentStyle: any, preceptorStyle: any): number {
  let score = 0;
  let totalWeight = 0;

  // Learning Method vs Mentoring Approach (Weight: 3)
  const learningStyleScore = calculateLearningStyleMatch(
    studentStyle.learningMethod, 
    preceptorStyle.mentoringApproach
  );
  score += learningStyleScore * 3;
  totalWeight += 3;

  // Feedback Preference Match (Weight: 3)
  const feedbackScore = calculateFeedbackMatch(
    studentStyle.feedbackPreference,
    preceptorStyle.feedbackApproach
  );
  score += feedbackScore * 3;
  totalWeight += 3;

  // Autonomy Comfort vs Autonomy Level (Weight: 2.5)
  const autonomyScore = calculateAutonomyMatch(
    studentStyle.clinicalComfort,
    preceptorStyle.autonomyLevel
  );
  score += autonomyScore * 2.5;
  totalWeight += 2.5;

  // Structure Preference vs Teaching Style (Weight: 2)
  const structureScore = calculateStructureMatch(
    studentStyle.structurePreference,
    preceptorStyle.rotationStart
  );
  score += structureScore * 2;
  totalWeight += 2;

  // Resource Needs vs Materials Provided (Weight: 1.5)
  const resourceScore = calculateResourceMatch(
    studentStyle.additionalResources,
    preceptorStyle.learningMaterials
  );
  score += resourceScore * 1.5;
  totalWeight += 1.5;

  // Observation vs Patient Interaction Style (Weight: 2)
  const observationScore = calculateObservationMatch(
    studentStyle.observationPreference,
    preceptorStyle.patientInteractions
  );
  score += observationScore * 2;
  totalWeight += 2;

  // Correction Style Match (Weight: 2)
  const correctionScore = calculateCorrectionMatch(
    studentStyle.correctionStyle,
    preceptorStyle.feedbackApproach
  );
  score += correctionScore * 2;
  totalWeight += 2;

  // Retention vs Question Preference (Weight: 1.5)
  const retentionScore = calculateRetentionMatch(
    studentStyle.retentionStyle,
    preceptorStyle.questionPreference
  );
  score += retentionScore * 1.5;
  totalWeight += 1.5;

  // Mentor Relationship vs Ideal Dynamic (Weight: 2.5)
  const relationshipScore = calculateRelationshipMatch(
    studentStyle.mentorRelationship,
    preceptorStyle.idealDynamic
  );
  score += relationshipScore * 2.5;
  totalWeight += 2.5;

  return Math.min(10, (score / totalWeight) * 10);
}

// Individual matching functions
function calculateLearningStyleMatch(studentMethod: string, preceptorApproach: string): number {
  const matches: Record<string, Record<string, number>> = {
    'hands-on': {
      'coach-guide': 2,
      'support-needed': 1,
      'expect-initiative': 0
    },
    'step-by-step': {
      'coach-guide': 2,
      'support-needed': 2,
      'expect-initiative': 0
    },
    'independent': {
      'coach-guide': 0,
      'support-needed': 1,
      'expect-initiative': 2
    }
  };
  return matches[studentMethod]?.[preceptorApproach] || 0;
}

function calculateFeedbackMatch(studentPref: string, preceptorApproach: string): number {
  const matches: Record<string, Record<string, number>> = {
    'real-time': {
      'real-time': 2,
      'daily-checkins': 1,
      'weekly-written': 0
    },
    'end-of-day': {
      'real-time': 0,
      'daily-checkins': 2,
      'weekly-written': 1
    },
    'minimal': {
      'real-time': 0,
      'daily-checkins': 1,
      'weekly-written': 2
    }
  };
  return matches[studentPref]?.[preceptorApproach] || 0;
}

function calculateAutonomyMatch(studentComfort: string, preceptorLevel: string): number {
  const matches: Record<string, Record<string, number>> = {
    'not-comfortable': {
      'close-supervision': 2,
      'shared-decisions': 1,
      'high-independence': 0
    },
    'somewhat-comfortable': {
      'close-supervision': 1,
      'shared-decisions': 2,
      'high-independence': 1
    },
    'very-comfortable': {
      'close-supervision': 0,
      'shared-decisions': 1,
      'high-independence': 2
    }
  };
  return matches[studentComfort]?.[preceptorLevel] || 0;
}

function calculateStructureMatch(studentPref: string, preceptorStart: string): number {
  const matches: Record<string, Record<string, number>> = {
    'clear-schedules': {
      'orient-goals': 2,
      'observe-adjust': 1,
      'dive-in-learn': 0
    },
    'general-guidance': {
      'orient-goals': 1,
      'observe-adjust': 2,
      'dive-in-learn': 1
    },
    'open-ended': {
      'orient-goals': 0,
      'observe-adjust': 1,
      'dive-in-learn': 2
    }
  };
  return matches[studentPref]?.[preceptorStart] || 0;
}

function calculateResourceMatch(studentNeeds: string, preceptorProvides: string): number {
  const matches: Record<string, Record<string, number>> = {
    'yes-love': {
      'always': 2,
      'sometimes': 1,
      'rarely': 0
    },
    'occasionally': {
      'always': 1,
      'sometimes': 2,
      'rarely': 1
    },
    'not-necessary': {
      'always': 0,
      'sometimes': 1,
      'rarely': 2
    }
  };
  return matches[studentNeeds]?.[preceptorProvides] || 0;
}

function calculateObservationMatch(studentPref: string, preceptorStyle: string): number {
  const matches: Record<string, Record<string, number>> = {
    'observe-first': {
      'lead-then-shadow': 2,
      'shadow-then-lead': 2,
      'lead-from-day-one': 0
    },
    'mix-both': {
      'lead-then-shadow': 1,
      'shadow-then-lead': 2,
      'lead-from-day-one': 1
    },
    'jump-in': {
      'lead-then-shadow': 0,
      'shadow-then-lead': 1,
      'lead-from-day-one': 2
    }
  };
  return matches[studentPref]?.[preceptorStyle] || 0;
}

function calculateCorrectionMatch(studentStyle: string, preceptorApproach: string): number {
  const matches: Record<string, Record<string, number>> = {
    'direct-immediate': {
      'real-time': 2,
      'daily-checkins': 1,
      'weekly-written': 0
    },
    'supportive-private': {
      'real-time': 1,
      'daily-checkins': 2,
      'weekly-written': 1
    },
    'written-summaries': {
      'real-time': 0,
      'daily-checkins': 1,
      'weekly-written': 2
    }
  };
  return matches[studentStyle]?.[preceptorApproach] || 0;
}

function calculateRetentionMatch(studentStyle: string, preceptorPref: string): number {
  const matches: Record<string, Record<string, number>> = {
    'watching-doing': {
      'anytime-during': 2,
      'breaks-downtime': 1,
      'end-of-day': 0
    },
    'note-taking': {
      'anytime-during': 1,
      'breaks-downtime': 2,
      'end-of-day': 1
    },
    'questions-discussion': {
      'anytime-during': 2,
      'breaks-downtime': 2,
      'end-of-day': 1
    }
  };
  return matches[studentStyle]?.[preceptorPref] || 0;
}

function calculateRelationshipMatch(studentPref: string, preceptorDynamic: string): number {
  const matches: Record<string, Record<string, number>> = {
    'teacher-coach': {
      'learner-teacher': 2,
      'teammates': 1,
      'supervisee-clinician': 0
    },
    'collaborator': {
      'learner-teacher': 1,
      'teammates': 2,
      'supervisee-clinician': 1
    },
    'supervisor': {
      'learner-teacher': 0,
      'teammates': 1,
      'supervisee-clinician': 2
    }
  };
  return matches[studentPref]?.[preceptorDynamic] || 0;
}

// Professional values overlap calculation
function calculateProfessionalValuesMatch(studentValues: string[], preceptorValues: string[]): number {
  if (!studentValues?.length || !preceptorValues?.length) return 1; // Neutral if not provided
  
  const overlap = studentValues.filter(value => preceptorValues.includes(value));
  const overlapRatio = overlap.length / Math.max(studentValues.length, preceptorValues.length);
  
  return overlapRatio * 2; // Scale to 0-2 range
}

// Determine compatibility tier based on score
function getCompatibilityTier(score: number): 'GOLD' | 'SILVER' | 'BRONZE' {
  if (score >= 8) return 'GOLD';
  if (score >= 5) return 'SILVER';
  return 'BRONZE';
}

// Generate explanation based on score and breakdown
function generateExplanation(score: number, breakdown: any): string {
  const tier = getCompatibilityTier(score);
  
  if (tier === 'GOLD') {
    return "Excellent match! This preceptor's teaching style aligns very well with your learning preferences, creating ideal conditions for a successful rotation.";
  } else if (tier === 'SILVER') {
    return "Good compatibility. This pairing should work well with some minor adjustments in communication and expectations.";
  } else {
    return "Lower compatibility. Consider discussing learning preferences and teaching expectations upfront to ensure alignment.";
  }
}

// Main compatibility calculation function (exposed as public query)
export const calculateCompatibility = query({
  args: {
    studentId: v.id("students"),
    preceptorId: v.id("preceptors")
  },
  handler: async (ctx, { studentId, preceptorId }): Promise<CompatibilityScore> => {
    const student = await ctx.db.get(studentId);
    const preceptor = await ctx.db.get(preceptorId);

    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    const studentStyle = student.learningStyle;
    const preceptorStyle = preceptor.mentoringStyle;

    // Calculate basic compatibility (required fields)
    const basicScore = calculateBasicCompatibility(studentStyle, preceptorStyle);
    
    // Calculate professional values match (optional)
    const valuesScore = calculateProfessionalValuesMatch(
      studentStyle.professionalValues || [],
      preceptorStyle.professionalValues || []
    );

    // Create detailed breakdown
    const breakdown = {
      learningStyleMatch: calculateLearningStyleMatch(studentStyle.learningMethod, preceptorStyle.mentoringApproach),
      feedbackMatch: calculateFeedbackMatch(studentStyle.feedbackPreference, preceptorStyle.feedbackApproach),
      autonomyMatch: calculateAutonomyMatch(studentStyle.clinicalComfort, preceptorStyle.autonomyLevel),
      structureMatch: calculateStructureMatch(studentStyle.structurePreference, preceptorStyle.rotationStart),
      resourceMatch: calculateResourceMatch(studentStyle.additionalResources, preceptorStyle.learningMaterials),
      observationMatch: calculateObservationMatch(studentStyle.observationPreference, preceptorStyle.patientInteractions),
      correctionMatch: calculateCorrectionMatch(studentStyle.correctionStyle, preceptorStyle.feedbackApproach),
      retentionMatch: calculateRetentionMatch(studentStyle.retentionStyle, preceptorStyle.questionPreference),
      relationshipMatch: calculateRelationshipMatch(studentStyle.mentorRelationship, preceptorStyle.idealDynamic),
      professionalValuesMatch: valuesScore
    };

    // Combine scores with values bonus
    const finalScore = Math.min(10, basicScore + (valuesScore * 0.5));
    
    const tier = getCompatibilityTier(finalScore);
    const explanation = generateExplanation(finalScore, breakdown);

    return {
      score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
      breakdown,
      tier,
      explanation
    };
  }
});

// Find compatible preceptors for a student
export const findCompatiblePreceptors = query({
  args: {
    studentId: v.id("students"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { studentId, limit = 10 }): Promise<any[]> => {
    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get verified preceptors with availability
    const preceptors = await ctx.db
      .query("preceptors")
      .filter((q) => 
        q.and(
          q.eq(q.field("verificationStatus"), "verified"),
          q.eq(q.field("availability.currentlyAccepting"), true)
        )
      )
      .collect();

    // Calculate compatibility for each preceptor
    const compatibilityPromises = preceptors.map(async (preceptor): Promise<any> => {
      const compatibility = await ctx.runQuery(api.mentorfit.calculateCompatibility, {
        studentId,
        preceptorId: preceptor._id
      });
      
      return {
        preceptor,
        compatibility
      };
    });

    const results: any[] = await Promise.all(compatibilityPromises);
    
    // Sort by compatibility score and limit results
    return results
      .sort((a: any, b: any) => b.compatibility.score - a.compatibility.score)
      .slice(0, limit);
  }
});

// Create a match with calculated compatibility
export const createMatchWithCompatibility = mutation({
  args: {
    studentId: v.id("students"),
    preceptorId: v.id("preceptors"),
    rotationDetails: v.object({
      startDate: v.string(),
      endDate: v.string(),
      weeklyHours: v.number(),
      rotationType: v.string(),
      location: v.optional(v.string())
    })
  },
  handler: async (ctx, { studentId, preceptorId, rotationDetails }): Promise<any> => {
    // Calculate compatibility
    const compatibility: any = await ctx.runQuery(api.mentorfit.calculateCompatibility, { studentId, preceptorId });
    
    // Create match record
    const matchId: any = await ctx.db.insert("matches", {
      studentId,
      preceptorId,
      status: "suggested",
      mentorFitScore: compatibility.score,
      rotationDetails,
      paymentStatus: "unpaid",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return {
      matchId,
      compatibility
    };
  }
});

// Recompute compatibility for an existing match and update its score
export const recomputeMatchCompatibility = mutation({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, { matchId }): Promise<{ score: number; tier: 'GOLD' | 'SILVER' | 'BRONZE' }> => {
    const match = await ctx.db.get(matchId)
    if (!match) throw new Error('Match not found')

    const student = await ctx.db.get(match.studentId)
    const preceptor = await ctx.db.get(match.preceptorId)
    if (!student || !preceptor) throw new Error('Student or preceptor not found')

    const compatibility: any = await ctx.runQuery(api.mentorfit.calculateCompatibility, {
      studentId: match.studentId,
      preceptorId: match.preceptorId,
    })

    await ctx.db.patch(matchId, {
      mentorFitScore: compatibility.score,
      updatedAt: Date.now(),
    })

    return { score: compatibility.score, tier: compatibility.tier }
  },
})

// Save MentorFit assessment answers for a student
export const saveMentorFitAssessment = mutation({
  args: {
    studentId: v.id("students"),
    assessmentAnswers: v.record(v.string(), v.string())
  },
  handler: async (ctx, { studentId, assessmentAnswers }) => {
    // Get the student record
    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Map assessment answers to correct schema values
    const mapLearningStyle = (value: string): "hands-on" | "step-by-step" | "independent" => {
      if (value === 'hands-on' || value === 'observation') return 'hands-on';
      if (value === 'explanation' || value === 'slow-thorough') return 'step-by-step';
      return 'independent';
    };

    const mapClinicalComfort = (value: string): "not-comfortable" | "somewhat-comfortable" | "very-comfortable" => {
      if (value === 'close-supervision' || value === 'collaborative-support') return 'not-comfortable';
      if (value === 'guided-independence') return 'somewhat-comfortable';
      return 'very-comfortable';
    };

    const mapFeedbackPref = (value: string): "real-time" | "end-of-day" | "minimal" => {
      if (value === 'immediate' || value === 'real-time') return 'real-time';
      if (value === 'end-shift' || value === 'daily') return 'end-of-day';
      return 'minimal';
    };

    // Process the assessment answers into learning style data
    const learningStyle = {
      learningMethod: mapLearningStyle(assessmentAnswers.learning_style || 'hands-on'),
      feedbackPreference: mapFeedbackPref(assessmentAnswers.feedback_timing || 'real-time'),
      clinicalComfort: mapClinicalComfort(assessmentAnswers.independence_level || 'guided-independence'),
      structurePreference: assessmentAnswers.learning_pace === 'fast-intensive' ? 'open-ended' as const : 
                          assessmentAnswers.learning_pace === 'slow-thorough' ? 'clear-schedules' as const : 
                          'general-guidance' as const,
      additionalResources: assessmentAnswers.motivation_source === 'knowledge-growth' ? 'yes-love' as const : 
                           assessmentAnswers.motivation_source === 'skill-mastery' ? 'occasionally' as const : 
                           'not-necessary' as const,
      observationPreference: assessmentAnswers.case_complexity === 'simple-building' ? 'observe-first' as const :
                            assessmentAnswers.case_complexity === 'complex-challenging' ? 'jump-in' as const :
                            'mix-both' as const,
      correctionStyle: assessmentAnswers.mistake_handling === 'immediate-correction' ? 'direct-immediate' as const :
                      assessmentAnswers.mistake_handling === 'private-discussion' ? 'supportive-private' as const :
                      'written-summaries' as const,
      retentionStyle: assessmentAnswers.problem_solving === 'intuitive' ? 'watching-doing' as const :
                      assessmentAnswers.problem_solving === 'systematic' ? 'note-taking' as const :
                      'questions-discussion' as const,
      mentorRelationship: assessmentAnswers.preceptor_relationship === 'mentor-mentee' ? 'teacher-coach' as const :
                         assessmentAnswers.preceptor_relationship === 'collaborative-partnership' ? 'collaborator' as const :
                         'supervisor' as const,
      proactiveQuestions: 3, // Default middle value
      professionalValues: [] // Will be set based on assessment answers
    };

    // Update the student record with their learning style
    await ctx.db.patch(studentId, {
      learningStyle,
      updatedAt: Date.now()
    });

    return { success: true, studentId };
  }
});