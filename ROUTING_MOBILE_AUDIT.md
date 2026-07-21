# Routing & Mobile Optimization Audit

**Project:** MHASA Corporate Website — `/home/z/my-project/`
**Auditor:** Principal Next.js Architect & Mobile UX Expert
**Scope:** (1) Next.js App Router folder-based routing best practices, (2) Mobile optimization
**Method:** Static code analysis of `src/app/`, `src/components/`, `src/lib/`, `public/`, plus `next.config.ts`, `package.json`, `globals.css`. Findings verified against `worklog.md` (Tasks 1–16) and `CTO_AUDIT_REPORT.md`.

---

## Part 1: Next.js Routing Audit

### Current Architecture

The application uses a **single-route view-state architecture**:

```
src/app/page.tsx            → Server Component that renders <ViewRouter/>
src/components/site/view-router.tsx → "use client", switches on Zustand `view` state
src/lib/store.ts            → Zustand store with `view: ViewKey` (12 keys) + `selectedProjectSlug`, `selectedServiceSlug`, `selectedPostSlug`, `selectedJobSlug`
```

**How navigation works today** (e.g., user clicks "About" in header):
1. `header.tsx:121` calls `handleNav("about")` → `setView("about")` (Zustand mutation)
2. `store.ts:59` updates `view: "about"` and calls `window.scrollTo({ top: 0 })`
3. `view-router.tsx:31` switch statement returns `<AboutView/>` (lazy-loaded)
4. **URL stays `https://mhaksa.com/` — it never changes**

For "detail" pages (project, service, blog post, job), the pattern is similar but uses a parallel `selected*Slug` state. Opening project "ABC" calls `openProject("abc")` which sets `view: "projects"` + `selectedProjectSlug: "abc"`. The URL still does not change.

**Existing App Router files inventory** (verified by `ls -la src/app/`):

| File | Status | Notes |
|---|---|---|
| `src/app/layout.tsx` | ✅ Exists, Server Component | Root layout, fonts, metadata, JSON-LD Organization schema |
| `src/app/page.tsx` | ✅ Exists, Server Component | Renders `<ViewRouter/>` (client) — no SSR data fetching |
| `src/app/loading.tsx` | ✅ Exists | Spinner only; never used because no Suspense boundaries on server |
| `src/app/error.tsx` | ✅ Exists, Client | Try Again / Home buttons, error digest |
| `src/app/global-error.tsx` | ✅ Exists, Client | Catches root layout errors |
| `src/app/not-found.tsx` | ✅ Exists, Server | Branded 404 with home button |
| `src/app/sitemap.ts` | ⚠️ Exists but **useless** | Lists 12 views ALL with URL `https://mhaksa.com` — see R-04 |
| `src/app/robots.ts` | ❌ Missing | Uses static `public/robots.txt` instead |
| `src/app/manifest.ts` | ❌ Missing | Uses static `public/manifest.json` (with 214 KB hero image as icon) |
| `src/app/[locale]/` | ❌ Missing | `next-intl` is installed (`package.json:82`) but completely unused |
| `src/app/about/page.tsx`, `/services/page.tsx`, etc. | ❌ None exist | Zero nested page segments |
| `src/app/projects/[slug]/page.tsx`, `/services/[slug]/`, `/news/[slug]/`, `/careers/[slug]/` | ❌ None exist | Zero dynamic page segments |

**Server vs Client component ratio** (from `grep -rL '"use client"'`):
- **86 client files**, 75 server files
- Server files are: `layout.tsx`, `page.tsx`, `loading.tsx`, `not-found.tsx`, `sitemap.ts`, all `src/app/api/**/route.ts`, all `src/components/ui/*.tsx` primitives (only become client when imported into a client tree), `src/components/site/loading-view.tsx`, `src/components/site/icon.tsx`, `src/middleware.ts`
- **Every view component** (`src/components/views/*.tsx`) is a Client Component
- Every site-overlay component (`header`, `footer`, `floating-ui`, `quick-quote-widget`, `newsletter-widget`, `search-dialog`, `view-router`, `rtl-root`) is a Client Component

**Data fetching pattern** (verified by reading `src/lib/hooks/use-queries.ts` + all public API routes):
- 100% client-side via TanStack Query (`useQuery` / `useMutation`)
- All public API routes (`src/app/api/public/*`) are missing `export const revalidate`, `export const dynamic`, `export const fetchCache`, `export const runtime` — verified by `grep -rn "export const revalidate\|export const dynamic" src/app/api/` returning zero matches
- No `generateStaticParams` anywhere — verified by `grep -rn "generateStaticParams" src/` returning zero matches
- No `generateMetadata` anywhere — verified by `grep -rn "generateMetadata" src/` returning zero matches
- No `HydrationBoundary`, `dehydrate`, or `prefetch` usage — verified by `grep -rn "HydrationBoundary\|dehydrate\|prefetch" src/` returning only `theme-toggle.tsx` hydration comment matches

**Sandbox constraint clarification** (per `worklog.md` line 8 and CTO audit §A): The worklog states *"Only the `/` route is user-visible. All 'pages' are managed via Zustand view-state."* This is a **design choice inherited from the initial sandbox scaffold**, not a hard platform constraint. Next.js App Router fully supports multiple routes in this sandbox (the dev server runs `next dev` without route restrictions). The CTO audit (§A, line 415) explicitly states: *"This is the single most impactful architectural change. The 'user can only see the `/` route' sandbox constraint noted in the worklog appears to be a sandbox restriction, not a product requirement."* Worklog Task 15 confirms multi-route migration is "Batch 7, sandbox-constrained" — meaning the team believes the sandbox limits them, but this belief has not been verified against the actual sandbox runtime.

---

### Routing Issues Found

