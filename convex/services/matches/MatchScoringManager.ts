export type Tier = { name: string; color: string; description: string };

export class MatchScoringManager {
  getTierFromScore(score: number): Tier {
    if (score >= 8.5) return { name: "Gold", color: "gold", description: "Exceptional compatibility" };
    if (score >= 7.0) return { name: "Silver", color: "silver", description: "Strong compatibility" };
    return { name: "Bronze", color: "bronze", description: "Good compatibility" };
  }

  calculateMentorFitScore(studentLearningStyle: any, preceptorMentoringStyle: any): number {
    let score = 0;
    let maxScore = 0;
    maxScore += 2;
    if (
      (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
      (studentLearningStyle.learningMethod === "step-by-step" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
      (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "expect-initiative")
    ) {
      score += 2;
    } else if (
      (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "support-needed") ||
      (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "support-needed")
    ) {
      score += 1;
    }

    maxScore += 2;
    if (
      (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "real-time") ||
      (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
      (studentLearningStyle.feedbackPreference === "minimal" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
    ) {
      score += 2;
    } else if (
      (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
      (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
    ) {
      score += 1;
    }

    maxScore += 2;
    if (
      (studentLearningStyle.structurePreference === "clear-schedules" && preceptorMentoringStyle.rotationStart === "orient-goals") ||
      (studentLearningStyle.structurePreference === "open-ended" && preceptorMentoringStyle.rotationStart === "dive-in-learn") ||
      (studentLearningStyle.structurePreference === "general-guidance" && preceptorMentoringStyle.rotationStart === "observe-adjust")
    ) {
      score += 2;
    } else {
      score += 1;
    }

    maxScore += 2;
    if (
      (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "high-independence") ||
      (studentLearningStyle.clinicalComfort === "not-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision") ||
      (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions")
    ) {
      score += 2;
    } else if (
      (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions") ||
      (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision")
    ) {
      score += 1;
    }

    maxScore += 2;
    if (
      (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "always") ||
      (studentLearningStyle.additionalResources === "not-necessary" && preceptorMentoringStyle.learningMaterials === "rarely") ||
      (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "sometimes")
    ) {
      score += 2;
    } else if (
      (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "sometimes") ||
      (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "always")
    ) {
      score += 1;
    }

    maxScore += 2;
    if (
      (studentLearningStyle.mentorRelationship === "teacher-coach" && preceptorMentoringStyle.idealDynamic === "learner-teacher") ||
      (studentLearningStyle.mentorRelationship === "collaborator" && preceptorMentoringStyle.idealDynamic === "teammates") ||
      (studentLearningStyle.mentorRelationship === "supervisor" && preceptorMentoringStyle.idealDynamic === "supervisee-clinician")
    ) {
      score += 2;
    } else {
      score += 1;
    }

    return Math.round((score / maxScore) * 10);
  }
}
