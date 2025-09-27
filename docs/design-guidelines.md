---
title: Design Guidelines
description: MentoLoop UI design tokens and usage conventions
---

## MentoLoop Design Guidelines

This document captures patterns that keep the product UI consistent. It complements the component stories in `components/ui` and the global theme in `app/globals.css`.

## Semantic Color Tokens

Our color palette uses semantic tokens that adapt across dark and light modes. Avoid hard-coded Tailwind utility hues (for example `bg-green-500`). These are now lint-blocked via `scripts/check-semantic-colors.js` + `private/eslint-restricted-patterns.json`.

| Purpose | Token | Tailwind Example |
| --- | --- | --- |
| Positive/Success | `success` | `bg-success text-success-foreground` |
| Caution/Warning | `warning` | `bg-warning/10 text-warning border border-warning/30` |
| Informational | `info` | `bg-info text-info-foreground` |
| Neutral/Muted | `muted` | `bg-muted text-muted-foreground` |
| Accent | `accent` | `bg-accent text-accent-foreground` |

### Usage Rules

- **Badges:** Use `bg-success text-success-foreground` for confirmed, paid, or completed states. For neutral outlines pair with `variant="outline"` and apply `bg-success/10 text-success border border-success/30`.
- **Alerts & Cards:** For positive states use `bg-success/10 border border-success/30`. Warnings follow the same pattern with the `warning` token.
- **Buttons:** Prefer `className="bg-success text-success-foreground hover:bg-success/90"` when a positive action needs emphasis.
- **Icons/Text:** Apply `text-success`, `text-warning`, or `text-info` to vector icons and inline text. Keep unique brand accents (such as primary/secondary) for navigation and highlights.

### Dos and Don'ts

- ✅ Do use semantic tokens in JSX and CSS via CSS variables (`var(--success)`) if hand-writing styles.
- ✅ Do keep tokens paired with matching foreground colors (`text-success-foreground`) for legibility.
- ❌ Do not mix semantic tokens with legacy fixed greens/yellows (`bg-green-500`, `bg-amber-400`, etc.). ESLint/CI will fail on these.
- ❌ Do not hardcode hex values for statuses; if a new status is needed, add a named token first.
- ❌ Do not bypass semantic classnames by inlining gradient hex strings. Use `bg-gradient-to-r from-primary via-accent to-secondary` and similar token blends.

## Extending the Palette

When introducing a new status or contextual color:

1. Add the token to both dark and light mode sections in `app/globals.css`.
2. Update `tailwind.config.ts` when additional named utilities are required.
3. Document the new token here, including intended usage and component examples.
4. Update `private/eslint-restricted-patterns.json` if the new token replaces formerly allowed patterns.

By staying within the semantic system we guarantee accessibility, theming flexibility, and quicker refactors.

## Async Controls

Interactive CTAs must communicate loading, success, and failure states immediately. To keep behaviour consistent across the dashboard:

- Use `AsyncButton` for any click handler that returns a promise. The component automatically disables while pending, sets `aria-busy`, and shows the provided `loadingText`.
- For navigational CTAs, prefer `LinkButton` so links inherit button styling (and fall back to a disabled `<span>` when the action is unavailable).
- Wrap complex flows (dialogs, mutations) with the `useAsyncAction` hook. It centralises loading/error tracking and supports optional controller overrides when local state already exists.
- Always provide meaningful `loadingText` (for example `"Processing…"`, `"Paying…"`) rather than a generic spinner-only state.
- Pair async buttons with toast and inline feedback. Errors should set a concise `toast.error` message and, when possible, highlight the affected form field.
- Ensure disabled actions explain the reason via adjacent helper text or a tooltip—particularly when the user must meet prerequisites (e.g. missing intake steps).

Following these patterns removes "dead" buttons, improves accessibility, and makes async UI intent obvious to users and QA automation alike.