#### **R-01 · CRITICAL · Single-route Zustand architecture breaks SEO, accessibility, and UX**
- **Files:** `src/lib/store.ts:10-22`, `src/components/site/view-router.tsx:27-59`, `src/app/page.tsx:15-33`, `src/app/sitemap.ts:8-28`
- **Problem:** All 12 "pages" + 4 detail types (project/service/blog/job) are rendered inside a single `/` route by mutating Zustand state. The URL **never changes** during navigation.
- **Consequences:**
  - **SEO:** Google sees exactly ONE page (`https://mhaksa.com/`). The 12 sitemap entries all point to the same URL — `src/app/sitemap.ts:24` hardcodes `url: baseUrl` for every view. Search engines ignore duplicate URLs in sitemaps; the `priority`/`changeFrequency` fields are useless. Service, project, blog detail content is never independently crawlable or indexable.
  - **Deep linking:** Cannot share `https://mhaksa.com/services/pipe-installation` — the URL doesn't exist. Email signatures, social shares, paid ads all point to the bare root URL.
  - **Browser back/forward:** Pressing browser Back after navigating Home → About → Services does NOT traverse the user's path; it leaves the site entirely. `store.ts:67` calls `window.scrollTo()` but never `history.pushState()`.
  - **Accessibility:** Screen-reader users hear "page 1 of 1" indefinitely; no `aria-current="page"` on nav; no route-change announcements.
  - **Code splitting:** `view-router.tsx:15-25` lazy-loads views, but without URL routing there's no `next/link` prefetching — every first navigation pays the chunk-download cost.
  - **Analytics:** Cannot measure per-page traffic without custom event tracking; UA/GA4 pageview tracking is broken because `gtag('config', ...)` only fires once on `/`.
- **Fix:** Implement proper multi-route App Router structure. See "Routing Recommendations" below.

#### **R-02 · HIGH · No dynamic `[slug]` routes for detail content**
- **Files:** Missing `src/app/projects/[slug]/page.tsx`, `src/app/services/[slug]/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/app/careers/[slug]/page.tsx`
- **Problem:** Project, service, blog, and job detail pages are rendered by setting `selectedProjectSlug` (etc.) in Zustand (`store.ts:77-92`). URLs like `/projects/grp-pipeline-jubail` do not exist. Cannot be linked, shared, or indexed.
- **Fix:** Create 4 dynamic route segments. Use `generateStaticParams` to pre-render all slugs at build time. Move detail data fetching into the Server Component.

#### **R-03 · HIGH · No per-page metadata / no `generateMetadata`**
- **Files:** `src/app/layout.tsx:20-78` (root metadata only); zero `generateMetadata` exports anywhere
- **Problem:** All views share the root `<title>MHASA | Mohd H. Al Marhoon Cont. Est. — Pipe Installation & Industrial Solutions</title>`. The About view has the same title as the Services view. OpenGraph shares are identical for every "page". SEO titles, descriptions, canonical URLs per view are impossible.
- **Fix:** With multi-route migration (R-01), add `export const metadata: Metadata` or `export async function generateMetadata({ params })` to each `page.tsx`.

#### **R-04 · HIGH · `sitemap.ts` is functionally useless**
- **File:** `src/app/sitemap.ts:8-28`
- **Problem:** Maps 12 view names to the same URL `https://mhaksa.com`:
  ```ts
  return views.map((view) => ({
    url: baseUrl,        // ← always the same URL
    lastModified,
    changeFrequency: ...,
    priority: view.priority,  // ← meaningless without unique URLs
  }));
  ```
  Google Search Console will report "Duplicate URLs" and ignore 11 of the 12 entries.
- **Fix:** After R-01 migration, regenerate sitemap from real routes: `["/", "/about", "/services", "/services/[slug]" × N, "/projects", "/projects/[slug]" × N, ...]`. Use `generateSitemaps` for large sites.

#### **R-05 · MEDIUM · `robots.ts` and `manifest.ts` not using App Router conventions**
- **Files:** Missing `src/app/robots.ts`; missing `src/app/manifest.ts`; using `public/robots.txt` and `public/manifest.json` instead
- **Problem:** Next.js 13+ supports `app/robots.ts` and `app/manifest.ts` for type-safe, dynamic, build-time generation. Static files cannot reference environment variables (e.g., staging vs prod domains), cannot be TypeScript-typed, and bypass the App Router build pipeline.
- **Additional manifest issue:** `public/manifest.json:11` references `/hero-industrial.png` (214 KB) as the only icon — see M-09.
- **Fix:** Migrate to `src/app/robots.ts` and `src/app/manifest.ts` (CTO audit M2/M3).

#### **R-06 · MEDIUM · `next-intl` installed but completely unused — no `[locale]` segment**
- **Files:** `package.json:82` (`"next-intl": "^4.3.4"`); `src/lib/i18n.ts` (custom dictionary); `src/lib/hooks/use-locale.ts` (custom hook reading Zustand)
- **Problem:** The project ships `next-intl` but implements i18n via a custom Zustand `locale` field + `RtlRoot` setting `document.documentElement.dir` in a `useEffect`. This means:
  - The initial server-rendered HTML is always `<html lang="en">` (`layout.tsx:118`) — Arabic visitors see English flash before client-side swap.
  - The `<link rel="alternate" hreflang="ar-SA" href="/?lang=ar">` in `layout.tsx:75` points to a URL that doesn't actually serve Arabic content server-side.
  - Google cannot index an Arabic version of the site.
- **Fix:** Implement `src/app/[locale]/` segment with `next-intl`. Move `getDictionary` server-side. Render `<html lang={locale}>` from `params.locale`.

#### **R-07 · MEDIUM · Public API routes have no caching directives**
- **Files:** All 7 files in `src/app/api/public/*/route.ts` — verified by `grep -rn "export const revalidate\|export const dynamic\|export const fetchCache\|export const runtime" src/app/api/` returning **zero matches**
- **Problem:** Every public GET hits the SQLite database on every request. For a corporate site with mostly-static content (services, projects, team, testimonials), this is wasteful. Combined with client-side fetching (R-08), this means every visitor pays a DB round-trip on every page load.
- **Fix:** Add `export const revalidate = 300;` (5 min ISR) or `export const dynamic = "force-static";` to each public GET route. Better: with multi-route migration, fetch this data in Server Components and let Next.js Full Route Cache handle it.

