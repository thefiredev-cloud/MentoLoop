# MentoLoop - Healthcare Mentorship Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.9.7-blue.svg)](https://github.com/Apex-ai-net/MentoLoop)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-Compliant-green.svg)](https://www.hhs.gov/hipaa/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Apex-ai-net/MentoLoop/actions)

A modern, full-stack mentorship platform built specifically for healthcare professionals, connecting nursing students and preceptors with AI-powered matching, real-time communication, and comprehensive clinical placement management.

Built with Next.js 15, Convex real-time database, Clerk authentication, AI-enhanced matching (OpenAI/Gemini), and comprehensive healthcare compliance features.

## 🚀 Live Demo
[**Try MentoLoop →**](https://mentoloop.com) | [**Documentation →**](https://docs.mentoloop.com)

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](https://via.placeholder.com/800x400/0066CC/FFFFFF?text=Student+Dashboard+Coming+Soon)

### AI-Powered Matching
![AI Matching](https://via.placeholder.com/800x400/00AA44/FFFFFF?text=AI+Matching+Interface+Coming+Soon)

### Preceptor Management
![Preceptor Dashboard](https://via.placeholder.com/800x400/AA0044/FFFFFF?text=Preceptor+Dashboard+Coming+Soon)

## Core Healthcare Features

- 🏥 **AI-Powered Matching** - MentorFit™ algorithm with OpenAI/Gemini enhancement for optimal student-preceptor pairing
- 👩‍🎓 **Student Management** - Complete intake workflow with MentorFit assessment and rotation tracking
- 👨‍⚕️ **Preceptor Management** - Credential verification, availability management, and student evaluation tools
- 💬 **HIPAA-Compliant Messaging** - Secure real-time communication with file attachments
- 📧 **Automated Communications** - SendGrid email templates and Twilio SMS for notifications
- 📊 **Clinical Hours Tracking** - Comprehensive logging, approval workflow, and progress analytics
- 🔄 **Real-time Updates** - Live match status, messages, and progress sync across all devices
- 📋 **Survey & Evaluation System** - Post-rotation feedback and quality improvement tracking
- 🏛️ **Enterprise Support** - Multi-school management with role-based access control

## Technical Features

- 🚀 **Next.js 15 with App Router** - Latest React framework with server components
- ⚡️ **Turbopack** - Ultra-fast development with hot module replacement
- 🎨 **TailwindCSS v4** - Modern utility-first CSS with custom design system
- 🔐 **Clerk Authentication** - Complete user management with role-based access
- 🗄️ **Convex Real-time Database** - Serverless backend with real-time sync
- 🧠 **AI Integration** - OpenAI GPT-4 and Google Gemini Pro for intelligent matching
- 📞 **Third-party Integrations** - SendGrid, Twilio, Stripe for communications and payments
- 🧪 **Comprehensive Testing** - Vitest unit tests, Playwright E2E tests, integration testing
- 🛡️ **Security & Compliance** - HIPAA/FERPA compliant with audit logging
- 📱 **Responsive Design** - Mobile-first approach with PWA capabilities
- 🚢 **Production Ready** - Full deployment infrastructure and monitoring

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Motion Primitives** - Advanced animation components
- **Lucide React & Tabler Icons** - Beautiful icon libraries
- **Recharts** - Data visualization components
- **React Bits** - Custom animation components

### Backend & Services
- **Convex** - Real-time database and serverless functions with optimized action patterns
- **Clerk** - Authentication and user management
- **OpenAI** - AI-enhanced matching with GPT-4 and streamlined algorithm
- **Google Gemini Pro** - Alternative AI provider
- **SendGrid** - Email automation with internal action architecture
- **Twilio** - SMS notifications and alerts
- **Stripe** - Payment processing (enterprise billing)
- **Svix** - Webhook handling and validation

### Development & Testing
- **TypeScript** - Type safety throughout
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - Component testing
- **Turbopack** - Fast build tool

### Deployment & Infrastructure
- **Netlify** - Primary deployment platform
- **Vercel** - Alternative deployment option
- **GitHub Actions** - CI/CD pipeline
- **Environment Management** - Multi-stage deployment

## Getting Started

### Prerequisites

- Node.js 22+ (recommended for optimal performance)
- Clerk account for authentication and user management
- Convex account for real-time database
- OpenAI API key for AI-enhanced matching
- SendGrid account for email automation
- Twilio account for SMS notifications

### Installation

1. Download and set up the starter template:

```bash
# Download the template files to your project directory
# Then navigate to your project directory and install dependencies
npm install #or pnpm / yarn / bun
```

2. Set up your environment variables:

```bash
cp .env.example .env.local
```

3. Configure your environment variables in `.env.local`:

3a. run `npx convex dev` or `bunx convex dev` to configure your convex database variables

```bash
# Clerk Authentication & Billing
# Get these from your Clerk dashboard at https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Clerk Frontend API URL (from JWT template - see step 5)
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

4. Initialize Convex:

```bash
npx convex dev
```

5. Set up Clerk JWT Template:
   - Go to your Clerk dashboard
   - Navigate to JWT Templates
   - Create a new template with name "convex"
   - Copy the Issuer URL - this becomes your `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
   - Add this URL to both your `.env.local` and Convex environment variables

6. Set up Convex environment variables in your Convex dashboard:

```bash
# In Convex Dashboard Environment Variables
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev
```

7. Set up Clerk webhooks (in Clerk Dashboard, not Convex):
   - Go to your Clerk dashboard → Webhooks section
   - Create a new endpoint with URL: `https://your-deployed-app.com/api/clerk-users-webhook`
   - Enable these events:
     - `user.created` - Syncs new users to Convex
     - `user.updated` - Updates user data in Convex
     - `user.deleted` - Removes users from Convex
     - `paymentAttempt.updated` - Tracks subscription payments
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add it to your Convex dashboard environment variables as `CLERK_WEBHOOK_SECRET`
   
   **Note**: The webhook URL `/clerk-users-webhook` is handled by Convex's HTTP router, not Next.js. Svix is used to verify webhook signatures for security.

8. Configure Clerk Billing:
   - Set up your pricing plans in Clerk dashboard
   - Configure payment methods and billing settings

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

## Architecture

### Key Routes
- `/` - Beautiful landing page with pricing
- `/dashboard` - Protected user dashboard with optimized components
- `/dashboard/payment-gated` - Subscription-protected content
- `/clerk-users-webhook` - Clerk webhook handler

### Authentication Flow
- Seamless sign-up/sign-in with Clerk
- Automatic user sync to Convex database
- Protected routes with middleware
- Social login support
- Automatic redirects to dashboard after auth

### Payment Flow
- Custom Clerk pricing table component
- Subscription-based access control
- Real-time payment status updates
- Webhook-driven payment tracking

### Email System Architecture
- **Internal Action Pattern** - Dedicated internal functions for email operations
- **Template Management** - Centralized email template system
- **Audit Logging** - Comprehensive email delivery tracking
- **Error Handling** - Robust failure recovery and logging

### Performance Optimizations
- **React Key Management** - Unique keys for ScrollArea and list components
- **Action vs Mutation** - Proper separation for Convex operations
- **Component Optimization** - Streamlined dashboard rendering

### Database Schema
```typescript
// Users table
users: {
  name: string,
  externalId: string // Clerk user ID
}

// Payment attempts tracking
paymentAttempts: {
  payment_id: string,
  userId: Id<"users">,
  payer: { user_id: string },
  // ... additional payment data
}
```

## Project Structure

```
├── app/
│   ├── (landing)/          # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── features-one.tsx
│   │   ├── pricing.tsx
│   │   └── ...
│   ├── dashboard/          # Protected dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── payment-gated/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── not-found.tsx       # Custom 404 page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── custom-clerk-pricing.tsx
│   ├── theme-provider.tsx
│   └── ...
├── convex/                 # Backend functions
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User management
│   ├── paymentAttempts.ts  # Payment tracking
│   └── http.ts             # Webhook handlers
├── lib/
│   └── utils.ts            # Utility functions
└── middleware.ts           # Route protection
```

## Key Components

### Landing Page
- **Hero Section** - Animated hero with CTAs
- **Features Section** - Interactive feature showcase
- **Pricing Table** - Custom Clerk billing integration
- **Testimonials** - Social proof section
- **FAQ Section** - Common questions
- **Footer** - Links and information

### Dashboard
- **Sidebar Navigation** - Collapsible sidebar with user menu
- **Interactive Charts** - Data visualization with Recharts
- **Data Tables** - Sortable and filterable tables
- **Payment Gating** - Subscription-based access control

### Animations & Effects
- **Splash Cursor** - Interactive cursor effects
- **Animated Lists** - Smooth list animations
- **Progressive Blur** - Modern blur effects
- **Infinite Slider** - Continuous scrolling elements

## Theme Customization

The starter kit includes a fully customizable theme system. You can customize colors, typography, and components using:

- **Theme Tools**: [tweakcn.com](https://tweakcn.com/editor/theme?tab=typography), [themux.vercel.app](https://themux.vercel.app/shadcn-themes), or [ui.jln.dev](https://ui.jln.dev/)
- **Global CSS**: Modify `app/globals.css` for custom styling
- **Component Themes**: Update individual component styles in `components/ui/`

## Environment Variables

### Required for .env.local

- `CONVEX_DEPLOYMENT` - Your Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex client URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` - Clerk frontend API URL (from JWT template)
- `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` - Redirect after sign in
- `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` - Redirect after sign up
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` - Fallback redirect for sign in
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` - Fallback redirect for sign up

### Required for Convex Dashboard

- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret (set in Convex dashboard)
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` - Clerk frontend API URL (set in Convex dashboard)

## Deployment

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The project is optimized for Vercel with:
- Automatic builds with Turbopack
- Environment variable management
- Edge function support

### Manual Deployment

Build for production:

```bash
npm run build
npm start
```

## Customization

### Styling
- Modify `app/globals.css` for global styles
- Update TailwindCSS configuration
- Customize component themes in `components/ui/`

### Branding
- Update logo in `components/logo.tsx`
- Modify metadata in `app/layout.tsx`
- Customize color scheme in CSS variables

### Features
- Add new dashboard pages in `app/dashboard/`
- Extend database schema in `convex/schema.ts`
- Create custom components in `components/`

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Why Starter.diy?

**THE EASIEST TO SET UP. EASIEST IN TERMS OF CODE.**

- ✅ **Clerk + Convex + Clerk Billing** make it incredibly simple
- ✅ **No complex payment integrations** - Clerk handles everything
- ✅ **Real-time user sync** - Webhooks work out of the box
- ✅ **Beautiful UI** - Tailark.com inspired landing page blocks
- ✅ **Production ready** - Authentication, payments, and database included
- ✅ **Type safe** - Full TypeScript support throughout

## 🤝 Contributing

We welcome contributions from healthcare professionals, developers, and educators! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow healthcare compliance standards (HIPAA/FERPA)
- Write tests for new features
- Maintain accessibility standards (WCAG 2.1 AA)
- Use TypeScript for type safety
- Follow existing code style and patterns

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/Apex-ai-net/MentoLoop)
![GitHub language count](https://img.shields.io/github/languages/count/Apex-ai-net/MentoLoop)
![GitHub top language](https://img.shields.io/github/languages/top/Apex-ai-net/MentoLoop)
![GitHub issues](https://img.shields.io/github/issues/Apex-ai-net/MentoLoop)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Apex-ai-net/MentoLoop)

## 🌟 Community

- **Discord**: [Join our developer community](https://discord.gg/mentoloop)
- **Discussions**: [GitHub Discussions](https://github.com/Apex-ai-net/MentoLoop/discussions)
- **Issues**: [Report bugs or request features](https://github.com/Apex-ai-net/MentoLoop/issues)
- **Blog**: [Read our development blog](https://blog.mentoloop.com)

## 🏆 Acknowledgments

- **Healthcare Professionals**: Thank you to the nurses and educators who provided feedback
- **Open Source Community**: Built on the shoulders of amazing open source projects
- **Beta Testers**: Early adopters who helped shape the platform
- **Nursing Schools**: Partner institutions who supported development

## License

This project is licensed under the MIT License.

---

**Stop rebuilding the same foundation over and over.** Starter.diy eliminates weeks of integration work by providing a complete, production-ready SaaS template with authentication, payments, and real-time data working seamlessly out of the box.

Built using Next.js 15, Convex, Clerk, and modern web technologies.
