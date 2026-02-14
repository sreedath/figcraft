# Contributing to FigCraft

## Setup

```bash
# Clone
git clone https://github.com/YOUR_ORG/figcraft.git
cd figcraft

# Install
pnpm install

# Set up environment
cp .env.example .env
# Fill in your API keys

# Start dev server
pnpm dev
```

## Making Changes

1. Create a branch from `staging`: `git checkout -b feat/your-feature staging`
2. Make your changes.
3. Run checks: `pnpm typecheck && pnpm lint && pnpm test`
4. Commit with conventional commit message: `feat: add color picker to style panel`
5. Push and open PR targeting `staging`.
6. Wait for CI to pass and get review.

## Code Standards

- TypeScript strict mode. No `any`.
- Components under 200 lines.
- All API routes validate input with Zod.
- All user-facing flows have E2E tests.
- No inline styles — Tailwind only.

## PR Checklist

- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Production build succeeds
- [ ] Screenshots included for UI changes
- [ ] Description explains what and why
