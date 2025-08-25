#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Run this to check if all required environment variables are configured
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = {
  // Convex
  'CONVEX_DEPLOYMENT': 'Convex deployment ID',
  'NEXT_PUBLIC_CONVEX_URL': 'Convex public URL',
  
  // Clerk Authentication
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'Clerk publishable key',
  'CLERK_SECRET_KEY': 'Clerk secret key',
  'CLERK_WEBHOOK_SECRET': 'Clerk webhook secret',
  
  // Stripe Payments
  'STRIPE_SECRET_KEY': 'Stripe secret key',
  'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret',
  
  // Email (SendGrid)
  'SENDGRID_API_KEY': 'SendGrid API key',
  'SENDGRID_FROM_EMAIL': 'SendGrid from email address',
  
  // SMS (Twilio)
  'TWILIO_ACCOUNT_SID': 'Twilio account SID',
  'TWILIO_AUTH_TOKEN': 'Twilio auth token',
  'TWILIO_PHONE_NUMBER': 'Twilio phone number',
  
  // Application
  'NEXT_PUBLIC_APP_URL': 'Application URL'
};

// Optional environment variables
const optionalVars = {
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Stripe publishable key (for client-side)',
  'GEMINI_API_KEY': 'Gemini API key (for AI features)',
  'OPENAI_API_KEY': 'OpenAI API key (for AI features)',
  'EMAIL_DOMAIN': 'Email domain for communications',
  'NODE_ENV': 'Node environment (development/production)'
};

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create a .env.local file with your environment variables.');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

console.log('🔍 Validating Environment Variables...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('📋 Required Variables:');
console.log('─'.repeat(50));

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`❌ ${key}: MISSING - ${description}`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue = value.substring(0, 4) + '****' + value.substring(value.length - 4);
    console.log(`✅ ${key}: Set (${maskedValue})`);
  }
}

console.log('\n📋 Optional Variables:');
console.log('─'.repeat(50));

for (const [key, description] of Object.entries(optionalVars)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${key}: Not set - ${description}`);
    hasWarnings = true;
  } else {
    const maskedValue = value.substring(0, 4) + '****' + (value.length > 8 ? value.substring(value.length - 4) : '');
    console.log(`✅ ${key}: Set (${maskedValue})`);
  }
}

// Additional validation
console.log('\n🔐 Security Checks:');
console.log('─'.repeat(50));

// Check for example values
const examplePatterns = ['your_', 'test_', 'example', 'TODO', 'CHANGE_ME'];
for (const [key, value] of Object.entries(process.env)) {
  if (requiredVars[key] && value) {
    for (const pattern of examplePatterns) {
      if (value.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`⚠️  ${key} appears to contain an example value!`);
        hasWarnings = true;
      }
    }
  }
}

// Check email format
if (process.env.SENDGRID_FROM_EMAIL && !process.env.SENDGRID_FROM_EMAIL.includes('@')) {
  console.log('⚠️  SENDGRID_FROM_EMAIL does not appear to be a valid email address');
  hasWarnings = true;
}

// Check Twilio phone format
if (process.env.TWILIO_PHONE_NUMBER && !process.env.TWILIO_PHONE_NUMBER.startsWith('+')) {
  console.log('⚠️  TWILIO_PHONE_NUMBER should start with + and include country code');
  hasWarnings = true;
}

// Check URL formats
if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
  console.log('⚠️  NEXT_PUBLIC_APP_URL should start with http:// or https://');
  hasWarnings = true;
}

if (process.env.NEXT_PUBLIC_CONVEX_URL && !process.env.NEXT_PUBLIC_CONVEX_URL.includes('convex.cloud')) {
  console.log('⚠️  NEXT_PUBLIC_CONVEX_URL should be a valid Convex URL');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Validation FAILED - Missing required environment variables');
  console.log('Please add the missing variables to your .env.local file');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Validation PASSED with warnings');
  console.log('The application should work, but review the warnings above');
} else {
  console.log('✅ All environment variables are properly configured!');
}

console.log('\n💡 Tips:');
console.log('- Copy values from .env.example as a starting point');
console.log('- Get Convex keys from: https://dashboard.convex.dev');
console.log('- Get Clerk keys from: https://dashboard.clerk.com');
console.log('- Get Stripe keys from: https://dashboard.stripe.com');
console.log('- Get SendGrid key from: https://app.sendgrid.com');
console.log('- Get Twilio credentials from: https://console.twilio.com');