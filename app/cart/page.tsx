import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import CartItems from "@/components/storefront/CartItems";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";

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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Shopping Cart
        </h1>

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
            <p className="text-gray-600 text-lg mb-6">
              Your cart is empty
            </p>
            <Link href="/products">
              <button
                type="button"
                className="px-6 py-3 btn-primary rounded-lg transition"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
