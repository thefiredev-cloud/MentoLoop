// Prompt Engineering Library for Healthcare Mentorship
// Derived from mentoloop-gpt5-template/prompt-engineering.ts and adapted for this repo

export const PROMPT_TEMPLATES = {
  systems: {
    mentor:
      "You are an experienced healthcare mentor with expertise in nursing education, clinical practice, and professional development. Provide guidance that is evidence-based, compassionate, and aligned with current healthcare standards.",
    evaluator:
      "You are a clinical education evaluator specializing in objective assessment of nursing competencies. Focus on constructive feedback, QSEN competencies, and professional growth.",
    coordinator:
      "You are a clinical placement coordinator optimizing student-preceptor matches based on learning objectives, clinical expertise, and scheduling constraints.",
    documentor:
      "You are a healthcare documentation specialist ensuring HIPAA compliance, educational standards, and clear clinical communication.",
  },
  fewShot: {
    clinicalReasoning: [
      {
        input: "Patient presents with chest pain and shortness of breath",
        output:
          "Systematic assessment: 1) Immediate vital signs and O2 sat, 2) PQRST pain assessment, 3) ECG within 10 minutes, 4) Consider cardiac vs respiratory vs anxiety etiology, 5) Notify provider per protocol",
      },
      {
        input: "Medication error near-miss identified",
        output:
          "Response protocol: 1) Ensure patient safety, 2) Document incident details, 3) Root cause analysis, 4) System improvement recommendations, 5) Education opportunity for team",
      },
    ],
    mentorshipGuidance: [
      {
        input: "Student struggling with time management in clinical",
        output:
          "Support strategy: 1) Observe current workflow, 2) Identify specific bottlenecks, 3) Teach prioritization frameworks (ABC, urgent/important), 4) Practice clustering care, 5) Set incremental goals with regular check-ins",
      },
    ],
  },
  chainOfThought: {
    matchingAnalysis:
      "Let's analyze this student-preceptor match step by step:\n1. Review student learning objectives and experience level\n2. Assess preceptor teaching style and clinical expertise\n3. Compare schedules and geographic proximity\n4. Evaluate personality compatibility indicators\n5. Consider previous feedback and success patterns\n6. Calculate overall compatibility score\n7. Identify potential challenges and growth opportunities",
    evaluationProcess:
      "Comprehensive evaluation approach:\n1. Review objective performance metrics\n2. Analyze clinical decision-making examples\n3. Assess professional behavior observations\n4. Evaluate communication effectiveness\n5. Compare to expected competency levels\n6. Identify patterns of growth\n7. Formulate specific, actionable recommendations",
  },
  outputFormats: {
    structured:
      "Provide response as JSON with keys: summary, details, recommendations, nextSteps",
    narrative:
      "Write in professional narrative format suitable for official documentation",
    bullet:
      "Use bullet points with clear headers for each main section",
    conversational:
      "Respond in a supportive, conversational tone appropriate for student interaction",
  },
};

export class PromptBuilder {
  private context: string[] = [];
  private constraints: string[] = [];
  private examples: Array<{ input: string; output: string }> = [];

  addContext(context: string): this {
    this.context.push(context);
    return this;
  }

  addConstraint(constraint: string): this {
    this.constraints.push(constraint);
    return this;
  }

  addExample(input: string, output: string): this {
    this.examples.push({ input, output });
    return this;
  }

  build(task: string, outputFormat: string = "structured"): string {
    let prompt = "";
    if (this.context.length > 0) {
      prompt += `Context:\n${this.context.join("\n")}\n\n`;
    }
    if (this.examples.length > 0) {
      prompt += "Examples:\n";
      this.examples.forEach((ex, i) => {
        prompt += `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}\n\n`;
      });
    }
    prompt += `Task: ${task}\n\n`;
    if (this.constraints.length > 0) {
      prompt += `Constraints:\n${this.constraints.map((c) => `- ${c}`).join("\n")}\n\n`;
    }
    prompt += `Output Format: ${outputFormat}`;
    return prompt;
  }
}

