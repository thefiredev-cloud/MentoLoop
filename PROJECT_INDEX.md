# MentoLoop Project Index

## 🏗️ Project Architecture Overview

### Application Type
- **Full-Stack SaaS Platform**
- **Multi-tenant Healthcare Education Marketplace**
- **Real-time Collaborative Application**

### User Roles
1. **Students** - NP students seeking clinical rotations
2. **Preceptors** - Healthcare professionals offering mentorship
3. **Enterprises** - Schools and healthcare institutions
4. **Administrators** - Platform operators and support staff

## 📁 Complete File Structure

### `/app` - Next.js App Router Pages

#### Landing & Marketing Pages
- `app/(landing)/page.tsx` - Main homepage
- `app/student-landing/page.tsx` - Student-specific landing page
- `app/preceptors/page.tsx` - Preceptor-specific landing page
- `app/institutions/page.tsx` - Enterprise/institution landing page
- `app/resources/page.tsx` - Educational resources page
- `app/contact/page.tsx` - Contact form page
- `app/support/page.tsx` - Support center
- `app/faq/page.tsx` - Frequently asked questions
- `app/help/page.tsx` - Help documentation

#### Authentication Pages
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign in page (Clerk)
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign up page (Clerk)
- `app/sign-up/student/page.tsx` - Student registration
- `app/sign-up/preceptor/page.tsx` - Preceptor registration
- `app/sign-up/institution/page.tsx` - Institution registration

#### Intake/Onboarding Flows
- `app/student-intake/page.tsx` - Student onboarding wizard
- `app/student-intake/confirmation/page.tsx` - Student intake confirmation
- `app/preceptor-intake/page.tsx` - Preceptor onboarding wizard
- `app/preceptor-intake/confirmation/page.tsx` - Preceptor intake confirmation

#### Student Dashboard (`/app/dashboard/student/`)
- `page.tsx` - Student dashboard homepage
- `profile/page.tsx` - Student profile management
- `search/page.tsx` - Preceptor search interface
- `matches/page.tsx` - View matched preceptors
- `hours/page.tsx` - Clinical hours tracking
- `documents/page.tsx` - Document management
- `rotations/page.tsx` - Rotation scheduling
- `evaluations/page.tsx` - Performance evaluations

#### Preceptor Dashboard (`/app/dashboard/preceptor/`)
- `page.tsx` - Preceptor dashboard homepage
- `profile/page.tsx` - Professional profile management
- `students/page.tsx` - Manage assigned students
- `matches/page.tsx` - Review match requests
- `schedule/page.tsx` - Availability management
- `documents/page.tsx` - Credential management
- `evaluations/page.tsx` - Student evaluations

#### Enterprise Dashboard (`/app/dashboard/enterprise/`)
- `page.tsx` - Enterprise dashboard homepage
- `students/page.tsx` - Student cohort management
- `preceptors/page.tsx` - Preceptor network management
- `analytics/page.tsx` - Advanced analytics
- `reports/page.tsx` - Custom reporting
- `billing/page.tsx` - Billing and invoicing
- `compliance/page.tsx` - Compliance tracking
- `agreements/page.tsx` - Contract management
- `settings/page.tsx` - Enterprise settings

#### Admin Dashboard (`/app/dashboard/admin/`)
- `page.tsx` - Admin control panel
- `users/page.tsx` - User management interface
- `matches/page.tsx` - Match oversight and intervention
- `finance/page.tsx` - Financial analytics
- `audit/page.tsx` - Audit logging
- `emails/page.tsx` - Email campaign management
- `sms/page.tsx` - SMS campaign management

#### Shared Dashboard Features (`/app/dashboard/`)
- `page.tsx` - Main dashboard router
- `messages/page.tsx` - Real-time messaging
- `notifications/page.tsx` - Notification center
- `billing/page.tsx` - Subscription management
- `ceu/page.tsx` - CEU course platform
- `loop-exchange/page.tsx` - Community forum
- `analytics/page.tsx` - Analytics dashboard
- `survey/page.tsx` - Survey responses
- `payment-success/page.tsx` - Payment confirmation
- `payment-gated/page.tsx` - Premium content gate

#### Testing & Development Pages
- `app/dashboard/test-communications/page.tsx` - Communication testing
- `app/dashboard/test-user-journeys/page.tsx` - User journey testing
- `app/dashboard/ai-matching-test/page.tsx` - AI matching sandbox
- `app/admin/discount-setup/page.tsx` - Discount code management

#### API Routes (`/app/api/`)
- `admin/init-discount/route.ts` - Initialize discount codes
- `set-user-role/route.ts` - User role management
- `stripe-webhook/route.ts` - Stripe webhook handler

#### Legal Pages
- `app/terms/page.tsx` - Terms of service
- `app/privacy/page.tsx` - Privacy policy

### `/components` - React Components

#### UI Components (`/components/ui/`)
- Core shadcn/ui components (40+ components)
- `loading-skeleton.tsx` - Loading state skeletons
- `lazy-component.tsx` - Lazy loading wrapper
- Custom styled components

#### Feature Components
- `error-boundary.tsx` - Error handling wrapper
- Form components
- Layout components
- Dashboard widgets

### `/convex` - Backend Functions

#### Core Backend Files
- `schema.ts` - Complete database schema
- `_generated/` - Auto-generated Convex files

