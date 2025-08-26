# Clerk Authentication Fix Documentation

## Problem Summary
You were experiencing an authentication loop with the following symptoms:
- "Get Started" button spinning indefinitely
- Error: "No auth provider found matching the given token"
- Location-based lockout message (despite being in California)
- WebSocket reconnection loop in browser console

## Root Causes Identified

1. **Wrong Production URL**: Accessing `bejewelled-cassata-453411.netlify.app` (404) instead of `sandboxmentoloop.online`
2. **Domain Mismatch**: Convex auth config defaulted to development domain instead of production
3. **Missing CSP Headers**: Content Security Policy blocking worker creation for Clerk
4. **Environment Variable Issues**: Production URL misconfigured

## Fixes Applied

### 1. Updated Convex Auth Configuration (`convex/auth.config.ts`)
- Added dynamic domain detection based on environment
- Proper fallback chain for development and production
- Support for custom Clerk domains

### 2. Fixed Environment Variables (`.env.production`)
- Updated `NEXT_PUBLIC_APP_URL` to `https://sandboxmentoloop.online`
- Ensured all production keys are properly set

### 3. Updated Security Headers (`netlify.toml`)
- Added `worker-src 'self' blob:` to CSP
- Added `clerk.sandboxmentoloop.online` to allowed domains
- Added `accounts.google.com` to frame-src for OAuth

### 4. Created Environment Template (`.env.production.example`)
- Complete template with all required variables
- Detailed instructions for each service
- Clerk Dashboard configuration checklist

## Clerk Dashboard Configuration Required

### Production Setup Checklist

1. **Switch to Production Instance**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your application
   - Switch to "Production" at the top
   - If not created, click "Upgrade to Production"

2. **Configure JWT Templates**
   - Go to JWT Templates
   - Create a template named "convex"
   - Set issuer domain to match your Clerk domain

3. **Configure OAuth Redirect URLs**
   - Go to User & Authentication > Social Connections
   - For Google OAuth, add ALL of these redirect URLs:
     * `https://sandboxmentoloop.online/sso-callback/google`
     * `https://sandboxmentoloop.online/sign-in`
     * `https://sandboxmentoloop.online/sign-up`
     * `https://sandboxmentoloop.online/dashboard`

4. **Configure Custom Domain (Optional)**
   - Go to Domains
   - Add custom domain: `clerk.sandboxmentoloop.online`
   - Follow DNS configuration instructions
   - Update `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` after setup

5. **Configure Webhooks (If Using)**
   - Go to Webhooks
   - Add endpoint: `https://sandboxmentoloop.online/api/clerk-webhook`
   - Select events: user.created, user.updated, etc.
   - Copy webhook secret to `CLERK_WEBHOOK_SECRET`

## Netlify Environment Variables

Ensure these are set in your Netlify dashboard:

```env
# Clerk (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://clerk.sandboxmentoloop.online

# Convex
CONVEX_DEPLOYMENT=prod:colorful-retriever-431
NEXT_PUBLIC_CONVEX_URL=https://colorful-retriever-431.convex.cloud

# Application
NEXT_PUBLIC_APP_URL=https://sandboxmentoloop.online
NODE_ENV=production
```

## Testing Instructions

### Local Development
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Click "Get Started" → Select role → Create account
4. Verify Clerk authentication works
5. Check console for any errors

### Production
1. Deploy changes to Netlify
2. Navigate to https://sandboxmentoloop.online
3. Test authentication flow
4. Verify Convex connection works
5. Check for any console errors

## Common Issues & Solutions

### Issue: "No auth provider found matching the given token"
**Solution**: Ensure Clerk domain in Convex matches actual Clerk instance

### Issue: CSP errors in console
**Solution**: Check netlify.toml has correct CSP headers including worker-src

### Issue: OAuth redirect fails
**Solution**: Add all redirect URLs to Clerk Dashboard OAuth settings

### Issue: Custom domain not working
**Solution**: Verify DNS settings and wait for propagation (can take up to 48 hours)

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Auth Setup](https://docs.convex.dev/auth/clerk)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## Next Steps

1. Configure Clerk Dashboard as described above
2. Update Netlify environment variables
3. Deploy to production
4. Test authentication flow on production site
5. Monitor for any errors in production logs