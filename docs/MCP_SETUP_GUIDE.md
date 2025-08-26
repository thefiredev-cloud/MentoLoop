# MCP (Model Context Protocol) Setup Guide

## Overview

MCPs (Model Context Protocol servers) provide structured interfaces for Claude to interact with your development APIs and services. This guide covers all MCPs configured for the MentoLoop project.

## Quick Start

1. **Install Claude Desktop** (if not already installed)
2. **Copy the MCP configuration**: The `.mcp.json` file in the project root contains all MCP configurations
3. **Set up environment variables**: Copy `.env.mcp.example` to `.env.mcp` and fill in your API keys
4. **Restart Claude Desktop** to load the new MCP configurations

## Configured MCPs

### 1. Clerk Authentication MCP
**Purpose**: User authentication and management
**Key Features**:
- User CRUD operations
- Organization management
- Invitation handling
- Metadata management

**Required Environment Variables**:
```bash
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Common Commands**:
- Get current user: `mcp__clerk__getUserId`
- Update user metadata: `mcp__clerk__updateUserPublicMetadata`
- Manage organizations: `mcp__clerk__createOrganization`

### 2. Convex Database MCP
**Purpose**: Backend database and serverless functions
**Key Features**:
- Database queries and mutations
- Function execution
- Environment variable management
- Real-time data access

**Required Environment Variables**:
```bash
CONVEX_DEPLOYMENT=your_deployment_id
NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud
```

**Common Commands**:
- Check deployment status: `mcp__convex__status`
- List tables: `mcp__convex__tables`
- Run functions: `mcp__convex__run`
- View logs: `mcp__convex__logs`

### 3. Stripe Payment MCP
**Purpose**: Payment processing and subscription management
**Key Features**:
- Customer management
- Subscription handling
- Payment intent creation
- Webhook management
- Product and pricing management

**Required Environment Variables**:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Common Commands**:
- Create customer: `mcp__stripe__createCustomer`
- Manage subscriptions: `mcp__stripe__createSubscription`
- Create checkout session: `mcp__stripe__createCheckoutSession`
- Handle webhooks: `mcp__stripe__createWebhookEndpoint`

### 4. Google Cloud MCP
**Purpose**: Google services including Gemini AI
**Key Features**:
- Gemini AI content generation
- Token counting
- Content embedding
- Analytics integration
- Model management

**Required Environment Variables**:
```bash
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX (optional)
```

**Common Commands**:
- Generate AI content: `mcp__google__generateContent`
- Count tokens: `mcp__google__countTokens`
- Get analytics: `mcp__google__analyticsGetReports`

### 5. GitHub MCP
**Purpose**: Repository and code management
**Key Features**:
- Repository operations
- File management
- Issue tracking
- Pull request management
- Code search

**Required Environment Variables**:
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token (optional, uses default auth if not provided)
```

**Common Commands**:
- Search repos: `mcp__github__search_repositories`
- Create PR: `mcp__github__create_pull_request`
- Manage issues: `mcp__github__create_issue`

### 6. Filesystem MCP
**Purpose**: Local file system access
**Key Features**:
- File read/write operations
- Directory management
- File search
- Media file handling

**Configuration**: Automatically configured for project directory

### 7. Browser Automation MCPs

#### Playwright MCP
**Purpose**: Advanced browser automation and testing
**Features**:
- Page navigation
- Element interaction
- Screenshot capture
- Form filling
- Network monitoring

#### Puppeteer MCP
**Purpose**: Alternative browser automation
**Features**:
- Simple page automation
- Screenshot capture
- JavaScript execution

### 8. Utility MCPs

#### Memory MCP
**Purpose**: Knowledge graph for project context
**Features**:
- Entity creation
- Relationship management
- Context preservation

#### Sequential Thinking MCP
**Purpose**: Advanced problem-solving
**Features**:
- Multi-step planning
- Complex reasoning
- Hypothesis testing

#### Docker MCP
**Purpose**: Container management
**Features**:
- Container creation
- Compose deployment
- Log viewing

## Environment Variable Management

### Required Variables
These must be set for core functionality:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`

### Optional Variables
These enhance functionality but aren't required:
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `STRIPE_WEBHOOK_SECRET`
- `CLERK_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `TWILIO_*` (for SMS)
- `SENDGRID_*` (for email)

## Permission Management

### Auto-Approved Operations
The following operations are automatically approved:
- Read operations (file reading, database queries)
- Test operations
- Development commands (npm, git)
- Documentation fetching

### Restricted Operations
These require explicit approval:
- File deletion
- Production deployments
- Sensitive data access
- System-level commands

## Best Practices

### 1. Security
- Never commit API keys to version control
- Use environment variables for all secrets
- Regularly rotate API keys
- Review MCP permissions periodically

### 2. Development Workflow
- Use development environments for testing
- Keep production keys separate
- Monitor API usage and limits
- Use webhook testing tools for local development

### 3. Team Collaboration
- Share `.mcp.json` configuration
- Document custom MCP usage patterns
- Maintain `.env.mcp.example` updated
- Use consistent naming conventions

## Troubleshooting

### Common Issues

1. **MCP not loading**
   - Restart Claude Desktop
   - Check `.mcp.json` syntax
   - Verify environment variables are set

2. **Permission denied errors**
   - Check `.claude/settings.local.json`
   - Ensure MCP permissions are configured
   - Verify API key permissions

3. **API connection failures**
   - Verify API keys are valid
   - Check network connectivity
   - Ensure service endpoints are correct

4. **Environment variable issues**
   - Use absolute paths for file references
   - Escape special characters properly
   - Check variable naming conventions

## Testing MCPs

### Basic Tests

1. **Clerk**: `mcp__clerk__getUserId`
2. **Convex**: `mcp__convex__status`
3. **Filesystem**: `mcp__filesystem__list_directory`
4. **GitHub**: `mcp__github__search_repositories`

### Integration Tests
```bash
# Test all MCPs
npm run test:mcp

# Test specific MCP
npm run test:mcp:clerk
npm run test:mcp:convex
npm run test:mcp:stripe
```

## Advanced Configuration

### Custom MCP Servers
To add a custom MCP server:

1. Add configuration to `.mcp.json`
2. Define required environment variables
3. Set up permissions in `settings.local.json`
4. Document usage in this guide

### Performance Optimization
- Batch operations when possible
- Use caching for read-heavy operations
- Monitor rate limits
- Implement retry logic for failures

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Guide](https://claude.ai/docs/desktop)
- [Clerk Docs](https://clerk.com/docs)
- [Convex Docs](https://docs.convex.dev)
- [Stripe Docs](https://stripe.com/docs)
- [Google Cloud Docs](https://cloud.google.com/docs)

## Support

For MCP-related issues:
1. Check this documentation
2. Review error messages carefully
3. Consult service-specific documentation
4. Contact team lead for assistance

---

*Last Updated: December 2024*
*Version: 1.0.0*