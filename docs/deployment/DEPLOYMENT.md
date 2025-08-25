# MentoLoop Deployment Guide

This comprehensive guide covers deploying the MentoLoop healthcare education platform to production.

## 📋 Prerequisites

### Required Accounts & Services
- [Netlify](https://netlify.com) - Hosting and deployment
- [Convex](https://convex.dev) - Real-time database and serverless functions
- [Clerk](https://clerk.com) - Authentication and user management
- [Stripe](https://stripe.com) - Payment processing
- [SendGrid](https://sendgrid.com) - Email automation
- [Twilio](https://twilio.com) - SMS notifications
- [OpenAI](https://openai.com) - AI matching (MentorFit)
- [Google Cloud](https://cloud.google.com) - Gemini AI (backup)

### Development Environment
- Node.js 22+ and npm 10+
- Git for version control
- Modern code editor (VS Code recommended)

## 🚀 Production Deployment Steps

### 1. Environment Setup

#### Copy Production Template
```bash
cp .env.production.template .env.production
```

#### Configure Production Variables
Edit `.env.production` with your production values:

```bash
# Convex Production
CONVEX_DEPLOYMENT=prod:your-production-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod-url.convex.cloud

# Clerk Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# AI Services
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=your_gemini_key

# Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Communications
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=support@mentoloop.com
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Application
NEXT_PUBLIC_APP_URL=https://mentoloop.com
NODE_ENV=production
```

### 2. Convex Database Setup

#### Deploy Convex Schema
```bash
# Navigate to project directory
cd mentoloop

# Deploy production Convex
npx convex deploy --prod

# Set environment variables in Convex dashboard
npx convex env set CLERK_WEBHOOK_SECRET whsec_your_webhook_secret
npx convex env set OPENAI_API_KEY sk-proj-your_openai_key
npx convex env set GEMINI_API_KEY your_gemini_key
npx convex env set SENDGRID_API_KEY SG.your_sendgrid_key
npx convex env set TWILIO_ACCOUNT_SID ACyour_twilio_sid
npx convex env set TWILIO_AUTH_TOKEN your_twilio_token
```

#### Verify Database Schema
```bash
npx convex dashboard
# Verify all tables are created:
# - users, students, preceptors, matches, payments
# - auditLogs, securityAlerts, userSessions
# - failedLogins, dataAccessLogs
# - surveys, clinicalHours, enterprises
```

### 3. Authentication Setup (Clerk)

#### Configure JWT Template
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "JWT Templates"
3. Create template named "convex"
4. Add custom claims:
```json
{
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "aud": "convex",
  "exp": "{{date.now_plus_minutes(60)}}",
  "iat": "{{date.now}}",
  "email": "{{user.primary_email_address.email_address}}",
  "name": "{{user.first_name}} {{user.last_name}}"
}
```

#### Configure Webhooks
1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/clerk-users-webhook`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to environment variables

#### Configure Redirect URLs
```
Sign-in URL: https://your-domain.com/sign-in
Sign-up URL: https://your-domain.com/sign-up
After sign-in: https://your-domain.com/dashboard
After sign-up: https://your-domain.com/dashboard
```

### 4. Payment Processing (Stripe)

#### Configure Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
4. Copy webhook secret to environment variables

#### Configure Products
Create three subscription products:
- **Basic Plan**: $99/month - Basic matching
- **Premium Plan**: $199/month - AI-enhanced matching + support
- **Enterprise Plan**: $499/month - Full features + priority support

### 5. Email Setup (SendGrid)

#### Configure Domain Authentication
1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Authenticate your domain (mentoloop.com)
3. Configure DNS records as provided

#### Create Email Templates
Required templates (see `/convex/emails.ts` for content):
- `welcome-student` - Student welcome email
- `welcome-preceptor` - Preceptor welcome email
- `match-notification-student` - Match found notification
- `match-notification-preceptor` - New student match
- `rotation-reminder` - Rotation deadline reminder
- `evaluation-reminder` - Evaluation reminder
- `payment-confirmation` - Payment successful
- `payment-failed` - Payment failed

### 6. SMS Setup (Twilio)

#### Configure Phone Number
1. Purchase a Twilio phone number
2. Configure webhook for incoming messages (optional)
3. Verify phone number in production

#### Configure Messaging Service
1. Create Messaging Service in Twilio Console
2. Add your phone number to the service
3. Configure sender pool and compliance

### 7. Netlify Deployment

#### Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:

```
Build command: npm run build
Publish directory: .next
Node version: 22
```

#### Configure Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add all production environment variables from your `.env.production` file.

#### Configure Redirects (netlify.toml)
```toml
[build]
  command = "npm install && npm run build"
  publish = ".next"
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NETLIFY = "true"

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"

# Redirects for SPA routing
[[redirects]]
  from = "/dashboard/*"
  to = "/dashboard/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/api/:splat"
  status = 200
```

#### Deploy
```bash
# Trigger deployment
git push origin main

# Or manual deploy
netlify deploy --prod --dir=.next
```

### 8. Domain Configuration

#### Configure Custom Domain
1. In Netlify Dashboard → Domain Settings
2. Add custom domain: `mentoloop.com`
3. Configure DNS records:
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 104.198.14.52 (Netlify's IP)
```

#### SSL Certificate
Netlify automatically provisions SSL certificates via Let's Encrypt.

### 9. Monitoring & Alerting

#### Configure Error Tracking (Optional)
Add Sentry for production error tracking:
```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Health Monitoring
Set up monitoring for:
- Application uptime (Pingdom, UptimeRobot)
- API endpoints health
- Database connectivity
- Third-party service status

### 10. Security Configuration

#### Enable Security Headers
Already configured in `netlify.toml` above.

#### Configure Rate Limiting
Implement in API routes:
```javascript
// app/api/matches/route.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

#### HIPAA Compliance Checklist
- [ ] SSL/TLS encryption enabled
- [ ] Database encryption at rest
- [ ] Audit logging implemented
- [ ] Access controls configured
- [ ] Data retention policies set
- [ ] Business associate agreements signed

## 🧪 Testing Deployment

### 1. Run Integration Tests
```bash
npm run test:integration
```

### 2. Manual Testing Checklist
- [ ] User registration (student & preceptor)
- [ ] Authentication flow
- [ ] AI matching functionality
- [ ] Payment processing
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Dashboard functionality
- [ ] Data persistence
- [ ] Real-time updates

### 3. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 2 seconds
- [ ] AI matching < 30 seconds
- [ ] Database queries optimized

### 4. Security Testing
- [ ] HTTPS enforcement
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Authentication bypass attempts

## 📊 Production Monitoring

### Key Metrics to Monitor
- **Uptime**: Target 99.9%
- **Response Time**: < 2 seconds average
- **Error Rate**: < 0.1%
- **Database Performance**: Query times < 100ms
- **Payment Success Rate**: > 99%
- **Email Delivery Rate**: > 95%
- **SMS Delivery Rate**: > 98%

### Dashboard URLs
- **Application**: https://mentoloop.com
- **Convex Dashboard**: https://dashboard.convex.dev
- **Netlify Dashboard**: https://app.netlify.com
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Stripe Dashboard**: https://dashboard.stripe.com

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# Via Netlify Dashboard
1. Go to Deploys
2. Click "..." on previous deploy
3. Click "Publish deploy"

# Via CLI
netlify deploy --prod --dir=previous-build
```

### Database Rollback
```bash
# Convex doesn't support rollbacks
# Use backup/restore procedures
npx convex import backup-file.jsonl
```

### Service Outage Response
1. **Identify affected services**
2. **Check status pages** of third-party providers
3. **Enable fallback mechanisms**
4. **Notify users** via status page
5. **Document incident** in audit logs

## 📞 Support Contacts

- **Netlify Support**: Via dashboard
- **Convex Support**: support@convex.dev
- **Clerk Support**: Via dashboard
- **Stripe Support**: Via dashboard
- **SendGrid Support**: Via dashboard
- **Twilio Support**: Via dashboard

## 📝 Post-Deployment Checklist

- [x] All environment variables configured (development)
- [x] Database schema deployed (Convex production ready)
- [x] Authentication working (Clerk integration complete)
- [x] Payment processing tested (Stripe integration ready)
- [x] Email/SMS notifications working (SendGrid/Twilio ready)
- [ ] Monitoring configured (pending production deployment)
- [ ] SSL certificate active (pending domain setup)
- [ ] Custom domain configured (pending production deployment)
- [x] Performance benchmarks met (development environment)
- [x] Security headers configured (netlify.toml ready)
- [ ] Backup procedures tested (pending production deployment)
- [x] Team access configured (development environment)
- [x] Documentation updated (comprehensive guides complete)

---

**Last Updated**: August 20, 2025  
**Version**: 0.9.7  
**Environment**: Pre-Production (Ready for Deployment)  
**Deployment Status**: All preparation steps documented, ready for production deployment