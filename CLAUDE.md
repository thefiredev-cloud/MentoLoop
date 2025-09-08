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

### Netlify Access
```bash
# List all Netlify sites
npx -y netlify-cli sites:list --json

# Get site info
npx -y netlify-cli sites:info --json

# List environment variables
npx -y netlify-cli env:list

# Deploy to Netlify
npx -y netlify-cli deploy --prod
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

### Deployment Workflow
**IMPORTANT: Never run local dev server. All changes must be deployed through GitHub → Netlify continuous deployment.**

#### Development Process
1. Make all code changes locally
2. Test with `npm run lint` and `npm run type-check`
3. Commit changes to GitHub
4. Push to GitHub repository
5. Netlify automatically deploys from GitHub push

#### GitHub Commands
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: your change description"

# Push to main branch (triggers Netlify deployment)
git push origin main
```

#### Deployment Notes
- **NEVER run `npm run dev` for local development**
- All changes go through GitHub → Netlify pipeline
- Production site: https://sandboxmentoloop.online
- Netlify auto-deploys on every push to main branch
- Ensure all validation checks pass before pushing
- Update environment variables in Netlify Dashboard if needed
- Test payment flows in Stripe test mode first

## MCP Tools Available

Claude Code has access to the following MCP (Model Context Protocol) tools globally configured in `C:\Users\Tanner\.claude.json`:

### Project-Specific MCP Integrations

#### Production Services
- **Netlify** (`mcp__netlify__*`) - Production deployment and hosting
  - Site management and deployment
  - Environment variable configuration
  - Build and deploy status monitoring
  - Connected to MentoLoop production site

- **Convex** (`mcp__convex__*`) - Serverless backend for this project
  - Database operations (queries, mutations, actions)
  - Real-time data synchronization
  - Function execution and monitoring
  - Environment variable management
  - Connected to production Convex deployment

- **Clerk** (`mcp__clerk__*`) - Authentication for this project
  - User authentication and management
  - Organization management
  - Membership and invitation handling
  - User metadata management
  - Connected to production Clerk instance

- **Stripe** (`mcp__stripe__*`) - Payment processing for this project
  - Payment intent creation and management
  - Customer management
  - Subscription handling
  - Product and pricing management
  - Connected to production Stripe account

- **GitHub** (`mcp__github__*`) - Source control for this repository
  - Repository operations (create, fork, search)
  - File operations (read, write, push)
  - Issues and pull requests
  - Branch management
  - Connected to this project's GitHub repository

### Development & Testing Tools
- **Filesystem** (`mcp__filesystem__*`) - Local file system operations
  - Read/write files
  - Directory operations
  - File search and metadata

- **Docker** (`mcp__docker-mcp__*`) - Container management
  - Create and manage containers
  - Deploy Docker Compose stacks
  - View container logs

### Browser Automation
- **Playwright** (`mcp__playwright__*`) - Browser automation and testing
  - Navigate and interact with web pages
  - Take screenshots
  - Fill forms and click elements
  - Handle dialogs and file uploads

- **Puppeteer** (`mcp__puppeteer__*`) - Headless browser control
  - Page navigation
  - Screenshots
  - Element interaction
  - JavaScript execution

### AI & Thinking Tools
- **Sequential Thinking** (`mcp__sequential-thinking__*`) - Structured problem-solving
  - Chain of thought reasoning
  - Hypothesis generation and verification

- **Memory** (`mcp__mcp-memory__*`) - Knowledge graph management
  - Create and manage entities
  - Build relationships
  - Search and query knowledge
  - Stores project context and decisions

### IDE Integration
- **IDE** (`mcp__ide__*`) - VS Code integration
  - Get diagnostics
  - Execute code in Jupyter notebooks

### MCP Configuration Location
All MCP tools are configured in: `C:\Users\Tanner\.claude.json`
These tools provide direct access to production services and should be used with caution.