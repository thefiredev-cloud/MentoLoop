import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

// Perform AI-enhanced mentor matches by evaluating available preceptors
export const performMentorMatch = action({
  args: {
    studentId: v.id("students"),
    preferences: v.object({
      specialty: v.optional(v.string()),
      state: v.optional(v.string()),
    }),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    matches: Array<{
      preceptorId: Id<"preceptors">;
      compatibilityScore: number;
      analysis?: string[];
      recommendations?: string[];
    }>;
    totalConsidered: number;
    returned: number;
  }> => {
    const limit = Math.max(1, Math.min(args.limit ?? 3, 10));

    // Get available preceptors using existing query
    const preceptors: Doc<"preceptors">[] = await ctx.runQuery(
      api.preceptors.getAvailablePreceptors,
      {
        specialty: args.preferences.specialty,
        state: args.preferences.state,
      }
    );

    // Score each preceptor using internal enhanced matching
    const scored: Array<{
      preceptorId: Id<"preceptors">;
      compatibilityScore: number;
      details: {
        enhancedScore: number;
        insights?: string[];
        recommendations?: string[];
      };
    }> = [];

    for (const p of preceptors) {
      try {
        const analysis = await ctx.runAction(
          internal.aiMatching.calculateEnhancedMatch,
          {
            studentId: args.studentId,
            preceptorId: p._id,
          }
        );
        scored.push({ preceptorId: p._id, compatibilityScore: analysis.enhancedScore, details: analysis });
      } catch {
        // Skip preceptors that fail analysis
      }
    }

    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const top = scored.slice(0, limit);

    return {
      matches: top.map((m) => ({
        preceptorId: m.preceptorId,
        compatibilityScore: m.compatibilityScore,
        analysis: m.details?.insights,
        recommendations: m.details?.recommendations,
      })),
      totalConsidered: preceptors.length,
      returned: top.length,
    };
  },
});
