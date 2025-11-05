# Google Analytics Setup

Google Analytics has been integrated into the application. Follow these steps to enable it:

## 1. Get Your GA Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

## 2. Add to Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

## 3. Tracking Events

You can track custom events throughout the application using the `trackEvent` function:

```typescript
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

// Example: Track add to cart
trackEvent("add_to_cart", "ecommerce", productName, price);

// Example: Track purchase
trackEvent("purchase", "ecommerce", orderId, totalAmount);
```

## Event Parameters

- **action**: The event action (e.g., "add_to_cart", "purchase")
- **category**: The event category (e.g., "ecommerce", "engagement")
- **label** (optional): Additional context
- **value** (optional): Numeric value

## Automatic Tracking

The integration automatically tracks:
- Page views on route changes
- User navigation patterns
