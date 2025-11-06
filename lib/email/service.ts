// Email notification service
// Uses Resend API (https://resend.com)
// Set RESEND_API_KEY in environment variables

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `CozzyHub <${process.env.EMAIL_FROM || "noreply@cozzyhub.shop"}>`,
        to: [to],
        subject,
        html,
        // Add headers to improve deliverability
        headers: {
          "X-Entity-Ref-ID": `${Date.now()}`,
        },
        tags: [
          {
            name: "category",
            value: "transactional",
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ec4899; }
        .button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2>Hi ${order.customer_name || "there"},</h2>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div class="order-details">
            <h3>Order #${order.id.slice(0, 8)}</h3>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            
            <div style="margin-top: 20px;">
              <h4>Items:</h4>
              ${order.order_items.map((item: any) => `
                <div class="item">
                  <span>${item.product_name} × ${item.quantity}</span>
                  <span>₹${(Number(item.product_price) * item.quantity).toFixed(2)}</span>
                </div>
              `).join("")}
            </div>
            
            ${order.discount_amount && Number(order.discount_amount) > 0 ? `
              <div class="item">
                <span>Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span style="color: #10b981;">-₹${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            ` : ""}
            
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>Total:</span>
                <span>₹${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <p><strong>Shipping Address:</strong></p>
          <p style="white-space: pre-line; background: white; padding: 15px; border-radius: 8px;">${order.shipping_address}</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/profile" class="button">View Order Status</a>
          </center>
          
          <div class="footer">
            <p>If you have any questions, please contact us.</p>
            <p>© ${new Date().getFullYear()} CozzyHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  orderShipped: (order: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #8b5cf6; margin: 15px 0; font-family: monospace; }
        .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <h2>Hi ${order.customer_name || "there"},</h2>
          <p>Great news! Your order #${order.id.slice(0, 8)} has been shipped and is on its way to you.</p>
          
          ${order.tracking_number ? `
            <div class="tracking">
              <p><strong>Tracking Information:</strong></p>
              ${order.courier_name ? `<p>Courier: ${order.courier_name}</p>` : ""}
              <p>Tracking Number:</p>
              <div class="tracking-number">${order.tracking_number}</div>
            </div>
          ` : ""}
          
          ${order.estimated_delivery ? `
            <p style="text-align: center; font-size: 16px;">
              <strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString()}
            </p>
          ` : ""}
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/profile" class="button">Track Your Order</a>
          </center>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>© ${new Date().getFullYear()} CozzyHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  orderDelivered: (order: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Delivered!</h1>
        </div>
        <div class="content">
          <h2>Hi ${order.customer_name || "there"},</h2>
          <p>Your order #${order.id.slice(0, 8)} has been delivered!</p>
          
          <p style="text-align: center; font-size: 18px; margin: 30px 0;">
            We hope you love your purchase! 💝
          </p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/products" class="button">Shop Again</a>
          </center>
          
          <div class="footer">
            <p>Thank you for choosing CozzyHub!</p>
            <p>© ${new Date().getFullYear()} CozzyHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  lowStockAlert: (product: any, currentStock: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
        .product { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3 style="margin-top: 0; color: #ef4444;">Action Required</h3>
            <p>The following product is running low on stock:</p>
          </div>
          
          <div class="product">
            <h3>${product.name}</h3>
            <p><strong>Current Stock:</strong> <span style="color: #ef4444; font-size: 20px;">${currentStock} units</span></p>
            <p><strong>SKU:</strong> ${product.id.slice(0, 8)}</p>
          </div>
          
          <p>Please restock this item to avoid stockouts.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/admin/inventory-alerts" class="button">View Inventory</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `,

  userAuthorization: (user: any, authToken: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email - CozzyHub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to CozzyHub</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">Hi ${user.full_name || "there"},</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                    Thank you for signing up! Please verify your email address to activate your account and start shopping.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/user/authorization/${authToken}" 
                           style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Verify Email Address</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                    Or copy and paste this link in your browser:<br>
                    <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/user/authorization/${authToken}" style="color: #6366f1; word-break: break-all;">${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/user/authorization/${authToken}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} CozzyHub. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

// Helper functions to send specific emails
export async function sendOrderConfirmation(order: any) {
  return sendEmail({
    to: order.customer_email,
    subject: `Order Confirmation #${order.id.slice(0, 8)} - CozzyHub`,
    html: emailTemplates.orderConfirmation(order),
  });
}

export async function sendOrderShipped(order: any) {
  return sendEmail({
    to: order.customer_email,
    subject: `Your Order Has Shipped! #${order.id.slice(0, 8)}`,
    html: emailTemplates.orderShipped(order),
  });
}

export async function sendOrderDelivered(order: any) {
  return sendEmail({
    to: order.customer_email,
    subject: `Order Delivered! #${order.id.slice(0, 8)}`,
    html: emailTemplates.orderDelivered(order),
  });
}

export async function sendLowStockAlert(adminEmail: string, product: any, currentStock: number) {
  return sendEmail({
    to: adminEmail,
    subject: `Low Stock Alert: ${product.name}`,
    html: emailTemplates.lowStockAlert(product, currentStock),
  });
}

export async function sendAuthorizationEmail(user: any, authToken: string) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to CozzyHub - Verify Your Email",
    html: emailTemplates.userAuthorization(user, authToken),
  });
}
