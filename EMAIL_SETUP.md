# Email Setup Guide

## Reducing Spam Issues with Resend

To ensure your emails land in the inbox instead of spam, follow these steps:

### 1. Verify Your Domain in Resend

1. Log in to your [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain: `cozzyhub.shop`
4. Add the provided DNS records (SPF, DKIM, DMARC) to your domain's DNS settings
5. Wait for verification (usually takes a few minutes to hours)

### 2. DNS Records to Add

Add these records to your domain registrar (where you bought cozzyhub.shop):

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT  
Name: resend._domainkey
Value: [Copy from Resend Dashboard]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@cozzyhub.shop
```

### 3. Update Environment Variable

Once your domain is verified, update `.env.local`:

```bash
# Use your verified domain
EMAIL_FROM=noreply@cozzyhub.shop

# Or use a friendly name
EMAIL_FROM=CozzyHub <noreply@cozzyhub.shop>
```

### 4. Best Practices

✅ **Always use verified domains** - Unverified domains = spam folder
✅ **Keep subject lines simple** - Avoid "FREE", "ACT NOW", excessive punctuation
✅ **Use transactional email tags** - Already configured in the code
✅ **Test with mail-tester.com** - Check your spam score
✅ **Avoid URL shorteners** - Use full links only

### 5. Testing Email Deliverability

Send a test email and check it at [Mail Tester](https://www.mail-tester.com/):

1. Sign up with the address shown on mail-tester.com
2. Check your spam score (aim for 9+/10)
3. Fix any issues highlighted

### 6. Alternative: Use Gmail SMTP (Development Only)

For local development without domain verification:

```bash
# Not recommended for production
EMAIL_FROM=your-gmail@gmail.com
```

Note: Gmail will still likely mark emails as spam unless you use a verified domain.

## Current Configuration

✅ Supabase confirmation emails **disabled**
✅ Custom authorization email system **enabled**
✅ Transactional email headers **configured**
✅ Clean, spam-score-optimized email template **implemented**

## Troubleshooting

**Emails still going to spam?**
1. Check domain verification status in Resend
2. Ensure all DNS records are properly configured
3. Test with mail-tester.com
4. Check Resend logs for bounce/spam reports

**Domain not verified?**
- DNS propagation can take 24-48 hours
- Use `dig` or `nslookup` to check if records are live
- Contact your domain registrar if issues persist
