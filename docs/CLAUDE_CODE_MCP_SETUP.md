# Claude Code CLI - MCP Configuration Guide

## Overview

This guide explains how to set up MCP (Model Context Protocol) servers for Claude Code CLI, providing structured interfaces to interact with your development APIs.

## Installation Steps

### Step 1: Copy Configuration File

**IMPORTANT**: You need to manually copy the `claude_desktop_config.json` file to the correct location:

```bash
# Copy the configuration file to AppData
copy claude_desktop_config.json %APPDATA%\claude-desktop\claude_desktop_config.json

# Or using PowerShell
Copy-Item claude_desktop_config.json -Destination "$env:APPDATA\claude-desktop\claude_desktop_config.json"
```

### Step 2: Set Environment Variables

Set your environment variables in your system or in a `.env` file in your project root:

```bash
# Required for Clerk
export CLERK_SECRET_KEY=sk_test_your_key
export CLERK_WEBHOOK_SECRET=whsec_your_secret

# Required for Convex
export CONVEX_DEPLOYMENT=your_deployment_id
export NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud

# Required for Stripe
export STRIPE_SECRET_KEY=sk_test_your_key
export STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Required for Google/Gemini
export GEMINI_API_KEY=your_gemini_key

# Optional for GitHub (uses default auth if not set)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token
```

### Step 3: Restart Claude Code CLI

After copying the configuration and setting environment variables:

```bash
# Restart Claude Code to load new MCPs
claude restart

# Or simply start a new session
claude
```

## Configured MCP Servers

### 1. Clerk Authentication
- **Purpose**: User and organization management
- **Commands**: User CRUD, organization management, invitations
- **Required**: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`

### 2. Convex Database
- **Purpose**: Backend database and serverless functions
- **Commands**: Database queries, function execution, logs
- **Required**: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`

### 3. Stripe Payments
- **Purpose**: Payment processing and subscriptions
- **Commands**: Customer management, subscriptions, checkout
- **Required**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### 4. Google Cloud / Gemini AI
- **Purpose**: AI content generation and Google services
- **Commands**: Generate content, embeddings, analytics
- **Required**: `GEMINI_API_KEY`

### 5. GitHub
- **Purpose**: Repository and code management
- **Commands**: Repos, issues, PRs, code search
- **Optional**: `GITHUB_PERSONAL_ACCESS_TOKEN`

### 6. Filesystem
- **Purpose**: Local file operations
- **Commands**: Read, write, search files
- **Pre-configured**: Points to your project directory

### 7. Browser Automation
- **Playwright**: Advanced browser testing
- **Puppeteer**: Simple browser automation

### 8. Utilities
- **Memory**: Knowledge graph for context
- **Sequential Thinking**: Complex problem solving
- **Docker**: Container management
- **IDE**: VS Code integration

## Usage Examples

Once configured, you can use these MCPs in Claude Code:

```bash
# Check Convex deployment status
claude "Check my Convex deployment status"

# Manage Clerk users
claude "Show me all users in my Clerk instance"

# Work with Stripe
claude "Create a new Stripe customer for test@example.com"

# Use Gemini AI
claude "Generate a product description using Gemini"

# GitHub operations
claude "Search for React repositories on GitHub"
```

## Troubleshooting

### MCPs Not Loading

1. Verify configuration file location:
```bash
dir %APPDATA%\claude-desktop\claude_desktop_config.json
```

2. Check environment variables:
```bash
echo %CLERK_SECRET_KEY%
echo %CONVEX_DEPLOYMENT%
```

3. Restart Claude Code:
```bash
claude restart
```

### Permission Errors

Check `.claude/settings.local.json` for proper permissions:
- Wildcard permissions for MCPs: `"mcp__clerk__*"`
- Bash command permissions
- WebFetch domain permissions

### API Connection Issues

1. Verify API keys are correct
2. Check network connectivity
3. Ensure services are active (Convex deployment, Clerk app, etc.)

## Project-Specific Configuration

The configuration is set up specifically for the MentoLoop project with:
- Filesystem MCP pointing to `C:/Users/Tanner/Mentoloop`
- All necessary permissions in `.claude/settings.local.json`
- Environment variables matching `.env.local` structure

## Security Notes

1. **Never commit API keys**: Keep them in `.env.local` or system environment
2. **Use test keys for development**: Don't use production keys locally
3. **Rotate keys regularly**: Update keys periodically for security
4. **Review permissions**: Check `.claude/settings.local.json` regularly

## Next Steps

1. Copy `claude_desktop_config.json` to `%APPDATA%\claude-desktop\`
2. Set your environment variables from `.env.local`
3. Restart Claude Code CLI
4. Test MCPs with simple commands

## Support

For issues:
1. Check this documentation
2. Review error messages in Claude Code
3. Verify environment variables
4. Check service-specific documentation

---

*Configuration for Claude Code CLI v1.0.92+*
*Last Updated: December 2024*