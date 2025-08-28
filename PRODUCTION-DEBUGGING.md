# MentoLoop Production Debugging Guide

## 🚀 Quick Start - Dashboard Access Issues

### If your client cannot access the dashboard:

1. **Check Authentication**
   ```
   Visit: https://sandboxmentoloop.online/sign-in
   - Can they sign in?
   - Do they see any error messages?
   - Check browser console for errors (F12)
   ```

2. **Verify User Role**
   - After sign-in, check browser console for logs starting with `[Dashboard]`
   - Look for: `[Dashboard] Routing user:` to see their userType
   - If userType is null/undefined, they need to complete onboarding

3. **Quick Health Check**
   ```
   Visit: https://sandboxmentoloop.online/api/health
   Should return: {"status":"healthy",...}
   ```

## 📋 Environment Variable Checklist

### Critical Variables (Dashboard won't work without these)

In Netlify Dashboard → Site Settings → Environment Variables, ensure these are set:

```bash
# Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Must be production key
CLERK_SECRET_KEY=sk_live_...                   # Must be production key
CLERK_WEBHOOK_SECRET=whsec_...                 # From Clerk dashboard

# Database (REQUIRED)
CONVEX_DEPLOYMENT=prod:...                     # Your Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud # Your Convex URL

# AI Services (REQUIRED for matching)
OPENAI_API_KEY=sk-proj-...                     # OpenAI API key
GEMINI_API_KEY=...                             # Google Gemini key

# Payments (REQUIRED for payment flow)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Stripe live key
STRIPE_SECRET_KEY=sk_live_...                  # Stripe live key
STRIPE_WEBHOOK_SECRET=whsec_...                # From Stripe dashboard

# Communications
SENDGRID_API_KEY=SG....                        # SendGrid API
SENDGRID_FROM_EMAIL=support@yourdomain.com     # Verified sender
TWILIO_ACCOUNT_SID=AC...                       # Twilio account
TWILIO_AUTH_TOKEN=...                          # Twilio auth
TWILIO_PHONE_NUMBER=+1...                      # Twilio phone

# App Configuration
NODE_ENV=production                            # Must be "production"
NEXT_PUBLIC_APP_URL=https://sandboxmentoloop.online
```

## 🔍 Common Issues & Solutions

### 1. User Can't Sign In

**Symptoms:**
- Stuck at sign-in page
- "Not authorized" error
- Infinite redirect loop

**Solutions:**
```javascript
// Check in browser console:
localStorage.getItem('__clerk_db_jwt')  // Should have a token

// Clear Clerk cache if needed:
localStorage.clear()
sessionStorage.clear()
// Then refresh and try signing in again
```

### 2. Dashboard Shows "Setting up your profile" Forever

**Cause:** User record not syncing between Clerk and Convex

**Solution:**
1. Check Clerk Dashboard → Webhooks → Look for failed webhooks
2. Verify webhook endpoint: `https://sandboxmentoloop.online/api/clerk-webhook`
3. Check webhook secret matches `CLERK_WEBHOOK_SECRET` in Netlify

### 3. Dashboard Redirects to Wrong Page

**Debug Steps:**
1. Open browser console (F12)
2. Look for logs:
   ```
   [Dashboard] Routing user: {userType: "student"...}
   [Dashboard] Redirecting to student dashboard
   ```
3. If userType is wrong, update in Convex dashboard

### 4. "Failed to load user profile" Error

**Check These:**
1. Convex connection:
   ```bash
   curl https://your-deployment.convex.cloud
   # Should return: {"status":"healthy"}
   ```

2. Check Netlify Functions tab for errors
3. Verify `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` match

### 5. Payment Issues

**Debug Stripe Integration:**
1. Check Stripe Dashboard → Developers → Webhooks
2. Verify endpoint: `https://sandboxmentoloop.online/api/stripe-webhook`
3. Check webhook signing secret matches
4. Look for failed webhook attempts in Stripe

## 🛠️ Production Verification Scripts

### Run Local Verification
```bash
# From your local machine with the code:
node scripts/verify-production.js

# This will check:
- All endpoints are accessible
- Security headers are set
- Services are responding
```