#### **R-08 · MEDIUM · 100% client-side data fetching — no SSR/SSG data**
- **Files:** `src/lib/hooks/use-queries.ts` (all hooks), `src/components/views/*.tsx` (all views call these hooks)
- **Problem:** No Server Component fetches data. The Server Component `src/app/page.tsx` renders only `<ViewRouter/>` which is a Client Component. The browser receives an HTML shell with no content, then JS downloads, then React Query fires 7+ API calls (`/api/public/site` returns settings/heroes/stats/services/clients/testimonials/faqs in one call — good consolidation), then content renders.
- **Consequences:**
  - **SEO:** Search engine crawlers see an empty `<main></main>` shell. Googlebot can execute JS but it's slower and lower-priority; Bing/DuckDuckGo/Baidu often do not.
  - **FCP/LCP:** First Contentful Paint waits for: HTML → JS bundle → React hydration → API round-trip → render. Should be: HTML (with data already inlined) → hydrate.
  - **No streaming:** Cannot use React `Suspense` + server `await` to stream content as it resolves.
- **Fix:** With multi-route migration (R-01), move data fetching into Server Components. Keep TanStack Query only for admin (where auth requires client-side) and interactive mutations.

#### **R-09 · LOW · `middleware.ts` matcher only protects `/api/admin/*` — no locale or auth redirects**
- **File:** `src/middleware.ts:32-34` — `matcher: ["/api/admin/:path*"]`
- **Problem:** Middleware runs only on admin API routes. No opportunity to:
  - Redirect `/about` to `/en/about` or `/ar/about` based on `Accept-Language` header
  - Redirect `?lang=ar` to `/ar` (legacy query-param locale)
  - Add security headers (`X-Frame-Options`, `Content-Security-Policy`, etc.) globally
  - Implement geo-based redirects
- **Fix:** Expand matcher to `["/((?!api|_next|favicon|robots|sitemap|manifest|.*\\.).*)"]` and add locale/security logic.

#### **R-10 · LOW · Root `page.tsx` is technically a Server Component but does no server work**
- **File:** `src/app/page.tsx:15-33`
- **Problem:** `Home()` is a Server Component (no `"use client"`), but it only renders `<RtlRoot>`, `<Header>`, `<main><ViewRouter/></main>`, `<Footer>`, and 6 overlay components — all of which are Client Components. The Server Component boundary is purely nominal; no `fetch()`, no `await db.`, no metadata generation happens here. This means the App Router's server capabilities are unused at the page level.
- **Fix:** After multi-route migration, `src/app/page.tsx` should `await db.heroSlide.findMany(...)` etc. and pass data as props to client islands.

---

### Routing Recommendations

#### **Is multi-route migration necessary?**

**Yes — for a production corporate website, this is non-negotiable.** The current architecture fails on every dimension that matters for a corporate marketing site:

| Dimension | Current (single-route) | Multi-route (target) |
|---|---|---|
| SEO | 1 indexable URL | 50+ indexable URLs (12 pages + ~30 slugs + paginated lists) |
| Deep linking | Impossible | Standard |
| Browser back/forward | Broken (exits site) | Standard |
| Per-page analytics | Requires custom events | Standard `pageview` |
| Per-page metadata | Impossible | `generateMetadata` per route |
| OG/Twitter cards | Same for all "pages" | Unique per page |
| Lighthouse SEO score | Likely 60–70 | 95–100 |
| Code splitting | Lazy but no prefetch | `next/link` prefetch on hover/viewport |

#### **Clarifying the sandbox constraint**

The worklog states: *"Constraint: Only the `/` route is user-visible."* This is **interpreted by the dev team as a platform restriction**, but it appears to actually be:
- Either (a) a sandbox preview limitation (the preview iframe shows `/` by default but the app can serve other routes), OR
- (b) a self-imposed architectural decision documented as a constraint.

**Verification step (no code change needed):** Run `bun run dev`, then `curl http://localhost:3000/about` — if it returns 404 (Next.js default not-found), then the App Router truly has no `/about` route (current state). If a `src/app/about/page.tsx` is added and `curl /about` returns 200, then the sandbox permits multi-route. The CTO audit (§A, line 415) asserts the latter.

#### **Proposed route structure (phased migration)**

```
src/app/
├── layout.tsx                          (root: html, body, fonts, providers)
├── page.tsx                            (home — server component with data fetch)
├── loading.tsx                         ✓ exists
├── error.tsx                           ✓ exists
├── global-error.tsx                    ✓ exists
├── not-found.tsx                       ✓ exists
├── robots.ts                           (NEW — replace public/robots.txt)
├── manifest.ts                         (NEW — replace public/manifest.json)
├── sitemap.ts                          (REWRITE — list real URLs)
├── about/page.tsx                      (NEW — server component, static)
├── services/
│   ├── page.tsx                        (NEW — server, fetch services)
│   └── [slug]/page.tsx                 (NEW — generateStaticParams + generateMetadata)
├── projects/
│   ├── page.tsx                        (NEW)
│   └── [slug]/page.tsx                 (NEW)
├── gallery/page.tsx                    (NEW)
├── clients/page.tsx                    (NEW)
├── careers/
│   ├── page.tsx                        (NEW)
│   └── [slug]/page.tsx                 (NEW)
├── news/
│   ├── page.tsx                        (NEW)
│   └── [slug]/page.tsx                 (NEW)
├── contact/page.tsx                    (NEW — form is client island)
├── faq/page.tsx                        (NEW)
├── privacy/page.tsx                    (NEW — static)
├── terms/page.tsx                      (NEW — static)
└── [locale]/...                        (Phase 5 — bilingual, next-intl)
```

