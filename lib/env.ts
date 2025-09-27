/**
 * Environment variable validation and type safety
 * This file ensures all required environment variables are present
 * and provides type-safe access throughout the application
 */

// Required environment variables for production
const requiredEnvVars = {
  // Convex
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  
  // Application
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://mentoloop.com',
} as const;

// Optional environment variables with defaults
const optionalEnvVars = {
  // AI Services
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // SendGrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  
  // Clerk Webhooks
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  
  // Feature Flags
  ENABLE_AI_MATCHING: process.env.ENABLE_AI_MATCHING === 'true',
  ENABLE_SMS_NOTIFICATIONS: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  ENABLE_PAYMENT_PROCESSING: process.env.ENABLE_PAYMENT_PROCESSING === 'true',
  
  // Security
  ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS !== 'false',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  // Marketing/Calendly
  NEXT_PUBLIC_CALENDLY_ENTERPRISE_URL: process.env.NEXT_PUBLIC_CALENDLY_ENTERPRISE_URL,
} as const;

/**
 * Validates that all required environment variables are present
 * This runs during build time and startup
 */
function validateEnv() {
  const missingVars: string[] = [];
  
  // Check required variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value === '') {
      missingVars.push(key);
    }
  }
  
  // In production, check for critical optional services
  if (process.env.NODE_ENV === 'production') {
    // These services should be configured in production
    const productionRequiredOptional = [
      'STRIPE_SECRET_KEY',
      'SENDGRID_API_KEY',
      'CLERK_WEBHOOK_SECRET'
    ];
    
    for (const key of productionRequiredOptional) {
      if (!optionalEnvVars[key as keyof typeof optionalEnvVars]) {
        console.warn(`Warning: ${key} is not configured. Some features may not work properly.`);
      }
    }
  }
  
  // Throw error if any required variables are missing
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env.local file or Netlify environment settings.`;
    
    // In development, just warn
    if (process.env.NODE_ENV === 'development') {
      console.warn(errorMessage);
    } else {
      // In production/build, throw error
      throw new Error(errorMessage);
    }
  }
}

// Run validation
if (typeof window === 'undefined') {
  // Only validate on server-side
  validateEnv();
}

// Export typed environment variables
export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// Type exports for use in other files
export type Env = typeof env;