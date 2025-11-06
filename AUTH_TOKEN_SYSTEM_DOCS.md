# 🔐 Custom Authorization Token System Documentation

## Overview
This system implements a custom authorization flow where users receive a unique 16-character alphanumeric token upon registration. They must click an authorization link to activate their account before accessing protected resources.

---

## 📋 System Components

### 1. Database Schema
**Location:** `supabase/migrations/add_auth_token.sql`

**New Columns Added to `profiles` table:**
```sql
- auth_token VARCHAR(16) UNIQUE       -- Unique authorization token
- is_authorized BOOLEAN DEFAULT FALSE -- Authorization status
- authorized_at TIMESTAMPTZ           -- When user was authorized
```

**Database Function:**
```sql
generate_auth_token() -- Generates unique 16-char token
```

### 2. Token Generation Utility
**Location:** `lib/utils/token.ts`

**Functions:**
- `generateAuthToken()` - Creates a cryptographically secure 16-char token
- `generateUniqueAuthToken()` - Ensures token uniqueness by checking database
- `isValidAuthTokenFormat()` - Validates token format

### 3. Email Service
**Location:** `lib/email/service.ts`

**New Template:**
- `emailTemplates.userAuthorization()` - Beautiful email with authorization link
- `sendAuthorizationEmail()` - Helper function to send authorization emails

### 4. Registration API
**Location:** `app/api/auth/register/route.ts`

**Endpoint:** `POST /api/auth/register`

**Workflow:**
1. Create user in Supabase Auth
2. Generate unique auth token
3. Store token in profiles table
4. Send authorization email
5. Return authorization URL

### 5. Authorization Endpoint
**Location:** `app/user/authorization/[auth_token]/route.ts`

**Endpoint:** `GET /user/authorization/:auth_token`

**Workflow:**
1. Validate token format
2. Look up user by token
3. Check if already authorized
4. Mark user as authorized
5. Redirect to user page

### 6. User Profile Page
**Location:** `app/user/page.tsx`

**Route:** `/user`

**Features:**
- Displays user profile information
- Shows authorization status
- Authorization success banner
- Protected route (requires authorization)

---

## 🔄 Complete User Flow

### Step 1: User Registration
```
User fills signup form
  ↓
POST /api/auth/register
  ↓
Create Supabase Auth account
  ↓
Generate unique 16-char token (e.g., "Xy9Ab3KqT7MnR4Lp")
  ↓
Store token in profiles.auth_token
  ↓
Send authorization email with link
```

### Step 2: Email Authorization
```
User receives email
  ↓
Email contains:
  - Authorization token display
  - Authorization button/link
  - Security warning
  ↓
Link format: cozzyhub.shop/user/authorization/Xy9Ab3KqT7MnR4Lp
```

### Step 3: Token Validation
```
User clicks authorization link
  ↓
GET /user/authorization/Xy9Ab3KqT7MnR4Lp
  ↓
Validate token format (16 alphanumeric chars)
  ↓
Look up user in database
  ↓
Check if token exists and is valid
```

### Step 4: Authorization & Redirect
```
If token valid:
  ↓
Update profiles:
  - is_authorized = true
  - authorized_at = NOW()
  ↓
Redirect to: /user?authorized=true
  ↓
Display success message and profile
```

---

## 🔧 Implementation Details

### Token Generation Security

**Cryptographic Randomness:**
```typescript
// Uses crypto.getRandomValues for secure randomness
const randomValues = new Uint32Array(16);
crypto.getRandomValues(randomValues);
```

**Character Set:**
- Uppercase: A-Z (26 chars)
- Lowercase: a-z (26 chars)  
- Numbers: 0-9 (10 chars)
- Total: 62 possible characters per position
- Total combinations: 62^16 = ~47 septillion possible tokens

**Uniqueness Check:**
- Database lookup before saving
- Maximum 10 generation attempts
- Fallback with timestamp if collisions occur

### API Responses

**Registration Success:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email...",
  "authorization_url": "https://cozzyhub.shop/user/authorization/Xy9Ab3KqT7MnR4Lp",
  "auth_token": "Xy9Ab3KqT7MnR4Lp",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Invalid Token Response:**
```html
<!-- HTML page with error message -->
<h1>Invalid Authorization Token</h1>
<p>The token is invalid or has expired.</p>
<a href="/signup">Back to Signup</a>
```

**Authorization Success:**
```
HTTP 302 Redirect
Location: /user?authorized=true
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
# Connect to your Supabase project
psql "postgresql://your-connection-string"

# Run the migration
\i supabase/migrations/add_auth_token.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `add_auth_token.sql`
3. Run query

### 2. Configure Environment Variables

Add to `.env.local`:
```env
# Email service (for authorization emails)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@cozzyhub.shop

# Base URL for authorization links
NEXT_PUBLIC_URL=https://cozzyhub.shop
# Or for development:
# NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Test the Flow

```bash
# Start development server
npm run dev

# Test registration
# 1. Go to http://localhost:3000/signup
# 2. Fill in registration form
# 3. Check console/logs for authorization URL
# 4. Visit the authorization URL
# 5. Should redirect to /user
```

---

## 📧 Email Template Preview

**Subject:** Complete Your CozzyHub Registration - Authorization Required

**Content:**
```
🎉 Welcome to CozzyHub!
Complete Your Registration

Hi [Name],

Thank you for registering with CozzyHub! To complete your 
registration and access your account, please click the button 
below to authorize your account.

Your Authorization Token:
[Xy9Ab3KqT7MnR4Lp]

[Authorize My Account Button]

⚠️ Security Notice: This authorization link is unique to your 
account. Do not share it with anyone.

Or copy and paste this link:
https://cozzyhub.shop/user/authorization/Xy9Ab3KqT7MnR4Lp
```

