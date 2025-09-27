# Frontend Stack (Stable Baseline)

## Core Versions
- **Next.js**: 14.2.33 (App Router)
- **React / React DOM**: 18.2.0
- **TypeScript**: 5.x (tsconfig references `strict` mode)
- **Tailwind CSS**: 3.4.17 with custom `tailwind.config.ts`
- **PostCSS**: default pipeline (`tailwindcss`, `autoprefixer`)
- **ESLint**: 8.57 with `.eslintrc.js` extending `next/core-web-vitals`
- **Prettier**: 3.6

## Supporting Decisions
- `next/font/google` now relies on stable families (`Inter`, `JetBrains Mono`, `Source Serif 4`), matching the CSS tokens declared in `app/globals.css`.
- Tailwind tokens are provided through `:root` variables; the config adds matching color aliases, extended shadows, and a plugin that restores the `size-*` utility that existed in Tailwind v4.
- `next.config.mjs` exports plain JS (TypeScript config is unsupported on Next 14). Sentry wrapping is preserved.
- PostCSS configuration returns a string/object map rather than module imports (Next 14 requires this shape).
- Utility `cn` wraps `tailwind-merge` with плейсхолдерами для `size-*`, `data-[...]`, `group-data[...]` классов; поведение зафиксировано тестами (`tests/unit/cn.test.js`).

## Update Procedure
1. **Package updates**: adjust `package.json` (keep Next 14 / React 18 / Tailwind 3 lines unless a new major stable release is planned). Run `pnpm install --lockfile-only` followed by `pnpm install`.
2. **Static analysis**: execute `pnpm lint` and `pnpm typecheck`. Ensure no prompts from `next lint` (requires `.eslintrc.js`).
3. **Build verification**: run `pnpm build` (needs outbound network to fetch Google fonts). Investigate and fix any Tailwind regressions or warnings from Next/Sentry.
4. **Playwright / Visual smoke**: trigger the existing Playwright suite (`pnpm test:e2e` once it is enabled) and review visual checks when added (see TODO #9).
5. **Dependency audit**: document deltas and required manual changes in `docs/frontend/changelog.md` (to be created alongside future upgrades).

## Release Checklist (per update PR)
- [ ] `package.json` / `pnpm-lock.yaml` updated.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build` executed.
- [ ] Any needed Tailwind config or CSS migrations captured in TODO backlog.
- [ ] Documentation in `docs/frontend` amended when behavior or tooling changes.

This file should be revised whenever the core stack or validation process evolves (e.g. adoption of Tailwind 4 once it becomes GA, or upgrading to React 19 when it leaves prerelease).
