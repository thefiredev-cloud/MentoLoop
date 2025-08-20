#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Comprehensive validation of MentoLoop platform before production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 MentoLoop Pre-Deployment Validation\n');

let errors = [];
let warnings = [];

// Validation utilities
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    errors.push(`❌ Missing: ${description} (${filePath})`);
    return false;
  }
}

function checkEnvironmentVariable(varName, isRequired = true) {
  if (process.env[varName]) {
    console.log(`✅ Environment variable: ${varName}`);
    return true;
  } else {
    if (isRequired) {
      errors.push(`❌ Missing required environment variable: ${varName}`);
    } else {
      warnings.push(`⚠️ Missing optional environment variable: ${varName}`);
    }
    return false;
  }
}

function runCommand(command, description) {
  try {
    console.log(`🔍 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Success`);
    return output;
  } catch (error) {
    errors.push(`❌ ${description} - Failed: ${error.message}`);
    return null;
  }
}

// 1. Core File Structure Validation
console.log('📁 Validating Core File Structure...\n');

const coreFiles = [
  { path: 'package.json', desc: 'Package configuration' },
  { path: 'next.config.ts', desc: 'Next.js configuration' },
  { path: 'netlify.toml', desc: 'Netlify deployment configuration' },
  { path: 'middleware.ts', desc: 'Authentication middleware' },
  { path: 'tailwind.config.ts', desc: 'Tailwind CSS configuration' },
  { path: 'tsconfig.json', desc: 'TypeScript configuration' },
  { path: '.env.example', desc: 'Environment variable template' },
  { path: '.env.production.template', desc: 'Production environment template' },
  { path: 'playwright.config.ts', desc: 'Playwright test configuration' },
];

coreFiles.forEach(file => {
  checkFileExists(file.path, file.desc);
});

// 2. Convex Database Files
console.log('\n🗄️ Validating Convex Database Files...\n');

const convexFiles = [
  { path: 'convex/schema.ts', desc: 'Database schema' },
  { path: 'convex/auth.ts', desc: 'Authentication functions' },
  { path: 'convex/users.ts', desc: 'User management functions' },
  { path: 'convex/students.ts', desc: 'Student functions' },
  { path: 'convex/preceptors.ts', desc: 'Preceptor functions' },
  { path: 'convex/matches.ts', desc: 'Matching functions' },
  { path: 'convex/payments.ts', desc: 'Payment functions' },
  { path: 'convex/emails.ts', desc: 'Email automation functions' },
  { path: 'convex/sms.ts', desc: 'SMS automation functions' },
  { path: 'convex/auditLogs.ts', desc: 'Audit logging functions' },
];

convexFiles.forEach(file => {
  checkFileExists(file.path, file.desc);
});

// 3. Application Routes
console.log('\n🛣️ Validating Application Routes...\n');

const appRoutes = [
  { path: 'app/page.tsx', desc: 'Landing page' },
  { path: 'app/layout.tsx', desc: 'Root layout' },
  { path: 'app/dashboard/page.tsx', desc: 'Dashboard routing' },
  { path: 'app/dashboard/student/page.tsx', desc: 'Student dashboard' },
  { path: 'app/dashboard/preceptor/page.tsx', desc: 'Preceptor dashboard' },
  { path: 'app/student-intake/page.tsx', desc: 'Student intake form' },
  { path: 'app/preceptor-intake/page.tsx', desc: 'Preceptor intake form' },
  { path: 'app/api/health/route.ts', desc: 'Health check endpoint' },
  { path: 'app/api/stripe-webhook/route.ts', desc: 'Stripe webhook handler' },
];

appRoutes.forEach(route => {
  checkFileExists(route.path, route.desc);
});

// 4. Test Files
console.log('\n🧪 Validating Test Files...\n');

const testFiles = [
  { path: 'tests/e2e/student-journey.spec.ts', desc: 'Student E2E tests' },
  { path: 'tests/e2e/preceptor-journey.spec.ts', desc: 'Preceptor E2E tests' },
  { path: 'tests/e2e/ai-matching-payment.spec.ts', desc: 'AI matching and payment tests' },
  { path: 'tests/integration/third-party-services.test.ts', desc: 'Third-party integration tests' },
];

testFiles.forEach(file => {
  checkFileExists(file.path, file.desc);
});

// 5. Documentation
console.log('\n📚 Validating Documentation...\n');

const docFiles = [
  { path: 'README.md', desc: 'Project README' },
  { path: 'CLAUDE.md', desc: 'Claude Code instructions' },
  { path: 'DEPLOYMENT.md', desc: 'Deployment guide' },
  { path: 'TROUBLESHOOTING.md', desc: 'Troubleshooting guide' },
  { path: 'SECURITY-AUDIT.md', desc: 'Security audit report' },
  { path: 'TESTING.md', desc: 'Testing documentation' },
];