#### **Phased migration plan** (5 phases, ~5 days)

1. **Phase 1 (4h)** — Create `src/app/robots.ts` and `src/app/manifest.ts`; delete `public/robots.txt` and `public/manifest.json`. No route changes yet.
2. **Phase 2 (1d)** — Create new `src/app/{about,services,projects,...}/page.tsx` routes that render the existing view components (e.g., `<AboutView/>`). Both the legacy `/` Zustand navigation AND the new `/about` URL work in parallel. Add `next/link` to header/footer nav items.
3. **Phase 3 (1d)** — Move data fetching into Server Components for the new routes. Pass data as props to the view components. Remove `useSiteData()`/`useProjects()` calls from public views (keep them in admin).
4. **Phase 4 (1d)** — Create `[slug]` routes for projects, services, news, careers. Add `generateStaticParams` + `generateMetadata`. Move `selectedSlug` Zustand state to URL params.
5. **Phase 5 (1–2d)** — Implement `[locale]` segment with `next-intl`. Redirect `/` to `/en` or `/ar` based on `Accept-Language`. Move dictionary to server. Remove `RtlRoot` client-side `dir` mutation.

**Fallback plan:** If the sandbox truly blocks multi-route (Phase 1 verification fails), at minimum:
- Add `history.pushState` on `setView()` so the URL changes (e.g., `/#about`, `/#services/pipe-installation`)
- Listen to `popstate` to sync browser back/forward with Zustand state
- Add per-view metadata via a client-side `useEffect` that calls `document.title = ...`
- This is a **band-aid**, not a fix — SEO will still be poor.

---

## Part 2: Mobile Optimization Audit

### Mobile Issues Found

#### **M-01 · CRITICAL · Touch targets below WCAG 44px minimum**
- **File:** `src/components/ui/button.tsx:24-29`
  ```ts
  size: {
    default: "h-9 px-4 py-2 has-[>svg]:px-3",   // 36px
    sm: "h-8 rounded-md gap-1.5 px-3",            // 32px
    lg: "h-10 rounded-md px-6",                   // 40px
    icon: "size-9",                                // 36px
  }
  ```
- **File:** `src/components/ui/input.tsx:11` — `h-9` (36px)
- **File:** `src/components/site/footer.tsx:102` — social icons `h-9 w-9` (36px)
- **File:** `src/components/site/newsletter-widget.tsx:84,91,97` — input + button `h-9` (36px)
- **File:** `src/components/site/floating-ui.tsx:175,183,191` — cookie consent buttons `h-8` (32px)
- **File:** `src/components/site/project-comparison.tsx:119,126` — comparison buttons `h-8` (32px)
- **WCAG 2.5.5 Target Size (Level AAA):** minimum 44×44 CSS pixels. WCAG 2.5.8 (Level AA, in WCAG 2.2): minimum 24×24. Apple HIG: 44pt. Material Design: 48dp.
- **Impact:** Users with motor impairments, on small touchscreens, will mis-tap. Particularly affects the cookie consent (decline button is right next to accept) and mobile menu items.
- **Fix:** Update `buttonVariants` sizes: `default: "h-11"`, `sm: "h-10"` (or eliminate `sm`), `lg: "h-12"`, `icon: "size-11"`. Update Input to `h-11`. Add `min-h-[44px]` to all interactive elements.

#### **M-02 · CRITICAL · No safe-area insets for iPhone notch / home indicator**
- **Files:** Verified by `grep -rn "safe-area\|env(safe\|viewport-fit" src/` returning **zero matches**
- **Problem:** Floating UI elements are positioned with `fixed bottom-4 end-4` (`floating-ui.tsx:56,153`), `fixed bottom-24 end-4` (`floating-ui.tsx:35`), `fixed bottom-4 start-1/2` (`project-comparison.tsx:98`). On iPhone X+ devices (notch + home indicator), these elements overlap the home indicator bar, making them hard to tap and visually broken.
- **Also:** The `viewport` export in `layout.tsx:80-84` lacks `viewportFit: "cover"` — without this, iOS won't extend web content into the notch area, but the floating elements also won't get safe-area padding.
- **Fix:**
  1. `layout.tsx` — add `viewportFit: "cover"` to `viewport` export
  2. `globals.css` — add `:root { --safe-bottom: env(safe-area-inset-bottom, 0px); --safe-top: env(safe-area-inset-top, 0px); }`
  3. Floating elements — change `bottom-4` to `bottom-[calc(1rem+var(--safe-bottom))]`

#### **M-03 · HIGH · `vh` units cause iOS Safari address-bar jump**
- **Files:**
  - `src/components/views/home-view.tsx:76` — `h-[88vh] min-h-[600px] max-h-[860px]`
  - `src/components/views/home-view.tsx:65` — `min-h-[70vh]`
  - `src/components/views/projects-view.tsx:366` — `h-[60vh] min-h-[440px]`
  - `src/components/views/news-view.tsx:219` — `h-[60vh] min-h-[440px]`
  - `src/components/views/projects-view.tsx:299,307` — `min-h-[60vh]`
  - `src/components/views/services-view.tsx:93,101` — `min-h-[60vh]`
  - `src/components/views/news-view.tsx:155,163` — `min-h-[60vh]`
- **Problem:** iOS Safari's `100vh` includes the area behind the address bar. When the user scrolls, the address bar collapses, the viewport grows, and `vh`-based heights jump — causing layout shift and broken hero sections. The `min-h-[600px]` partially mitigates this on small screens but doesn't fix the jump.
- **Fix:** Replace `vh` with `dvh` (dynamic viewport height) or `svh` (small viewport height — most stable for heroes):
  - `h-[88vh]` → `h-[88dvh]` or `h-[88svh]`
  - All `min-h-[60vh]` → `min-h-[60dvh]`
  - Tailwind v4 supports `h-dvh`, `h-svh`, `h-lvh` natively.

