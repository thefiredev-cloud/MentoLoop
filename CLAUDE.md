# Claude Code Instructions

## Project Overview
MentoLoop is a healthcare education platform that connects Nurse Practitioner students with preceptors for clinical rotations. The platform uses AI-powered matching and includes payment processing, messaging, and comprehensive dashboard features.

## Technology Stack
- **Frontend**: Next.js 15.3.5, React, TypeScript
- **Backend**: Convex (serverless backend)
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI/Gemini for matching
- **Communications**: SendGrid (email), Twilio (SMS)
- **Styling**: Tailwind CSS, shadcn/ui

## Key Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use functional components with hooks for React
- Implement proper error handling and loading states
- Add proper TypeScript types, avoid `any`

### Testing
- Run `npm run test` for Playwright E2E tests
- Run `npm run test:unit` for Vitest unit tests
- Run `npm run lint` before committing
- Run `npm run type-check` to verify TypeScript

### Security
- Never commit sensitive data or API keys
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication checks
- Follow OWASP security guidelines

### Convex Database
- All database operations go through Convex functions
- Use proper typing for database schemas
- Implement proper error handling in mutations
- Use optimistic updates where appropriate

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
npm run test         # Run Playwright tests
npm run validate     # Run pre-deployment validation
```

### File Structure
- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/convex` - Backend functions and schema
- `/lib` - Utility functions and configurations
- `/public` - Static assets
- `/tests` - Test files

### Important Notes
- Always check user authentication before sensitive operations
- Use the validation schemas in `/lib/validation-schemas.ts`
- Follow the existing routing patterns
- Maintain consistent UI/UX with existing pages
- Test across different screen sizes (responsive design)

### Deployment
- Production deploys to Netlify
- Ensure all validation checks pass before deployment
- Update environment variables in production
- Test payment flows in Stripe test mode first