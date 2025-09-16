# MentoLoop Healthcare Mentorship Platform — Codex Project Context

This file provides Codex with project-wide context, standards, and patterns to ensure output aligns with MentoLoop’s architecture, compliance, and quality requirements.

## Project Overview
- Platform: Healthcare mentorship system with AI-powered matching
- URL: sandboxmentoloop.online
- Repository: https://github.com/Apex-ai-net/MentoLoop
- Version: 0.9.7
- Primary Users: Nursing students, preceptors, healthcare institutions

## Tech Stack

### Frontend
- Framework: Next.js 15 with App Router (Turbopack)
- Styling: TailwindCSS v4, shadcn/ui components
- UI Libraries: Radix UI, Framer Motion, Motion Primitives
- Icons: Lucide React, Tabler Icons
- Charts: Recharts for data visualization
- State Management: React hooks with Convex real-time sync

### Backend & Database
- Database: Convex (real-time serverless)
- Authentication: Clerk (with JWT templates)
- File Storage: Convex file storage
- API Pattern: Convex mutations/actions/queries

### AI & Integrations
- AI Providers: OpenAI GPT-4, Google Gemini Pro
- Email: SendGrid (internal action pattern)
- SMS: Twilio
- Payments: Stripe (subscription-based)
- Webhooks: Svix for validation

## Project Structure
```
├── app/                    # Next.js App Router
│   ├── (landing)/         # Public landing pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── admin/             # Admin panel
│   ├── student-intake/    # Student onboarding
│   ├── preceptor-intake/  # Preceptor onboarding
│   └── api/               # API routes
├── convex/                # Backend functions
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User management
│   ├── matches.ts         # Matching logic
│   ├── aiMatching.ts      # AI-enhanced matching
│   ├── messages.ts        # HIPAA-compliant messaging
│   ├── payments.ts        # Stripe integration
│   ├── emails.ts          # SendGrid templates
│   └── sms.ts             # Twilio notifications
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   └── shared/            # Shared components
├── lib/                   # Utilities
└── hooks/                 # Custom React hooks
```

## Key Coding Patterns

### Convex Database Operations
```ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Queries for read operations
export const getStudents = query({
  args: { schoolId: v.optional(v.id("schools")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db.query("students").collect();
  },
});

// Mutations for write operations
export const updateStudent = mutation({
  args: { studentId: v.id("students"), data: v.object({ /* ... */ }) },
  handler: async (ctx, args) => {
    // Validate and update
  },
});

// Actions for external API calls
export const sendEmail = action({
  args: { /* SendGrid params */ },
  handler: async (ctx, args) => {
    // External API calls go in actions
  },
});
```

### Component Structure
```ts
interface ComponentProps {
  data: Student;
  onUpdate: (id: Id<"students">, data: Partial<Student>) => void;
}

export function StudentCard({ data, onUpdate }: ComponentProps) {
  const students = useQuery(api.students.list);
  if (students === undefined) return <Skeleton />;
  if (students === null) return <ErrorState />;
  return <Card className="p-4">{/* ... */}</Card>;
}
```

## Environment Variables (required)
- Convex: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`
- AI: `OPENAI_API_KEY`, `GEMINI_API_KEY`
- Communications: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_CORE`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_PREMIUM`
- App Settings: `NEXT_PUBLIC_APP_URL`, `EMAIL_DOMAIN`, `NODE_ENV=production`
- Feature Flags: `ENABLE_AI_MATCHING`, `ENABLE_EMAIL_NOTIFICATIONS`, `ENABLE_SMS_NOTIFICATIONS`, `ENABLE_PAYMENT_PROCESSING`

## Healthcare Compliance Requirements

### HIPAA Compliance
- Encrypt all patient data in transit and at rest
- Implement audit logging for all data access
- Use secure messaging for all communications
- Never log PHI in console or error messages

### FERPA Compliance
- Protect student educational records
- Implement proper access controls
- Maintain data retention policies

## Development Guidelines

### Code Quality Standards
- TypeScript strict mode
- Comprehensive error handling
- JSDoc comments for complex functions
- Follow ESLint and Prettier
- Unit tests for critical functions

### Git Workflow
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Commit format: `type(scope): message`
- Run tests before pushing

### Performance Optimization
- Use `React.memo` for expensive components
- Virtual scrolling for large lists
- Optimize images via `next/image`
- Dynamic imports for code splitting
- Cache Convex queries when appropriate

### Security Best Practices
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Sanitize data before display
- Use environment variables for secrets
- Never expose sensitive data in client code

## Common Tasks & Solutions
- Add feature: define schema in `convex/schema.ts`, create functions in `convex/`, build UI in `components/`, add routes in `app/`, wire real-time via Convex hooks, add tests/docs.
- Debug Convex: check dashboard logs, verify env vars, ensure auth flow, review schema migrations.
- Optimize AI matching: use streamlined algorithm in `aiMatching.ts`, cache responses, implement fallbacks, monitor usage/costs.

## Testing Requirements
- Unit tests with Vitest for utilities
- Integration tests for API endpoints
- E2E tests with Playwright for critical flows
- Component tests for complex UI logic

## Deployment Notes
- Primary: Netlify (automatic deployments)
- Alternative: Vercel
- CI/CD: GitHub Actions
- Environments: development, staging, production

## Important Patterns
- Convex: use actions for external APIs, mutations for writes, queries for reads
- Real-time: prefer `useQuery`, implement optimistic updates, handle connection states
- Compliance: audit all data access, encrypt sensitive data, enforce access controls

## Cursor Rules
A stricter ruleset exists in `.cursor/rules/mentoloop.mdc` and is always applied.

