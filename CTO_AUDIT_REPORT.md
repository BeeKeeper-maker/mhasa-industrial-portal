# CTO Pre-Delivery Audit Report
### MHASA Corporate Website — Next.js 16 · TypeScript 5 · Prisma · NextAuth

**Audit performed:** 2024-Q4 pre-delivery review
**Auditor role:** Principal Software Architect / Fractional CTO
**Project root:** `/home/z/my-project/`
**Method:** Static review of all `src/`, `prisma/`, `public/`, and root config files + execution of `bunx tsc --noEmit` and `bun run lint`.

---

## Executive Summary

**Verdict: ❌ NOT READY for delivery.** The application is functionally feature-complete (14+ worklog rounds, 35+ features) but ships with **configuration defects that hide TypeScript errors at build time, hardcoded production credentials in the UI, a weak NextAuth secret fallback, no App Router error boundaries, and a non-standard single-route architecture that breaks SEO/a11y expectations**.

| Severity | Count |
|---|---|
| 🔴 Critical (blocks delivery) | **8** |
| 🟠 High | **11** |
| 🟡 Medium | **14** |
| 🟢 Low | **9** |
| **Total findings** | **42** |

### Headline issues

1. `next.config.ts` has `typescript.ignoreBuildErrors: true` and `reactStrictMode: false` — **the production build silently swallows every TS error**. There are currently **23 TypeScript errors** in `src/` that would block a clean build.
2. `src/lib/auth.ts:66` ships a hardcoded fallback NextAuth secret `"mhasa-dev-secret-change-in-production-2024"`, and `.env` does not define `NEXTAUTH_SECRET` — so production will silently use the public dev secret, allowing JWT forgery.
3. `src/components/admin/admin-overlay.tsx:108,193-197` hardcodes the admin email **and the admin password** (`Admin@2024`) into the deployed UI as "Demo Credentials". This must be removed before delivery.
4. `prisma/seed.ts:15` seeds the production database with a weak known password (`Admin@2024`). The seeded admin user must be force-prompted to change it on first login.
5. The app uses **Zustand view-state routing** instead of the Next.js App Router. The "single visible `/` route" constraint noted in the worklog should be revisited — see Architecture Recommendations §A.
6. No `src/middleware.ts`, no `error.tsx`, no `loading.tsx`, no `global-error.tsx`, no `robots.ts`, no `manifest.ts` (uses `public/manifest.json` instead).
7. File-upload endpoint (`/api/careers/apply`) accepts **any MIME type, any size**, and stores the resume as a base64 data URL inside SQLite — a denial-of-service and disk-fill risk.
8. ESLint config disables ~30 essential rules (`@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps`, `no-console`, `prefer-const`, `no-unreachable`, …) — the "0 lint errors" claim in the worklog is a false positive.

### Top 5 critical issues (detailed)

| # | File:Line | Issue |
|---|---|---|
| C1 | `next.config.ts:6` | `typescript.ignoreBuildErrors: true` masks 23 compile errors |
| C2 | `src/lib/auth.ts:66` | Hardcoded NextAuth secret fallback; no env var set |
| C3 | `src/components/admin/admin-overlay.tsx:108,194-196` | Admin email + password hardcoded into shipped UI |
| C4 | `src/app/api/careers/apply/route.ts:29-33` | File upload with no MIME/size validation, stored as base64 in SQLite |
| C5 | `eslint.config.mjs:10-44` | ~30 ESLint rules disabled — lint cleanliness claim is false |

---

## Critical Issues (Must Fix Before Delivery)

