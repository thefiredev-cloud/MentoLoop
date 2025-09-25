import { internal } from "../../_generated/api";

export class MatchSelectionManager {
  async findPotentialMatches(ctx: any, studentId: string): Promise<Array<{ preceptor: any; mentorFitScore: number; locationScore: number; overallScore: number }>> {
    const student = await ctx.db.get(studentId as any);
    if (!student) throw new Error("Student not found");

    const availablePreceptors = await ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q: any) => q.eq("verificationStatus", "verified"))
      .collect();

    const { MatchScoringManager } = await import("./MatchScoringManager");
    const scoring = new MatchScoringManager();

    const potentialMatches: Array<{ preceptor: any; mentorFitScore: number; locationScore: number; overallScore: number }> = [];
    for (const preceptor of availablePreceptors) {
      if (!preceptor.availability?.currentlyAccepting) continue;

      const hasMatchingRotation = preceptor.availability.availableRotations?.some((rotation: any) =>
        student.rotationNeeds?.rotationTypes?.includes(rotation)
      );
      if (!hasMatchingRotation) continue;

      const mentorFitScore = scoring.calculateMentorFitScore(student.learningStyle, preceptor.mentoringStyle);

      let locationScore = 2;
      if (student.rotationNeeds?.preferredLocation?.state === preceptor.practiceInfo?.state) {
        locationScore = 2.5;
      }
      if (student.rotationNeeds?.preferredLocation?.city === preceptor.practiceInfo?.city) {
        locationScore = 3;
      } else if (student.rotationNeeds?.willingToTravel) {
        locationScore = 2;
      }

      const overallScore = (mentorFitScore * 0.7) + (locationScore * 0.3);
      potentialMatches.push({ preceptor, mentorFitScore, locationScore, overallScore });
    }

    return potentialMatches.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);
  }
}
