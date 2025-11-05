"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import CouponInput from "@/components/ui/CouponInput";
import {
  ArrowLeft,
  Banknote,
  MapPin,
  User as UserIcon,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    couponData?: any;
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        // Logged in user
        setUser(user);
        setIsGuest(false);
        setCustomerEmail(user.email || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCustomerName(profile.full_name || "");
        }

        const { data: items } = await supabase
          .from("cart")
          .select("*, products(*)")
          .eq("user_id", user.id);

        setCartItems(items || []);
      } else {
        // Guest user - get cart from localStorage
        setIsGuest(true);
        const guestCart = localStorage.getItem("guestCart");
        if (guestCart) {
          const guestCartItems = JSON.parse(guestCart);
          
          // Fetch product details for guest cart items
          if (guestCartItems.length > 0) {
            const productIds = guestCartItems.map((item: any) => item.productId);
            const { data: products } = await supabase
              .from("products")
              .select("*")
              .in("id", productIds);
            
            if (products) {
              const itemsWithProducts = guestCartItems.map((item: any) => {
                const product = products.find(p => p.id === item.productId);
                return {
                  id: item.productId,
                  product_id: item.productId,
                  quantity: item.quantity,
                  products: product,
                };
              }).filter((item: any) => item.products); // Filter out items where product not found
              
              setCartItems(itemsWithProducts);
            }
          }
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(subtotal - discount, 0);

  const handleApplyCoupon = async (code: string) => {
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.couponData.code,
          discount: data.discount,
          couponData: data.couponData,
        });
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to apply coupon",
        discount: 0,
      };
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "online") {
      const message = `Hi! I want to place an order worth ${formatINR(total)}. My name is ${customerName}.`;
      const whatsappUrl = `https://wa.me/message/ZS4AVDIPSYGDO1?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: isGuest ? null : user.id, // null for guest orders
          total,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: {
            address,
            city,
            postal_code: postalCode,
            state,
            country: "India",
            phone: customerPhone,
          },
          status: "pending",
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products.name,
        product_price: item.products.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      if (isGuest) {
        localStorage.removeItem("guestCart");
        router.push(`/order-confirmation?orderId=${order.id}`);
      } else {
        await supabase.from("cart").delete().eq("user_id", user.id);
        router.push("/profile?order=success");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-4"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
          <Link href="/products">
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
          {isGuest && (
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-200 rounded-lg text-sm font-medium">
              Guest Checkout
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <UserIcon className="text-purple-400" size={24} />
                  <h2 className="text-xl font-bold text-white">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      placeholder="Raj Kumar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      placeholder="raj@example.com"
                      disabled={!isGuest && !!user}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="9876543210"
                  />
                  <p className="text-gray-400 text-xs mt-1">10-digit mobile number</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-purple-400" size={24} />
                  <h2 className="text-xl font-bold text-white">
                    Shipping Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      placeholder="123 MG Road"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="400001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-white/20 cursor-pointer hover:border-purple-500 transition bg-white/5">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-5 h-5 text-purple-500"
                    />
                    <Banknote size={24} className="text-green-400" />
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Cash on Delivery
                      </p>
                      <p className="text-gray-400 text-sm">
                        Pay when you receive the product
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-white/20 cursor-pointer hover:border-purple-500 transition bg-white/5">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="w-5 h-5 text-purple-500"
                    />
                    <MessageCircle size={24} className="text-green-500" />
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Online Payment (WhatsApp)
                      </p>
                      <p className="text-gray-400 text-sm">
                        Contact us on WhatsApp to complete payment
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {paymentMethod === "online" ? (
                  <>
                    <MessageCircle size={20} />
                    Contact on WhatsApp
                  </>
                ) : (
                  <>
                    <Banknote size={20} />
                    {loading ? "Placing Order..." : "Place Order (COD)"}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-24 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                      {item.products.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Banknote size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.products.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {formatINR(Number(item.products.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Have a coupon code?
                </h3>
                <CouponInput
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon}
                />
              </div>

              <div className="border-t border-white/20 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
