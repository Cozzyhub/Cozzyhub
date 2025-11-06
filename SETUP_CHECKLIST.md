# ✅ Auth Token System - Setup Checklist

## Required Steps to Get Started

### Step 1: Run Database Migration ⚙️

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard/project/umluidzwrirpmzhyptlc
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file: `supabase/migrations/add_auth_token.sql`
5. Copy and paste the entire contents
6. Click **Run** or press `Ctrl+Enter`
7. ✅ You should see "Success. No rows returned"

**Option B: Via Command Line**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref umluidzwrirpmzhyptlc

# Run migration
supabase db push
```

**Verify Migration:**
```sql
-- Run this in SQL Editor to verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('auth_token', 'is_authorized', 'authorized_at');
```

Expected result: You should see all 3 columns listed.

---

### Step 2: Get Resend API Key 📧

The system needs this to send authorization emails to users.

**Quick Setup:**
1. Go to: https://resend.com
2. Click **Sign Up** (free tier: 3,000 emails/month)
3. Verify your email
4. Go to: https://resend.com/api-keys
5. Click **Create API Key**
6. Name it: "CozzyHub Auth Emails"
7. Copy the key (starts with `re_`)
8. Update `.env.local`:
   ```env
   RESEND_API_KEY=re_paste_your_key_here
   ```

**Optional but Recommended:**
- Add your domain: https://resend.com/domains
- Verify domain for better deliverability
- Update `EMAIL_FROM=noreply@yourdomain.com`

**For Testing Only (if you don't want to set up Resend yet):**
- The system will still work, but emails won't be sent
- Check server logs for the authorization URL
- You can manually visit the URL to test

---

### Step 3: Update Environment Variables 🔐

Your `.env.local` has been updated. **You need to:**

1. **Replace the Resend API key:**
   ```env
   RESEND_API_KEY=re_your_actual_key_here  # Replace this!
   ```

2. **Verify the URL is correct:**
   ```env
   # For local development:
   NEXT_PUBLIC_URL=http://localhost:3000
   
   # For production (when deploying):
   # NEXT_PUBLIC_URL=https://cozzyhub.shop
   ```

3. **Save the file**

---

### Step 4: Restart Development Server 🔄

```bash
# Stop current server (Ctrl+C)

# Start fresh
npm run dev
```

**Why restart?**
- Next.js needs to reload environment variables
- New API routes need to be registered

---

### Step 5: Test the System 🧪

**Test Registration:**
1. Go to: http://localhost:3000/signup
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click **Sign Up**

**What Should Happen:**
- ✅ Alert shows: "Account created successfully!"
- ✅ Alert includes authorization URL
- ✅ Email sent (check inbox/spam)
- ✅ Check server logs for the URL if email fails

**Test Authorization:**
1. Copy the authorization URL from:
   - Email (preferred)
   - Alert message
   - Server console logs
2. Paste in browser
3. Should redirect to: http://localhost:3000/user?authorized=true
4. See success banner and profile

**Expected URL format:**
```
http://localhost:3000/user/authorization/Xy9Ab3KqT7MnR4Lp
                                         ^^^^^^^^^^^^^^^^
                                         16-char token
```

---

### Step 6: Verify Database 📊

Check that everything was stored correctly:

**Via Supabase Dashboard:**
1. Go to: **Table Editor** → **profiles**
2. Find your test user
3. Verify columns:
   - `auth_token`: Should have 16-char value
   - `is_authorized`: Should be `true` (after clicking link)
   - `authorized_at`: Should have timestamp

**Via SQL Editor:**
```sql
SELECT 
  email,
  auth_token,
  is_authorized,
  authorized_at,
  created_at
FROM profiles 
WHERE email = 'test@example.com';
```

---

## 🐛 Troubleshooting

### Problem: Migration fails with "column already exists"
**Solution:** 
- The migration uses `IF NOT EXISTS` so it's safe to run multiple times
- If it still fails, manually check if columns exist
- Drop and recreate if needed (be careful in production!)

### Problem: Email not received
**Solutions:**
1. Check RESEND_API_KEY is set correctly
2. Restart dev server after adding key
3. Check spam folder
4. Check Resend logs: https://resend.com/emails
5. Check server console for authorization URL
6. Verify EMAIL_FROM domain is authorized in Resend

### Problem: "Failed to update authorization status"
**Solutions:**
1. Verify migration ran successfully
2. Check auth_token column exists in profiles table
3. Check Supabase logs for errors
4. Verify token exists in database

### Problem: Cannot access /user page
**Solutions:**
1. Make sure you clicked the authorization link
2. Check is_authorized is true in database
3. Clear browser cache and cookies
4. Try logging in again

### Problem: Token validation fails
**Solutions:**
1. Verify token is exactly 16 characters
2. Check for extra spaces or characters
3. Verify token exists in database
4. Check token hasn't been cleared/deleted

---

## ✨ Quick Reference

### URLs:
- **Signup:** http://localhost:3000/signup
- **Login:** http://localhost:3000/login
- **User Page:** http://localhost:3000/user
- **Auth Link:** http://localhost:3000/user/authorization/{token}

### API Endpoints:
- **Register:** POST `/api/auth/register`
- **Authorize:** GET `/user/authorization/:auth_token`

### Database Tables:
- **profiles** - Contains auth_token, is_authorized, authorized_at

### Files to Review:
- `AUTH_TOKEN_SYSTEM_DOCS.md` - Complete documentation
- `SUPABASE_AUTH_EMAIL_CONFIG.md` - Email setup guide
- `.env.local` - Environment configuration

---

## 🚀 Production Deployment

When ready to deploy:

1. **Update environment variables:**
   ```env
   NEXT_PUBLIC_URL=https://cozzyhub.shop
   RESEND_API_KEY=re_your_production_key
   EMAIL_FROM=noreply@cozzyhub.shop
   ```

2. **Verify domain in Resend:**
   - Add cozzyhub.shop to Resend
   - Configure DNS records (SPF, DKIM)
   - Wait for verification

3. **Run migration on production database:**
   - Use Supabase dashboard SQL Editor
   - Or use Supabase CLI with production credentials

4. **Test on production:**
   - Register test user
   - Verify email delivery
   - Check authorization flow
   - Monitor logs

5. **Update Supabase Redirect URLs:**
   - Go to: Authentication → URL Configuration
   - Add: `https://cozzyhub.shop/auth/callback`
   - Add: `https://cozzyhub.shop/user/authorization/*`

---

## 📞 Need Help?

1. Check `AUTH_TOKEN_SYSTEM_DOCS.md` for detailed docs
2. Review Supabase logs
3. Check Resend email logs
4. Review browser console errors
5. Check server console output

---

**Status:** ⏳ **SETUP REQUIRED**

Complete all steps above to activate the auth token system!