### C1. `ignoreBuildErrors` and disabled React Strict Mode hide 23 TypeScript errors
- **File**: `next.config.ts:5-8`
- **Problem**: 
  ```ts
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  ```
  `bunx tsc --noEmit` reports **23 errors in `src/`** (plus 4 in `examples/` and `skills/` which are correctly excluded from the build but not from `tsconfig.json`'s `include` glob). Because the build ignores these, the production bundle ships with type holes that produce runtime bugs.
- **Impact**: Production runtime defects that TypeScript was supposed to catch. Examples already in the codebase:
  - `src/components/views/home-view.tsx:708` uses `pick()` but it is **never destructured from `useLocale()`** in `CTASection` → runtime `ReferenceError` when locale is Arabic.
  - `src/components/views/home-view.tsx:145` references `current.ctaTextAr` which is **not on `HeroSlideDTO`** → undefined at runtime; Arabic CTA falls back silently.
  - `src/components/admin/charts/index.tsx:275,323` pass `fetchStats` directly as a queryFn (signature mismatch) — Recharts incorrectly typed as `{}`; `data.contentCounts` and `data.topCategories` will throw at runtime when admin opens the Overview tab.
  - `src/components/admin/admin-dashboard.tsx:135-136` passes `"settings"` and `"activity"` to `ResourceManager` but `ResourceKey` excludes those values — runtime comparison in `resource-manager.tsx:102,105` always falls through.
- **Fix**: 
  1. Set `typescript.ignoreBuildErrors: false` and `reactStrictMode: true` in `next.config.ts`.
  2. Add `eslint: { ignoreDuringBuilds: false }` (default — remove any override).
  3. Fix all 23 TypeScript errors (see "Files to Create/Modify Summary" below).
  4. Re-run `bunx tsc --noEmit` until clean.

### C2. Hardcoded NextAuth secret fallback + missing env var
- **File**: `src/lib/auth.ts:66`, `.env` (only contains `DATABASE_URL`)
- **Problem**: 
  ```ts
  secret: process.env.NEXTAUTH_SECRET ?? "mhasa-dev-secret-change-in-production-2024",
  ```
  `.env` does **not** define `NEXTAUTH_SECRET`, so production silently uses the public dev secret. Anyone who reads the public GitHub repo can forge a valid JWT and access the admin API.
- **Impact**: Complete authentication bypass. **CVSS ~9.8 (Critical).**
- **Fix**:
  1. Remove the `?? "..."` fallback so the app **fails fast** if `NEXTAUTH_SECRET` is unset:
     ```ts
     const secret = process.env.NEXTAUTH_SECRET;
     if (!secret) throw new Error("NEXTAUTH_SECRET must be set");
     ```
  2. Generate a 64-byte random hex secret (`openssl rand -hex 64`) and add it to `.env` / deployment env vars.
  3. Add `.env.example` documenting all required vars (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV`).
  4. Run `git log --all -p -- .env` to confirm the secret was never committed; if it was, rotate immediately.

### C3. Admin credentials hardcoded in shipped UI
- **File**: `src/components/admin/admin-overlay.tsx:108,194-197`, `prisma/seed.ts:15,27,569`
- **Problem**:
  ```tsx
  const [email, setEmail] = useState("admin@mhaksa.com");   // line 108
  ...
  <p>Email: admin@mhaksa.com</p>                              // line 195
  <p>Password: Admin@2024</p>                                 // line 196
  ```
  The login form pre-fills the admin email and displays the password to any visitor who opens the Admin overlay. `prisma/seed.ts` seeds the production DB with this same password.
- **Impact**: Any visitor can read the credentials off the screen and log into the admin panel. **Authentication effectively public.**
- **Fix**:
  1. Delete the entire "Demo Credentials" panel (`admin-overlay.tsx:193-197`).
  2. Remove the default value from `useState("admin@mhaksa.com")` → `useState("")`.
  3. Update `prisma/seed.ts` to either:
     - Skip seeding the admin user if one already exists, OR
     - Generate a random password at seed time and log it **once** to the server console (never to the client).
  4. Force password change on first login (add `mustChangePassword: Boolean` to `User` schema).
  5. Rotate the existing admin password immediately before delivery.

### C4. File upload endpoint accepts any MIME / any size, stored as base64 in SQLite
- **File**: `src/app/api/careers/apply/route.ts:20-33`
- **Problem**:
  ```ts
  const resumeFile = formData.get("resume") as File | null;
  if (resumeFile && resumeFile.size > 0) {
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    resumeUrl = `data:${resumeFile.type};base64,${buffer.toString("base64")}`;
  }
  ```
  No MIME-type whitelist, no size limit, no virus scan, no extension validation. The file is then persisted into a SQLite TEXT column via Prisma (`JobApplication.resumeUrl`). A malicious 100 MB upload is fully buffered in memory and then base64-encoded (33% larger) before being written to the DB.
- **Impact**:
  - **Denial of service**: a single 50 MB upload will OOM the Node process and bloat the SQLite file.
  - **Stored XSS via SVG**: an attacker can upload `evil.svg` containing script; if the admin downloads/views it inline in a browser, script executes in the admin origin.
  - **DB bloat**: base64 resumes grow the SQLite file indefinitely with no cleanup path.
- **Fix**:
  1. Whitelist MIME types: `["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]`.
  2. Enforce 5 MB max size: `if (resumeFile.size > 5 * 1024 * 1024) return fail("Resume must be ≤ 5 MB", 413);`
  3. Validate file signature (magic bytes), not just the declared MIME.
  4. Store the file in object storage (S3 / OSS / local disk under `/uploads/`) — never in the database.
  5. Generate an unguessable filename (e.g., `crypto.randomUUID() + ext`) and serve via a streaming endpoint with `Content-Disposition: attachment`.
  6. Add a cleanup cron to delete unclaimed resumes after 90 days.

### C5. ESLint config disables ~30 critical rules — "0 errors" claim is misleading
- **File**: `eslint.config.mjs:9-45`
- **Problem**: The ESLint config disables nearly every rule that catches real bugs:
  - `@typescript-eslint/no-explicit-any` → off (allows `args?: any` in `crud-factory.ts`)
  - `@typescript-eslint/no-unused-vars` → off (allows dead imports/vars)
  - `@typescript-eslint/no-non-null-assertion` → off
  - `@typescript-eslint/ban-ts-comment` → off (allows `@ts-ignore`)
  - `react-hooks/exhaustive-deps` → off (allows stale-closure bugs)
  - `@next/next/no-img-element` → off (allows raw `<img>` — performance/a11y hit)
  - `prefer-const` → off
  - `no-unreachable`, `no-fallthrough`, `no-useless-escape` → off
  - `no-console`, `no-debugger` → off
- **Impact**: Lint cleanliness is reported as "0 errors" in the worklog, but the linter is effectively a no-op. Real bugs (e.g., unused imports, stale closures, `<img>` instead of `<Image>`, unreachable code) pass silently.
- **Fix**:
  1. Remove **all** rule overrides — use the default `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` rule set.
  2. Re-run `bun run lint` and fix every error.
  3. Add `eslint: { ignoreDuringBuilds: false }` to `next.config.ts` so lint errors block the build.
  4. Add a `lint-staged` hook (via Husky) so pre-commit runs ESLint with `--max-warnings 0`.

### C6. No Next.js App Router error boundaries (`error.tsx`, `global-error.tsx`, `loading.tsx`)
- **Files**: missing — `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/loading.tsx`
- **Problem**: Only `src/app/not-found.tsx` exists. Any unhandled runtime error in a Server Component, route handler, or the root layout will render the default Next.js red error page or a blank screen. There is no `loading.tsx`, so navigating between lazy-loaded views shows nothing while the chunk downloads.
- **Impact**: Poor UX and lost conversions; users hitting a server error have no recovery path. A single API timeout in the home view currently crashes the entire page.
- **Fix**: Create:
  - `src/app/error.tsx` (client component) — branded error card with "Try Again" button calling `reset()`.
  - `src/app/global-error.tsx` — fallback for errors in the root layout itself (must render its own `<html>/<body>`).
  - `src/app/loading.tsx` — full-page skeleton matching the home view structure.

### C7. No `middleware.ts` — admin API routes have no defense-in-depth guard
- **Files**: missing — `src/middleware.ts`
- **Problem**: All `/api/admin/*` routes call `requireAdmin()` inside the handler (good), but there is no middleware-level guard. This means:
  - Every admin route pays the cost of `getServerSession()` on every request.
  - There is no centralized rate limiting for admin endpoints (only the public `contact`/`apply`/`newsletter` routes are rate-limited).
  - There is no CSRF protection on session-cookie-authenticated mutations.
- **Impact**: Brute-force and CSRF attacks against admin endpoints are easier than necessary.
- **Fix**:
  1. Add `src/middleware.ts` that intercepts `/api/admin/*` and short-circuits with 401 if no session cookie is present.
  2. Add rate-limiting for admin login (`/api/auth/[...nextauth]`) — currently unthrottled.
  3. Add CSRF token check for all mutation routes (or use `SameSite=Strict` cookies).

### C8. In-memory rate limiter does not survive restarts and is per-process
- **File**: `src/lib/rate-limit.ts:11`
- **Problem**:
  ```ts
  const buckets = new Map<string, Bucket>();
  ```
  The token-bucket map lives in module memory. Under serverless/standalone deployment with multiple workers (or restarts), each process has its own map — an attacker distributing requests across workers gets N× the rate limit. A restart wipes all buckets.
- **Impact**: Rate limits are ineffective in production multi-process deployments. The contact/apply/newsletter endpoints are effectively unthrottled.
- **Fix**: Move rate-limit state to a shared store:
  - **Simpler**: Upstash Redis with `@upstash/ratelimit` (serverless-friendly).
  - **Self-hosted**: `ioredis` against a Redis container.
  - **Single-process workaround (NOT recommended for prod)**: document that the deployment MUST be single-process and set `NEXT_PRIVATE_WORKER_COUNT=1`.

---

## High Priority Issues

### H1. `tsconfig.json` is missing strict flags
- **File**: `tsconfig.json:11-13`
- **Problem**: `strict: true` is set, but `noImplicitAny: false` overrides it, and the following are missing:
  - `noUnusedLocals` / `noUnusedParameters` (dead code accumulates silently)
  - `noImplicitReturns` (functions silently return `undefined`)
  - `noFallthroughCasesInSwitch`
  - `forceConsistentCasingInFileNames` (already default in TS 5+ but should be explicit)
  - `exactOptionalPropertyTypes` (catches `x?: T | undefined` vs `x?: T` bugs)
- **Fix**: Add the flags above, then fix the resulting errors.

### H2. ResourceKey type doesn't include `"settings"` and `"activity"` — runtime comparison is dead code
- **Files**: `src/components/admin/resource-configs.ts:25-27`, `src/components/admin/resource-manager.tsx:102,105`, `src/components/admin/admin-dashboard.tsx:135-136`
- **Problem**: `ResourceKey` is `"services" | "projects" | ... | "stats"` — **no** `"settings"` or `"activity"`. But `admin-dashboard.tsx:135-136` passes those strings to `<ResourceManager resource="settings" />`, and `resource-manager.tsx:102,105` does `if (resource === "settings") return <SettingsManager />`. Both are TypeScript errors (C1) AND the special-case branches never execute because the type system prevents the comparison.
- **Impact**: Clicking "Site Settings" or "Activity Log" in the admin sidebar renders the generic CRUD list — settings & activity are unreachable in the admin UI.
- **Fix**: Either widen `ResourceKey` to include `"settings" | "activity"` and keep the special-case branches, **or** add separate tab components for those two (cleaner).

### H3. `HeroSlideDTO` is missing `ctaTextAr` — Arabic CTA silently falls back
- **Files**: `src/lib/types.ts:170-179`, `src/components/views/home-view.tsx:145`, `prisma/schema.prisma:331` (has `ctaTextAr`), `src/lib/validations.ts:162-172` (no `ctaTextAr`)
- **Problem**: The Prisma model has `ctaTextAr`, but the DTO omits it. The home view calls `pick(current.ctaText, current.ctaTextAr)` — at runtime `ctaTextAr` is `undefined` (TS error, but `pick` swallows it). The Zod `heroSlideSchema` also omits `ctaTextAr`, so even if the admin sends it, the API drops it on validation.
- **Impact**: Arabic hero CTA button text can never be customized; always shows the English value or the default.
- **Fix**:
  1. Add `ctaTextAr: string | null` to `HeroSlideDTO` in `src/lib/types.ts:179`.
  2. Add `ctaTextAr: z.string().optional().nullable()` to `heroSlideSchema` in `src/lib/validations.ts:169`.
  3. Add `ctaTextAr` field to the `heroes` config in `src/components/admin/resource-configs.ts:199-215`.

### H4. No pagination on admin list endpoints — returns ALL records
- **Files**: `src/lib/crud-factory.ts:22-30` (`makeListHandler`), `src/app/api/admin/leads/route.ts:18-22`, `src/app/api/admin/applications/route.ts:17-22`, `src/app/api/admin/activity/route.ts:13-17`
- **Problem**: Every admin GET list endpoint calls `model.findMany({ orderBy })` with no `take`/`skip`. As leads/applications/activity logs grow, the response payload grows unbounded. The activity endpoint has `take: 100`, but leads and applications do not.
- **Impact**: Slow admin UI as data grows; potential OOM on very large tables.
- **Fix**: Add `?page=1&pageSize=50` query parsing in `makeListHandler`, return `{ items, total, page, pageSize }` using the existing `PaginatedResponse<T>` type in `types.ts:209-214`.

### H5. Public search endpoint has no `take` limit and no input length cap
- **File**: `src/app/api/search/route.ts`
- **Problem**: `q.length < 2` is the only guard. The query is built with `contains` (case-insensitive on SQLite), and each `findMany` has `take: 5` (good), but the endpoint accepts arbitrarily long query strings and `parseJsonArray(null)` on line 59 is dead code (always returns `[]`).
- **Impact**: Minor — DoS via 100 KB query strings passed to SQLite LIKE; dead code confusion.
- **Fix**: Cap `q.length > 100` and return 400; remove the dead `parseJsonArray(null)` call.

### H6. `crud-factory.ts` uses `args?: any` for Prisma delegates
- **File**: `src/lib/crud-factory.ts:13,33,96-98`
- **Problem**: The Prisma-delegate types are hand-rolled with `any` to dodge Prisma's complex generic delegate types. This loses type-safety on `findMany`, `create`, `update`, `delete` arguments and return types.
- **Fix**: Use Prisma's built-in delegate types — `Prisma.ProjectDelegate`, `Prisma.ServiceDelegate`, etc. — or generic `Prisma.ModelDelegate<T>` via `db[Model]`. This is the single biggest type-safety win in the codebase.

### H7. `ReactMarkdown` renders user-controlled content without URL sanitization
- **File**: `src/components/views/news-view.tsx:368`
- **Problem**: Blog post `content` (markdown authored by admins) is rendered with `<ReactMarkdown components={markdownHeadingComponents}>`. By default `react-markdown` does NOT render raw HTML (no `rehype-raw`), so XSS via inline HTML is blocked. **However**, there is no `remark-gfm` URL sanitization and no `allowedSchemes` filter — a markdown link like `[click](javascript:alert(1))` would be rendered as `<a href="javascript:alert(1)">`. (Recent `react-markdown` versions DO filter `javascript:` URLs, but it's worth being explicit.)
- **Fix**: Add explicit URL sanitization:
  ```ts
  <ReactMarkdown
    components={markdownHeadingComponents}
    urlTransform={(url) => /^https?:/i.test(url) || url.startsWith("#") ? url : ""}
  >
  ```

### H8. `useSiteData` refetches on every mount; no SSR / no initial data
- **File**: `src/lib/hooks/use-queries.ts:32-38`
- **Problem**: `staleTime: 5 * 60 * 1000` is OK, but every component mounting calls `useSiteData()` — there's no `initialData` and no SSR. The home view shows skeletons for ~500 ms on every cold load. Combined with the fact that all views are client components, this defeats Next.js's RSC data-fetching.
- **Fix**: Convert the home view (at minimum) to a Server Component that fetches site data with `fetch()` + `next: { revalidate: 300 }` and passes it as props. Hydrate the React Query cache via `<HydrationBoundary state={dehydrate(queryClient)}>`. See Architecture Recommendations §B.

### H9. Public API routes have no `Cache-Control` / `revalidate` headers
- **Files**: `src/app/api/public/site/route.ts`, `src/app/api/public/projects/route.ts`, `src/app/api/public/blog/route.ts`, etc.
- **Problem**: Every public GET endpoint hits the database on every request. Next.js does not cache route handlers by default.
- **Fix**: Either:
  - Add `export const revalidate = 300;` to each route (Full Route Cache), OR
  - Wrap responses with `NR.json(data, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=86400" } })`.

### H10. Resume download in admin uses raw `<a href>` on a data URL
- **File**: `src/components/admin/panels/applications.tsx:285`
- **Problem**: `<a href={app.resumeUrl as string} download>` where `resumeUrl` is a base64 data URL. This works for small PDFs but:
  - Bloated URLs (multi-MB base64 strings) freeze the browser tab.
  - No content-type sniffing.
  - Vulnerable to stored XSS if a `data:text/html` payload sneaks through (see C4).
- **Fix**: After implementing C4 (object storage), link to a streaming download endpoint `/api/admin/applications/[id]/resume` that sets `Content-Disposition: attachment` and streams the file.

### H11. Single-route Zustand architecture is a major SEO/a11y/UX regression
- **Files**: `src/lib/store.ts`, `src/components/site/view-router.tsx`, `src/app/page.tsx`, `src/app/sitemap.ts`
- **Problem**: The entire site is one `/` route. "Navigation" calls `setView()` which mutates Zustand state — the URL **never changes**. Consequences:
  - **No deep linking**: a user on `/about` who refreshes lands back on home.
  - **No browser back/forward**: the browser history has only one entry. (Worklog claims smooth view transitions, but the user loses their place on back.)
  - **SEO**: `sitemap.ts` lists 12 views but they all map to the same URL (`https://mhaksa.com`). Google sees one page. The "priorities" in the sitemap are useless.
  - **Analytics**: cannot tell which "page" a visitor is on without custom events.
  - **Sharing**: cannot share a link to a specific project, blog post, or job.
  - **Accessibility**: screen readers cannot use `aria-current="page"` properly; the document title never changes.
  - **Code splitting**: ViewRouter lazy-loads views, but without URL routing there's no `next/link` prefetching.
- **Impact**: Severe — defeats the entire purpose of using Next.js App Router.
- **Recommendation**: Implement proper multi-route App Router architecture. See "Architecture Recommendations §A" below.

---

## Medium Priority Issues

### M1. No `loading.tsx` for the root segment → no streaming SSR
- **Files**: missing — `src/app/loading.tsx`
- **Fix**: Add a branded skeleton loader.

### M2. `manifest.json` lives in `/public` instead of using `src/app/manifest.ts`
- **Files**: `public/manifest.json`, `src/app/layout.tsx:120`
- **Problem**: Next.js 13+ supports `app/manifest.ts` for type-safe, dynamic manifest generation. The current setup duplicates the brand colors in two places (`manifest.json` and `layout.tsx:81`).
- **Fix**: Migrate to `src/app/manifest.ts`.

### M3. `robots.txt` is a static file, not `src/app/robots.ts`
- **Files**: `public/robots.txt`
- **Problem**: Same as M2 — Next.js supports `app/robots.ts` for type-safe, dynamic generation. Also, the current `robots.txt` doesn't reference the Arabic locale.
- **Fix**: Migrate to `src/app/robots.ts` and include `Host: https://mhaksa.com`.

### M4. No `hreflang` alternate URLs for EN/AR
- **File**: `src/app/layout.tsx:75`
- **Problem**: `alternates.languages` is set to `{ "en-US": "/", "ar-SA": "/?lang=ar" }`, but the `?lang=ar` query param is not actually consumed by any middleware or layout — it does nothing. The `RtlRoot` component reads locale from Zustand's persisted state, not from the URL.
- **Fix**: Either implement proper routing (Architecture §A) or at minimum parse `?lang=` in middleware and set the initial Zustand state.

### M5. JSON-LD schema is incomplete
- **File**: `src/app/layout.tsx:91-115`
- **Problem**: Only an `Organization` schema is emitted. Missing:
  - `WebSite` schema (enables sitelinks search box)
  - `BreadcrumbList` for blog posts and projects
  - `JobPosting` for each open job (Google for Jobs)
  - `FAQPage` for the FAQ view
  - `Article` for blog posts
- **Fix**: Add per-view JSON-LD via a `<script>` tag in each view's server component.

### M6. `next/font` loaded but Tailwind theme doesn't reference the CSS variables in `tailwind.config.ts`
- **File**: `src/app/layout.tsx:7-18`, `tailwind.config.ts`
- **Problem**: `Inter` and `Poppins` are loaded with `variable: "--font-inter"` / `--font-poppins`, applied to `<body>` via the className. Need to confirm `tailwind.config.ts` extends the `fontFamily` theme with these variables. (Likely already done — verify.)

### M7. `<Card onClick=...>` without `role="button"` / `tabIndex` / keyboard handler
- **Files**: `src/components/site/cards.tsx:34,95,230`
- **Problem**: Three Card components are clickable via `onClick` but lack:
  - `role="button"`
  - `tabIndex={0}`
  - `onKeyDown` handler for Enter/Space
  - Visual focus ring
- **Impact**: Keyboard users cannot navigate cards; screen readers don't announce them as interactive.
- **Fix**: Either wrap card content in a real `<button>` (preferred for a11y) or add the ARIA attributes + keyboard handler.

### M8. `react-hooks/exhaustive-deps` is disabled — likely stale closures
- **File**: `eslint.config.mjs:21`
- **Problem**: With the rule disabled, several `useEffect` calls are likely missing dependencies. Quick spot-check of `src/components/views/home-view.tsx:56` (hero auto-advance) and `587` (stat counter) shows effects with no deps array at all or partial deps.
- **Fix**: Re-enable the rule and fix every warning.

### M9. `useEffect` count is high (32 across components) — potential over-rendering
- **File**: multiple
- **Problem**: 32 `useEffect` calls across `src/components/` suggests some are doing work that could be done in event handlers or derived state. Each unnecessary effect causes an extra render cycle.
- **Fix**: Audit each `useEffect` — many can be replaced with `useMemo`, event handlers, or moved to Server Components.

### M10. No structured error response format on API errors
- **Files**: `src/lib/api.ts:17-19` (`fail()`), various route handlers
- **Problem**: Error responses return `{ success: false, error: "string" }`. There's no error code, no field-level errors for form validation, no request ID for debugging. The contact form joins Zod issues with `;` and returns them as a single string — the client cannot programmatically map errors back to fields.
- **Fix**: Extend `ApiResponse`:
  ```ts
  interface ApiError { code: string; message: string; field?: string; }
  interface ApiResponse<T> { success: boolean; data?: T; error?: string; errors?: ApiError[]; requestId?: string; }
  ```
  Have `fail()` accept either a string or an array of `ApiError`. Update Zod parsing to emit `errors: issues.map(i => ({ code: "VALIDATION", field: i.path.join("."), message: i.message }))`.

### M11. `ActivityLog.userId` relation uses `SetNull` on delete — orphaned audit trail
- **File**: `prisma/schema.prisma:45`
- **Problem**: When a User is deleted, their activity logs have `userId` set to NULL. This is reasonable for audit-trail preservation, but the log entries lose attribution. Better to keep the user's email/name snapshot in the log itself.
- **Fix**: Add `userEmail String?` and `userName String?` to `ActivityLog` and snapshot them at log time.

### M12. `BlogPost.views` increment is fire-and-forget with no concurrency control
- **File**: `src/app/api/public/blog/route.ts:24`
- **Problem**: `db.blogPost.update({ data: { views: { increment: 1 } } }).catch(() => {})` — swallowed errors, no debouncing (refresh = +1), no unique-user tracking. Stats are inflated and unreliable.
- **Fix**: Track views via a separate `BlogView` table with `(postId, ip, day)` unique constraint, or use a counter service (Redis INCR) with a 24-hour per-IP dedupe.

### M13. No environment variable validation at boot
- **File**: missing — should be `src/lib/env.ts`
- **Problem**: No `z.object({ ... }).parse(process.env)` at app startup. Missing env vars fail silently at runtime (e.g., the NextAuth secret fallback in C2).
- **Fix**: Create `src/lib/env.ts` with Zod-validated env schema; call it once in `next.config.ts` and once in `src/lib/db.ts` / `src/lib/auth.ts`.

### M14. `parseJsonArray` / `stringifyArray` boilerplate repeated across routes
- **Files**: every public/admin route that touches `features`, `tags`, `galleryImages`, `requirements`
- **Problem**: SQLite has no array type, so arrays are stored as JSON strings. Every read/write requires manual `parseJsonArray`/`stringifyArray`. This is error-prone (easy to forget one column).
- **Fix**: Add Prisma `Json` type to these columns (`features Json?`, etc.) and Prisma will auto-serialize. Or write a thin mapper utility per model.

---

## Low Priority Issues

### L1. `next-env.d.ts` is committed
- **File**: `next-env.d.ts`
- **Problem**: Auto-generated by Next.js; should be gitignored (it already is in `.gitignore`).
- **Fix**: `git rm --cached next-env.d.ts` (no behavior change).

### L2. `dev.log` and `server.log` are committed and growing
- **Files**: `dev.log`, `.gitignore:39-40`
- **Problem**: `dev.log` is gitignored but exists in the working tree (507 bytes, contains a `[next-auth][warn][NEXTAUTH_URL]` warning that confirms C2).
- **Fix**: No action needed for delivery; ensure `.gitignore` covers `server.log` (it does, line 41).

### L3. `.env` is committed to the repo
- **File**: `.env`
- **Problem**: `.gitignore:32` says `.env*` is ignored, but `.env` exists in the working tree. Confirm it's not in git history.
- **Fix**: `git log --all --full-history -- .env` — if it was ever committed, rotate `DATABASE_URL` and any other values.

### L4. `tsconfig.json` `include` glob picks up `examples/` and `skills/`
- **File**: `tsconfig.json:32-38`
- **Problem**: The `include: ["**/*.ts", "**/*.tsx"]` glob picks up `examples/websocket/*.ts` and `skills/image-edit/scripts/*.ts` which fail compilation (missing `socket.io-client`, etc.). The ESLint config correctly ignores these (`eslint.config.mjs:47`), but `tsconfig.json` does not.
- **Fix**: Add `"exclude": ["node_modules", "examples", "skills", ".next"]` to `tsconfig.json`.

### L5. `package.json` has dependencies that are not used in `src/`
- **Files**: `package.json:17-83`
- **Problem**: A quick scan suggests `@dnd-kit/*`, `@mdxeditor/editor`, `react-syntax-highlighter`, `react-resizable-panels`, `react-day-picker`, `input-otp`, `recharts` (used in admin only), `next-intl` (i18n is custom, not next-intl), `z-ai-web-dev-sdk`, `uuid` may be unused or partially used.
- **Fix**: Run `bunx depcheck` and remove unused deps to shrink bundle and attack surface.

### L6. Hero section auto-advance uses `useEffect` with no pause-on-hover
- **File**: `src/components/views/home-view.tsx:56-XX` (verify)
- **Problem**: Carousel auto-advances every N seconds with no pause when the user hovers or when the tab is hidden.
- **Fix**: Add `onMouseEnter`/`onMouseLeave` handlers and a `document.hidden` check.

### L7. `manifest.json` references `/hero-industrial.png` (214 KB) as the icon
- **File**: `public/manifest.json:11`
- **Problem**: Using a 214 KB hero image as a PWA icon is wasteful and slow on mobile install. PWA icons should be optimized PNGs at 192×192 and 512×512.
- **Fix**: Generate proper icons via `sharp` or an icon generator; reference them in `manifest.json`.

### L8. No `<html lang>` set server-side
- **File**: `src/app/layout.tsx:118`
- **Problem**: `<html lang="en" suppressHydrationWarning>` is hardcoded. `RtlRoot` updates it client-side via `document.documentElement.lang = locale`, but the initial server render is always `en` — Arabic visitors see a flash of English before hydration.
- **Fix**: Read locale from cookie in `layout.tsx` (Server Component) and set `lang`/`dir` on `<html>` server-side.

### L9. `activity/route.ts` returns `include: { user: true }` — leaks `passwordHash`
- **File**: `src/app/api/admin/activity/route.ts:16`
- **Problem**: `include: { user: true }` returns the full `User` row including `passwordHash`, `email`, etc. The admin activity log viewer only displays `user.name`, but the JSON response includes the hash.
- **Fix**: Use `select: { user: { select: { name: true } } }` instead of `include`.

---

## Architecture Recommendations

### §A. Migrate from Zustand view-state to proper Next.js App Router routing

**Current state**: Single `/` route, Zustand holds `view: "home" | "about" | ...`, navigation calls `setView()`, URL never changes.

**Recommendation**: This is the single most impactful architectural change. The "user can only see the `/` route" sandbox constraint noted in the worklog appears to be a **sandbox restriction, not a product requirement**. For a production corporate website, proper URL routing is non-negotiable for the reasons listed in H11.

**Proposed route structure**:
```
src/app/
├── layout.tsx                    # Root layout (server component)
├── page.tsx                      # Home (/)
├── about/page.tsx                # /about
├── services/
│   ├── page.tsx                  # /services
│   └── [slug]/page.tsx           # /services/[slug]   (generateStaticParams)
├── projects/
│   ├── page.tsx                  # /projects
│   └── [slug]/page.tsx           # /projects/[slug]   (generateStaticParams)
├── gallery/page.tsx              # /gallery
├── clients/page.tsx              # /clients
├── careers/
│   ├── page.tsx                  # /careers
│   └── [slug]/page.tsx           # /careers/[slug]   (generateStaticParams)
├── news/
│   ├── page.tsx                  # /news
│   └── [slug]/page.tsx           # /news/[slug]   (generateStaticParams)
├── faq/page.tsx                  # /faq
├── contact/page.tsx              # /contact
├── legal/
│   ├── privacy/page.tsx          # /legal/privacy
│   └── terms/page.tsx            # /legal/terms
├── admin/
│   ├── layout.tsx                # Auth-gated admin layout (server)
│   └── page.tsx                  # /admin dashboard
└── api/...
```

**Migration approach** (low-risk, incremental):
1. **Phase 1** — Keep Zustand as a *secondary* navigation hint; add a `useEffect` in `RtlRoot` that syncs `window.location.pathname` → Zustand `view` on back/forward (popstate). Add `history.pushState` on `setView`. This restores back-button without rewriting anything.
2. **Phase 2** — Create new App Router pages that render the same view components (e.g., `app/about/page.tsx` → `<AboutView />`). Both the Zustand-driven `/` and the new `/about` work.
3. **Phase 3** — Convert navigation `setView("about")` calls to `<Link href="/about">`. Update `Header`/`Footer` nav.
4. **Phase 4** — Move data fetching into Server Components; use `generateStaticParams` for `[slug]` routes; remove TanStack Query for public read-only data (keep it for admin).
5. **Phase 5** — Add `[locale]` segment for proper `/en/...` and `/ar/...` bilingual routing using `next-intl` (already installed but unused).

**Effort estimate**: 3–5 days for a senior engineer.

### §B. Adopt Server Components for public pages

Currently **every** view component is `"use client"`. This means:
- No SSR data fetching — every page shows a skeleton for ~500 ms.
- No SEO benefits from server-rendered content.
- Larger JS bundle (TanStack Query, all view code ships to the client).

**Recommendation**: Convert public views to Server Components that fetch via Prisma directly (server-side) and pass typed props to client sub-components. Keep client components only where interactivity is required (forms, carousels, animations).

### §C. Replace `crud-factory.ts`'s `any` with proper Prisma types

Use Prisma's generated delegate types (`Prisma.ServiceDelegate`, etc.) or a generic helper that preserves type inference. This eliminates 5+ `as any`/`as Record<string, unknown>` casts per route file.

### §D. Adopt a transactional outbox for activity logging

Currently `logActivity` is fire-and-forget with `catch(() => {})`. If the DB write fails (e.g., DB down, constraint violation), the audit trail is silently lost. For an enterprise audit trail, use a transactional outbox pattern or at minimum log failures to a fallback sink (stderr + Sentry).

### §E. Add observability: Sentry + structured logging

There is currently no error monitoring, no structured logging, no request tracing. For a production enterprise app, add:
- `@sentry/nextjs` for error tracking.
- `pino` or `winston` for structured server logs.
- A `requestId` propagated via `X-Request-ID` header for tracing.

### §F. Replace SQLite with PostgreSQL for production

SQLite is fine for development but problematic for production multi-process deployments (file locking, no concurrent writes). The Prisma schema is DB-agnostic — switching to Postgres is a `provider = "postgresql"` change + a `DATABASE_URL` swap. This also enables `Json` column types (fixes M14), proper full-text search (better than SQLite `contains`), and native UUID.

---

## Files to Create/Modify Summary

### Batch 1 — Critical Build & Config (1 subagent, ~4h)
- [ ] `next.config.ts` — set `ignoreBuildErrors: false`, `reactStrictMode: true`, add `eslint.ignoreDuringBuilds: false`.
- [ ] `tsconfig.json` — add `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, `exactOptionalPropertyTypes`; add `examples`/`skills` to `exclude`.
- [ ] `eslint.config.mjs` — remove ALL rule overrides; keep only `ignores`.
- [ ] `.env` — add `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV`.
- [ ] `.env.example` — new file documenting all required vars.
- [ ] `src/lib/env.ts` — new file with Zod-validated env schema.
- [ ] `src/lib/auth.ts` — remove secret fallback (C2).
- [ ] `prisma/seed.ts` — remove hardcoded password; generate random; log once.

### Batch 2 — TypeScript Error Fixes (1 subagent, ~6h)
Must resolve all 23 `tsc --noEmit` errors in `src/`. Specifically:
- [ ] `src/components/views/home-view.tsx:708` — add `pick` to `useLocale()` destructure in `CTASection`.
- [ ] `src/components/views/home-view.tsx:145` — add `ctaTextAr` to `HeroSlideDTO` (see Batch 3).
- [ ] `src/components/admin/charts/index.tsx:275,323` — wrap `fetchStats` in arrow function: `queryFn: () => fetchStats(30)`.
- [ ] `src/components/admin/charts/index.tsx:287,335` — narrow `data` type after the `isLoading` guard.
- [ ] `src/components/admin/admin-dashboard.tsx:135-136` — widen `ResourceKey` or replace `settings`/`activity` tabs with dedicated components.
- [ ] `src/components/admin/resource-manager.tsx:102,105,145,157,487` — fix `ResourceKey` type; fix `unknown → ReactNode` casts.
- [ ] `src/components/admin/panels/applications.tsx:262,275` — `unknown → ReactNode` casts.
- [ ] `src/components/admin/panels/leads.tsx:279,284` — same.
- [ ] `src/components/admin/panels/newsletter.tsx:114` — same.
- [ ] `src/components/site/smart-image.tsx:8` — `ImgProps` is not exported by `react`; import only `ImgHTMLAttributes` or remove the re-export.

### Batch 3 — Security Fixes (1 subagent, ~6h)
- [ ] `src/components/admin/admin-overlay.tsx:108,193-197` — remove hardcoded credentials (C3).
- [ ] `src/app/api/careers/apply/route.ts` — add MIME whitelist, 5 MB size limit, magic-byte check, store to disk/object storage (C4).
- [ ] `src/lib/rate-limit.ts` — move to Redis-backed store (C8).
- [ ] `src/middleware.ts` — new file: admin route guard + login rate limit + CSRF check (C7).
- [ ] `src/app/api/admin/activity/route.ts:16` — use `select` not `include` (L9).
- [ ] `src/components/views/news-view.tsx:368` — add `urlTransform` to ReactMarkdown (H7).

### Batch 4 — App Router Conventions (1 subagent, ~4h)
- [ ] `src/app/error.tsx` — new client error boundary.
- [ ] `src/app/global-error.tsx` — new global error boundary.
- [ ] `src/app/loading.tsx` — new loading skeleton.
- [ ] `src/app/manifest.ts` — migrate from `public/manifest.json` (M2).
- [ ] `src/app/robots.ts` — migrate from `public/robots.txt` (M3).
- [ ] `src/app/layout.tsx` — add `WebSite` JSON-LD; read locale from cookie server-side (L8).
- [ ] `prisma/schema.prisma` — add `mustChangePassword Boolean @default(false)` to `User`.

### Batch 5 — DTO / Validation / Pagination (1 subagent, ~4h)
- [ ] `src/lib/types.ts` — add `ctaTextAr` to `HeroSlideDTO` (H3); add `errors?: ApiError[]` to `ApiResponse` (M10).
- [ ] `src/lib/validations.ts` — add `ctaTextAr` to `heroSlideSchema` (H3).
- [ ] `src/components/admin/resource-configs.ts` — add `ctaTextAr` to heroes config; widen `ResourceKey` or split (H2).
- [ ] `src/lib/crud-factory.ts` — replace `any` with Prisma delegate types (H6); add pagination support (H4).
- [ ] `src/lib/api.ts` — extend `fail()` to accept `ApiError[]` (M10).
- [ ] `src/app/api/admin/leads/route.ts`, `applications/route.ts` — add `?page&pageSize` (H4).

### Batch 6 — Accessibility & Performance (1 subagent, ~4h)
- [ ] `src/components/site/cards.tsx:34,95,230` — wrap cards in `<button>` or add ARIA + keyboard (M7).
- [ ] `src/components/views/home-view.tsx` — pause carousel on hover (L6).
- [ ] `src/app/layout.tsx` — set `<html lang/dir>` server-side (L8).
- [ ] Public API routes — add `export const revalidate = 300` (H9).
- [ ] `src/lib/hooks/use-queries.ts:32-38` — pass `initialData` from server (H8).
- [ ] Run `bunx depcheck` and remove unused deps (L5).

### Batch 7 — Architecture Migration (1 senior subagent, 3–5 days) — OPTIONAL but RECOMMENDED
- [ ] Implement proper App Router multi-route structure (§A).
- [ ] Convert public views to Server Components (§B).
- [ ] Add `generateStaticParams` for `[slug]` routes.
- [ ] Migrate i18n to `next-intl` with `[locale]` segment.
- [ ] Replace `<img>` raw tags (only 1 in `resource-manager.tsx:147`) with `<Image>`.
- [ ] Add per-view JSON-LD schemas (M5).

---

## Verification Steps After All Fixes

1. `bunx tsc --noEmit` → 0 errors.
2. `bun run lint` → 0 errors, 0 warnings.
3. `bun run build` → succeeds with `ignoreBuildErrors: false`.
4. `curl -s https://mhaksa.com/api/admin/services` → 401 (no session).
5. `curl -s -X POST https://mhaksa.com/api/careers/apply -F "resume=@evil.svg"` → 415 or 422.
6. Open admin overlay → no pre-filled email, no "Demo Credentials" panel.
7. Refresh on `/about` (after §A migration) → stays on `/about`.
8. View page source → server-rendered content visible (after §B migration).
9. Lighthouse audit → Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95.
10. Run `bunx depcheck` → no unused deps.
