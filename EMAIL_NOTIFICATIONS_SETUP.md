# Email Notifications Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free tier available)
2. Verify your domain OR use their test domain for development
3. Create an API key in the dashboard
4. Copy the API key (starts with `re_`)

### Step 2: Add Environment Variables

Add to your `.env.local` file:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_URL=https://yourdomain.com
```

**For Development:**
```env
RESEND_API_KEY=re_test_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_URL=http://localhost:3000
```

### Step 3: Restart Development Server

```bash
npm run dev
```

That's it! Emails will now be sent automatically.

---

## 📧 Email Types Implemented

### 1. Order Confirmation
- **Trigger:** When order is created
- **Sent to:** Customer email
- **Content:** Order details, items, total, shipping address

### 2. Order Shipped
- **Trigger:** When order status changes to "shipped"
- **Sent to:** Customer email
- **Content:** Tracking number, courier name, estimated delivery

### 3. Order Delivered
- **Trigger:** When order status changes to "delivered"
- **Sent to:** Customer email
- **Content:** Delivery confirmation, shop again CTA

### 4. Low Stock Alert
- **Trigger:** When product stock falls below threshold
- **Sent to:** Admin email
- **Content:** Product details, current stock level

---

## 🔧 How It Works

### Automatic Emails

The system automatically sends emails when:

1. **New Order Created** → Order Confirmation Email
2. **Order Status Updated to "shipped"** → Shipping Email
3. **Order Status Updated to "delivered"** → Delivery Email

### Manual Email Sending

You can manually trigger emails from admin actions:

```typescript
import { sendOrderConfirmation, sendOrderShipped } from "@/lib/email/service";

// Send order confirmation
await sendOrderConfirmation(order);

// Send shipping notification
await sendOrderShipped(order);
```

---

## 📝 Email Templates

All email templates are in `lib/email/service.ts` with:
- Responsive HTML design
- Beautiful gradients (matches brand colors)
- Mobile-friendly layout
- Professional styling

### Template Features:
- ✅ Branded header with gradients
- ✅ Order details table
- ✅ Discount/coupon display
- ✅ Shipping address
- ✅ Call-to-action buttons
- ✅ Tracking information
- ✅ Responsive design

---

## 🎨 Customizing Templates

Edit `lib/email/service.ts` → `emailTemplates` object:

```typescript
export const emailTemplates = {
  orderConfirmation: (order) => `
    <!-- Your custom HTML here -->
  `,
  // ... other templates
}
```

---

## 🧪 Testing Emails

### Option 1: Use Resend Test Mode

With test API key, emails go to Resend dashboard (not real inboxes).

### Option 2: Send to Your Email

1. Create a test order with your email
2. Check your inbox
3. Verify email renders correctly

### Option 3: Use Resend Preview

```bash
# In Resend dashboard, use "Send Test" feature
```

---

## 📊 Email Analytics

Resend provides:
- Delivery rates
- Open rates
- Click tracking
- Bounce tracking

Access at: https://resend.com/dashboard

---

## 🔐 Security Best Practices

1. **Never commit API keys** - Keep in `.env.local`
2. **Use environment-specific keys** - Different for dev/prod
3. **Verify sender domain** - Better deliverability
4. **Rate limiting** - Avoid spam detection

---

## 🚨 Troubleshooting

### Email Not Sending?

1. **Check API Key**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check Logs**
   - Look for "RESEND_API_KEY not set" warning
   - Check for Resend API errors in console

3. **Verify Email Address**
   - Must be valid format
   - Check for typos

4. **Check Resend Dashboard**
   - View recent API calls
   - Check for errors or bounces

### Common Errors

| Error | Solution |
|-------|----------|
| "Email service not configured" | Add RESEND_API_KEY to .env.local |
| "Unauthorized" | API key is invalid or expired |
| "Domain not verified" | Use test domain or verify your domain |
| "Rate limit exceeded" | Upgrade Resend plan or wait |

---

## 💰 Pricing (Resend)

- **Free Tier:** 100 emails/day
- **Pro:** $20/month for 50,000 emails
- **Enterprise:** Custom pricing

For most small e-commerce sites, free tier is sufficient.

---

## 🎯 Next Steps

After setup:

1. ✅ Test order confirmation email
2. ✅ Test shipping notification
3. ✅ Test delivery notification
4. ✅ Customize templates with your branding
5. ✅ Verify domain for better deliverability
6. ✅ Set up webhooks for advanced tracking

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend React Email](https://react.email) - Advanced templates
- [Email Best Practices](https://resend.com/docs/best-practices)

---

## 🆘 Need Help?

1. Check Resend docs: https://resend.com/docs
2. View API logs in Resend dashboard
3. Test with: `curl https://api.resend.com/emails -H "Authorization: Bearer YOUR_KEY"`

---

**✨ Email notifications are now ready to use!**
