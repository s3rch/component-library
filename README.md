## Library Components — UI + Tracking + Demo (Next.js) + API (Express)

### Overview

This repository is a **technical test solution** that demonstrates:

- A **reusable UI component library** (`@repo/ui`) with integrated tracking.
- A **tracking SDK** (`@repo/tracking`) with queue + flush and fault tolerance (it should never crash the UI).
- A **demo app** (`apps/web`) built with Next.js App Router that showcases components, auth, a “real‑time” statistics dashboard, and exports.
- A **backend API** (`apps/api`) built with Express + Mongoose using MongoDB Atlas, JWT, validation, error handling, and basic logging.

### Tech stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 16.x (App Router), React 19.x, Tailwind CSS
- **Backend**: Node.js + Express, MongoDB Atlas Free Tier, Mongoose, JWT
- **Testing**: Jest + Testing Library (UI/SDK), supertest (API)
- **Language**: TypeScript (strict)

### Repo structure

- **`apps/web`**: demo app (Next.js)
- **`apps/api`**: backend API (Express)
- **`packages/ui`**: UI component library (Button/Input/Modal/Card)
- **`packages/tracking`**: tracking SDK (Provider + hook + queue/flush)

### Prerequisites

- **Node.js**: recommended **20 LTS** (should work with Node >= 18.18)
- **pnpm**: recommended **9.x** (repo pins `pnpm@9.15.1` in `package.json`)
- **MongoDB Atlas Free Tier**: a reachable cluster (network access + user)

### Setup (step‑by‑step)

1) Install dependencies:

```bash
pnpm install
```

2) Create local `.env` files from the examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3) Configure MongoDB Atlas (Free Tier):

- **Create a DB user** (Database Access) with access to the cluster.
- **Network Access**: add your IP to the allowlist (or temporarily allow `0.0.0.0/0` for evaluation).
- **Confirm DB name**: `t1_analytics`
- **Confirm collection**: `tracking_events` (Mongoose creates/uses it automatically).
- **Set `MONGODB_URI`** in `apps/api/.env` including **`/t1_analytics`**.
  - Example (placeholders): `mongodb+srv://<USER>:<PASSWORD>@<HOST>/t1_analytics?retryWrites=true&w=majority`

4) Run in dev:

```bash
pnpm dev
```

5) Open the demo:

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

### How to test (repo scripts)

From the repo root:

```bash
pnpm build
pnpm lint
pnpm test
pnpm test:coverage
```

Notes:

- The backend tests use **in‑memory MongoDB** (`mongodb-memory-server`), so they **do not require Atlas**.
- The test coverage target is **`packages/ui` >= 80% (components)**; the report is generated in `packages/ui/coverage/`.

### Demo usage guide

On the home page (`apps/web`) you’ll see 3 sections:

- **Showcase**: interact with `Button`, `Input`, `Modal`, `Card` to generate tracking events.
  - **Button**: tracks `click` (no tracking when `disabled`/`loading`).
  - **Input**: tracks only `focus`/`blur` (never sends the input `value`).
  - **Modal**: tracks `open`/`close` and on close includes `metadata.reason` (`x`, `overlay`, `esc`, `api`).
  - **Card**: tracks `click` only when clickable (has `onClick`).
- **Real‑time Statistics**: a dashboard that polls **every 2s** via `GET /api/components/stats`.
  - The “Interaction counter” should increase **within 2 seconds** after interactions.
- **Auth**: Register/Login/Logout. The JWT is stored in `localStorage`.

Export:

- **Export CSV**: downloads from the backend via `GET /api/components/export` (JWT required).
- **Export JSON**: client‑side download of the **current dashboard state** (no backend call).

### API documentation (curl)

Assume:

```bash
API_BASE_URL=http://localhost:4000
```

#### `GET /api/health`

```bash
curl -sS "$API_BASE_URL/api/health"
```

#### `POST /api/auth/register`

```bash
curl -sS -X POST "$API_BASE_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### `POST /api/auth/login` (returns JWT)

```bash
curl -sS -X POST "$API_BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

Store the token in a variable (no `jq`, using Node):

```bash
TOKEN=$(curl -sS -X POST "$API_BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).token')
echo "$TOKEN"
```

#### `POST /api/components/track` (public)

Payload (aligned with what’s implemented): `component`, `variant`, `action`, `metadata?`.

Note: the backend **generates** `timestamp` when persisting (and returns it in the response/CSV).

