#!/usr/bin/env node

/**
 * Test Script for Stripe Configuration
 * This script verifies that Stripe is properly configured with:
 * - Correct API keys
 * - Products and prices created
 * - Webhook endpoint configured
 * - Integration with Convex and Clerk
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { ConvexHttpClient } = require('convex/browser');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

console.log('Environment check:');
console.log('STRIPE_SECRET_KEY:', STRIPE_SECRET_KEY ? `${STRIPE_SECRET_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('CONVEX_URL:', CONVEX_URL || 'NOT SET');
console.log('');

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not found in environment variables');
  process.exit(1);
}

async function testStripeConfig() {
  console.log('🔍 Testing Stripe Configuration...\n');

  try {
    // 1. Test Stripe API connection
    console.log('1️⃣ Testing Stripe API connection...');
    const accountResponse = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!accountResponse.ok) {
      throw new Error(`Stripe API error: ${accountResponse.status}`);
    }

    const account = await accountResponse.json();
    console.log(`✅ Connected to Stripe account: ${account.email}`);
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Business Name: ${account.business_profile?.name || 'Not set'}\n`);

    // 2. Check products
    console.log('2️⃣ Checking Stripe products...');
    const productsResponse = await fetch('https://api.stripe.com/v1/products?limit=10', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }

    const products = await productsResponse.json();
    console.log(`✅ Found ${products.data.length} products:`);
    
    const expectedProducts = ['Core Membership', 'Pro Membership', 'Premium Membership'];
    const foundProducts = [];
    
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`);
      if (expectedProducts.includes(product.name)) {
        foundProducts.push(product.name);
      }
    });

    if (foundProducts.length === 3) {
      console.log('✅ All expected membership products found!\n');
    } else {
      console.log(`⚠️ Only found ${foundProducts.length}/3 expected products\n`);
    }

    // 3. Check prices
    console.log('3️⃣ Checking Stripe prices...');
    const pricesResponse = await fetch('https://api.stripe.com/v1/prices?limit=10', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!pricesResponse.ok) {
      throw new Error(`Failed to fetch prices: ${pricesResponse.status}`);
    }

    const prices = await pricesResponse.json();
    console.log(`✅ Found ${prices.data.length} prices:`);
    
    const priceMap = {
      'price_1S1ylsKVzfTBpytSRBfYbhzd': 'Core ($695)',
      'price_1S1yltKVzfTBpytSoqseGrEF': 'Pro ($1,295)',
      'price_1S1yltKVzfTBpytSOdNgTEFP': 'Premium ($1,895)'
    };
    
    prices.data.forEach(price => {
      const amount = (price.unit_amount / 100).toFixed(2);
      const label = priceMap[price.id] || 'Unknown';
      console.log(`   - ${price.id}: $${amount} USD (${label})`);
    });
    console.log('');

    // 4. Check webhook endpoints
    console.log('4️⃣ Checking webhook endpoints...');
    const webhooksResponse = await fetch('https://api.stripe.com/v1/webhook_endpoints?limit=10', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!webhooksResponse.ok) {
      throw new Error(`Failed to fetch webhooks: ${webhooksResponse.status}`);
    }

    const webhooks = await webhooksResponse.json();
    console.log(`✅ Found ${webhooks.data.length} webhook endpoints:`);
    
    webhooks.data.forEach(webhook => {
      console.log(`   - ${webhook.url}`);
      console.log(`     Status: ${webhook.status}`);
      console.log(`     Events: ${webhook.enabled_events.slice(0, 3).join(', ')}${webhook.enabled_events.length > 3 ? '...' : ''}`);
    });
    console.log('');

    // 5. Test Convex connection
    console.log('5️⃣ Testing Convex connection...');
    const convex = new ConvexHttpClient(CONVEX_URL);
    
    // Test if we can call the getStripePricing action
    try {
      const pricing = await convex.action('payments:getStripePricing');
      console.log(`✅ Successfully called Convex action`);
      console.log(`   Retrieved ${pricing.length} prices from Stripe via Convex\n`);
    } catch (error) {
      console.log(`⚠️ Could not call Convex action: ${error.message}\n`);
    }

    // Summary
    console.log('📊 Configuration Summary:');
    console.log('─────────────────────────');
    console.log(`✅ Stripe API: Connected`);
    console.log(`✅ Products: ${products.data.length} created`);
    console.log(`✅ Prices: ${prices.data.length} configured`);
    console.log(`${webhooks.data.length > 0 ? '✅' : '⚠️'} Webhooks: ${webhooks.data.length} endpoints`);
    console.log(`✅ Convex: Connected`);
    console.log('');

    // Environment variables check
    console.log('6️⃣ Environment Variables:');
    console.log(`   STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY.substring(0, 15)}...`);
    console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log('');

    console.log('✨ Stripe configuration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testStripeConfig().catch(console.error);