docFiles.forEach(file => {
  checkFileExists(file.path, file.desc);
});

// 6. Environment Variable Validation
console.log('\n🔧 Validating Environment Variables...\n');

// Load .env.local if it exists
if (fs.existsSync('.env.local')) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // dotenv not available, continue without it
    console.log('⚠️ dotenv not available, skipping .env.local loading');
  }
}

const requiredEnvVars = [
  'CONVEX_DEPLOYMENT',
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

const optionalEnvVars = [
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'SENTRY_DSN',
  'GOOGLE_ANALYTICS_ID',
];

requiredEnvVars.forEach(varName => {
  checkEnvironmentVariable(varName, true);
});

optionalEnvVars.forEach(varName => {
  checkEnvironmentVariable(varName, false);
});

// 7. Build Validation
console.log('\n🔨 Validating Build Process...\n');

runCommand('npm run build', 'Production build');

// 8. TypeScript Validation
console.log('\n📝 Validating TypeScript...\n');

runCommand('npx tsc --noEmit', 'TypeScript type checking');

// 9. Package Dependencies
console.log('\n📦 Validating Dependencies...\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for critical dependencies
  const criticalDeps = [
    'next',
    'react',
    'convex',
    '@clerk/nextjs',
    'stripe',
    '@sendgrid/mail',
    'twilio',
    'openai',
    '@google/generative-ai',
  ];

  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ Dependency: ${dep}`);
    } else {
      errors.push(`❌ Missing critical dependency: ${dep}`);
    }
  });

  // Check for security vulnerabilities
  runCommand('npm audit --audit-level=moderate', 'Security audit');

} catch (error) {
  errors.push(`❌ Failed to parse package.json: ${error.message}`);
}

// 10. Configuration Validation
console.log('\n⚙️ Validating Configuration Files...\n');

try {
  // Validate Next.js config
  if (fs.existsSync('next.config.ts')) {
    const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
    if (nextConfig.includes('eslint: { ignoreDuringBuilds: true }')) {
      console.log('✅ ESLint configured to ignore during builds');
    }
    if (nextConfig.includes('typescript: { ignoreBuildErrors: true }')) {
      console.log('✅ TypeScript configured to ignore build errors');
    }
  }

  // Validate Netlify config
  if (fs.existsSync('netlify.toml')) {
    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    if (netlifyConfig.includes('NODE_VERSION = "22"')) {
      console.log('✅ Netlify Node.js version configured');
    }
    if (netlifyConfig.includes('X-Frame-Options = "DENY"')) {
      console.log('✅ Security headers configured');
    }
    if (netlifyConfig.includes('Content-Security-Policy')) {
      console.log('✅ Content Security Policy configured');
    }
  }

} catch (error) {
  warnings.push(`⚠️ Configuration validation error: ${error.message}`);
}

// 11. API Endpoint Validation
console.log('\n🌐 Validating API Endpoints...\n');

const apiEndpoints = [
  'app/api/health/route.ts',
  'app/api/stripe-webhook/route.ts',
  'app/api/security/metrics/route.ts',
];

apiEndpoints.forEach(endpoint => {
  if (fs.existsSync(endpoint)) {
    const content = fs.readFileSync(endpoint, 'utf8');
    if (content.includes('export async function GET') || content.includes('export async function POST')) {
      console.log(`✅ API endpoint: ${endpoint}`);
    } else {
      warnings.push(`⚠️ API endpoint may be missing proper exports: ${endpoint}`);
    }
  }
});

// 12. Database Schema Validation
console.log('\n🗃️ Validating Database Schema...\n');

if (fs.existsSync('convex/schema.ts')) {
  const schema = fs.readFileSync('convex/schema.ts', 'utf8');
  
  const requiredTables = [
    'users',
    'students',
    'preceptors',
    'matches',
    'payments',
    'auditLogs',
    'securityAlerts',
    'userSessions',
    'failedLogins',
    'dataAccessLogs',
  ];

  requiredTables.forEach(table => {
    if (schema.includes(`${table}:`)) {
      console.log(`✅ Database table: ${table}`);
    } else {
      errors.push(`❌ Missing database table: ${table}`);
    }
  });
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 ALL VALIDATIONS PASSED! Ready for deployment.');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach(error => console.log(`   ${error}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }

  console.log(`\n📈 VALIDATION RESULTS:`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n🚫 DEPLOYMENT BLOCKED - Fix errors before proceeding.');
    process.exit(1);
  } else {
    console.log('\n⚠️ DEPLOYMENT ALLOWED WITH WARNINGS - Review warnings before proceeding.');
    process.exit(0);
  }
}