# MentoLoop Matching System Environment Variables

## Critical Environment Variables for Student-Preceptor Matching

This document outlines all environment variables required for the MentoLoop matching system to function properly in production.

## Core Matching System Variables

### AI Matching Services
```env
# OpenAI API Key (Primary AI provider for enhanced matching)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Gemini API Key (Fallback AI provider)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
```
**Purpose**: These keys enable AI-enhanced matching analysis that improves upon the base MentorFit™ algorithm. The system uses OpenAI GPT-4 as the primary provider and falls back to Google Gemini if unavailable.

### Database Backend (Convex)
```env
# Convex Deployment Configuration
CONVEX_DEPLOYMENT=prod:kindly-setter-845
NEXT_PUBLIC_CONVEX_URL=https://kindly-setter-845.convex.cloud
```
**Purpose**: Connects the application to the Convex serverless backend where all matching logic, MentorFit™ scoring, and database operations are handled.

### Authentication (Clerk)
```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```
**Purpose**: Manages user authentication and ensures only authorized users can access matching features. Required for both students and preceptors.

### Payment Processing (Stripe)
```env
# Stripe Payment Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Subscription Price IDs
STRIPE_PRICE_ID_CORE=price_1S22LRB1lwwjVYGvHmZ7gtYq
STRIPE_PRICE_ID_PRO=price_1S22LdB1lwwjVYGvqYOegswu
STRIPE_PRICE_ID_PREMIUM=price_1S22LqB1lwwjVYGvR5hlPOvs
```
**Purpose**: Processes payments for accepted matches and manages subscription tiers that affect matching limits.

### Communication Services
```env
# Email Notifications (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=support@sandboxmentoloop.online

# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+17373748445
```
**Purpose**: Sends notifications to students and preceptors when matches are created, accepted, or declined.

## Matching System Features Configuration

### Feature Flags
```env
# Enable/Disable Features
ENABLE_AI_MATCHING=true              # Use AI enhancement for matching
ENABLE_EMAIL_NOTIFICATIONS=true      # Send email notifications
ENABLE_SMS_NOTIFICATIONS=true        # Send SMS notifications
ENABLE_PAYMENT_PROCESSING=true       # Require payment for matches
```

### System Settings
```env
# Application URLs
NEXT_PUBLIC_APP_URL=https://sandboxmentoloop.online
EMAIL_DOMAIN=sandboxmentoloop.online

# Security & Performance
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
SESSION_TIMEOUT_MINUTES=60
```

## Netlify Deployment Configuration

All environment variables must be configured in Netlify with appropriate contexts:
- `all` - Applied to all deployments
- `production` - Production builds only
- `deploy-preview` - Preview deployments
- `branch-deploy` - Branch deployments
- `dev` - Development builds

### Setting Environment Variables in Netlify

1. **Via Netlify CLI**:
```bash
# Set a variable for all contexts
npx netlify-cli env:set VARIABLE_NAME "value"

# Set for specific context
npx netlify-cli env:set VARIABLE_NAME "value" --context production
```

2. **Via Netlify Dashboard**:
- Go to Site Settings → Environment Variables
- Add each variable with appropriate scope and context
- Mark sensitive variables as "secret"

## Verification Checklist

### Essential Variables for Matching
- [ ] `OPENAI_API_KEY` - For AI-enhanced matching
- [ ] `GEMINI_API_KEY` - Fallback AI provider
- [ ] `CONVEX_DEPLOYMENT` - Backend connection
- [ ] `NEXT_PUBLIC_CONVEX_URL` - Backend API URL
- [ ] `CLERK_SECRET_KEY` - User authentication
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `SENDGRID_API_KEY` - Email notifications
- [ ] `TWILIO_AUTH_TOKEN` - SMS notifications

### Testing the Configuration

1. **Build Test**:
```bash
npm run build
```

2. **Type Check**:
```bash
npm run type-check
```

3. **Lint Check**:
```bash
npm run lint
```

4. **Production Deploy**:
```bash
git add .
git commit -m "feat: update matching system configuration"
git push origin main
# Netlify will automatically deploy
```

## Troubleshooting

### Common Issues

1. **"AI matching unavailable"**
   - Verify `OPENAI_API_KEY` or `GEMINI_API_KEY` is set
   - Check API key validity and quota

2. **"Cannot connect to backend"**
   - Verify `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
   - Ensure Convex project is active

3. **"Authentication failed"**
   - Check `CLERK_SECRET_KEY` is correct
   - Verify Clerk domain configuration

4. **"Notifications not sending"**
   - Verify SendGrid/Twilio credentials
   - Check `ENABLE_EMAIL_NOTIFICATIONS` and `ENABLE_SMS_NOTIFICATIONS`

## Security Notes

- **Never commit `.env.local` to version control**
- All sensitive keys should be marked as "secret" in Netlify
- Rotate API keys regularly
- Use different keys for development and production
- Monitor API usage for unusual activity

## Support

For issues with environment configuration:
1. Check Netlify deployment logs
2. Verify all required variables are set
3. Test with minimal configuration first
4. Contact support with specific error messages

---
*Last Updated: January 2025*