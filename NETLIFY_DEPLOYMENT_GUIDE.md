# MentoLoop Netlify Deployment Guide

## 🚀 Deployment Status

Your MentoLoop application has been configured for production deployment at **your-domain.com**

### ✅ Completed Setup

1. **Convex Production Database**
   - Deployment: `your-convex-deployment`
   - URL: https://your-convex-url.convex.cloud
   - Webhook secret configured

2. **Environment Configuration**
   - Production credentials configured in `.env.production`
   - All services ready (Stripe, SendGrid, Twilio, OpenAI, Gemini)
   
3. **GitHub Repository**
   - Code pushed to: https://github.com/Apex-ai-net/MentoLoop

## 📋 Next Steps in Netlify Dashboard

### Step 1: Create New Site from GitHub

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub
4. Select repository: `Apex-ai-net/MentoLoop`
5. Configure build settings:
   - Build command: `npm ci --legacy-peer-deps && npm run build`
   - Publish directory: `.next`

### Step 2: Add Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add ALL variables from `.env.production`:

#### Critical Variables (Add These First):

```
CONVEX_DEPLOYMENT=prod:YOUR_CONVEX_DEPLOYMENT_NAME
NEXT_PUBLIC_CONVEX_URL=https://YOUR_CONVEX_URL.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### All Other Variables:
Copy each variable from `.env.production` file into Netlify's environment variables section.

### Step 3: Configure Custom Domain

1. Go to Domain Settings in Netlify
2. Add custom domain: `your-domain.com`
3. Configure DNS (at your domain registrar):
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS

### Step 4: Deploy

1. Trigger deploy from Netlify dashboard
2. Monitor build logs
3. Once deployed, visit https://your-domain.com

## ⚠️ Important Notes

### Clerk Authentication
- Currently using TEST keys (pk_test_, sk_test_)
- For production use, upgrade to production Clerk keys
- Update redirect URLs in Clerk dashboard to use your-domain.com

### Stripe Payments
- Using LIVE Stripe keys - ready for real payments
- Configure webhooks in Stripe dashboard for your-domain.com

### Email Configuration
- SendGrid will send from: support@your-domain.com
- Verify domain in SendGrid for better deliverability

## 🧪 Testing Checklist

After deployment, test:
- [ ] Homepage loads at your-domain.com
- [ ] Sign up/Sign in with Clerk
- [ ] Dashboard access after authentication
- [ ] Convex database operations
- [ ] Payment processing (use test cards initially)
- [ ] Email sending (if applicable)
- [ ] SMS sending (if applicable)

## 🔧 Troubleshooting

### Build Fails
- Check Node version (should be 20.x)
- Verify all environment variables are set
- Check build logs for specific errors

### Authentication Issues
- Verify Clerk keys are correct
- Check redirect URLs match domain
- Ensure JWT template "convex" exists in Clerk

### Database Connection Issues
- Verify Convex deployment URL is correct
- Check if Convex functions are deployed
- Ensure CLERK_WEBHOOK_SECRET is set in Convex

## 📞 Support

- Convex Dashboard: https://dashboard.convex.dev
- Clerk Dashboard: https://dashboard.clerk.com
- Netlify Support: https://app.netlify.com/support

## 🎉 Ready to Deploy!

Your application is fully configured and ready for deployment to your-domain.com!