---
title: Design Guidelines
description: MentoLoop UI design tokens and usage conventions
---

# MentoLoop Design Guidelines

This document captures patterns that keep the product UI consistent. It complements the component stories in `components/ui` and the global theme in `app/globals.css`.

## Semantic Color Tokens

Our color palette uses semantic tokens that adapt across dark and light modes. Avoid hard-coded Tailwind utility hues (for example `bg-green-500`) in favor of the semantic classes below.

| Purpose | Token | Tailwind Example |
| --- | --- | --- |
| Positive/Success | `success` | `bg-success text-success-foreground`
| Caution/Warning | `warning` | `bg-warning/10 text-warning border border-warning/30`
| Informational | `info` | `bg-info text-info-foreground`

### Usage Rules

- **Badges:** Use `bg-success text-success-foreground` for confirmed, paid, or completed states. For neutral outlines pair with `variant="outline"` and apply `bg-success/10 text-success border border-success/30`.
- **Alerts & Cards:** For positive states use `bg-success/10 border border-success/30`. Warnings follow the same pattern with the `warning` token.
- **Buttons:** Prefer `className="bg-success text-success-foreground hover:bg-success/90"` when a positive action needs emphasis.
- **Icons/Text:** Apply `text-success`, `text-warning`, or `text-info` to vector icons and inline text. Keep unique brand accents (such as primary/secondary) for navigation and highlights.

### Dos and Don'ts

- ✅ Do use semantic tokens in JSX and CSS via CSS variables (`var(--success)`) if hand-writing styles.
- ✅ Do keep tokens paired with matching foreground colors (`text-success-foreground`) for legibility.
- ❌ Do not mix semantic tokens with legacy fixed greens/yellows (`bg-green-500`, `bg-amber-400`, etc.).
- ❌ Do not hardcode hex values for statuses; if a new status is needed, add a named token first.

## Extending the Palette

When introducing a new status or contextual color:

1. Add the token to both dark and light mode sections in `app/globals.css`.
2. Expose utilities in `tailwind.config.ts` if needed.
3. Update this file with usage guidance so future contributors follow the same pattern.

By staying within the semantic system we guarantee accessibility, theming flexibility, and quicker refactors.

