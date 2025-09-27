# Claude Code Instructions

## Project Overview

MentoLoop is a comprehensive healthcare education platform that connects Nurse Practitioner (NP) students with qualified preceptors for clinical rotations. The platform leverages AI-powered matching algorithms to ensure optimal student-preceptor pairings, while providing a full suite of features including payment processing, real-time messaging, document management, and detailed analytics dashboards.

## Technology Stack

- **Frontend**: Next.js 15.3.5, React 18, TypeScript 5
- **Backend**: Convex (serverless backend with real-time sync)
- **Authentication**: Clerk (user management & organizations)
- **Payments**: Stripe (subscriptions & one-time payments)
- **AI Services**: OpenAI/Gemini for intelligent matching
- **Communications**: SendGrid (email), Twilio (SMS)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Netlify (continuous deployment from GitHub)
- **Testing**: Playwright (E2E), Vitest (unit tests)

## Key Features

### For Students

- AI-powered preceptor matching based on preferences
- Clinical hour tracking and management
- Document upload and verification
- Subscription plans (Core, Pro, Elite)
- Real-time messaging with preceptors
- CEU course enrollment and tracking
- Progress dashboards and analytics

### For Preceptors

- Student match requests and management
- Schedule management and availability
- Compensation tracking
- Student evaluations
- Document verification
- Professional profile management

### For Enterprises/Institutions

- Bulk student management
- Analytics and reporting
- Compliance tracking
- Custom billing arrangements
- Student progress monitoring
- Preceptor network management

### Administrative Features

- User management dashboard
- Financial analytics
- Audit logging
- SMS/Email campaign management
- Match oversight and manual intervention
- Discount code management

## Recent Updates (Latest)

### New Features Added

1. **Billing System** (`convex/billing.ts`)
   - Complete subscription management for Core/Pro/Elite plans
   - Invoice generation and payment tracking
   - Discount code application

2. **CEU Courses Platform** (`convex/ceuCourses.ts`)
   - Course catalog with categories and difficulty levels
   - Enrollment tracking and progress monitoring
   - Certificate generation upon completion

3. **Enterprise Management** (`convex/enterpriseManagement.ts`)
   - Comprehensive enterprise dashboard
   - Student cohort management
   - Advanced analytics and reporting
   - Bulk operations support

4. **Error Handling** (`components/error-boundary.tsx`)
   - React error boundaries for graceful error recovery
   - User-friendly error messages
   - Automatic error logging

5. **UI Improvements** (`components/ui/loading-skeleton.tsx`)
   - Loading skeletons for better UX
   - Consistent loading states across the app

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use functional components with hooks for React
- Implement proper error handling and loading states
- Add proper TypeScript types, avoid `any`
- Use interfaces for complex types
- Prefer const assertions for literal types

### Testing Requirements

- Run `npm run test` for Playwright E2E tests
- Run `npm run test:unit` for Vitest unit tests
- Run `npm run lint` before committing
- Run `npm run type-check` to verify TypeScript
- Ensure all tests pass before pushing to GitHub

### Security Best Practices

- Never commit sensitive data or API keys
- Use environment variables for all configuration
- Validate all user inputs on both client and server
- Implement proper authentication checks using Clerk
- Follow OWASP security guidelines
- Sanitize data before database operations
- Use HTTPS for all external API calls

### Convex Database Guidelines

- All database operations go through Convex functions
- Use proper typing for database schemas
- Implement proper error handling in mutations
- Use optimistic updates where appropriate
- Follow the schema definitions in `convex/schema.ts`
- Use indexes for frequently queried fields
- Implement proper data validation

### Common Commands

```bash
# Development
npm run dev          # Start development server (DO NOT USE - see deployment workflow)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
npm run test         # Run Playwright tests
npm run test:unit    # Run Vitest unit tests
npm run validate     # Run pre-deployment validation

# Git Operations
git status           # Check current status
git add .            # Stage all changes
git commit -m "..."  # Commit with message
git push origin main # Push to GitHub (triggers deployment)
git pull origin main # Pull latest changes
```

### Netlify Operations

