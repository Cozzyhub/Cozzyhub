# 🔐 Supabase Authentication & Email Configuration Guide

## 📋 Table of Contents
- [Supabase Setup](#supabase-setup)
- [Authentication Configuration](#authentication-configuration)
- [Email Service Setup](#email-service-setup)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Email Templates](#email-templates)
- [Testing & Troubleshooting](#testing--troubleshooting)

---

## 🚀 Supabase Setup

### 1. Project Information
**Current Supabase Project:**
- **URL:** `https://umluidzwrirpmzhyptlc.supabase.co`
- **Region:** Auto-selected by Supabase
- **Project Name:** CozzyHub (or your custom name)

### 2. Required Supabase Services
- ✅ **Authentication** - User signup/login/password reset
- ✅ **Database** - PostgreSQL with Row Level Security (RLS)
- ✅ **Storage** - Product images storage
- ✅ **Realtime** (Optional) - Live updates

---

## 🔑 Authentication Configuration

### Supabase Dashboard Settings

#### Step 1: Navigate to Authentication Settings
1. Go to: https://supabase.com/dashboard/project/umluidzwrirpmzhyptlc
2. Click **Authentication** → **Settings**

#### Step 2: Configure Site URL
```
Site URL: https://your-domain.com
OR for development: http://localhost:3000
```

#### Step 3: Configure Redirect URLs
Add these URLs to **Redirect URLs** section:
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

#### Step 4: Email Auth Provider Settings
Go to **Authentication** → **Providers** → **Email**

**Enable the following:**
- ✅ Enable Email provider
- ✅ Confirm email (recommended for production)
- ✅ Secure email change (recommended)
- ❌ Double confirm email change (optional)

**Email Templates Configuration:**
```
Confirmation email subject: Confirm Your Email - CozzyHub
Reset password subject: Reset Your Password - CozzyHub
Magic link subject: Your Magic Link - CozzyHub
Email change subject: Confirm Email Change - CozzyHub
```

#### Step 5: Password Requirements
**Recommended Settings:**
- Minimum length: 8 characters
- Require uppercase: Optional
- Require lowercase: Optional  
- Require numbers: Optional
- Require symbols: Optional

---

## 📧 Email Service Setup

### Option 1: Supabase Built-in Email (Development Only)

**Default behavior:**
- Supabase provides built-in email service for testing
- **Limitation:** Max 4 emails per hour per email address
- **Not suitable for production!**

**No configuration needed** - works out of the box for development.

---

### Option 2: Custom SMTP (Production Recommended)

#### Using Resend (Recommended)

**Why Resend?**
- Modern email API
- Free tier: 3,000 emails/month
- Easy setup
- Great deliverability

**Setup Steps:**

1. **Sign up for Resend**
   - Go to: https://resend.com
   - Create account
   - Verify your domain (optional but recommended)

2. **Get API Key**
   - Navigate to: https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Configure in Supabase**
   - Go to: **Project Settings** → **Authentication**
   - Scroll to **SMTP Settings**
   
   ```
   Sender name: CozzyHub
   Sender email: noreply@your-domain.com
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   ```

4. **Add to Environment Variables**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@your-domain.com
   ```

---

#### Using Gmail SMTP (Alternative)

**Setup Steps:**

1. **Enable 2-Step Verification**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn On

2. **Create App Password**
   - Security → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Configure in Supabase SMTP Settings**
   ```
   Sender name: CozzyHub
   Sender email: your-email@gmail.com
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [16-character app password]
   ```

**Limitations:**
- Gmail limits: 500 emails/day
- Can be flagged as spam
- Not ideal for production

---

#### Using SendGrid (Alternative)

1. **Sign up:** https://sendgrid.com
2. **Create API Key:** Settings → API Keys
3. **Configure in Supabase:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```

---

## 🔐 Environment Variables

### Required Variables (.env.local)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://umluidzwrirpmzhyptlc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbHVpZHp3cmlycG16aHlwdGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk3MzcsImV4cCI6MjA3NjcwNTczN30.rFpm2iCkjo4mSog9V2lybgtM3aOSryR_clxkx4ojPvw

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=noreply@cozzyhub.shop

# Site URL
NEXT_PUBLIC_URL=http://localhost:3000
# OR for production:
# NEXT_PUBLIC_URL=https://your-domain.com

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VDM3C00QCC
```

### Getting Your Keys

**Supabase URL & Anon Key:**
1. Go to: https://supabase.com/dashboard/project/umluidzwrirpmzhyptlc
2. Click **Settings** → **API**
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Service Role Key (For Backend Only - Keep Secret!):**
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
⚠️ Never expose this in client-side code!

---

## 🔄 Authentication Flow

### 1. User Signup Flow

```mermaid
sequenceDiagram
    User->>Frontend: Fill signup form
    Frontend->>Supabase: auth.signUp()
    Supabase->>Email Service: Send confirmation email
    Email Service->>User: Email with confirmation link
    User->>Confirmation Link: Click link
    Confirmation Link->>Supabase: Verify token
    Supabase->>Database: Create profile
    Database->>Frontend: Redirect to /auth/callback
    Frontend->>User: Auto-login & redirect home
```

**Code Implementation:**
```typescript
// app/signup/page.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### 2. Login Flow

```typescript
// app/login/page.tsx
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### 3. Password Reset Flow

```typescript
// app/reset-password/page.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/update-password`,
});
```

### 4. Auth Callback Handler

```typescript
// app/auth/callback/route.ts
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(`${origin}/?verified=true`);
  }
  
  return NextResponse.redirect(`${origin}/login`);
}
```

---

## 📧 Email Templates

### Built-in Supabase Email Templates

Customize these in: **Authentication** → **Email Templates**

#### 1. Confirmation Email
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### 2. Password Recovery
```html
<h2>Reset your password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