#### **M-04 · HIGH · Forms disable mobile autofill and lack mobile keyboard hints**
- **Files:**
  - `src/components/views/contact-view.tsx:207` — honeypot `autoComplete="off"` (correct for honeypot)
  - `src/components/views/contact-view.tsx:214-247` — real inputs (name, company, email, phone) have NO `autoComplete` attribute
  - `src/components/views/contact-view.tsx:241` — phone input uses default `type="text"`, not `type="tel"` or `inputMode="tel"`
  - `src/components/views/careers-view.tsx:587-605` — name and email fields lack `autoComplete`
  - `src/components/site/quick-quote-widget.tsx:175` — honeypot `autoComplete="off"` (correct)
  - `src/components/site/newsletter-widget.tsx:79` — email input lacks `autoComplete="email"` and `inputMode="email"`
- **Problem:** Mobile browsers (iOS Safari, Android Chrome) provide autofill UI for names, emails, phone numbers, addresses, and credit cards. Without proper `autoComplete` tokens (`autoComplete="email"`, `autoComplete="tel"`, `autoComplete="given-name"`), the browser cannot offer this — forcing users to type everything manually. Phone field without `type="tel"` shows alphanumeric keyboard instead of dialpad.
- **Also missing:** `enterKeyHint` (`"next"`, `"previous"`, `"send"`, `"go"`, `"search"`) on submit buttons — this changes the mobile keyboard's Enter key label and behavior.
- **Fix:**
  - Contact form: `<Input type="email" autoComplete="email" inputMode="email" />`, `<Input type="tel" autoComplete="tel" inputMode="tel" pattern="[0-9+ ]+" />`, `<Input autoComplete="name" />`, `<Input autoComplete="organization" />` for company
  - Submit button: `<Button enterKeyHint="send">`
  - Newsletter email: `<Input type="email" autoComplete="email" inputMode="email" enterKeyHint="send" />`

#### **M-05 · HIGH · No swipe gestures on carousels**
- **Files:**
  - `src/components/views/home-view.tsx:640-678` — testimonial carousel uses dot pagination + buttons only
  - `src/components/views/home-view.tsx:178-200` — hero slider uses dot pagination only
  - `package.json:62` — `embla-carousel-react` is installed
  - `src/components/ui/carousel.tsx` — full Embla carousel component exists with touch/swipe support
  - `grep -rn "Carousel\|embla" src/components/views/` — Embla is **never used in views**
- **Problem:** On mobile, users expect to swipe horizontally through testimonials, hero slides, and project galleries. The current implementation requires tapping dots/arrows — awkward one-handed use. The Embla library is installed but unused.
- **Fix:** Replace the custom `motion.div` carousel in `home-view.tsx:640` with `<Carousel>` from `src/components/ui/carousel.tsx`. It supports touch dragging out of the box.