```bash
curl -sS -X POST "$API_BASE_URL/api/components/track" \
  -H 'Content-Type: application/json' \
  -d '{"component":"Button","variant":"primary","action":"click","metadata":{"source":"curl"}}'
```

#### `GET /api/components/stats` (public)

```bash
curl -sS "$API_BASE_URL/api/components/stats"
```

#### `GET /api/components/export` (CSV, JWT required)

Download CSV to disk:

```bash
curl -sS "$API_BASE_URL/api/components/export?limit=1000" \
  -H "Authorization: Bearer $TOKEN" \
  -o tracking-events.csv
```

### Requirement Mapping (test)

- **UI components (Button/Input/Modal/Card) + variants/states + central export**
  - `packages/ui/src/components/Button/Button.tsx`
  - `packages/ui/src/components/Input/Input.tsx`
  - `packages/ui/src/components/Modal/Modal.tsx`
  - `packages/ui/src/components/Card/Card.tsx`
  - Central export: `packages/ui/src/index.ts`
- **Design tokens (file + majority usage via CSS vars)**
  - Tokens: `packages/ui/src/tokens/design-tokens.ts`
  - Used via `--ui-*` vars and `ensureDesignTokensApplied()` (see components above)
- **Tracking SDK (Provider + hook + queue/flush + “never crash UI”)**
  - Provider/hook: `packages/tracking/src/presentation/TrackingProvider.tsx`, `packages/tracking/src/presentation/useTracking.ts`
  - Queue/flush/backoff + safe metadata: `packages/tracking/src/application/trackingService.ts`
  - HTTP client: `packages/tracking/src/infrastructure/httpClient.ts`
- **Demo app (showcase + polling dashboard + auth + exports)**
  - Entry: `apps/web/src/app/page.tsx`
  - Providers (TrackingProvider + tokens): `apps/web/src/app/providers.tsx`
  - Showcase: `apps/web/src/features/showcase/presentation/ShowcaseSection.tsx`
  - 2s polling stats: `apps/web/src/features/analytics/application/usePollingStats.ts`, `apps/web/src/features/analytics/presentation/AnalyticsSection.tsx`
  - Export CSV/JSON: `apps/web/src/features/analytics/presentation/ExportPanel.tsx`
  - Auth + localStorage JWT: `apps/web/src/features/auth/presentation/AuthProvider.tsx`, `apps/web/src/features/auth/infrastructure/authStorage.ts`
- **Backend API (Express + Mongoose + JWT + validation + errors + logging)**
  - App wiring: `apps/api/src/app.ts`, `apps/api/src/main.ts`
  - Env: `apps/api/src/config/env.ts`
  - Routes: `apps/api/src/presentation/http/routes/auth.routes.ts`, `apps/api/src/presentation/http/routes/components.routes.ts`, `apps/api/src/presentation/http/routes/health.routes.ts`
  - Validation middleware: `apps/api/src/presentation/http/middlewares/validate.ts`
  - JWT middleware: `apps/api/src/presentation/http/middlewares/auth-jwt.ts`
  - Error handling: `apps/api/src/presentation/http/middlewares/error-handler.ts`, `apps/api/src/presentation/http/middlewares/not-found.ts`
  - Logging: `apps/api/src/infrastructure/logging/logger.ts` (and `morgan` in `apps/api/src/app.ts`)
- **Tests (>=3 per UI component, tracking integration tests, API tests with supertest)**
  - UI: `packages/ui/src/components/*/*.test.tsx`
  - Tracking: `packages/tracking/test/tracking.test.tsx`
  - API: `apps/api/test/api.test.ts`
- **Coverage >= 80% UI components**
  - Run `pnpm test:coverage` (see report in `packages/ui/coverage/`)

### Troubleshooting

- **Atlas IP not allowed**
  - Check Atlas Network Access and add your IP. If your IP changes, update the allowlist.
- **`MONGODB_URI` missing DB name**
  - It must include `/t1_analytics` (e.g. `...mongodb.net/t1_analytics?...`).
- **Password with special characters**
  - If the password includes `@`, `:`, etc., you must URL‑encode it in the connection string.
- **Port conflicts (3000/4000)**
  - Ensure `:3000` (web) and `:4000` (api) are free before running `pnpm dev`.

### Security note

- **Do not commit real credentials** (`apps/api/.env` and `apps/web/.env` should be local only).


