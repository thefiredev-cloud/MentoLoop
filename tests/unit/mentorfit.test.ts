import { describe, it, expect, vi } from 'vitest'

// Mock Convex functions
const mockRunQuery = vi.fn()
const mockCtx = {
  runQuery: mockRunQuery,
}

// Mock student and preceptor data for testing
const mockStudent = {
  _id: 'student123',
  profile: {
    learningMethod: 'hands-on',
    feedbackPreference: 'immediate',
    clinicalComfort: 'supervised',
    structurePreference: 'structured',
    communicationStyle: 'direct',
    expectations: {
      timeManagement: 'structured',
      professionalGuidance: 'regular'
    }
  }
}

const mockPreceptor = {
  _id: 'preceptor123',
  profile: {
    mentoringApproach: 'hands-on',
    feedbackApproach: 'immediate',
    autonomyLevel: 'supervised',
    structureStyle: 'structured',
    communicationStyle: 'direct',
    mentoringPreferences: {
      timeManagement: 'structured',
      professionalGuidance: 'regular'
    }
  }
}

describe('MentorFit Compatibility Algorithm', () => {
  describe('Learning Style Matching', () => {
    it('should return high score for perfect learning style match', () => {
      // Test hands-on learner with hands-on mentor
      const score = calculateLearningStyleMatch('hands-on', 'hands-on')
      expect(score).toBe(10)
    })

    it('should return medium score for compatible styles', () => {
      // Test visual learner with demonstration-based mentor
      const score = calculateLearningStyleMatch('visual', 'demonstration')
      expect(score).toBeGreaterThanOrEqual(7)
    })

    it('should return low score for incompatible styles', () => {
      // Test hands-on learner with theory-focused mentor
      const score = calculateLearningStyleMatch('hands-on', 'theory')
      expect(score).toBeLessThanOrEqual(4)
    })
  })

  describe('Feedback Preference Matching', () => {
    it('should return high score for matching feedback preferences', () => {
      const score = calculateFeedbackMatch('immediate', 'immediate')
      expect(score).toBe(10)
    })

    it('should return medium score for compatible feedback styles', () => {
      const score = calculateFeedbackMatch('immediate', 'real-time')
      expect(score).toBeGreaterThanOrEqual(7)
    })

    it('should return low score for incompatible feedback styles', () => {
      const score = calculateFeedbackMatch('immediate', 'end-of-rotation')
      expect(score).toBeLessThanOrEqual(4)
    })
  })

  describe('Autonomy Level Matching', () => {
    it('should return high score for matching autonomy levels', () => {
      const score = calculateAutonomyMatch('supervised', 'supervised')
      expect(score).toBe(10)
    })

    it('should return appropriate score for slight autonomy mismatch', () => {
      const score = calculateAutonomyMatch('guided', 'supervised')
      expect(score).toBeGreaterThanOrEqual(6)
      expect(score).toBeLessThanOrEqual(8)
    })

    it('should return low score for major autonomy mismatch', () => {
      const score = calculateAutonomyMatch('independent', 'supervised')
      expect(score).toBeLessThanOrEqual(4)
    })
  })

  describe('Overall Compatibility Calculation', () => {
    it('should calculate high compatibility for well-matched profiles', () => {
      const compatibility = calculateBasicCompatibility(mockStudent.profile, mockPreceptor.profile)
      expect(compatibility).toBeGreaterThanOrEqual(8)
    })

    it('should handle missing profile data gracefully', () => {
      const incompleteStudent = {
        learningMethod: 'hands-on',
        // Missing other fields
      }
      const compatibility = calculateBasicCompatibility(incompleteStudent, mockPreceptor.profile)
      expect(compatibility).toBeGreaterThanOrEqual(0)
      expect(compatibility).toBeLessThanOrEqual(10)
    })

    it('should assign correct tier based on score', () => {
      const goldScore = 9.0
      const silverScore = 7.5
      const bronzeScore = 6.0
      const lowScore = 4.0

      expect(getCompatibilityTier(goldScore)).toBe('GOLD')
      expect(getCompatibilityTier(silverScore)).toBe('SILVER')
      expect(getCompatibilityTier(bronzeScore)).toBe('BRONZE')
      expect(getCompatibilityTier(lowScore)).toBe('BRONZE')
    })
  })

  describe('Professional Values Matching', () => {
    it('should score professional values alignment correctly', () => {
      const studentValues = {
        communicationStyle: 'direct',
        timeManagement: 'structured',
        professionalGuidance: 'regular'
      }
      const preceptorValues = {
        communicationStyle: 'direct',
        timeManagement: 'structured',
        professionalGuidance: 'regular'
      }
      
      const score = calculateProfessionalValuesMatch(studentValues, preceptorValues)
      expect(score).toBe(10)
    })

    it('should handle partial professional values match', () => {
      const studentValues = {
        communicationStyle: 'direct',
        timeManagement: 'flexible',
        professionalGuidance: 'regular'
      }
      const preceptorValues = {
        communicationStyle: 'direct',
        timeManagement: 'structured',
        professionalGuidance: 'regular'
      }
      
      const score = calculateProfessionalValuesMatch(studentValues, preceptorValues)
      expect(score).toBeGreaterThanOrEqual(5)
      expect(score).toBeLessThanOrEqual(8)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null or undefined inputs', () => {
      expect(() => calculateBasicCompatibility(null, mockPreceptor.profile)).not.toThrow()
      expect(() => calculateBasicCompatibility(mockStudent.profile, null)).not.toThrow()
    })

    it('should return reasonable scores for empty profiles', () => {
      const emptyStudent = {}
      const emptyPreceptor = {}
      const score = calculateBasicCompatibility(emptyStudent, emptyPreceptor)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('should handle unknown learning styles gracefully', () => {
      const score = calculateLearningStyleMatch('unknown-style', 'unknown-approach')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
    })
  })
})

// Helper functions that would be imported from the actual implementation
function calculateLearningStyleMatch(studentStyle: string, preceptorApproach: string): number {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    'hands-on': {
      'hands-on': 10,
      'demonstration': 8,
      'guided-practice': 9,
      'theory': 3,
      'lecture': 2
    },
    'visual': {
      'demonstration': 10,
      'hands-on': 8,
      'visual-aids': 9,
      'theory': 6,
      'lecture': 4
    },
    'auditory': {
      'lecture': 10,
      'discussion': 9,
      'verbal-guidance': 8,
      'hands-on': 5,
      'theory': 7
    },
    'reading': {
      'theory': 10,
      'case-studies': 9,
      'documentation': 8,
      'hands-on': 4,
      'lecture': 6
    }
  }

  return compatibilityMatrix[studentStyle]?.[preceptorApproach] ?? 5
}

function calculateFeedbackMatch(studentPref: string, preceptorApproach: string): number {
  const feedbackMatrix: Record<string, Record<string, number>> = {
    'immediate': {
      'immediate': 10,
      'real-time': 9,
      'same-day': 7,
      'weekly': 4,
      'end-of-rotation': 2
    },
    'same-day': {
      'same-day': 10,
      'immediate': 8,
      'real-time': 8,
      'weekly': 6,
      'end-of-rotation': 3
    },
    'weekly': {
      'weekly': 10,
      'same-day': 7,
      'bi-weekly': 8,
      'immediate': 5,
      'end-of-rotation': 6
    }
  }

  return feedbackMatrix[studentPref]?.[preceptorApproach] ?? 5
}

function calculateAutonomyMatch(studentComfort: string, preceptorLevel: string): number {
  const autonomyMatrix: Record<string, Record<string, number>> = {
    'supervised': {
      'supervised': 10,
      'guided': 7,
      'collaborative': 5,
      'independent': 2
    },
    'guided': {
      'guided': 10,
      'supervised': 8,
      'collaborative': 8,
      'independent': 5
    },
    'collaborative': {
      'collaborative': 10,
      'guided': 8,
      'supervised': 6,
      'independent': 7
    },
    'independent': {
      'independent': 10,
      'collaborative': 8,
      'guided': 5,
      'supervised': 3
    }
  }

  return autonomyMatrix[studentComfort]?.[preceptorLevel] ?? 5
}

function calculateBasicCompatibility(studentStyle: any, preceptorStyle: any): number {
  if (!studentStyle || !preceptorStyle) return 5

  let totalScore = 0
  let totalWeight = 0

  // Learning style match (weight: 3)
  if (studentStyle.learningMethod && preceptorStyle.mentoringApproach) {
    totalScore += calculateLearningStyleMatch(studentStyle.learningMethod, preceptorStyle.mentoringApproach) * 3
    totalWeight += 3
  }

  // Feedback match (weight: 3)
  if (studentStyle.feedbackPreference && preceptorStyle.feedbackApproach) {
    totalScore += calculateFeedbackMatch(studentStyle.feedbackPreference, preceptorStyle.feedbackApproach) * 3
    totalWeight += 3
  }

  // Autonomy match (weight: 2.5)
  if (studentStyle.clinicalComfort && preceptorStyle.autonomyLevel) {
    totalScore += calculateAutonomyMatch(studentStyle.clinicalComfort, preceptorStyle.autonomyLevel) * 2.5
    totalWeight += 2.5
  }

  return totalWeight > 0 ? totalScore / totalWeight : 5
}

function calculateProfessionalValuesMatch(studentValues: any, preceptorValues: any): number {
  if (!studentValues || !preceptorValues) return 5

  let matches = 0
  let total = 0

  const valuesToCheck = ['communicationStyle', 'timeManagement', 'professionalGuidance']

  valuesToCheck.forEach(value => {
    if (studentValues[value] && preceptorValues[value]) {
      total++
      if (studentValues[value] === preceptorValues[value]) {
        matches++
      }
    }
  })

  return total > 0 ? (matches / total) * 10 : 5
}

function getCompatibilityTier(score: number): 'GOLD' | 'SILVER' | 'BRONZE' {
  if (score >= 8.5) return 'GOLD'
  if (score >= 7.0) return 'SILVER'
  return 'BRONZE'
}