"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/storefront/Navbar";
import Link from "next/link";
import { CheckCircle, Package, Mail, Phone } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .eq("id", orderId)
        .single();

      if (data && !error) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find this order. Please check your email for order details.
          </p>
          <Link href="/products">
            <button
              type="button"
              className="px-6 py-3 btn-primary rounded-lg"
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Order Number
              </h3>
              <p className="text-lg font-mono font-semibold text-gray-900">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Order Date
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-gray-400" />
                <span>{order.customer_email}</span>
              </div>
              {order.shipping_address?.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-gray-400" />
                  <span>{order.shipping_address.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.shipping_address.address}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Order Items
          </h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                {item.products?.image_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.products.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatINR(Number(item.product_price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatINR(order.total)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass-card rounded-2xl p-8 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>You'll receive an order confirmation email at <strong>{order.customer_email}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>We'll notify you when your order ships</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>Expected delivery: 5-7 business days</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/products">
            <button
              type="button"
              className="px-8 py-3 btn-primary rounded-lg"
            >
              Continue Shopping
            </button>
          </Link>
          <Link href="/">
            <button
              type="button"
              className="px-8 py-3 btn-ghost rounded-lg"
            >
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
