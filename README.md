# Next.js Rendering Lab

## What this is for

This repo is a **practice lab**, not a starter app. Use it when you want to understand Next.js rendering by running it, not by reading docs alone.

It is for:

- Relearning **SSG, SSR, ISR, CSR** and when to pick each one
- Seeing the difference between **Server Components and Client Components** (what ships to the browser, what stays on the server)
- Practicing **streaming, caching, Server Actions, hydration**, and the old **Pages Router** APIs interviews still ask about
- Learning the Next.js 16 model: **Cache Components / Partial Prerendering** (`'use cache'`, `cacheLife`, `cacheTag`)

Each page is a working demo plus teaching material: notes (what / where / when / why), step-by-step experiments, curl checks, and interview questions.

There are two apps because the two Next.js models cannot live in one config. Classic ISR uses `export const revalidate`. Cache Components turn that off. Side-by-side is the point.

## How to use it

### 1. Install and start

You need Node.js 22+ and [pnpm](https://pnpm.io) 10+.

```bash
pnpm install
pnpm build && pnpm start:prod
```

Then open:

- **Classic lab:** http://localhost:3000 — start here
- **Modern lab:** http://localhost:3001 — Cache Components / PPR

`pnpm start:prod` also starts the mock API on http://localhost:4000. That API counts every real upstream call. If you reload a page and the counter does not move, Next served from a cache.

For reading notes only, `pnpm dev` is fine. **Do not trust caching demos in dev.** `next dev` re-renders every request, so SSG and ISR look dynamic. Always switch to `pnpm start:prod` when you get to timestamps, hit counters, or “is this static?”.

### 2. Work through one topic at a time

On http://localhost:3000, follow the homepage roadmap from the top. Suggested order is SSG → SSR → ISR → CSR, then Server vs Client, streaming, caching, actions, runtime, hydration, Pages Router. After that, switch to http://localhost:3001 for PPR.

On each lesson page, use the tabs in this order:

1. **Demo** — watch the badges. `▣ server` ran on the server. `◆ client` hydrates in the browser. The timestamp tells SSG (frozen) from SSR (changes every reload). The hit counter tells you whether mock-api was actually called.
2. **Notes** — read what it is, where it runs (server vs client vs CDN), when it runs (build, request, revalidate, hydrate), why you would choose it, tradeoffs, and common mistakes.
3. **Try this** — do the experiments (reload, wait 10 seconds, click revalidate, disable JavaScript, view source).
4. **Verify** — run the listed `curl` or `bash scripts/verify-*.sh` from the repo root while `start:prod` is running.
5. **Interview** — flashcards first, then multiple choice (scores stay in this browser’s `localStorage`), then “predict the output”.

When you have gone through several topics, open `/interview` on that app. It shows your score per topic and a weak-topics review.

### 3. How to read the proof

| Signal | Meaning |
| --- | --- |
| Timestamp stays the same on reload | Static or cached (SSG / ISR / `'use cache'`) |
| Timestamp changes on every reload | Rendered per request (SSR / dynamic / `connection()`) |
| Upstream hit counter does not increase | Cache hit — mock-api was not called |
| Data is in “view source” / curl HTML | Server-rendered (good for SEO) |
| Data missing from raw HTML, then appears | Client-rendered (`useEffect` / `ssr: false`) |

### 4. Commands you will actually use

| Command | When |
| --- | --- |
| `pnpm install` | First time |
| `pnpm start:prod` | Daily learning (after a build) |
| `pnpm build && pnpm start:prod` | After pulling changes, or to rebuild static pages |
| `pnpm dev` | Quick UI / notes, not caching |
| `pnpm test` | Unit tests |
| `pnpm verify` | Curl checks (needs `start:prod` in another terminal) |
| `pnpm e2e` | Playwright against production builds |

---

## Why two apps

`cacheComponents: true` (Partial Prerendering) disables classic route segment config such as `export const revalidate` and `export const dynamic`. Interviews still ask about those APIs, so the lab splits them:

| App | Port | Model |
| --- | --- | --- |
| [`apps/classic`](apps/classic) | http://localhost:3000 | App Router **without** Cache Components, plus Pages Router under `/legacy/*` |
| [`apps/modern`](apps/modern) | http://localhost:3001 | `cacheComponents: true` — `'use cache'`, `cacheLife`, `cacheTag`, `updateTag`, `connection()` |

Shared UI and lesson content live in [`packages/learn-ui`](packages/learn-ui).

## Curriculum

### Classic (`apps/classic`)

1. Roadmap and request lifecycle — `/`
2. SSG — `/rendering/ssg`
3. SSR (and what makes a route dynamic) — `/rendering/ssr`
4. ISR (time-based and on-demand) — `/rendering/isr`
5. CSR — `/rendering/csr`
6. Server vs Client Components — `/components/server-vs-client`
7. Streaming and Suspense — `/streaming`
8. Four caching layers — `/caching`
9. Server Actions and Route Handlers — `/actions`
10. Edge vs Node and `proxy.ts` — `/runtime`
11. Hydration — `/hydration`
12. Pages Router (`getStaticProps`, `getServerSideProps`, `getStaticPaths`) — `/legacy`

### Modern (`apps/modern`)

1. Partial Prerendering overview — `/`
2. PPR shell + cached + dynamic hole — `/ppr`
3. `'use cache'` levels and keys — `/use-cache`
4. `cacheLife` — `/cache-life`
5. `cacheTag`: `updateTag` vs `revalidateTag` — `/cache-tag`
6. Runtime data, private cache, `connection()` — `/runtime-data`
7. Classic → modern mapping — `/migration`

## Repo layout

```
apps/classic/          Next.js 16 App Router + Pages Router
apps/modern/           Next.js 16 with cacheComponents: true
packages/learn-ui/     Lesson shell, proof kit, quizzes, content
mock-api/              Local JSON API with per-endpoint hit counters
scripts/               verify-*.sh, with-mock.mjs, stream-timing.mjs
```

## Tests

```bash
pnpm test              # Vitest
pnpm verify            # requires pnpm start:prod in another terminal
pnpm e2e               # Playwright (installs/uses Chromium)
```

Playwright expects a production build. `pnpm e2e` runs `pnpm build` first. If servers are already up, configs reuse them.

## Deploying to Vercel

This lab is built for **local production mode** first. A straight `vercel` of the repo root will not work:

- There are **two** Next apps, so create **two Vercel projects** (root directories `apps/classic` and `apps/modern`).
- `mock-api` is a long-running Node process on port 4000. Vercel Functions have no sticky `localhost:4000` at request time, so SSR/ISR/Server Actions that fetch it will fail unless you fold the mock into Route Handlers (or another always-on host).
- In-memory hit counters reset between serverless isolates.

What *does* get better on Vercel after that work: `x-nextjs-cache` (HIT / MISS / STALE), CDN `s-maxage`, and real PPR shells.

Until the mock API is in-app, keep using `pnpm start:prod` locally.

## Stack

Next.js 16, React 19, TypeScript, Tailwind v4, pnpm workspaces, Vitest, Playwright.
