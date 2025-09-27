# UI Color Audit (September 2025)

This note captures legacy color values that still exist outside the homepage theme tokens defined in `app/globals.css`. Each row lists the legacy value, where it appears today, and the semantic token or utility we will swap in during the refactor.

| Legacy value | Primary usage examples | Planned replacement |
| --- | --- | --- |
| `#111a2b`, `#0f2038`, `#13203a` | Billing dashboard shells/cards (`app/dashboard/billing/**`) | ✅ Replaced with `bg-card/80` + `backdrop-blur` |
| `#1d2a46` | Billing borders, dashed outlines | ✅ Replaced with `border-border/60` |
| `#a6b3cc` | Secondary text in billing components | ✅ Replaced with `text-muted-foreground/80` |
| `#2fd3c5`, `#1fa2ff`, `#0ee` gradient | Billing hero badge gradient | ✅ Replaced with `bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30` |
| `#338BFF` | Clerk `colorPrimary` (see `lib/clerk-config.ts`) | ✅ Now `hsl(var(--primary))` |
| `#0F172A` | Clerk `colorBackground` | ✅ Now `hsl(var(--background))` |
| `#E5E7EB`, `#9CA3AF` | Clerk text colors | ✅ Now `hsl(var(--foreground))`, `hsl(var(--muted-foreground))` |
| `#ef4444` | Clerk danger | ✅ Now `hsl(var(--destructive))` |
| `#10b981` | Clerk success | ✅ Now `hsl(var(--success))` |
| `#f59e0b` | Clerk warning | ✅ Now `hsl(var(--warning))` |
| Fixed Tailwind hues (`bg-blue-500`, `text-amber-500`, etc.) | Dashboards, alerts, badges across `app/dashboard/**` | Semantic tokens (`bg-primary`, `text-warning`, `bg-success/10`, etc.) |
| Hard-coded gradients using brand hex (`from-blue-500`, `from-purple-500`) | Landing features carousel | Token-based gradients (`from-primary/30`, `from-accent/30`, etc.) |
| Inline icon fills (`fill-yellow-400`, `text-red-500`) | Badges/icons in dashboards | `text-warning`, `text-destructive`, `text-success` |

Additional updates completed:

- `app/(landing)/features-one.tsx` now relies on the `BentoGridItem` theme prop.
- `components/ui/chart.tsx` still references Recharts internals (requires follow-up for CSS variables).
- `components/magicui/pulsating-button.tsx` default pulse uses `hsl(var(--muted-foreground))`.

Lint + CI guardrails:

- `private/.eslintrc.cjs` blocks hex usage in TSX/MDX via `no-restricted-syntax`.
- `private/eslint-restricted-patterns.json` flags Tailwind fixed hues (bg/red/etc.).
- `scripts/check-semantic-colors.js` runs in `npm run lint` to enforce the guardrail.
