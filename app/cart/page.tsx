import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import CartItems from "@/components/storefront/CartItems";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";
import { ShoppingCart } from "lucide-react";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cartItems } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", user.id);

  const total =
    cartItems?.reduce((sum, item) => {
      return sum + Number(item.products.price) * item.quantity;
    }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems items={cartItems} />
            </div>

            <div className="glass-card rounded-2xl p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatINR(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-gray-900 font-bold text-xl">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <button
                  type="button"
                  className="w-full py-3 px-4 btn-primary rounded-lg transition"
                >
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
