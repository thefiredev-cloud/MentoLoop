# Clerk Webhook Configuration Guide

## Overview
This guide explains how to configure Clerk webhooks to sync users between Clerk and Convex. Without proper webhook configuration, users authenticated through Clerk won't be automatically created in the Convex database, causing "User profile not found" errors.

## Production Setup Steps

### 1. Get Your Convex HTTP Endpoint URL
1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your production deployment
3. Find the HTTP endpoint URL (format: `https://[your-deployment].convex.site`)
4. Your webhook endpoint will be: `https://[your-deployment].convex.site/clerk-users-webhook`

### 2. Configure Webhook in Clerk Dashboard
1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your production application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Configure the webhook:
   - **Endpoint URL**: `https://[your-convex-deployment].convex.site/clerk-users-webhook`
   - **Description**: "Convex User Sync"
   - **Events to listen for**:
     - ✅ user.created
     - ✅ user.updated
     - ✅ user.deleted
6. Click **Create**
7. After creation, copy the **Signing Secret** (starts with `whsec_`)

### 3. Add Webhook Secret to Convex Environment
1. Go to your Convex dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: The signing secret from Clerk (e.g., `whsec_...`)
4. Click **Save**

### 4. Verify Webhook is Working
1. In Clerk Dashboard, go to your webhook endpoint
2. Click **Send test** and select `user.created` event
3. Check Convex logs for successful webhook processing
4. Look for message: "Webhook processed successfully"

## Troubleshooting

### "User profile not found" Error
**Cause**: User exists in Clerk but not in Convex database.

**Solutions**:
1. **Immediate Fix**: The app now includes `ensureUserExists` mutation that creates users on-demand
2. **Long-term Fix**: Ensure webhook is properly configured (follow steps above)

### Webhook Not Receiving Events
1. **Check URL**: Ensure the webhook URL is correct and publicly accessible
2. **Check Secret**: Verify `CLERK_WEBHOOK_SECRET` is set in Convex environment
3. **Check Events**: Ensure the correct events are selected in Clerk
4. **Check Logs**: Look at Convex function logs for any webhook errors

### Webhook Signature Verification Failed
**Error**: "Webhook signature verification failed"
**Solution**: The `CLERK_WEBHOOK_SECRET` in Convex doesn't match the signing secret from Clerk. Re-copy the secret from Clerk and update in Convex.

## Testing Webhooks Locally
For local development, you can use ngrok to expose your local Convex instance:

```bash
# Install ngrok
npm install -g ngrok

# Run your Convex dev server
npx convex dev

# In another terminal, expose Convex HTTP endpoint
ngrok http 3210  # Default Convex HTTP port

# Use the ngrok URL for webhook configuration in Clerk
# Example: https://abc123.ngrok.io/clerk-users-webhook
```

## Fallback Mechanisms
The app includes multiple fallback mechanisms to ensure users are synced:

1. **On-demand Creation**: `ensureUserExists` mutation creates users when needed
2. **Proactive Sync**: `UserSyncWrapper` component syncs users on app load
3. **Submission Sync**: Student intake form ensures user exists before submission

## Environment Variables Reference
```env
# Required in Convex Dashboard (not in .env file)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Required in .env.local (Next.js app)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Security Notes
- Never commit webhook secrets to version control
- Use different webhook secrets for development and production
- Regularly rotate webhook secrets for security
- Monitor webhook logs for suspicious activity

## Support
If you continue experiencing issues after following this guide:
1. Check Convex function logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test with the Clerk webhook testing tool
4. Contact support with specific error messages and logs