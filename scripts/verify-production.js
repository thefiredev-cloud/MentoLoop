#!/usr/bin/env node

/**
 * Production Environment Verification Script
 * This script verifies that all services are properly configured for production
 * Run this after deployment to ensure everything is working correctly
 */

const https = require('https');
const fs = require('fs');

console.log('🔍 MentoLoop Production Verification Script');
console.log('=' .repeat(60));

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://sandboxmentoloop.online';
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTPS requests
function checkEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = new URL(path, PRODUCTION_URL);
    console.log(`\n📡 Checking: ${url.href}`);
    
    https.get(url.href, (res) => {
      if (res.statusCode === expectedStatus) {
        results.passed.push(`✅ ${path} - Status: ${res.statusCode}`);
        console.log(`   ✅ Response: ${res.statusCode} ${res.statusMessage}`);
        
        // Collect response data
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ success: true, status: res.statusCode, data });
        });
      } else {
        results.failed.push(`❌ ${path} - Expected: ${expectedStatus}, Got: ${res.statusCode}`);
        console.log(`   ❌ Unexpected status: ${res.statusCode}`);
        resolve({ success: false, status: res.statusCode });
      }
    }).on('error', (err) => {
      results.failed.push(`❌ ${path} - Error: ${err.message}`);
      console.log(`   ❌ Request failed: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

// Check environment variables in .env.production if it exists
function checkProductionEnv() {
  console.log('\n🔐 Checking Production Environment Configuration...');
  
  const envFile = '.env.production';
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'CONVEX_DEPLOYMENT',
      'NEXT_PUBLIC_CONVEX_URL',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'SENDGRID_API_KEY',
      'TWILIO_ACCOUNT_SID'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        const hasValue = !envContent.includes(`${varName}=YOUR_`) && 
                        !envContent.includes(`${varName}=sk_test_`) &&
                        !envContent.includes(`${varName}=pk_test_`);
        
        if (hasValue) {
          console.log(`   ✅ ${varName} is configured`);
          results.passed.push(`✅ Environment: ${varName}`);
        } else {
          console.log(`   ⚠️ ${varName} appears to be using placeholder value`);
          results.warnings.push(`⚠️ ${varName} may need production value`);
        }
      } else {
        console.log(`   ❌ ${varName} is missing`);
        results.failed.push(`❌ Missing env var: ${varName}`);
      }
    });
  } else {
    console.log('   ℹ️ No .env.production file found (this is normal if using Netlify env vars)');
    results.warnings.push('⚠️ Ensure environment variables are set in Netlify dashboard');
  }
}

async function runChecks() {
  console.log(`\n🌐 Testing Production URL: ${PRODUCTION_URL}`);
  console.log('=' .repeat(60));
  
  // 1. Check environment configuration
  checkProductionEnv();
  
  // 2. Check main application endpoints
  console.log('\n🏠 Checking Core Application Endpoints...');
  
  // Homepage
  await checkEndpoint('/', 200);
  
  // Health check
  const healthCheck = await checkEndpoint('/api/health', 200);
  if (healthCheck.success && healthCheck.data) {
    try {
      const health = JSON.parse(healthCheck.data);
      console.log(`   📊 Health Status: ${health.status}`);
      console.log(`   🔧 Environment: ${health.environment}`);
      
      if (health.checks) {
        Object.entries(health.checks).forEach(([service, status]) => {
          if (status === 'healthy') {
            console.log(`   ✅ ${service}: ${status}`);
          } else {
            console.log(`   ❌ ${service}: ${status}`);
            results.failed.push(`❌ Service unhealthy: ${service}`);
          }
        });
      }
    } catch (e) {
      console.log('   ⚠️ Could not parse health check response');
    }
  }
  
  // 3. Check authentication pages
  console.log('\n🔐 Checking Authentication Pages...');
  await checkEndpoint('/sign-in', 200);
  await checkEndpoint('/sign-up', 200);
  
  // 4. Check protected routes (should redirect to sign-in)
  console.log('\n🛡️ Checking Protected Routes (should redirect)...');
  await checkEndpoint('/dashboard', 307); // Redirect when not authenticated
  await checkEndpoint('/dashboard/student', 307);
  await checkEndpoint('/dashboard/preceptor', 307);
  await checkEndpoint('/dashboard/admin', 307);
  
  // 5. Check intake forms
  console.log('\n📝 Checking Intake Forms...');
  await checkEndpoint('/student-intake', 307); // Protected
  await checkEndpoint('/preceptor-intake', 307); // Protected
  
  // 6. Check static assets
  console.log('\n📦 Checking Static Assets...');
  await checkEndpoint('/favicon.ico', 200);
  
  // 7. Check API endpoints
  console.log('\n🔌 Checking API Endpoints...');
  
  // Webhook endpoints should return 405 for GET requests
  await checkEndpoint('/api/stripe-webhook', 405);
  
  // 8. Security headers check
  console.log('\n🔒 Checking Security Headers...');
  const securityCheck = await new Promise((resolve) => {
    https.get(PRODUCTION_URL, (res) => {
      const headers = res.headers;
      const securityHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
        'content-security-policy'
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`   ✅ ${header}: ${headers[header].substring(0, 50)}...`);
          results.passed.push(`✅ Security header: ${header}`);
        } else {
          console.log(`   ❌ Missing: ${header}`);
          results.failed.push(`❌ Missing security header: ${header}`);
        }
      });
      resolve();
    });
  });
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  
  console.log(`\n✅ Passed: ${results.passed.length}`);
  results.passed.forEach(item => console.log(`   ${item}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ Warnings: ${results.warnings.length}`);
    results.warnings.forEach(item => console.log(`   ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(item => console.log(`   ${item}`));
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (results.failed.length === 0) {
    console.log('🎉 Production verification PASSED!');
    console.log('✨ Your application appears to be running correctly.');
  } else {
    console.log('⚠️ Production verification found issues.');
    console.log('🔧 Please review the failed checks above.');
  }
  
  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    summary: {
      passed: results.passed.length,
      warnings: results.warnings.length,
      failed: results.failed.length
    },
    details: results
  };
  
  fs.writeFileSync('production-verification-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Full report saved to: production-verification-report.json');
}

// Run the verification
runChecks().catch(err => {
  console.error('❌ Verification script error:', err);
  process.exit(1);
});