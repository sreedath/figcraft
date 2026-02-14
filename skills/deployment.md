# Skill: Deployment & CI/CD

## Purpose
Ship confidently. Every change goes through CI, deploys to staging first, and only reaches production after approval.

## Infrastructure

### Railway Setup
Two Railway services from the same GitHub repo:

| Service | Branch | URL | Purpose |
|---------|--------|-----|---------|
| staging | `staging` | `staging.figcraft.app` | Preview + approve changes |
| production | `main` | `figcraft.app` | Live, user-facing |

Both services use:
- Same Dockerfile (multi-stage build)
- Same Railway Postgres (separate databases per env)
- Same R2 bucket (separate prefixes per env)
- Different env vars (staging has `STAGING_MODE=true`)

### Railway Configuration
```
# railway.toml
[build]
builder = "dockerfile"
dockerfilePath = "docker/Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

## Git Workflow

```
feature/xyz ──PR──→ staging ──promote──→ main
                      │                    │
                      ↓                    ↓
               Railway staging      Railway production
```

### Step-by-step:
1. Developer creates feature branch from `staging`.
2. Pushes commits, opens PR targeting `staging`.
3. CI runs (lint + typecheck + test + build + e2e).
4. If CI passes and PR approved, merge to `staging`.
5. GitHub Action auto-deploys staging service.
6. Developer visits staging URL, reviews changes.
7. Clicks "Approve & Deploy to Production" button.
8. This triggers the promote API → GitHub Action → merge staging into main.
9. GitHub Action auto-deploys production service.

## GitHub Actions

### CI (`ci.yml`)
```yaml
name: CI
on:
  pull_request:
    branches: [staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - run: pnpm test:e2e
```

### Deploy Staging (`deploy-staging.yml`)
```yaml
name: Deploy Staging
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: staging
```

### Deploy Production (`deploy-production.yml`)
```yaml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: production
```

## Staging Promote Flow

### The Approve Button
On the staging site at `/admin/staging`:
- Shows a summary of changes since last production deploy.
- Shows test results from CI.
- Has a big green "Approve & Deploy to Production" button.
- Button requires a confirmation dialog: "This will deploy to production. Are you sure?"

### Promote API (`/api/promote`)
```typescript
// 1. Verify staging secret (auth)
// 2. Create a GitHub PR: staging → main
// 3. Auto-merge the PR (since CI already passed on staging)
// 4. GitHub Action picks up the main branch push
// 5. Railway deploys production
// 6. Return deployment status URL
```

### Rollback
If something goes wrong in production:
1. Railway supports instant rollback to previous deploy via dashboard.
2. Or: revert the merge commit on `main` → auto-deploys previous version.
3. The staging promote UI shows a "Rollback Production" button (reverts last merge).

## Docker

### Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Monitoring
- Railway provides built-in logging and metrics.
- Add Sentry for error tracking (free tier).
- Health check endpoint at `/api/health` returns:
  - App version (git SHA)
  - Database connectivity
  - AI API connectivity
  - Uptime