#### User Management
- `users.ts` - User CRUD operations
- `students.ts` - Student-specific operations
- `preceptors.ts` - Preceptor-specific operations
- `enterprises.ts` - Enterprise management

#### Feature Functions
- `matches.ts` - AI matching logic
- `payments.ts` - Payment processing
- `billing.ts` - Subscription management
- `ceuCourses.ts` - CEU course management
- `enterpriseManagement.ts` - Enterprise features
- `messages.ts` - Real-time messaging
- `notifications.ts` - Notification system
- `documents.ts` - Document management
- `evaluations.ts` - Evaluation system

#### Communication Functions
- `emails.ts` - Email operations
- `sms.ts` - SMS operations
- `campaigns.ts` - Marketing campaigns

#### Administrative Functions
- `audit.ts` - Audit logging
- `analytics.ts` - Analytics aggregation
- `reports.ts` - Report generation
- `discountCodes.ts` - Discount management
- `paymentAttempts.ts` - Payment retry logic

### `/lib` - Utility Libraries

#### Core Utilities
- `utils.ts` - General utility functions
- `cn.ts` - Class name utilities
- `validation-schemas.ts` - Zod validation schemas

#### Configuration
- `clerk-config.ts` - Clerk authentication setup
- `stripe-config.ts` - Stripe configuration
- `convex-config.ts` - Convex setup

#### Helpers
- `payment-protection.ts` - Payment security
- `web-vitals.ts` - Performance monitoring
- `error-handling.ts` - Error utilities
- `date-utils.ts` - Date formatting
- `formatting.ts` - Data formatting

### `/public` - Static Assets
- Images and icons
- Placeholder content
- Public documents
- Favicon and app icons

### `/tests` - Test Suites
- Playwright E2E tests
- Vitest unit tests
- Test fixtures
- Test utilities

### Configuration Files (Root)
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `middleware.ts` - Clerk authentication middleware
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables
- `convex.json` - Convex configuration
- `playwright.config.ts` - Playwright test setup
- `vitest.config.ts` - Vitest test configuration

## 🔑 Key Integration Points

### Authentication Flow (Clerk)
1. User signs up → Clerk creates user
2. Webhook triggers → Convex user record created
3. Role assignment → Access control enabled
4. Organization creation → Multi-tenant setup

### Payment Flow (Stripe)
1. User selects plan → Stripe checkout session
2. Payment processed → Webhook received
3. Subscription created → Convex updated
4. Access granted → Features unlocked

### Matching Algorithm
1. Student submits preferences → Data stored
2. AI processing → OpenAI/Gemini analysis
3. Match scoring → Compatibility calculation
4. Notification sent → Both parties informed

### Real-time Features (Convex)
1. Message sent → Convex mutation
2. Real-time sync → WebSocket update
3. UI updates → React re-render
4. Notification triggered → User alerted

## 📊 Database Schema Overview

### Core Tables
- **users** - All platform users
- **students** - Student-specific data
- **preceptors** - Preceptor profiles
- **enterprises** - Institution accounts
- **matches** - Student-preceptor pairings
- **messages** - Real-time messaging
- **payments** - Transaction records
- **subscriptions** - Active subscriptions
- **documents** - Uploaded files
- **evaluations** - Performance reviews

### Supporting Tables
- **notifications** - User notifications
- **auditLogs** - System audit trail
- **discountCodes** - Promotional codes
- **campaigns** - Marketing campaigns
- **paymentAttempts** - Retry tracking
- **ceuCourses** - Educational courses
- **enrollments** - Course enrollments

## 🚀 Deployment Pipeline

### Development Workflow
1. Local development (TypeScript/React)
2. Git commit with conventional commits
3. Push to GitHub main branch
4. Netlify auto-deployment triggered
5. Production site updated

### Environment Management
- **Local**: `.env.local` for development
- **Production**: Netlify environment variables
- **Secrets**: Stored in respective service dashboards

### CI/CD Pipeline
- GitHub → Netlify (automatic)
- Build validation on every push
- Type checking and linting
- Production deployment on main branch

## 📈 Performance Optimizations

### Frontend
- Next.js App Router with RSC
- Dynamic imports for code splitting
- Image optimization with Next/Image
- Loading skeletons for better UX
- Error boundaries for resilience

### Backend
- Convex serverless functions
- Database indexing strategies
- Optimistic UI updates
- Real-time subscriptions
- Efficient query patterns

### Infrastructure
- CDN via Netlify
- Edge functions for routing
- Automatic HTTPS
- Global distribution
- Auto-scaling capabilities

## 🔒 Security Measures

### Authentication
- Clerk for secure authentication
- Role-based access control (RBAC)
- Organization-level permissions
- Session management
- MFA support

### Data Protection
- Environment variable encryption
- Stripe PCI compliance
- Input validation on all forms
- SQL injection prevention
- XSS protection

### API Security
- Webhook signature verification
- Rate limiting
- CORS configuration
- API key management
- Request validation

## 📝 Development Standards

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits
- Code review process

### Testing Strategy
- Unit tests with Vitest
- E2E tests with Playwright
- Component testing
- API testing
- Performance testing

### Documentation
- Inline code comments
- README files
- API documentation
- User guides
- Change logs

---
*This index provides a comprehensive overview of the MentoLoop project structure, architecture, and key implementation details.*