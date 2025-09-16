// Prompt Engineering Library for Healthcare Mentorship
// Optimized patterns for MentoLoop GPT-5 integration

export const PROMPT_TEMPLATES = {
  // System prompts for different contexts
  systems: {
    mentor: `You are an experienced healthcare mentor with expertise in nursing education, clinical practice, and professional development. Provide guidance that is evidence-based, compassionate, and aligned with current healthcare standards.`,
    
    evaluator: `You are a clinical education evaluator specializing in objective assessment of nursing competencies. Focus on constructive feedback, QSEN competencies, and professional growth.`,
    
    coordinator: `You are a clinical placement coordinator optimizing student-preceptor matches based on learning objectives, clinical expertise, and scheduling constraints.`,
    
    documentor: `You are a healthcare documentation specialist ensuring HIPAA compliance, educational standards, and clear clinical communication.`,
  },

  // Few-shot examples for consistency
  fewShot: {
    clinicalReasoning: [
      {
        input: "Patient presents with chest pain and shortness of breath",
        output: "Systematic assessment: 1) Immediate vital signs and O2 sat, 2) PQRST pain assessment, 3) ECG within 10 minutes, 4) Consider cardiac vs respiratory vs anxiety etiology, 5) Notify provider per protocol"
      },
      {
        input: "Medication error near-miss identified",
        output: "Response protocol: 1) Ensure patient safety, 2) Document incident details, 3) Root cause analysis, 4) System improvement recommendations, 5) Education opportunity for team"
      }
    ],
    
    mentorshipGuidance: [
      {
        input: "Student struggling with time management in clinical",
        output: "Support strategy: 1) Observe current workflow, 2) Identify specific bottlenecks, 3) Teach prioritization frameworks (ABC, urgent/important), 4) Practice clustering care, 5) Set incremental goals with regular check-ins"
      }
    ]
  },

  // Chain of Thought patterns
  chainOfThought: {
    matchingAnalysis: `Let's analyze this student-preceptor match step by step:
1. Review student learning objectives and experience level
2. Assess preceptor teaching style and clinical expertise
3. Compare schedules and geographic proximity
4. Evaluate personality compatibility indicators
5. Consider previous feedback and success patterns
6. Calculate overall compatibility score
7. Identify potential challenges and growth opportunities`,

    evaluationProcess: `Comprehensive evaluation approach:
1. Review objective performance metrics
2. Analyze clinical decision-making examples
3. Assess professional behavior observations
4. Evaluate communication effectiveness
5. Compare to expected competency levels
6. Identify patterns of growth
7. Formulate specific, actionable recommendations`,
  },

  // Output format specifications
  outputFormats: {
    structured: "Provide response as JSON with keys: summary, details, recommendations, nextSteps",
    narrative: "Write in professional narrative format suitable for official documentation",
    bullet: "Use bullet points with clear headers for each main section",
    conversational: "Respond in a supportive, conversational tone appropriate for student interaction"
  }
};

// Advanced prompt construction utilities
export class PromptBuilder {
  private context: string[] = [];
  private constraints: string[] = [];
  private examples: any[] = [];
  
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
      prompt += `Constraints:\n${this.constraints.map(c => `- ${c}`).join("\n")}\n\n`;
    }
    
    prompt += `Output Format: ${outputFormat}`;
    
    return prompt;
  }
}

// Healthcare-specific prompt validators
export function validateHealthcarePrompt(prompt: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for PHI/PII
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{10}\b/, // Phone
    /MRN:\s*\d+/i, // Medical Record Number
  ];
  
  phiPatterns.forEach(pattern => {
    if (pattern.test(prompt)) {
      issues.push("Potential PHI detected - remove identifying information");
    }
  });
  
  // Check for appropriate medical terminology
  const inappropriateTerms = ["diagnosis", "prescribe", "treatment plan"];
  inappropriateTerms.forEach(term => {
    if (prompt.toLowerCase().includes(term)) {
      issues.push(`Use of '${term}' may exceed educational scope`);
    }
  });
  
  // Ensure educational context
  const educationalKeywords = ["learning", "student", "education", "teaching", "mentor"];
  const hasEducationalContext = educationalKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword)
  );
  
  if (!hasEducationalContext) {
    issues.push("Add educational context to clarify mentorship purpose");
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Prompt optimization for token efficiency
export function optimizePrompt(prompt: string, maxTokens: number = 2000): string {
  // Remove redundancy
  let optimized = prompt
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  
  // Compress common phrases
  const compressions = {
    "Please provide": "Provide",
    "Can you please": "Please",
    "I would like you to": "Please",
    "It would be helpful if": "Please",
  };
  
  Object.entries(compressions).forEach(([long, short]) => {
    optimized = optimized.replace(new RegExp(long, 'gi'), short);
  });
  
  // Estimate tokens (rough approximation)
  const estimatedTokens = optimized.split(/\s+/).length * 1.3;
  
  if (estimatedTokens > maxTokens) {
    // Truncate with ellipsis
    const words = optimized.split(/\s+/);
    const targetWords = Math.floor(maxTokens / 1.3);
    optimized = words.slice(0, targetWords).join(' ') + '...';
  }
  
  return optimized;
}

// Response quality validators
export function validateResponse(
  response: string,
  criteria: {
    minLength?: number;
    maxLength?: number;
    requiredSections?: string[];
    tone?: 'professional' | 'supportive' | 'instructional';
  }
): boolean {
  const words = response.split(/\s+/).length;
  
  if (criteria.minLength && words < criteria.minLength) return false;
  if (criteria.maxLength && words > criteria.maxLength) return false;
  
  if (criteria.requiredSections) {
    for (const section of criteria.requiredSections) {
      if (!response.toLowerCase().includes(section.toLowerCase())) {
        return false;
      }
    }
  }
  
  if (criteria.tone === 'professional') {
    const casualWords = ['hey', 'yeah', 'kinda', 'gonna'];
    if (casualWords.some(word => response.toLowerCase().includes(word))) {
      return false;
    }
  }
  
  return true;
}

// Specialized prompt generators
export const PromptGenerators = {
  generateMatchingPrompt(student: any, preceptors: any[]): string {
    return new PromptBuilder()
      .addContext("Healthcare mentorship matching for nursing education")
      .addContext(`Student specialty: ${student.specialty}`)
      .addContext(`Available preceptors: ${preceptors.length}`)
      .addConstraint("Consider clinical expertise alignment")
      .addConstraint("Evaluate scheduling compatibility")
      .addConstraint("Assess teaching style match")
      .addConstraint("Factor in geographic proximity")
      .build("Create optimal student-preceptor matches with detailed reasoning");
  },
  
  generateEvaluationPrompt(performance: any, rubric: any): string {
    return new PromptBuilder()
      .addContext("Clinical performance evaluation")
      .addContext(`Evaluation rubric: ${JSON.stringify(rubric)}`)
      .addConstraint("Use objective, measurable language")
      .addConstraint("Include specific examples")
      .addConstraint("Maintain constructive tone")
      .addConstraint("Align with QSEN competencies")
      .build("Generate comprehensive performance evaluation", "narrative");
  },
  
  generateLearningPathPrompt(assessment: any, goals: string[]): string {
    return new PromptBuilder()
      .addContext("Personalized nursing education pathway")
      .addContext(`Current competencies: ${JSON.stringify(assessment)}`)
      .addContext(`Career goals: ${goals.join(", ")}`)
      .addConstraint("Create weekly milestones")
      .addConstraint("Include diverse learning modalities")
      .addConstraint("Incorporate clinical and theoretical components")
      .build("Design 12-week learning pathway with specific objectives");
  }
};
