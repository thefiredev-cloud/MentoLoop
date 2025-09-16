Sub-Agents Overview

This folder contains focused sub-agent presets designed to operate with your MCP tools. Each preset defines scope, allowed tools, required env, and safe operating procedures.

Available sub-agents:
- GitHub Ops: code reviews, issues, PRs, repo maintenance
- Convex Ops: schema/functions review, deployment coordination, log triage
- Clerk Ops: auth config review, org/users workflows
- Stripe Ops: billing flows, checkout/session/webhook coordination
- Netlify Ops: deploy workflow review, env vars, build troubleshooting

How to use
- Open the desired agent file and paste its Role + Playbook into your assistant as a system/instruction preset.
- Ensure the corresponding MCP server is enabled in your client and the required env vars are set.
- Start with the "First-run checklist" in each agent file.

Notes
- Some MCP servers referenced in docs may not be published. Where MCP tooling is unavailable, these agents fall back to GitHub API discussions, CLI commands, or code changes via PRs.