---

## 🔒 Security Considerations

### Token Security
- ✅ Cryptographically secure random generation
- ✅ 16-character length (62^16 combinations)
- ✅ Unique constraint in database
- ✅ Single-use recommended (can be enhanced)
- ✅ No expiration (can be added if needed)

### Recommendations for Production

1. **Add Token Expiration:**
```sql
ALTER TABLE profiles ADD COLUMN auth_token_expires_at TIMESTAMPTZ;
```

2. **Invalidate Token After Use:**
```typescript
// After successful authorization
await supabase
  .from('profiles')
  .update({ auth_token: null })  // Clear token
  .eq('id', userId);
```

3. **Rate Limiting:**
```typescript
// Add rate limiting to registration endpoint
// Prevent token generation abuse
```

4. **HTTPS Only:**
```typescript
// Ensure authorization links use HTTPS in production
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
```

5. **Audit Logging:**
```sql
-- Log authorization attempts
CREATE TABLE auth_token_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(16),
  ip_address INET,
  success BOOLEAN,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can register with valid email/password
- [ ] Auth token is generated and stored
- [ ] Email is sent with authorization link
- [ ] Authorization link format is correct
- [ ] Clicking link validates token
- [ ] User is marked as authorized
- [ ] Redirect to /user works
- [ ] Success banner displays on /user
- [ ] Invalid token shows error page
- [ ] Already authorized users can access /user
- [ ] Non-authorized users cannot access /user

### Test Scenarios

**Valid Authorization:**
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Extract auth_token from response
# Visit: http://localhost:3000/user/authorization/{auth_token}
# Should redirect to /user
```

**Invalid Token:**
```bash
# Visit with invalid token
curl http://localhost:3000/user/authorization/InvalidToken123

# Should return error page
```

**Already Authorized:**
```bash
# Use same token twice
# First time: Should authorize
# Second time: Should redirect to /user (already authorized)
```

---

## 📊 Database Queries

### Check Authorization Status
```sql
SELECT 
  email, 
  auth_token, 
  is_authorized, 
  authorized_at
FROM profiles
WHERE email = 'user@example.com';
```

### Find Unauthorized Users
```sql
SELECT 
  email, 
  created_at,
  auth_token
FROM profiles
WHERE is_authorized = false
ORDER BY created_at DESC;
```

### Authorization Statistics
```sql
SELECT 
  COUNT(*) FILTER (WHERE is_authorized = true) as authorized_users,
  COUNT(*) FILTER (WHERE is_authorized = false) as pending_users,
  COUNT(*) as total_users
FROM profiles;
```

### Recently Authorized Users
```sql
SELECT 
  email,
  full_name,
  authorized_at
FROM profiles
WHERE is_authorized = true
ORDER BY authorized_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Issue: Email not received
**Solutions:**
- Check RESEND_API_KEY is set correctly
- Verify EMAIL_FROM domain is authorized
- Check spam folder
- Review Resend logs: https://resend.com/emails

### Issue: Token validation fails
**Solutions:**
- Verify database migration ran successfully
- Check auth_token column exists
- Ensure token is exactly 16 characters
- Verify token exists in database

### Issue: Redirect not working
**Solutions:**
- Check NEXT_PUBLIC_URL is set correctly
- Verify no trailing slashes in URL
- Check browser console for errors
- Ensure user is logged in

### Issue: "Already registered" error
**Solutions:**
- User already exists in database
- Check Supabase Auth users
- Use different email or delete existing user

---

## 🔄 Future Enhancements

### Potential Features

1. **Token Expiration**
   - Add expiration timestamp
   - Auto-cleanup expired tokens
   - Resend functionality

2. **Multi-Factor Authorization**
   - SMS verification
   - Authenticator app support
   - Backup codes

3. **Authorization Analytics**
   - Track authorization rates
   - Monitor failed attempts
   - Geographic tracking

4. **Customizable Flows**
   - Different authorization methods
   - Conditional authorization
   - Role-based authorization

5. **Admin Dashboard**
   - View pending authorizations
   - Manually authorize users
   - Revoke authorization
   - Regenerate tokens

---

## 📚 API Reference

### POST /api/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "authorization_url": "https://cozzyhub.shop/user/authorization/Xy9Ab3KqT7MnR4Lp",
  "auth_token": "Xy9Ab3KqT7MnR4Lp",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email and password are required"
}
```

---

### GET /user/authorization/:auth_token

**Parameters:**
- `auth_token` (path): 16-character alphanumeric token

**Response (302 Redirect):**
```
Location: /user?authorized=true
```

**Response (404 HTML):**
```html
<!-- Invalid token error page -->
```

**Response (400 JSON):**
```json
{
  "error": "Invalid authorization token format",
  "message": "Token must be 16 alphanumeric characters"
}
```

---

## 📝 Changelog

### Version 1.0.0 - Initial Release
- ✅ Auth token generation system
- ✅ Database schema with auth_token column
- ✅ Registration API with token generation
- ✅ Authorization endpoint with validation
- ✅ Email template for authorization
- ✅ User profile page with authorization check
- ✅ Security features and validation

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review Supabase logs
3. Check email service logs (Resend)
4. Review browser console errors

---

**Last Updated:** 2025-01-05  
**Version:** 1.0.0  
**Project:** CozzyHub E-commerce Platform