```bash
# Site Management
npx -y netlify-cli sites:list --json      # List all sites
npx -y netlify-cli sites:info --json      # Get site info

# Environment Variables
npx -y netlify-cli env:list               # List env vars
npx -y netlify-cli env:set KEY value      # Set env var
npx -y netlify-cli env:unset KEY          # Remove env var

# Deployment
npx -y netlify-cli deploy --prod          # Manual deploy to production
npx -y netlify-cli deploy                 # Deploy to draft URL
```

## Project Structure

### Core Directories

```text
/app                 # Next.js app router pages
├── (landing)        # Public landing pages
├── dashboard/       # Protected dashboard routes
│   ├── admin/       # Admin-only pages
│   ├── student/     # Student dashboard
│   ├── preceptor/   # Preceptor dashboard
│   └── enterprise/  # Enterprise dashboard
├── api/             # API routes
└── [auth]/          # Authentication pages

/components          # Reusable React components
├── ui/              # shadcn/ui components
├── forms/           # Form components
└── layouts/         # Layout components

/convex              # Backend functions
├── _generated/      # Auto-generated Convex files
├── schema.ts        # Database schema
└── *.ts             # Backend functions

/lib                 # Utility functions
├── utils.ts         # General utilities
├── validation/      # Validation schemas
└── hooks/           # Custom React hooks

/public              # Static assets
/tests               # Test files
```

### Key Files

- `convex/schema.ts` - Database schema definitions
- `lib/validation-schemas.ts` - Form validation schemas
- `middleware.ts` - Clerk authentication middleware
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

## Deployment Workflow

### IMPORTANT: GitHub-First Deployment

**Never run local dev server. All changes must be deployed through GitHub → Netlify continuous deployment.**

### Development Process

1. **Make Changes Locally**
   - Edit code in your preferred editor
   - Use TypeScript for all new features
   - Follow existing code patterns

2. **Validate Changes**

   ```bash
   npm run lint         # Fix any linting errors
   npm run type-check   # Ensure TypeScript compiles
   npm run build        # Verify production build works
   ```

3. **Commit to GitHub**

   ```bash
   git add .
   git commit -m "feat: describe your changes"
   git push origin main
   ```

4. **Automatic Deployment**
   - Netlify watches GitHub repository
   - Automatically builds and deploys on push
   - Check deployment status at Netlify dashboard

5. **Verify Production**
   - Visit <https://sandboxmentoloop.online>
   - Test new features in production
   - Monitor for any errors

### Environment Variables

Required environment variables for production:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `OPENAI_API_KEY`

## MCP Tools Available

Claude Code has access to the following MCP (Model Context Protocol) tools globally configured in `C:\Users\Tanner\.claude.json`:

### Project-Specific MCP Integrations

#### Production Services

- **Netlify** (`mcp__netlify__*`) - Production deployment and hosting
- **Convex** (`mcp__convex__*`) - Serverless backend for this project
- **Clerk** (`mcp__clerk__*`) - Authentication for this project
- **Stripe** (`mcp__stripe__*`) - Payment processing for this project
- **GitHub** (`mcp__github__*`) - Source control for this repository

### Development & Testing Tools

- **Filesystem** (`mcp__filesystem__*`) - Local file system operations
- **Docker** (`mcp__docker-mcp__*`) - Container management
- **Playwright** (`mcp__playwright__*`) - Browser automation and testing
- **Puppeteer** (`mcp__puppeteer__*`) - Headless browser control

### AI & Thinking Tools

- **Sequential Thinking** (`mcp__sequential-thinking__*`) - Structured problem-solving
- **Memory** (`mcp__mcp-memory__*`) - Knowledge graph management

### IDE Integration

- **IDE** (`mcp__ide__*`) - VS Code/Cursor integration

## Support & Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Project Links

- **Production Site**: <https://sandboxmentoloop.online>
- **GitHub Repository**: <https://github.com/Apex-ai-net/MentoLoop>
- **Netlify Dashboard**: Access via Netlify CLI
- **Convex Dashboard**: Access via Convex CLI

### Contact

For questions or issues, create a GitHub issue in the repository.

---

#### Last Updated: January 2025
