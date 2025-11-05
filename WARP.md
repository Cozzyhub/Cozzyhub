# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Start (prod): `npm start`
- Lint: `npm run lint` (Biome)
- Format: `npm run format` (Biome, writes changes)

### Testing
- All tests: `npm test`
- Extension tests: `npm run test:extension`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Single test file: `npm test -- path/to/test.test.ts`

### Database Setup
1. Run `supabase/schema.sql` in the Supabase SQL Editor
2. Run `supabase/migrations/add_category_subcategory.sql`
3. Run `supabase/migrations/add_product_affiliate_links.sql`
4. Run `supabase/migrations/create_affiliate_system.sql`
5. Seed categories: POST `/api/seed-categories` (requires admin session)

### Environment Variables (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture and Structure

### Framework & Rendering
- **Next.js 16 App Router** with React Server Components by default
- Use `"use client"` directive only for interactive views, forms, and client-side hooks
- React 19 with experimental React Compiler enabled
- Turbopack for faster builds

### Supabase Integration
- **Server Client** (`lib/supabase/server.ts`): For SSR, route handlers, and server actions. Uses Next.js cookies.
- **Browser Client** (`lib/supabase/client.ts`): For client-side usage in Client Components.
- **Critical**: Always import from the correct file based on component type to avoid auth/hydration issues.

### Authentication & Route Protection
- Auth middleware in `proxy.ts` (not `middleware.ts`):
  - Protects `/admin/*` routes (redirects unauthenticated users to `/login`)
  - Redirects authenticated users away from `/login` and `/signup` pages
- Admin role determined by `profiles.is_admin` boolean in Supabase
- New user profiles auto-created via database trigger on `auth.users` insert

### Database Schema
**Core Tables** (see `supabase/schema.sql`):
- `profiles`: Extends `auth.users`, includes `is_admin`, `full_name`, `email`
- `categories`: Product categories with slugs and images
- `products`: Main product table with `images[]` array, `category_id`, pricing, stock
- `cart`: User-scoped cart items (unique constraint on user_id + product_id)
- `orders`: Order headers with status tracking and shipping info
- `order_items`: Line items with denormalized product data for history

**Affiliate System** (see `supabase/migrations/create_affiliate_system.sql`):
- `affiliates`: Affiliate profiles with referral codes, commission rates, payment details
- `affiliate_clicks`: Track clicks on affiliate links with conversion tracking
- `affiliate_sales`: Commission records linked to orders
- Automatic stat updates via database triggers

**Security**: All tables have Row Level Security (RLS) enabled with policies for user/admin access.
### App Routes
**Storefront**:
- `/` - Homepage with featured products (server-rendered)
- `/products` - Product listing page
- `/products/[slug]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Order creation (Client Component; creates `orders` + `order_items`, clears cart)
- `/profile` - User dashboard with order history
- `/search` - Product search
- `/about` - About page

**Auth**:
- `/login` - Sign in page
- `/signup` - Registration page
- `/auth/callback` - OAuth callback handler

**Admin** (requires `is_admin = true`):
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/products/new` - Create new product
- `/admin/orders` - Order management

**Affiliate**:
- `/affiliate` - Affiliate dashboard and application

**API Routes**:
- `/api/seed-categories` - Seed default categories (requires admin)
- `/api/products/import` - Import products from browser extension
- `/api/optimize-image` - Image optimization (GET for URLs, POST for uploads)
- `/api/affiliate/track` - Track affiliate clicks
- `/api/affiliate/product-link` - Generate affiliate product links

### Component Organization
- `components/admin/*` - Admin UI (e.g., `AdminNav`, `DeleteProductButton`, `UpdateOrderStatus`)
- `components/storefront/*` - Customer-facing UI (e.g., `Navbar`, `Hero`, `ProductCard`, `CartItems`)
- `components/affiliate/*` - Affiliate dashboard components
- `components/ui/*` - Reusable UI components
- `components/providers/*` - React context providers
### Styling
- **Tailwind CSS v4** via `postcss.config.mjs`
- Global styles in `app/globals.css`
- **Framer Motion** for animations
- **Lucide React** for icons

### Image Handling
- **Next.js Image** component with optimized config:
  - Accepts remote images from any HTTPS host
  - Formats: AVIF, WebP
  - SVG support with security policies
- **Client-side optimization** (`lib/ffmpeg/imageProcessor.ts`):
  - Uses FFmpeg.wasm for browser-based image processing
  - WebP conversion and resizing
- **Server-side optimization** (`app/api/optimize-image/route.ts`):
  - Uses Sharp for fast server processing
  - GET endpoint for URL-based optimization
  - POST endpoint for file uploads
  - Cache headers for performance
- **Supabase Storage**: Products bucket for product images

### TypeScript Configuration
- Path alias: `@/*` maps to repository root
- Strict mode enabled
- React 19 JSX transform

### Code Quality
- **Biome** for linting and formatting:
  - Recommended rules for Next.js and React
  - Auto-organize imports
  - 2-space indentation
- **Jest** for testing (Node and jsdom environments)

## Browser Extension

### Meesho to Cozzyhub Importer
Chrome/Edge extension in `browser-extension/` for importing products from Meesho.com:
- Extracts product data from Meesho product pages
- Uploads images and creates products via `/api/products/import`
- Manifest v3 with content scripts and service worker
- See `browser-extension/README.md` for installation and usage
- Reload instructions in `HOW_TO_RELOAD_EXTENSION.md`

## Key Implementation Details

### Product Images
- Products support multiple images via `images` TEXT[] column
- `image_url` used as primary/featured image for backward compatibility
- Image optimization available via FFmpeg (client) or Sharp (server)

### Affiliate System
- Unique referral codes generated automatically
- Commission tracking with configurable rates
- Click attribution with conversion tracking
- Payment status tracking (pending/paid/cancelled)
- Stats auto-updated via database triggers

### Admin Access
- Set `is_admin = true` in profiles table via Supabase dashboard
- RLS policies enforce admin-only access to management routes
- No service role key needed for normal operations
