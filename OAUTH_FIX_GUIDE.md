# OAuth Redirect URI Fix Guide

## Problem
Getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google OAuth through Clerk.

## Root Cause
The redirect URIs configured in Clerk Dashboard's OAuth provider settings don't match the URLs your application is using.

## Solution Overview
Since Clerk is deprecating Dashboard-based path configuration, we need to:
1. Configure OAuth redirect URIs in the OAuth provider settings (not paths)
2. Update code-side configuration
3. Ensure environment variables are properly set

## Step-by-Step Fix

### 1. Clerk Dashboard - OAuth Configuration

#### Navigate to OAuth Settings:
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. **Switch to Production instance** (critical!)
4. Navigate to: **User & Authentication** → **Social Connections**
5. Click on **Google** provider settings

#### Configure Google OAuth:
In the Google OAuth settings, you need to add these **Authorized redirect URIs**:

```
https://sandboxmentoloop.online/sso-callback/google
https://bejewelled-cassata-453411.netlify.app/sso-callback/google
https://loved-lamprey-34.clerk.accounts.dev/v1/oauth_callback
https://clerk.sandboxmentoloop.online/v1/oauth_callback
```

**Note:** The exact callback URL format may be shown in your Clerk Dashboard. Copy it exactly as shown.

### 2. Google Cloud Console Configuration

If you have access to Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Add the same redirect URIs from above to **Authorized redirect URIs**

### 3. Environment Variables

#### For Netlify Production:
Set these in Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Production keys from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc2FuZGJveG1lbnRvbG9vcC5vbmxpbmUk
CLERK_SECRET_KEY=sk_live_nvimSBgvKYdVQ5PrXOSJjvk8F4lV6bXpqGZZfwMwx8

# URLs
NEXT_PUBLIC_APP_URL=https://sandboxmentoloop.online
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Frontend API URL
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://clerk.sandboxmentoloop.online
```

#### For Local Development:
Keep using development keys in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-dev-key]
CLERK_SECRET_KEY=sk_test_[your-dev-secret]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Code Configuration

We've implemented code-side configuration as Clerk recommends:

#### Files Updated:
- `lib/clerk-config.ts` - Centralized Clerk configuration
- `app/sign-in/[[...sign-in]]/page.tsx` - Custom sign-in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Custom sign-up page
- `app/layout.tsx` - ClerkProvider with proper redirect URLs

#### Key Changes:
1. Added explicit redirect URL configuration in ClerkProvider
2. Created custom sign-in/sign-up pages with proper redirectUrl props
3. Added helper function to generate OAuth redirect URLs

### 5. Testing

#### Local Testing:
```bash
npm run dev
# Visit http://localhost:3000
# Click sign in → Try Google OAuth
```

#### Production Testing:
1. Push changes to GitHub (auto-deploys to Netlify)
2. Clear browser cookies/cache
3. Visit https://sandboxmentoloop.online
4. Test sign-in flow

### 6. Troubleshooting

#### Still Getting redirect_uri_mismatch?

1. **Check Clerk Instance:**
   - Ensure you're on Production (not Development) in Clerk Dashboard
   - Verify the OAuth provider is enabled

2. **Verify URLs:**
   - Check that redirect URIs are EXACTLY as shown in error message
   - No trailing slashes
   - Correct protocol (https for production)

3. **Clear Cache:**
   - Clear all cookies for your domain
   - Try incognito/private mode
   - Try different browser

4. **Check Logs:**
   - Netlify function logs
   - Browser console for errors
   - Network tab for redirect chains

### 7. Common Issues

| Issue | Solution |
|-------|----------|
| Wrong Clerk instance | Switch to Production in dashboard |
| URLs don't match | Copy exact URLs from error message |
| Custom domain not working | Configure DNS CNAME for clerk.sandboxmentoloop.online |
| Environment variables missing | Check Netlify environment settings |

### 8. OAuth Flow Explanation

1. User clicks "Sign in with Google"
2. Clerk redirects to Google with callback URL
3. Google validates the redirect URI against configured ones
4. If match: User authenticates with Google
5. Google redirects back to Clerk callback URL
6. Clerk processes auth and redirects to your app's dashboard

### 9. Required Redirect URIs

Based on your setup, these are ALL the redirect URIs you might need:

```
# Production Custom Domain
https://sandboxmentoloop.online/sso-callback/google
https://sandboxmentoloop.online/sign-in
https://sandboxmentoloop.online/sign-up
https://sandboxmentoloop.online/dashboard

# Netlify Default Domain
https://bejewelled-cassata-453411.netlify.app/sso-callback/google
https://bejewelled-cassata-453411.netlify.app/sign-in
https://bejewelled-cassata-453411.netlify.app/sign-up
https://bejewelled-cassata-453411.netlify.app/dashboard

# Clerk OAuth Callbacks (check your dashboard for exact URLs)
https://loved-lamprey-34.clerk.accounts.dev/v1/oauth_callback
https://clerk.sandboxmentoloop.online/v1/oauth_callback

# Development (if needed)
http://localhost:3000/sso-callback/google
http://localhost:3000/sign-in
http://localhost:3000/sign-up
http://localhost:3000/dashboard
```

### 10. Next Steps

1. **Configure in Clerk Dashboard** (Social Connections → Google)
2. **Set Netlify environment variables**
3. **Deploy to production**
4. **Test OAuth flow**
5. **Monitor for errors**

## Contact Support

If issues persist:
- **Clerk Support:** https://clerk.com/support
- **Clerk Discord:** https://discord.com/invite/b5rXHjAg7A
- **Documentation:** https://clerk.com/docs

## Quick Checklist

- [ ] Switched to Production instance in Clerk Dashboard
- [ ] Added all redirect URIs in Google OAuth settings (Clerk Dashboard)
- [ ] Set production environment variables in Netlify
- [ ] Created custom sign-in/sign-up pages
- [ ] Updated ClerkProvider configuration
- [ ] Cleared browser cache
- [ ] Tested OAuth flow

Once all items are checked, your Google OAuth should work properly!