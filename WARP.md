# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Start (prod): `npm start`
- Lint: `npm run lint` (Biome)
- Format: `npm run format` (Biome, writes changes)
- Tests: not configured in `package.json`

Database setup: run `supabase/schema.sql` in the Supabase SQL Editor before first run.

Environment (.env.local):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(Note: a service role key is not used by the code at present.)

Seed categories (admin session required): POST `/api/seed-categories` while signed in as an admin.

## Architecture and structure
- Next.js App Router with React Server Components by default; add `"use client"` only for interactive views and forms.
- Supabase clients:
  - Server: `lib/supabase/server.ts` exports `createClient()` wired to Next cookies for SSR, route handlers, and server actions.
  - Client: `lib/supabase/client.ts` exports `createClient()` for browser-side usage in Client Components.
  - Import from the correct file based on component type to avoid auth/hydration issues.
- Auth and route protection:
  - `middleware.ts` guards `/admin/*` (redirects unauthenticated to `/login`) and redirects signed-in users away from `/login` and `/signup`.
  - Admin role via `profiles.is_admin` in Supabase.
- Data model (Supabase, see `supabase/schema.sql`): `profiles` (extends auth users, includes `is_admin`), `products` (optionally linked to `categories`), `cart` (user-scoped), `orders` and `order_items` (denormalize product data for history). RLS is expected across tables.
- App routes (selected):
  - `/` homepage fetches featured products on the server.
  - `/products`, `/products/[slug]` listing and detail.
  - `/cart`, `/checkout` cart and order creation (checkout is a Client Component; inserts `orders` and `order_items`, then clears `cart`).
  - `/profile` user dashboard with order history.
  - `/admin` dashboard, `/admin/products`, `/admin/products/new`, `/admin/orders` for management (server-rendered; creation form is client-side).
  - `/api/seed-categories` route handler to upsert default categories (requires admin).
- Components:
  - `components/admin/*` admin UI (e.g., `AdminNav`, `DeleteProductButton`, `UpdateOrderStatus`).
  - `components/storefront/*` customer UI (e.g., `Navbar`, `Hero`, `ProductCard`, `CartItems`, `ProductAddSection`).
- Styling and assets:
  - Tailwind CSS v4 via `postcss.config.mjs`; global styles in `app/globals.css`.
  - `next.config.ts` allows remote images from any https host.
- Tooling:
  - TypeScript paths: `@/*` maps to repo root (see `tsconfig.json`).
  - Biome (`biome.json`) provides lint and format.

## Notes for future changes
- If tests are added (e.g., Vitest/Playwright), document how to run a single test and the test command here.
