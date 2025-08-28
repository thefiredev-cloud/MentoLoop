# Netlify Environment Variables Setup Guide

## Critical Production Environment Variables

### 1. Get Your Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Switch to **Production** instance (not Development)
4. Navigate to **API Keys** section
5. Copy the following keys:

### 2. Required Clerk Environment Variables for Netlify

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Clerk Authentication (PRODUCTION KEYS REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[your_production_key]
CLERK_SECRET_KEY=sk_live_[your_production_secret]
CLERK_WEBHOOK_SECRET=whsec_[your_production_webhook_secret]

# Clerk Configuration
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://[your-production-instance].clerk.accounts.dev
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

### 3. Convex Database Variables

```bash
CONVEX_DEPLOYMENT=prod:[your-convex-deployment-name]
NEXT_PUBLIC_CONVEX_URL=https://[your-convex-url].convex.cloud
```

### 4. Other Required Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://[your-domain].netlify.app

# AI Services
OPENAI_API_KEY=[your_openai_key]
GEMINI_API_KEY=[your_gemini_key]

# Stripe (Live Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your_stripe_public_key]
STRIPE_SECRET_KEY=[your_stripe_secret_key]
STRIPE_WEBHOOK_SECRET=[your_stripe_webhook_secret]

# SendGrid
SENDGRID_API_KEY=[your_sendgrid_key]
SENDGRID_FROM_EMAIL=support@[your-domain].com

# Twilio
TWILIO_ACCOUNT_SID=[your_twilio_sid]
TWILIO_AUTH_TOKEN=[your_twilio_token]
TWILIO_PHONE_NUMBER=[your_twilio_number]
```

## How to Add Environment Variables in Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site Configuration** → **Environment variables**
4. Click **Add a variable**
5. Choose **Add a single variable**
6. Enter the key and value for each variable
7. Click **Create variable**
8. Repeat for all variables listed above

## Important Notes

⚠️ **CRITICAL**: Make sure you're using PRODUCTION Clerk keys (starting with `pk_live_` and `sk_live_`), NOT test keys (starting with `pk_test_` and `sk_test_`)

⚠️ **SECURITY**: Never commit these keys to your repository. Keep them secure in Netlify's environment variables.

## Verification Steps

After setting up environment variables:

1. **Trigger a new deployment** in Netlify
2. **Check the deployment logs** for any errors
3. **Visit your site** and verify:
   - No Clerk development warning in console
   - Authentication works properly
   - Users can sign in/up and are redirected to `/dashboard`

## Troubleshooting

If you still see Clerk development warnings:
1. Clear your browser cache
2. Check that all Clerk environment variables are set correctly in Netlify
3. Ensure you're not overriding production variables with development ones
4. Verify the deployment is using the latest environment variables

## Getting Production Clerk Keys

If you haven't upgraded to production Clerk yet:

1. Log in to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click on your application
3. Look for "Upgrade to Production" button
4. Follow the upgrade process
5. Once upgraded, copy your production keys
6. Update all environment variables in Netlify

## Contact Support

If issues persist after following this guide:
- Check Netlify deployment logs
- Review browser console for specific error messages
- Contact Clerk support for authentication issues
- Contact Netlify support for deployment issues