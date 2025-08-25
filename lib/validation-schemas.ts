import { z } from 'zod';

// Sanitization helpers
const sanitizeString = (str: string) => str.trim().replace(/[<>]/g, '');
const sanitizeEmail = (email: string) => email.toLowerCase().trim();

// Common validation patterns
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const zipCodeRegex = /^\d{5}(-\d{4})?$/;
const npiRegex = /^\d{10}$/;

// Base schemas for reuse
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(100, 'Email too long')
  .transform(sanitizeEmail);

export const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Invalid phone number')
  .transform(sanitizeString);

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .transform(sanitizeString);

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
  .refine((date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }, 'Invalid date');

// Student intake validation
export const studentPersonalInfoSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: dateSchema,
  preferredContact: z.enum(['email', 'phone', 'text']),
  linkedinOrResume: z.string().url().optional().or(z.literal('')),
});

export const studentSchoolInfoSchema = z.object({
  programName: z.string().min(1).max(200).transform(sanitizeString),
  degreeTrack: z.enum(['FNP', 'PNP', 'PMHNP', 'AGNP', 'ACNP', 'WHNP', 'NNP', 'DNP']),
  schoolLocation: z.object({
    city: z.string().min(1).max(100).transform(sanitizeString),
    state: z.string().length(2).toUpperCase(),
  }),
  programFormat: z.enum(['online', 'in-person', 'hybrid']),
  expectedGraduation: dateSchema,
  clinicalCoordinatorName: z.string().max(100).optional().transform((v) => v ? sanitizeString(v) : v),
  clinicalCoordinatorEmail: emailSchema.optional(),
});

export const studentRotationNeedsSchema = z.object({
  rotationTypes: z.array(z.enum([
    'family-practice', 'pediatrics', 'psych-mental-health',
    'womens-health', 'adult-gero', 'acute-care', 'telehealth', 'other'
  ])).min(1, 'Select at least one rotation type'),
  otherRotationType: z.string().max(100).optional().transform((v) => v ? sanitizeString(v) : v),
  startDate: dateSchema,
  endDate: dateSchema,
  weeklyHours: z.enum(['<8', '8-16', '16-24', '24-32', '32+']),
  daysAvailable: z.array(z.enum([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ])).min(1, 'Select at least one day'),
  willingToTravel: z.boolean(),
  preferredLocation: z.object({
    city: z.string().min(1).max(100).transform(sanitizeString),
    state: z.string().length(2).toUpperCase(),
  }).optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Preceptor intake validation
export const preceptorPersonalInfoSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  mobilePhone: phoneSchema,
  licenseType: z.enum(['NP', 'MD/DO', 'PA', 'other']),
  specialty: z.enum(['FNP', 'PNP', 'PMHNP', 'AGNP', 'ACNP', 'WHNP', 'NNP', 'other']),
  statesLicensed: z.array(z.string().length(2).toUpperCase()).min(1, 'Select at least one state'),
  npiNumber: z.string().regex(npiRegex, 'Invalid NPI number'),
  linkedinOrCV: z.string().url().optional().or(z.literal('')),
});

export const preceptorPracticeInfoSchema = z.object({
  practiceName: z.string().min(1).max(200).transform(sanitizeString),
  practiceSettings: z.array(z.enum([
    'private-practice', 'urgent-care', 'hospital', 'clinic', 'telehealth', 'other'
  ])).min(1, 'Select at least one practice setting'),
  address: z.string().min(1).max(200).transform(sanitizeString),
  city: z.string().min(1).max(100).transform(sanitizeString),
  state: z.string().length(2).toUpperCase(),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code'),
  website: z.string().url().optional().or(z.literal('')),
  emrUsed: z.string().max(100).optional().transform((v) => v ? sanitizeString(v) : v),
});

// API endpoint validation
export const webhookPayloadSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  timestamp: z.number().optional(),
});

export const stripeWebhookSchema = z.object({
  payload: z.string(),
  signature: z.string().min(1, 'Signature is required'),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string()
    .max(255, 'Filename too long')
    .regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename characters'),
  mimetype: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ], {
    errorMap: () => ({ message: 'File type not allowed' }),
  }),
  size: z.number()
    .max(10 * 1024 * 1024, 'File size must be less than 10MB')
    .positive('Invalid file size'),
});

// User authentication validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Payment validation
export const paymentSessionSchema = z.object({
  matchId: z.string().min(1),
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Message validation for chat
export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long')
    .transform(sanitizeString),
  messageType: z.enum(['text', 'file', 'system_notification']),
});

// Survey validation
export const surveyResponseSchema = z.object({
  matchId: z.string().min(1),
  responses: z.object({
    teachStyleMatch: z.number().min(1).max(5).optional(),
    commEffectiveness: z.number().min(1).max(5).optional(),
    caseMixAlignment: z.number().min(1).max(5).optional(),
    supportHoursComp: z.number().min(1).max(5).optional(),
    wouldRecommend: z.number().min(1).max(5).optional(),
    studentPreparedness: z.number().min(1).max(5).optional(),
    studentComm: z.number().min(1).max(5).optional(),
    teachability: z.number().min(1).max(5).optional(),
    competenceGrowth: z.number().min(1).max(5).optional(),
    comments: z.string().max(2000).optional().transform((v) => v ? sanitizeString(v) : v),
  }),
});

// Helper function to validate and sanitize input
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Middleware helper for request validation
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (req: Request): Promise<{ 
    valid: true; 
    data: T 
  } | { 
    valid: false; 
    errors: string[] 
  }> => {
    try {
      const body = await req.json();
      const result = await validateInput(schema, body);
      
      if (result.success) {
        return { valid: true, data: result.data };
      } else {
        return {
          valid: false,
          errors: result.errors.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
    } catch (error) {
      return {
        valid: false,
        errors: ['Invalid request body'],
      };
    }
  };
}