# Cartory Wash Payment Desk (web)

The cashier and admin web app for Cartory Wash: record car-wash sales in three taps, issue
receipts, and see revenue by payment method, service and cashier. Next.js 16 (App Router), React
19, TanStack Query 5, Zod 4, Tailwind CSS v4, Radix (dialog, dropdown), sonner, Vitest.

The product rules live in `../PROJECT_GUIDE.md`. The screens, copy and behaviour come from
`../Carwash payment system prototype/`. The API contract (every request, response, message and
error code) is in `../carwash-api/docs/api/`. The browser never calls the API: every call goes
server to server from a Server Action or Route Handler, with the token from an HttpOnly cookie.

## Run locally

```bash
nvm use                       # Node 24
npm install
cp .env.example .env.local    # API_INTERNAL_BASE_URL must end in /v1
npm run dev                   # http://localhost:3000 (the API runs on :4000, see ../carwash-api)
```

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server on port 3000                     |
| `npm run build`     | Production build (`next build`, Turbopack)  |
| `npm run start`     | Serve the build                             |
| `npm run typecheck` | `tsc --noEmit`                              |
| `npm run lint`      | ESLint (next core-web-vitals + TypeScript)  |
| `npm test`          | Vitest once (`npm run test:watch` to watch) |
| `npm run format`    | Prettier (with the Tailwind class sorter)   |

Environment (validated in `src/config/env.ts`):

| Variable                | Where       | Value                                                                                                      |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`  | browser     | `Cartory Wash` (fallback name before settings load)                                                        |
| `API_INTERNAL_BASE_URL` | server only | The API origin **including `/v1`**, e.g. `http://localhost:4000/v1`                                        |
| `API_SECURITY_KEY`      | server only | Same value as carwash-api's `API_SECURITY_KEY` (32+ characters). Optional locally, **required on Vercel**. |

