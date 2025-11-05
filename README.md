# CozzyHub - Premium E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js 16, React 19, Supabase, and TailwindCSS 4.

## ✨ Features

### Customer Features
- 🛍️ Product browsing with advanced filtering
- 🔍 Full-text search with filters
- 🛒 Shopping cart with real-time updates
- ❤️ Wishlist functionality
- ⭐ Product reviews and ratings
- 📦 Order tracking with visual timeline
- 👤 User authentication and profiles
- 🎟️ Coupon/promo code support
- 🔔 Stock notifications
- 📊 Product comparison
- 🌐 Affiliate link generation

### Admin Features
- 📈 Analytics dashboard
- 📦 Order management with bulk actions
- 🏷️ Product & category management
- 📊 Inventory alerts for low stock
- 👥 Customer management
- ⭐ Review moderation
- 📬 Newsletter subscriber management
- 🎨 Product variant management
- 📊 Sales reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Cozzyhub
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_URL=http://localhost:3000
```

Optional:
```env
RESEND_API_KEY=your-resend-api-key  # For email notifications
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXX  # For analytics
```

### 3. Database Setup

Run the migrations in your Supabase SQL Editor:

1. `supabase/schema.sql` - Base schema
2. `supabase/migrations/add_new_features.sql` - Extended features
3. `supabase/migrations/create_affiliate_system.sql` - Affiliate system
4. `supabase/migrations/add_category_subcategory.sql` - Category enhancements
5. `supabase/migrations/add_product_affiliate_links.sql` - Affiliate links
6. `supabase/migrations/add_stock_history.sql` - Stock tracking

### 4. Create PWA Icons

Place these files in the `public/` directory:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

See `CREATE_PWA_ICONS.md` for generation instructions.

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## 🗂️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── products/          # Product pages
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── storefront/       # Customer-facing components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── email/            # Email service
│   └── utils/            # Helper functions
├── supabase/             # Database migrations
└── public/               # Static assets
```

## 🔐 Admin Access

To create an admin user:

1. Sign up through the regular signup flow
2. In Supabase, update the `profiles` table:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   ```
3. Access admin at `/admin`

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, TailwindCSS 4, Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Email:** Resend (optional)
- **Icons:** Lucide React
- **Image Processing:** Sharp
- **Linting:** Biome

## 📱 PWA Support

The application is PWA-ready with:
- Service worker for offline support
- App manifest
- Installable on mobile/desktop

## 🔧 Configuration

### Image Optimization

Images are optimized using Next.js Image component with:
- AVIF/WebP formats
- Responsive sizes
- Lazy loading

### Database

All tables use Row Level Security (RLS) policies for security.
See `supabase/schema.sql` for the complete schema.

## 🐛 Troubleshooting

### Build Errors
- Clear `.next` folder and rebuild
- Verify all environment variables are set
- Check Node.js version (18+)

### Database Errors
- Ensure all migrations have been run
- Verify Supabase credentials
- Check RLS policies are enabled

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check email domain is verified in Resend
- Review logs for error messages

## 📄 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Contact

[Your Contact Information]
