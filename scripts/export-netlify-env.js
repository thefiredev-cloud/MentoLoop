#!/usr/bin/env node

/**
 * Export environment variables for Netlify deployment
 * This script reads .env.production and outputs commands to set them in Netlify
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envFile)) {
  console.error('❌ .env.production file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf-8');
const lines = envContent.split('\n');

console.log('# Netlify Environment Variables');
console.log('# Copy and paste these commands in your terminal:');
console.log('');

const envVars = {};

lines.forEach(line => {
  // Skip comments and empty lines
  if (line.startsWith('#') || line.trim() === '') {
    return;
  }
  
  // Parse key=value pairs
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    
    // Skip if value is empty or a placeholder
    if (value && !value.includes('your_') && !value.includes('TODO')) {
      envVars[key] = value;
    }
  }
});

// Output Netlify CLI commands
console.log('# Using Netlify CLI:');
Object.entries(envVars).forEach(([key, value]) => {
  // Escape special characters in value
  const escapedValue = value.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  console.log(`netlify env:set ${key} "${escapedValue}"`);
});

console.log('');
console.log('# Or add these to Netlify dashboard (Site Settings > Environment Variables):');
console.log('');

// Output as JSON for easy copy-paste
console.log(JSON.stringify(envVars, null, 2));

console.log('');
console.log('✅ Total environment variables:', Object.keys(envVars).length);
console.log('');
console.log('⚠️  Important: Review these variables before deploying:');
console.log('   - Ensure Clerk keys are production keys (pk_live_, sk_live_)');
console.log('   - Verify webhook secrets are correct');
console.log('   - Check that URLs point to production domains');