Every server-to-server call (Server Actions, the proxy's refresh, the CSV handlers) sends
`X-Security-Key` (when the key is set) and `X-Client-Ip` (the browser's IP: the first
`x-forwarded-for` entry, else `x-real-ip`). The API then rate-limits sign-in and refresh per
browser rather than per Vercel server (`lib/api/server-headers.ts`).

## How it is put together

```
src/
  proxy.ts                 Renews the session 60 s before the access token expires; else /login?returnTo=
  config/env.ts            publicEnv (eager) + getServerEnv() (server only)
  app/
    (auth)/login           Sign in (Server Action form)
    (auth)/change-password Temporary passwords are changed here first
    (desk)/                Signed-in shell: dashboard, new, transactions, services, reports, settings
    api/export/…           Two CSV Route Handlers (transactions, daily totals)
  components/
    ui/  feedback/  layout/  navigation/  access/
  features/<domain>/       components/ hooks/ schemas/ services/ utils/
  lib/
    api/                   server client, envelope, ApiError, ServiceResult, endpoints, query keys
    auth/                  cookies, session (requireUser), proxy refresh logic, return-to, access
    format/                money, date, plate, payment-method, text (all Lagos-pinned)
  providers/               QueryProvider, SessionProvider (useSession, useCan), AppProviders
  testing/                 Typed fixtures and renderWithDesk()
```

### Auth

- **Sign in** is the `signIn` Server Action (`features/auth/services/auth.service.ts`): `POST
/auth/login`, then two HttpOnly cookies, `cw_access` (lives until `accessTokenExpiresAt`) and
  `cw_refresh` (7 days), both `SameSite=Lax`, `Secure` in production. It then redirects: a
  temporary password goes to `/change-password`, otherwise `returnTo`, or admin → `/dashboard`,
  cashier → `/new`. No token ever reaches browser JavaScript.
- **`src/proxy.ts`** runs before every page, Server Action and export. When the access token is
  missing or expires within 60 s it calls `POST /auth/refresh` **once per refresh token**
  (single flight, result shared for 30 s; refresh tokens rotate and reuse signs the user out
  everywhere) and writes both cookies. No session on a protected page → `/login?returnTo=…`
  (`safeReturnTo` blocks off-site and looping targets). Server Actions are never redirected: the
  service answers `unauthorized` and the query client sends the tablet to sign in.
- **`(desk)/layout.tsx`** calls `requireUser()` (`GET /auth/me`, `React.cache`), the real check,
  redirects to `/change-password` while `mustChangePassword` is true, and mounts
  `SessionProvider`. Client code uses `useSession()`, `useCan(action)` and `<Can action>`
  (`lib/auth/access.ts` lists the admin-only actions). The API enforces roles regardless.
- **Sign out** is the `signOut` Server Action: `POST /auth/logout`, clear both cookies, `/login`.

### Data flow: adding a feature

```
Client component
  → hook in features/<domain>/hooks          useQuery / useMutation, keys from queryKeys
    → "use server" features/<domain>/services  returns ServiceResult<T> (serialisable, no tokens)
      → executeBackendService(() => mapBackendData(
          authenticatedBackendRequest(API_ROUTES.<domain>.<route>), schema.parse))
```

To add something, touch these shared files (small edits in your own section only):

| To add…               | Edit                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| An API route          | `src/lib/api/endpoints.ts` (`API_ROUTES.<domain>`; query via `withQuery`)          |
| A query key           | `src/lib/api/query-keys.ts` (start from the domain's `all`)                        |
| An admin-only action  | `src/lib/auth/access.ts` (`DESK_ACTIONS`)                                          |
| A page in the sidebar | `src/components/navigation/navigation-items.ts` + `src/app/(desk)/<href>/page.tsx` |
| A token               | `src/app/globals.css` (`:root` + `@theme inline`)                                  |

Then, in `features/<domain>/`:

1. `schemas/<domain>.schema.ts`: Zod schemas copied from the contract (responses and request
   bodies, with the prototype's error copy). This is the contract boundary: a response that does
   not parse becomes a 502 `ApiError` with the request ID.
2. `services/<domain>.service.ts`: first line `"use server"`; parse input, call
   `authenticatedBackendRequest`, parse output with `mapBackendData`, wrap in
   `executeBackendService`. Money-moving writes pass `idempotencyKey`.
3. `hooks/use-<domain>.ts`: `unwrapServiceResult` (data) or `unwrapServiceSuccess` (data + the
   API's message for a toast). Mutations invalidate by domain; a sale or cancellation invalidates
   transactions, dashboard, reports, services (`soldLast30Days`) and staff (`todayCount`).
4. `components/`: handle pending (skeleton), error (`ErrorState` with Retry and request ID),
   empty and filtered-empty. Show `error.message` next to the control that failed; toasts are for
   success only.
5. Tests next to the code (`*.test.ts(x)`), mocking the service module (`vi.mock`) and using
   `renderWithDesk()` plus the typed fixtures in `src/testing/fixtures.ts`.

Pages stay thin: `await requireUser()`, a `PageHeader`, one feature component.

Errors: `ApiError(message, status, kind, requestId, code)`. `message` is the API's human copy;
branch on `code` (the contract's `errorCode`), never on the message. Kinds: `validation`,
`unauthorized`, `forbidden`, `not-found`, `conflict`, `rate-limited`, `server`, `network`,
`timeout`, `aborted`, `unknown`.

### CSV exports

`/api/export/transactions` and `/api/export/daily-totals` read `cw_access`, forward a whitelist of
query parameters to the API, and stream the CSV back with its `Content-Disposition`. The browser
just follows a plain link. There is no generic catch-all proxy.

## UI primitives

Design rules: `../PROJECT_GUIDE.md` §9 and the prototype's style guide. Dark only, square corners,
tokens only (no raw hex in features), Lucide icons at stroke 1.5, focus ring 2 px accent,
disabled at 45 %.

| Primitive                                                                           | File                                    | Notes                                                                                                                                          |
| ----------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Blueprint`, `Corners`                                                              | `ui/blueprint.tsx`                      | Hairline frame + four `+` registration marks (`.blueprint > .corner` in `globals.css`). Unfilled.                                              |
| `Button`, `buttonVariants`                                                          | `ui/button.tsx`                         | `primary` / `secondary` / `ghost`; sizes `sm md lg xl` (`xl` = full-width 52 px); `marks`; `loading`. Destructive = secondary + `border-text`. |
| `Input`                                                                             | `ui/input.tsx`                          | `inputSize="lg"` = 44 px / 16 px for cashier-facing fields.                                                                                    |
| `Field`                                                                             | `ui/field.tsx`                          | Render prop wiring `id`, `aria-describedby`, `aria-invalid`; hint and ink error.                                                               |
| `Select`                                                                            | `ui/select.tsx`                         | Native select in the input style.                                                                                                              |
| `Checkbox`                                                                          | `ui/checkbox.tsx`                       | Square native checkbox, optional label.                                                                                                        |
| `Switch`                                                                            | `ui/switch.tsx`                         | `role="switch"` setting toggle.                                                                                                                |
| `Seg`                                                                               | `ui/seg.tsx`                            | Segmented control on native radios (arrow keys move).                                                                                          |
| `Tag`                                                                               | `ui/tag.tsx`                            | `accent` (Paid, Active, Admin), `neutral` (Cancelled, Inactive, Cashier), `outline` (Adjusted).                                                |
| `Table*`, `TableSkeleton`, `TableEmptyRow`                                          | `ui/table.tsx`                          | `numeric` cells are right-aligned and tabular. `TableContainer` scrolls on phones.                                                             |
| `Dialog`, `DialogContent`, `DialogActions`                                          | `ui/dialog.tsx`                         | Radix; blueprint on the page ground; always titled.                                                                                            |
| `DropdownMenu*`                                                                     | `ui/dropdown-menu.tsx`                  | Radix; row actions.                                                                                                                            |
| `StatTile`, `StatTileSkeleton`                                                      | `ui/stat-tile.tsx`                      | KPI tile; `lg` 52 px figure, `md` 38 px.                                                                                                       |
| `MethodSplitBar`                                                                    | `ui/method-split-bar.tsx`               | Stacked bar + legend (share % and ₦), always cash / transfer / POS in yellow / cyan / orange.                                                  |
| `MoneyText`, `DateText`                                                             | `ui/money-text.tsx`, `ui/date-text.tsx` | ₦ from kobo (`struck`, `signed`); Lagos dates as `<time>`.                                                                                     |
| `Skeleton`                                                                          | `ui/skeleton.tsx`                       | Square pulse block.                                                                                                                            |
| `Toaster`, `toast`                                                                  | `ui/toast.tsx`                          | accent-900 field, ground text, bottom-right, 2.6 s. Success only.                                                                              |
| `EmptyState`, `ErrorState`, `FormErrors`, `Notice`, `ConfirmDialog`, `PageSkeleton` | `feedback/`                             | `FormErrors` is the ink-bordered error block above a submit button.                                                                            |
| `AppShell`, `PageHeader`, `Brand`, `BrandMark`, `SignOutButton`                     | `layout/`                               | Sidebar at `lg`+, top bar + drawer below.                                                                                                      |
| `Can`                                                                               | `access/can.tsx`                        | Hides what a role may never do.                                                                                                                |

Formatters (`src/lib/format`): `formatNaira(kobo)` → "₦12,500", `nairaToKobo`, `parseNairaInput`,
`formatTime` → "10:30 AM", `formatShortDate` → "19 Oct", `formatLongDate` → "Monday, 19 October
2026", `formatReceiptDateTime`, `formatWhen` → "Today, 10:30 AM", `lagosDateKey`,
`normalizePlate` / `formatPlate` → "KJA 482 FX" / "—", `formatPaymentMethod`. All `Intl`, all
`Africa/Lagos`.

## Testing

Vitest + Testing Library + jsdom, files next to the code. Server-side tests (proxy, server client,
refresh) run in the Node environment (`// @vitest-environment node`). Tests mock `fetch` or the
feature service modules; nothing reaches a real API.

## Deploy (Vercel)

1. Import the `carwash-web` repository in Vercel. Framework preset: **Next.js** (build `npm run
build`, output handled by Vercel). Install command `npm ci`.
2. Settings → General → **Node.js version 24.x** (matches `.nvmrc` and `engines`).
3. Environment variables (Production and Preview):
   - `NEXT_PUBLIC_APP_NAME` = `Cartory Wash`
   - `API_INTERNAL_BASE_URL` = the Render API URL **with `/v1`**, e.g. `https://cartory-api.onrender.com/v1`
   - `API_SECURITY_KEY` = the same secret as the API's `API_SECURITY_KEY` (at least 32 characters)
4. Add the Vercel domain to the API's `CORS_ORIGINS` on Render (defence in depth: the browser
   never calls the API directly).

Cookies are `Secure` in production, so the deployed app must be served over HTTPS (Vercel does
this). CI (`.github/workflows/ci.yml`) runs `npm ci`, typecheck, lint, test and build on Node 24
for every pull request and push to `main`.
