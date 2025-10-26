# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
- **Development server**: `npm run dev` (runs on http://localhost:3000)
- **Production build**: `npm run build`
- **Production server**: `npm start`

### Code Quality
- **Linting**: `npm run lint` (uses Biome)
- **Formatting**: `npm run format` (auto-formats with Biome)

### Database Setup
Initial setup requires running `supabase/schema.sql` in the Supabase SQL Editor.

## Architecture Overview

### Tech Stack
- **Next.js 14** with App Router (Server Components by default)
- **TypeScript** with strict mode enabled
- **Supabase** for authentication, database (PostgreSQL), and Row Level Security
- **Tailwind CSS** for styling with glassmorphic design patterns
- **Framer Motion** for animations
- **Biome** for linting and formatting (replaces ESLint/Prettier)

### Client/Server Separation Pattern

This project strictly separates client and server-side Supabase usage:

1. **Server Components** (`@/lib/supabase/server`): Use `createClient()` from `lib/supabase/server.ts`
   - Returns `createServerClient` with Next.js cookies integration
   - Used in Server Components, Server Actions, and Route Handlers
   - Automatically handles authentication via cookies

2. **Client Components** (`@/lib/supabase/client`): Use `createClient()` from `lib/supabase/client.ts`
   - Returns `createBrowserClient` for client-side operations
   - Used in Client Components with `"use client"` directive
   - Required for real-time subscriptions and client-side mutations

**Important**: Always import from the correct file based on component type. Mixing them causes authentication and hydration errors.

### Authentication & Authorization

- **Middleware** (`middleware.ts`): Protects `/admin` routes and redirects authenticated users from `/login` and `/signup`
- **Admin Access**: Controlled by `is_admin` boolean in `profiles` table
- **RLS Policies**: All database operations are secured with Supabase Row Level Security
  - Admins can CRUD products, categories, and view all orders
  - Users can only access their own cart and orders
  - Public can read products and categories

### Database Schema

Key tables and relationships:
- **profiles**: Extends `auth.users` with `is_admin` flag and user details
- **products**: Has `category_id` FK, supports multiple images via `images` TEXT array
- **categories**: One-to-many with products
- **cart**: User-specific with `user_id` and `product_id` unique constraint
- **orders**: Contains `user_id`, `status` enum, and JSONB `shipping_address`
- **order_items**: Denormalizes product data (`product_name`, `product_price`) for historical accuracy

All tables have:
- UUID primary keys with `uuid_generate_v4()`
- Automatic `created_at` and `updated_at` timestamps
- Row Level Security enabled

### Project Structure

```
app/
├── admin/           # Admin dashboard routes (protected by middleware)
│   ├── page.tsx     # Dashboard with stats
│   ├── products/    # Product management CRUD
│   └── orders/      # Order management
├── cart/            # Shopping cart page
├── products/        # Product listing and detail pages
├── login/ signup/   # Authentication pages
└── page.tsx         # Homepage with featured products

components/
├── admin/           # Admin-specific components (forms, tables)
└── storefront/      # Customer-facing components (Navbar, Hero, etc.)

lib/
└── supabase/
    ├── client.ts    # Browser client for Client Components
    └── server.ts    # Server client for Server Components
```

### Styling Patterns

The application uses a consistent glassmorphic design system:
- Background: `bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950`
- Glass cards: `backdrop-blur-xl bg-white/5 border border-white/10`
- Hover states: `hover:bg-white/10 transition`
- All pages should maintain this visual consistency

### Path Aliasing

TypeScript paths are configured with `@/*` mapping to root directory:
```typescript
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/storefront/Navbar'
```

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-only, never expose to client)

## Key Implementation Details

### Order Status Flow
Orders follow this status progression:
1. `pending` (default on creation)
2. `processing` (admin marks for fulfillment)
3. `shipped` (order in transit)
4. `delivered` (completed)
5. `cancelled` (can be set at any point)

Status is enforced by PostgreSQL CHECK constraint.

### Product Images
Products support:
- `image_url`: Single primary image (TEXT)
- `images`: Array of additional images (TEXT[])

### Admin Creation
New users are NOT admins by default. To grant admin access:
1. User signs up via `/signup`
2. Trigger automatically creates profile entry
3. Manually update `profiles.is_admin` to `true` in Supabase dashboard
4. User can then access `/admin` routes

### Server Components First
By default, all components are Server Components (Next.js 14 App Router). Only add `"use client"` when:
- Using React hooks (useState, useEffect, etc.)
- Handling browser events
- Using Framer Motion animations
- Real-time Supabase subscriptions

## Biome Configuration

Biome handles both linting and formatting with:
- 2-space indentation
- Recommended rulesets for Next.js and React
- Automatic import organization on save
- Git-aware file processing

When making code changes, always run `npm run lint` before committing.

## Brand Identity

**Brand Name**: CosyHub
**Tagline**: Your cozy corner for comfort and style
**Brand Voice**: Warm, welcoming, and focused on creating comfortable, stylish spaces that feel like home.