export function validateHealthcarePrompt(prompt: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{10}\b/, // Phone
    /MRN:\\s*\d+/i, // Medical Record Number
  ];
  phiPatterns.forEach((pattern) => {
    if (pattern.test(prompt)) {
      issues.push("Potential PHI detected - remove identifying information");
    }
  });
  const inappropriateTerms = ["diagnosis", "prescribe", "treatment plan"];
  inappropriateTerms.forEach((term) => {
    if (prompt.toLowerCase().includes(term)) {
      issues.push(`Use of '${term}' may exceed educational scope`);
    }
  });
  const educationalKeywords = [
    "learning",
    "student",
    "education",
    "teaching",
    "mentor",
  ];
  const hasEducationalContext = educationalKeywords.some((k) =>
    prompt.toLowerCase().includes(k)
  );
  if (!hasEducationalContext) {
    issues.push("Add educational context to clarify mentorship purpose");
  }
  return { valid: issues.length === 0, issues };
}

export function optimizePrompt(prompt: string, maxTokens: number = 2000): string {
  let optimized = prompt.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n");
  const compressions: Record<string, string> = {
    "Please provide": "Provide",
    "Can you please": "Please",
    "I would like you to": "Please",
    "It would be helpful if": "Please",
  };
  for (const [long, short] of Object.entries(compressions)) {
    optimized = optimized.replace(new RegExp(long, "gi"), short);
  }
  const estimatedTokens = optimized.split(/\s+/).length * 1.3;
  if (estimatedTokens > maxTokens) {
    const words = optimized.split(/\s+/);
    const targetWords = Math.floor(maxTokens / 1.3);
    optimized = words.slice(0, targetWords).join(" ") + "...";
  }
  return optimized;
}

export function validateResponse(
  response: string,
  criteria: {
    minLength?: number;
    maxLength?: number;
    requiredSections?: string[];
    tone?: "professional" | "supportive" | "instructional";
  }
): boolean {
  const words = response.split(/\s+/).length;
  if (criteria.minLength && words < criteria.minLength) return false;
  if (criteria.maxLength && words > criteria.maxLength) return false;
  if (criteria.requiredSections) {
    for (const section of criteria.requiredSections) {
      if (!response.toLowerCase().includes(section.toLowerCase())) return false;
    }
  }
  if (criteria.tone === "professional") {
    const casualWords = ["hey", "yeah", "kinda", "gonna"];
    if (casualWords.some((w) => response.toLowerCase().includes(w))) return false;
  }
  return true;
}

type GenericRecord = Record<string, unknown>;

export const PromptGenerators = {
  generateMatchingPrompt(student: { specialty?: string | null }, preceptors: GenericRecord[]): string {
    return new PromptBuilder()
      .addContext("Healthcare mentorship matching for nursing education")
      .addContext(`Student specialty: ${student?.specialty ?? "unknown"}`)
      .addContext(`Available preceptors: ${preceptors?.length ?? 0}`)
      .addConstraint("Consider clinical expertise alignment")
      .addConstraint("Evaluate scheduling compatibility")
      .addConstraint("Assess teaching style match")
      .addConstraint("Factor in geographic proximity")
      .build("Create optimal student-preceptor matches with detailed reasoning");
  },
  generateEvaluationPrompt(_performance: GenericRecord, rubric: GenericRecord): string {
    return new PromptBuilder()
      .addContext("Clinical performance evaluation")
      .addContext(`Evaluation rubric: ${JSON.stringify(rubric)}`)
      .addConstraint("Use objective, measurable language")
      .addConstraint("Include specific examples")
      .addConstraint("Maintain constructive tone")
      .addConstraint("Align with QSEN competencies")
      .build("Generate comprehensive performance evaluation", "narrative");
  },
  generateLearningPathPrompt(assessment: GenericRecord, goals: string[]): string {
    return new PromptBuilder()
      .addContext("Personalized nursing education pathway")
      .addContext(`Current competencies: ${JSON.stringify(assessment)}`)
      .addContext(`Career goals: ${goals.join(", ")}`)
      .addConstraint("Create weekly milestones")
      .addConstraint("Include diverse learning modalities")
      .addConstraint("Incorporate clinical and theoretical components")
      .build("Design 12-week learning pathway with specific objectives");
  },
};
