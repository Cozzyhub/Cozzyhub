# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Start (prod): `npm start`
- Lint: `npm run lint` (Biome)
- Format: `npm run format` (writes changes)
- Tests: not configured in `package.json`

## Environment and database
- Create `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (README lists `SUPABASE_SERVICE_ROLE_KEY`, but it is not referenced by code.)
- Initialize DB by running `supabase/schema.sql` in Supabase SQL Editor.
- To grant admin access: in Supabase Table Editor set `profiles.is_admin = true` for a user.
- Seed categories (admin session required): POST `/api/seed-categories` while signed in as an admin.

## Architecture overview
- Next.js App Router with React Server Components by default; add `"use client"` only for interactive views/forms.
- Auth and route protection:
  - Middleware logic lives in `proxy.ts` (protects `/admin/*`, redirects logged-in users away from `/login` and `/signup`). For it to take effect, export it from a root `middleware.ts` (e.g., `export { proxy as middleware, config } from './proxy'`).
  - Admin role checked via `profiles.is_admin` in Supabase.
- Supabase clients:
  - Server: `lib/supabase/server.ts` exports `createClient()` wired to Next cookies for SSR, server actions, and route handlers.
  - Client: `lib/supabase/client.ts` exports `createClient()` for browser-side usage in Client Components.
  - Import from the correct file based on component type to avoid auth/hydration issues.
- API routes:
  - `/api/seed-categories` upserts default categories (requires admin).
  - `/api/optimize-image` image optimization with Sharp. POST accepts `file`, optional `maxWidth`, `maxHeight`, `quality`. GET accepts `url` with the same optional params; returns WebP with cache headers.
- UI and pages (selected): home (`/`), products listing and detail (`/products`, `/products/[slug]`), cart/checkout (`/cart`, `/checkout`), profile (`/profile`), admin dashboard and management (`/admin`, `/admin/products`, `/admin/products/new`, `/admin/orders`).
- Components: `components/admin/*` for admin UI; `components/storefront/*` for customer UI.
- Client-side media utilities: `lib/ffmpeg/*` provides in-browser image conversion/optimization via FFmpeg WASM; `lib/utils/currency.ts` for formatting.
- Styling and build:
  - Tailwind CSS v4 via `postcss.config.mjs`; globals in `app/globals.css`.
  - `next.config.ts`: enables React Compiler and Turbopack; allows remote images (`https://**`), sets image formats/sizes, and disables `fs` in webpack fallback.
- Tooling:
  - TypeScript strict config; path alias `@/*` to repo root (see `tsconfig.json`).
  - Biome (`biome.json`) for lint/format.

## Notes
- Tests are not set up. If a test runner is added, document the commands here (including how to run a single test).
