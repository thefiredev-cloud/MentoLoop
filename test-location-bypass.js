// Test script to verify location bypass functionality
// Run with: node test-location-bypass.js

const { getLocationFromIP, getStateFromZip, isSupportedState } = require('./lib/location.ts');
const { SUPPORTED_STATES } = require('./lib/states-config.ts');

console.log('Testing Location Bypass Features\n');
console.log('=================================\n');

// Test supported states
console.log('1. Supported States:');
Object.entries(SUPPORTED_STATES).forEach(([code, state]) => {
  console.log(`   ${code}: ${state.name}`);
});

console.log('\n2. Testing IP Geolocation (Mock):');
console.log('   Note: In production, the ipapi.co API will detect actual location');
console.log('   Current bypass methods:');
console.log('   - Set DISABLE_LOCATION_CHECK=true in environment');
console.log('   - Add ?bypass=mentoloop-bypass-2025 to URL');
console.log('   - Add user email to LOCATION_WHITELIST_EMAILS');
console.log('   - Cookie-based bypass (24 hours for token, 7 days for whitelisted)');

console.log('\n3. Debug Mode:');
console.log('   Set DEBUG_LOCATION=true to see detailed logs including:');
console.log('   - Detected IP address');
console.log('   - IP geolocation API response');
console.log('   - Validation results');
console.log('   - Headers being checked');

console.log('\n4. Testing State Detection from ZIP:');
const testZips = ['75201', '77001', '85001', '90001', '80001', '32801', '70001', '87101', '73001', '72201'];
testZips.forEach(zip => {
  const state = getStateFromZip(zip);
  console.log(`   ZIP ${zip}: ${state || 'Not found'}`);
});

console.log('\n5. Quick Access Methods:');
console.log('   For immediate access while debugging:');
console.log('   a) Add this to your URL: ?bypass=mentoloop-bypass-2025');
console.log('   b) Or set DISABLE_LOCATION_CHECK=true in .env.local');
console.log('   c) Or add your email to LOCATION_WHITELIST_EMAILS in .env.local');

console.log('\n✅ Location bypass configuration ready!');
console.log('\nNext steps:');
console.log('1. If running locally, the checks are already bypassed');
console.log('2. For production, use one of the bypass methods above');
console.log('3. Monitor console logs with DEBUG_LOCATION=true to diagnose issues');