#### **M-06 · HIGH · No `prefers-reduced-motion` support**
- **Files:** `grep -rn "prefers-reduced-motion" src/` returns **zero matches**
- **Problem:** The site uses Framer Motion extensively (verified by 18 `whileInView`/`viewportOnce` usages, parallax hooks, animated transitions in every view). Users with vestibular disorders, motion sensitivity, or those who enable "Reduce Motion" in macOS/iOS/Android accessibility settings will see full animations — causing nausea or distraction.
- **WCAG 2.3.3 Animation from Interactions (Level AAA):** Motion should be disableable.
- **Fix:**
  1. `globals.css` — add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`
  2. Use Framer Motion's `useReducedMotion()` hook in `useParallax` and `view-router.tsx` to disable transform animations.

#### **M-07 · MEDIUM · No mobile bottom navigation**
- **Files:** `src/components/site/header.tsx:166-239` — mobile menu is hamburger → Sheet (right/left drawer)
- **Problem:** Mobile UX pattern for content-heavy sites is a bottom tab bar (Home / Services / Projects / Contact). Current implementation requires opening the hamburger Sheet for every navigation. Bottom nav is faster (thumb-reachable), more discoverable, and standard on iOS/Android.
- **Fix:** Add `<BottomNav>` component visible only on `< md` screens with 4–5 top destinations. Hide on admin overlay.

#### **M-08 · MEDIUM · Missing mobile-specific meta tags**
- **File:** `src/app/layout.tsx:80-84,117-125`
- **Problem:** The viewport export is:
  ```ts
  export const viewport = {
    themeColor: "#0f1e3d",
    width: "device-width",
    initialScale: 1,
  };
  ```
  Missing:
  - `viewportFit: "cover"` (needed for safe-area insets — see M-02)
  - `maximumScale: 5` (allow zoom for accessibility; do NOT set `maximumScale: 1` — that's an a11y violation)
  - No `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` for iOS PWA
  - No `mobile-web-app-capable` for Android PWA
  - No `format-detection` meta to control iOS auto-linking of phone numbers (currently iOS may auto-link phone numbers in body text, breaking layouts)
- **Fix:**
  ```ts
  export const viewport: Viewport = {
    themeColor: "#0f1e3d",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
  };
  // In layout head:
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="format-detection" content="telephone=no" />
  ```

#### **M-09 · MEDIUM · PWA manifest uses 214 KB hero image as icon**
- **File:** `public/manifest.json:9-15`
  ```json
  "icons": [
    { "src": "/hero-industrial.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
  ```
- **Problem:** `hero-industrial.png` is 214 KB (verified by `ls -la public/`). PWA install prompts will download this 214 KB icon — slow on mobile networks. Also:
  - Missing 192×192 icon (Android requires both 192 and 512)
  - Same image used for `any` and `maskable` — maskable icons need safe-zone padding (80% inner circle); a hero photo will be cropped badly
  - No `id` field (PWA requirement for some browsers)
  - No `screenshots` array (richer install prompt)
  - No `shortcut` entries
- **Fix:** Generate proper 192×192 and 512×512 PNG icons (use `sharp` or an online tool) from the `logo.svg`. Add separate maskable icon with padding. Migrate to `src/app/manifest.ts` (R-05).

#### **M-10 · MEDIUM · RTL flash on initial load**
- **Files:** `src/app/layout.tsx:118` (`<html lang="en">`); `src/components/site/rtl-root.tsx:13-16` (sets `dir` in `useEffect`)
- **Problem:** When an Arabic-speaking visitor loads the page:
  1. Server renders `<html lang="en">` (hardcoded)
  2. Browser renders LTR
  3. JS bundle downloads + hydrates
  4. `RtlRoot` `useEffect` runs, sets `document.documentElement.dir = "rtl"`
  5. Layout flips to RTL — visible "flash of LTR content"
- **Fix:** With `[locale]` routing (R-06), render `<html lang={locale} dir={dir}>` server-side. Without that migration, add an inline `<script>` in `<head>` that reads `localStorage.getItem("mhasa-app-store")` and sets `dir` before paint.

#### **M-11 · MEDIUM · Missing PWA icons referenced in metadata**
- **Files:** `src/app/layout.tsx:48-50`
  ```ts
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  ```
  Verified by `ls -la public/favicon.ico public/apple-touch-icon.png public/og-image.jpg` — **all three files DO NOT EXIST**.
- **Also:** `layout.tsx:60,66` references `/og-image.jpg` for OpenGraph + Twitter cards — also missing.
- **Impact:** Browsers show default favicon (none); iOS Safari "Add to Home Screen" shows blank icon; social shares (Facebook, Twitter, LinkedIn, WhatsApp) show no preview image.
- **Fix:** Generate `favicon.ico` (multi-size: 16/32/48), `apple-touch-icon.png` (180×180), `og-image.jpg` (1200×630) from the brand logo.

#### **M-12 · MEDIUM · Cookie consent + floating actions crowd small screens**
- **Files:**
  - `src/components/site/floating-ui.tsx:56` — FloatingActions at `fixed bottom-4 end-4` (WhatsApp + Call buttons, 56px each)
  - `src/components/site/floating-ui.tsx:35` — BackToTop at `fixed bottom-24 end-4`
  - `src/components/site/floating-ui.tsx:153` — CookieConsent at `fixed bottom-4 start-4 max-w-md`
  - `src/components/site/quick-quote-widget.tsx:86` — Quick Quote tab at `fixed top-1/2 end-0`
- **Problem:** On a 375px-wide iPhone SE, after the cookie consent appears (default position: bottom-left, max-width 28rem = 448px), it nearly fills the screen width. Combined with FloatingActions (bottom-right) and BackToTop (bottom-right above WA), the bottom 200px of the viewport is cluttered. On landscape mobile (e.g., 667×375), this is worse.
- **Fix:**
  - Cookie consent: on `< sm`, render as a full-width bottom sheet (vaul Drawer is installed) instead of floating card
  - Hide FloatingActions while CookieConsent is visible
  - Quick Quote tab: hide on `< sm` (already partly handled — but `grep` shows no `hidden` class on it)

#### **M-13 · MEDIUM · No `touch-action` or `overscroll-behavior`**
- **Files:** `grep -rn "touch-action\|overscroll-behavior" src/` returns **zero matches**
- **Problem:**
  - Modals/drawers (Sheet, Dialog, Quick Quote panel) don't set `overscroll-behavior: contain` — scrolling to the bottom of a modal continues scrolling the background body (scroll chaining).
  - The `before-after-slider.tsx` slider uses `touchmove` with `{ passive: false }` (`floating-ui.tsx:61`) to preventDefault — good, but no `touch-action: none` CSS, so the browser may still pan/zoom before JS handles it.
  - No pull-to-refresh prevention on pages where it would interrupt form filling.
- **Fix:**
  - `globals.css` — add `overscroll-behavior-y: contain;` to `body` (or scoped to modals)
  - `before-after-slider.tsx` container — add `style={{ touchAction: 'none' }}` or `className="touch-none"`
  - When admin overlay / cookie consent is open, set `body { overflow: hidden; overscroll-behavior: contain; }` (admin overlay already does `overflow: hidden` at `admin-overlay.tsx:31` — good)

#### **M-14 · MEDIUM · Search dialog not optimized for mobile**
- **File:** `src/components/site/search-dialog.tsx:82` — `<DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">`
- **Problem:** On mobile, the search dialog is centered with `max-w-2xl` (672px). Mobile UX best practice is full-screen or top-anchored bottom sheet for search (cf. iOS Spotlight, Android Google app). Currently the dialog is centered with margin, leaving wasted space and a small input.
- **Fix:** Use `vaul` Drawer (installed) for mobile search: `<Drawer>` on `< md`, `<Dialog>` on `md+`. Or use `sm:rounded-none sm:h-screen` classes.

#### **M-15 · LOW · `text-[10px]` and `text-xs` for non-label text**
- **Files:**
  - `src/components/views/home-view.tsx:594` — `text-[10px]` for client industry label (10px)
  - Multiple `text-xs` (12px) usages — acceptable for labels/eyebrows but borderline for body captions
- **WCAG 1.4.4 Resize Text (Level AA):** text must scale to 200%. Fixed `text-[10px]` does not scale with user font-size preferences if `font-size` is set in px. Tailwind's `text-xs` uses `rem` (good).
- **Fix:** Replace `text-[10px]` with `text-xs` (12px rem-based). Audit all `text-[Npx]` usages and convert to Tailwind rem-based sizes.

#### **M-16 · LOW · No lazy loading of below-the-fold components**
- **Files:** `src/components/views/home-view.tsx` (746 lines) renders Hero → TrustBar → AboutPreview → Services → WhyUs → Stats → FeaturedProjects → Clients → Testimonials → CTA — all in one component, all in one chunk.
- **Problem:** The entire home view is one big client component. Even though `view-router.tsx:15-25` lazy-loads `AboutView`/`ServicesView`/etc., the home view itself is not internally code-split. Below-the-fold sections (Testimonials, CTA) ship in the same JS chunk as above-the-fold Hero.
- **Fix:** Wrap below-the-fold sections in `next/dynamic` with `ssr: false` and a Suspense fallback, or split into separate components loaded via `React.lazy`. Better: with multi-route migration (R-01), make these Server Components — they'll stream via Suspense.

#### **M-17 · LOW · Horizontal scroll risk in comparison tables**
- **Files:**
  - `src/components/site/service-comparison-table.tsx:97` — `<table className="w-full border-collapse min-w-[700px]">`
  - `src/components/site/project-comparison.tsx:234` — `<th className="... min-w-[180px]">`
- **Problem:** On 375px-wide mobile, the 700px-min table forces horizontal scroll inside the `overflow-x-auto` wrapper. The sticky first column helps, but there's no visual hint (chevron, "swipe →" label) that more content is off-screen.
- **Fix:** Add a subtle "← Swipe to compare →" hint above the table on `< md`. Or transform the table into an accordion on mobile (one service per accordion item).

#### **M-18 · LOW · `useIsMobile` hook only used in sidebar component**
- **Files:** `src/hooks/use-mobile.ts` (defines hook); `grep -rn "useIsMobile" src/components/` finds only `src/components/ui/sidebar.tsx:8,69` (admin sidebar, never used in site)
- **Problem:** The hook exists but is unused for actual mobile UX decisions. Could be used to: switch carousel to swipe mode, render bottom nav, switch Dialog to Drawer, etc.
- **Fix:** Use `useIsMobile()` in `search-dialog.tsx`, `quick-quote-widget.tsx`, `floating-ui.tsx` to render mobile-optimized variants.

#### **M-19 · LOW · Admin overlay not fully mobile-optimized**
- **Files:** `src/components/admin/admin-overlay.tsx`, `src/components/admin/admin-dashboard.tsx`
- **Problem:**
  - `admin-overlay.tsx:70` — "Sign Out" text is `hidden sm:inline` — on smallest screens, only the icon shows with no label
  - Admin tables (`resource-manager.tsx`) likely have horizontal scroll on mobile (no mobile-specific card view)
  - `resource-manager.tsx:157` uses raw `<img>` (eslint-disabled) — fine for admin but unoptimized
- **Mitigation:** Admin is not user-facing; this is lower priority. But the admin is mobile-accessible (the mobile menu has an "Admin" button at `header.tsx:226`).
- **Fix:** Add a "Are you sure?" confirm for sign-out. Add mobile card-view toggle for resource lists.

#### **M-20 · LOW · No `priority` on hero image of detail pages**
- **Files:** `src/components/views/projects-view.tsx:372` has `priority` (good); `news-view.tsx:225` has `priority` (good); but `home-view.tsx` hero section is the same — also good.
- **Status:** ✅ All hero images DO have `priority`. No issue here — verified by `grep -rn "priority" src/components/views/`.

#### **M-21 · LOW · `quality` prop not set on next/image**
- **Files:** All `next/image` usages
- **Problem:** Default `quality` is 75. For photographic hero images, 70–75 is fine. For PNG logos/screenshots, 90+ is better. No `quality` prop is set on any image — meaning all use 75.
- **Fix:** Add `quality={90}` to logo/screenshot images; leave heroes at default. Minor optimization.

---

### Mobile Recommendations

To achieve "perfect" mobile optimization, implement in priority order:

1. **Fix touch targets** (M-01) — update `button.tsx` and `input.tsx` heights. 1 hour. Affects every interactive element.
2. **Add safe-area insets** (M-02) — `viewportFit: "cover"` + `env(safe-area-inset-*)` on floating UI. 1 hour. Critical for iPhone X+.
3. **Replace `vh` with `dvh`** (M-03) — global find/replace. 30 minutes. Fixes iOS Safari jump.
4. **Add form mobile attributes** (M-04) — `autoComplete`, `inputMode`, `enterKeyHint` on all form fields. 2 hours. Major UX improvement.
5. **Add `prefers-reduced-motion` support** (M-06) — CSS media query + `useReducedMotion` hook. 1 hour. Accessibility compliance.
6. **Implement Embla carousel** (M-05) — swap home testimonial + hero carousels to use existing `src/components/ui/carousel.tsx`. 2 hours. Adds swipe gestures.
7. **Fix PWA manifest + missing icons** (M-09, M-11) — generate proper icons, migrate to `manifest.ts`. 2 hours. Required for installability + social sharing.
8. **Add mobile bottom nav** (M-07) — new `<BottomNav>` component. 2 hours. Major mobile UX upgrade.
9. **Mobile-optimize cookie consent + search** (M-12, M-14) — use vaul Drawer for both on mobile. 2 hours.
10. **Fix RTL flash** (M-10) — inline script in `<head>`. 30 minutes. Or full fix via `[locale]` routing (R-06).
11. **Add `touch-action` / `overscroll-behavior`** (M-13) — CSS additions. 30 minutes.
12. **Replace `text-[10px]`** (M-15) — 15 minutes.
13. **Code-split home view** (M-16) — wrap below-the-fold sections in `next/dynamic`. 1 hour.
14. **Add mobile hints to comparison tables** (M-17) — swipe hint or accordion transform. 1 hour.

**Estimated total:** ~16 hours of focused mobile work to reach Lighthouse Mobile Performance ≥ 90, Accessibility ≥ 95.

---

## Priority Action List

### 🔴 P0 — Must fix before client delivery (production-blocking)

| # | Issue | File(s) | Effort | Area |
|---|---|---|---|---|
| 1 | **R-01** Single-route Zustand architecture breaks SEO/deep-linking/back-button | `store.ts`, `view-router.tsx`, `page.tsx`, `sitemap.ts` | 3–5 days | Routing |
| 2 | **R-02** No `[slug]` dynamic routes for projects/services/news/careers | (missing files) | 1 day | Routing |
| 3 | **R-03** No per-page `generateMetadata` | (missing exports) | 0.5 day | Routing |
| 4 | **R-04** `sitemap.ts` lists 12 identical URLs (useless) | `src/app/sitemap.ts` | 0.5 day | Routing |
| 5 | **M-01** Touch targets below 44px WCAG minimum | `button.tsx`, `input.tsx`, 6 site components | 1 hour | Mobile |
| 6 | **M-02** No safe-area insets (iPhone notch overlap) | `layout.tsx`, `globals.css`, `floating-ui.tsx` | 1 hour | Mobile |
| 7 | **M-04** Forms disable mobile autofill, lack `inputMode`/`enterKeyHint` | `contact-view.tsx`, `careers-view.tsx`, `newsletter-widget.tsx`, `quick-quote-widget.tsx` | 2 hours | Mobile |
| 8 | **M-11** Missing favicon, apple-touch-icon, og-image (referenced but absent) | `public/` | 2 hours | Mobile/SEO |

### 🟡 P1 — Should fix before delivery (significant UX/SEO impact)

| # | Issue | File(s) | Effort | Area |
|---|---|---|---|---|
| 9 | **R-05** Migrate to `robots.ts` + `manifest.ts` (App Router conventions) | (new files) | 1 hour | Routing |
| 10 | **R-06** `next-intl` installed but unused; no `[locale]` segment | `i18n.ts`, `use-locale.ts`, `rtl-root.tsx`, new `[locale]/` routes | 2 days | Routing |
| 11 | **R-07** Public API routes missing `revalidate` / `dynamic` exports | 7 files in `src/app/api/public/` | 30 minutes | Routing/Perf |
| 12 | **R-08** 100% client-side data fetching (no SSR data) | All views + `use-queries.ts` | 2 days (with R-01) | Routing/Perf |
| 13 | **M-03** `vh` units cause iOS Safari address-bar jump | 9 view files | 30 minutes | Mobile |
| 14 | **M-05** No swipe gestures on carousels (Embla installed but unused) | `home-view.tsx` | 2 hours | Mobile |
| 15 | **M-06** No `prefers-reduced-motion` support | `globals.css`, parallax hooks | 1 hour | Mobile/A11y |
| 16 | **M-09** PWA manifest uses 214 KB hero image as icon | `public/manifest.json` | 1 hour | Mobile |
| 17 | **M-10** RTL flash on initial load (server renders `lang="en"`) | `layout.tsx`, `rtl-root.tsx` | 30 minutes (band-aid) or part of R-06 | Mobile |
| 18 | **M-12** Cookie consent + floating actions crowd small screens | `floating-ui.tsx` | 2 hours | Mobile |

### 🟢 P2 — Nice to have (polish)

| # | Issue | File(s) | Effort | Area |
|---|---|---|---|---|
| 19 | **R-09** Middleware matcher too narrow (no locale/security headers) | `middleware.ts` | 1 hour | Routing |
| 20 | **R-10** Root `page.tsx` is server component but does no server work | `page.tsx` | Part of R-01 | Routing |
| 21 | **M-07** No mobile bottom navigation | (new component) | 2 hours | Mobile |
| 22 | **M-08** Missing mobile meta tags (`viewportFit`, PWA capable, format-detection) | `layout.tsx` | 30 minutes | Mobile |
| 23 | **M-13** No `touch-action` / `overscroll-behavior` containment | `globals.css`, `before-after-slider.tsx` | 30 minutes | Mobile |
| 24 | **M-14** Search dialog not mobile-optimized (should be Drawer on mobile) | `search-dialog.tsx` | 1 hour | Mobile |
| 25 | **M-15** `text-[10px]` non-rem font sizes | `home-view.tsx:594` | 15 minutes | Mobile/A11y |
| 26 | **M-16** Home view not internally code-split | `home-view.tsx` | 1 hour | Mobile/Perf |
| 27 | **M-17** Comparison tables lack mobile swipe hint | `service-comparison-table.tsx`, `project-comparison.tsx` | 1 hour | Mobile |
| 28 | **M-18** `useIsMobile` hook defined but unused for UX decisions | Various | Part of M-07/M-14 | Mobile |
| 29 | **M-19** Admin overlay mobile gaps (sign-out label, table views) | `admin-overlay.tsx`, `resource-manager.tsx` | 2 hours | Mobile |
| 30 | **M-21** `quality` prop not set on next/image | Various | 30 minutes | Mobile/Perf |

---

## Verification Checklist (for re-audit after fixes)

- [ ] `curl https://mhaksa.com/about` returns 200 (not 404)
- [ ] `curl https://mhaksa.com/projects/grp-pipeline-jubail` returns 200 with that project's content in HTML
- [ ] `view-source:https://mhaksa.com/` contains hero text (not empty `<main></main>`)
- [ ] Browser back button traverses Home → About → Services correctly
- [ ] `sitemap.xml` contains 50+ unique URLs
- [ ] Lighthouse Mobile SEO ≥ 95
- [ ] Lighthouse Mobile Accessibility ≥ 95
- [ ] Lighthouse Mobile Performance ≥ 90
- [ ] All buttons ≥ 44×44 CSS pixels (audit via DevTools "Inspect" → Computed → check `height`)
- [ ] iPhone X simulator: floating buttons don't overlap home indicator
- [ ] iOS Safari: hero doesn't jump when address bar collapses
- [ ] iOS Safari: filling contact form offers autofill suggestions
- [ ] iOS Safari: swiping testimonial carousel works
- [ ] macOS "Reduce Motion" enabled: animations are subtle/instant
- [ ] "Add to Home Screen" on iOS shows branded icon (not blank/screenshot)
- [ ] Sharing `https://mhaksa.com/projects/[slug]` on WhatsApp shows OG image preview

---

**End of audit.**
