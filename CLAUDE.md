# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 SaaS starter template with integrated authentication (Clerk), real-time database (Convex), and subscription billing (Clerk Billing).

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Convex Development
- `npx convex dev` - Start Convex development server (required for database)
- Run this in a separate terminal alongside `npm run dev`

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **Convex** for real-time database and serverless functions
- **Clerk** for authentication and user management
- **Clerk Billing** for subscription payments
- **TailwindCSS v4** with custom UI components (shadcn/ui)
- **TypeScript** throughout

### Key Architectural Patterns

#### Authentication Flow
1. Clerk handles all authentication via `middleware.ts`
2. JWT tokens are configured with "convex" template in Clerk dashboard
3. Users are synced to Convex via webhooks at `/api/clerk-users-webhook`
4. Protected routes redirect unauthenticated users to sign-in

#### Database Architecture
- **Convex** provides real-time sync and serverless functions
- Schema defined in `convex/schema.ts`:
  - `users` table: Synced from Clerk (externalId maps to Clerk ID)
  - `paymentAttempts` table: Tracks subscription payments
- All database operations in `convex/` directory
- **Action vs Mutation Pattern**: Use actions for external API calls, mutations for database operations

#### Email System Architecture
1. **Internal Action Pattern**: Use `sendEmailInternal` for internal email operations
2. **Template Management**: Centralized email templates with variable substitution
3. **Audit Logging**: All email attempts are logged with status tracking
4. **Error Handling**: Comprehensive error recovery and logging
5. **External Integration**: SendGrid API integration with proper error handling

#### Payment Integration
1. Clerk Billing handles subscription management
2. Custom pricing component in `components/custom-clerk-pricing.tsx`
3. Payment-gated content uses `<ClerkBillingGate>` component
4. Webhook events update payment status in Convex

#### Performance Patterns
1. **React Keys**: Always provide unique keys for ScrollArea and list components
2. **Component Optimization**: Use proper React patterns to prevent unnecessary re-renders
3. **Convex Optimization**: Separate actions and mutations for better performance

### Project Structure
```
app/
├── (landing)/         # Public landing page components
├── dashboard/         # Protected dashboard area
│   └── payment-gated/ # Subscription-only content
├── layout.tsx         # Root layout with providers
└── middleware.ts      # Auth protection

components/
├── ui/               # shadcn/ui components
├── custom-clerk-pricing.tsx
└── ConvexClientProvider.tsx

convex/
├── schema.ts         # Database schema
├── users.ts          # User CRUD operations
├── paymentAttempts.ts # Payment tracking
├── http.ts           # Webhook handlers
└── auth.config.ts    # JWT configuration
```

## Key Integration Points

### Environment Variables Required
- `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` (from Clerk JWT template)
- `CLERK_WEBHOOK_SECRET` (set in Convex dashboard)
- `SENDGRID_API_KEY` (for email automation)
- `SENDGRID_FROM_EMAIL` (verified sender email, defaults to "noreply@mentoloop.com")
- `TWILIO_ACCOUNT_SID` (for SMS notifications)
- `TWILIO_AUTH_TOKEN` (for SMS notifications)
- `TWILIO_PHONE_NUMBER` (verified Twilio phone number)
- `NEXT_PUBLIC_APP_URL` (for survey links in emails)

### Webhook Configuration
Clerk webhooks must be configured to:
- Endpoint: `{your_domain}/api/clerk-users-webhook`
- Events: `user.created`, `user.updated`, `user.deleted`, `paymentAttempt.updated`

### Real-time Data Flow
1. UI components use Convex hooks (`useQuery`, `useAction`, `useMutation`)
2. **Actions vs Mutations**: Use `useAction` for external API calls, `useMutation` for database operations
3. Convex provides automatic real-time updates
4. Authentication context from `useAuth()` (Clerk)
5. User data synced between Clerk and Convex
6. **Component Keys**: Ensure ScrollArea and list components have unique keys for proper re-rendering

## Development Best Practices

### Convex Function Patterns
- **Actions**: Use for external API calls (SendGrid, Twilio, OpenAI)
- **Mutations**: Use for database operations only
- **Internal Actions**: Use `sendEmailInternal` pattern for reusable internal operations
- **Error Handling**: Always implement comprehensive error handling and logging

### React Component Patterns
- **Unique Keys**: Always provide unique keys for ScrollArea components: `<ScrollArea key="unique-id" />`
- **List Components**: Use stable, unique keys for dynamic lists to prevent rendering issues
- **Hook Usage**: Use `useAction` for external operations, `useMutation` for database changes

### Email System Guidelines
- Use `sendEmailInternal` for all internal email operations
- Implement proper template variable substitution
- Log all email attempts with status tracking
- Handle SendGrid API errors gracefully

### Performance Optimization
- Implement React keys for all dynamic components
- Separate concerns between actions and mutations
- Use proper error boundaries for external API calls
- Optimize component re-rendering with stable keys

## Shadcn Component Installation Rules
When installing shadcn/ui components:
- ALWAYS use `bunx --bun shadcn@latest add [component-name]` instead of `npx`
- If dependency installation fails, manually install with `bun install [dependency-name]`
- Check components.json for existing configuration before installing
- Verify package.json after installation to ensure dependencies were added
- Multiple components can be installed at once: `bunx --bun shadcn@latest add button card drawer`
