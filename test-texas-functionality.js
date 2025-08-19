// Quick test script to validate Texas-only functionality

const { isTexasZipCode, validateTexasLocation, getMetroAreaFromZip } = require('./lib/location.ts');

console.log('Testing Texas-only functionality...\n');

// Test ZIP code validation
console.log('1. ZIP Code Validation:');
console.log('75201 (Dallas):', isTexasZipCode('75201')); // Should be true
console.log('77001 (Houston):', isTexasZipCode('77001')); // Should be true
console.log('78701 (Austin):', isTexasZipCode('78701')); // Should be true
console.log('90210 (Beverly Hills, CA):', isTexasZipCode('90210')); // Should be false
console.log('10001 (New York, NY):', isTexasZipCode('10001')); // Should be false

console.log('\n2. Metro Area Detection:');
console.log('75201:', getMetroAreaFromZip('75201')); // Should be Dallas-Fort Worth
console.log('77001:', getMetroAreaFromZip('77001')); // Should be Houston
console.log('78701:', getMetroAreaFromZip('78701')); // Should be Austin

console.log('\n3. Location Validation:');
const validTexasLocation = {
  city: 'Dallas',
  state: 'TX',
  zipCode: '75201'
};

const invalidLocation = {
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90210'
};

console.log('Valid Texas location:', validateTexasLocation(validTexasLocation)); // Should be true
console.log('Invalid (CA) location:', validateTexasLocation(invalidLocation)); // Should be false

console.log('\n✅ Texas-only functionality test completed!');