### Custom Email Service (Resend/Order Notifications)

**Location:** `lib/email/service.ts`

#### Order Confirmation Email
```typescript
export async function sendOrderConfirmation(order: any) {
  return sendEmail({
    to: order.customer_email,
    subject: `Order Confirmation #${order.id.slice(0, 8)} - CozzyHub`,
    html: emailTemplates.orderConfirmation(order),
  });
}
```

#### Email Templates Available:
1. ✅ **Order Confirmation** - Sent after successful order
2. ✅ **Order Shipped** - With tracking info
3. ✅ **Order Delivered** - Delivery notification
4. ✅ **Low Stock Alert** - Admin notification

**Usage:**
```typescript
import { sendOrderConfirmation } from '@/lib/email/service';

await sendOrderConfirmation({
  id: orderId,
  customer_email: 'user@example.com',
  customer_name: 'John Doe',
  total: 999.00,
  order_items: [...],
  shipping_address: '...'
});
```

---

## 🧪 Testing & Troubleshooting

### Testing Authentication in Development

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Signup**
   - Go to: http://localhost:3000/signup
   - Enter test email and password
   - Check email inbox (or Supabase dashboard)

3. **Check Supabase Dashboard**
   - **Authentication** → **Users**
   - Verify user is created
   - Check if email is confirmed

### Common Issues & Solutions

#### ❌ Issue: "Email not sent"
**Solutions:**
- Check Supabase logs: **Logs** → **Auth Logs**
- Verify SMTP settings are correct
- Check email service rate limits
- Verify sender email is authorized

#### ❌ Issue: "Invalid redirect URL"
**Solutions:**
- Add URL to Supabase redirect URLs
- Check `emailRedirectTo` matches allowed URLs
- Verify site URL is set correctly

#### ❌ Issue: "User already registered"
**Solutions:**
- Delete user from Supabase dashboard
- Use different email
- Check if email confirmation is pending

#### ❌ Issue: "Email in spam folder"
**Solutions:**
- Verify domain with email provider
- Add SPF/DKIM records
- Use professional email service (Resend/SendGrid)
- Avoid spammy words in email content

### Testing Email Delivery

**Using Resend Dashboard:**
1. Go to: https://resend.com/emails
2. View sent emails
3. Check delivery status
4. View bounce/complaint logs

**Testing Locally:**
- Use tools like [Mailtrap](https://mailtrap.io/) for email testing
- Or use [Ethereal Email](https://ethereal.email/)

---

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)
All tables have RLS enabled in `supabase/schema.sql`:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### 2. Admin Access
Admin check in policies:
```sql
CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

### 3. Password Requirements
Set in Supabase dashboard under Authentication → Policies

### 4. Email Verification
**Production recommendation:**
- Enable "Confirm email" in Supabase
- Users must verify before login
- Set in: Authentication → Settings → Email

### 5. Rate Limiting
Supabase provides automatic rate limiting:
- Auth endpoints: 60 requests/min
- Email sending: 4 emails/hour (built-in)
- Custom SMTP: Based on provider

---

## 📊 Monitoring & Analytics

### Check Authentication Stats
1. Go to: **Authentication** → **Users**
2. View:
   - Total users
   - Signups over time
   - Confirmed vs unconfirmed
   - Last sign-in time

### Email Logs
- Supabase: **Logs** → **Auth Logs**
- Resend: **Emails** → **Logs**
- SendGrid: **Activity** → **Email Activity**

---

## 🚀 Production Deployment Checklist

### Before Going Live:

- [ ] Set up custom SMTP (Resend/SendGrid)
- [ ] Configure custom domain for emails
- [ ] Add SPF, DKIM, DMARC DNS records
- [ ] Enable email confirmation
- [ ] Set strong password requirements
- [ ] Update redirect URLs for production domain
- [ ] Update `NEXT_PUBLIC_URL` in .env
- [ ] Test full auth flow in production
- [ ] Set up email monitoring
- [ ] Configure rate limiting if needed
- [ ] Review RLS policies
- [ ] Test password reset flow
- [ ] Set up admin user(s)

### Environment Variables for Production:
```env
# Update these for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=re_your_production_key
EMAIL_FROM=noreply@your-domain.com
NEXT_PUBLIC_URL=https://your-domain.com
```

---

## 📚 Additional Resources

### Official Documentation
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Resend API Docs](https://resend.com/docs)
- [Next.js Auth with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Support
- Supabase Discord: https://discord.supabase.com
- Resend Support: support@resend.com

---

## 🎉 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Then edit .env.local with your keys

# Run development server
npm run dev

# Access the app
# http://localhost:3000

# Test authentication
# 1. Visit /signup
# 2. Create account
# 3. Check email
# 4. Click confirmation link
# 5. Login at /login
```

---

**Last Updated:** 2025-01-05  
**Version:** 1.0.0  
**Project:** CozzyHub E-commerce Platform