### Manual Health Checks

1. **Main Health Check:**
   ```
   https://sandboxmentoloop.online/api/health
   ```

2. **Dashboard Health Check (requires auth):**
   ```
   https://sandboxmentoloop.online/api/dashboard-health
   ```

3. **Check Specific Pages:**
   - Landing: https://sandboxmentoloop.online/
   - Sign In: https://sandboxmentoloop.online/sign-in
   - Sign Up: https://sandboxmentoloop.online/sign-up
   - Dashboard: https://sandboxmentoloop.online/dashboard (requires auth)

## 📊 Monitoring Dashboard Access

### Browser Console Commands

Run these in the browser console while on the dashboard:

```javascript
// Check authentication status
__clerk_db_jwt && console.log('User is authenticated')

// Get current user info (if using Clerk)
window.Clerk && window.Clerk.user && console.log(window.Clerk.user)

// Check Convex connection
fetch('/api/dashboard-health')
  .then(r => r.json())
  .then(console.log)
```

### Netlify Monitoring

1. **Check Build Logs:**
   - Netlify Dashboard → Deploys → Click latest deploy
   - Look for build errors or warnings

2. **Check Function Logs:**
   - Netlify Dashboard → Functions tab
   - Look for errors in API routes

3. **Check Deploy Settings:**
   - Build command: `npm ci --legacy-peer-deps && npm run build`
   - Publish directory: `.next`
   - Node version: 20.x

## 🚨 Emergency Fixes

### If Everything Is Broken:

1. **Redeploy with Cache Clear:**
   ```
   Netlify Dashboard → Deploys → Trigger Deploy → Clear cache and deploy
   ```

2. **Check Service Status:**
   - Clerk: https://status.clerk.com
   - Convex: https://status.convex.dev
   - Stripe: https://status.stripe.com
   - Netlify: https://www.netlifystatus.com

3. **Rollback to Previous Deploy:**
   - Netlify Dashboard → Deploys → Find last working deploy → Publish deploy

### Quick Environment Variable Test

Create this test file locally as `test-env.js`:

```javascript
const required = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CONVEX_DEPLOYMENT',
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY'
];

console.log('Environment Check:');
required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ ${key}: MISSING`);
  } else if (value.includes('test')) {
    console.log(`⚠️ ${key}: Using TEST key in production!`);
  } else {
    console.log(`✅ ${key}: Set`);
  }
});
```

## 📞 Support Escalation Path

1. **Check this guide first**
2. **Run verification scripts**
3. **Check Netlify function logs**
4. **Check browser console for errors**
5. **If still stuck:**
   - Document error messages
   - Note which dashboard/page has issues
   - Check webhook logs in Clerk/Stripe
   - Contact support with details

## 🔐 Security Notes

- Never share API keys or secrets in logs/screenshots
- Use production keys (pk_live_, sk_live_) not test keys
- Ensure HTTPS is always used
- Check Content Security Policy headers are active

## 📈 Performance Monitoring

Check these metrics in production:

1. **Page Load Time:**
   - Should be < 3 seconds for dashboard
   - Check Network tab in browser DevTools

2. **API Response Times:**
   - Health check should respond < 500ms
   - Dashboard data should load < 2 seconds

3. **Error Rate:**
   - Check Netlify Functions for error percentage
   - Should be < 1% error rate

## 🎯 Testing User Journeys

### Test Student Flow:
1. Sign up as new user
2. Complete student intake
3. Access student dashboard
4. View matches
5. Make payment
6. Access paid features

### Test Preceptor Flow:
1. Sign up as new user
2. Complete preceptor intake
3. Access preceptor dashboard
4. View student matches
5. Update availability

### Test Admin Access:
1. Sign in with admin account
2. Access admin dashboard
3. View all users
4. Check analytics
5. Review audit logs

---

## Need More Help?

If dashboard issues persist after following this guide:
1. Save browser console logs
2. Save network requests (HAR file)
3. Note exact error messages
4. Document reproduction steps
5. Check webhook logs in third-party services