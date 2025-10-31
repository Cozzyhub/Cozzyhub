import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import {
  Mail,
  User,
  Calendar,
  ShoppingBag,
  Package,
  CheckCircle,
} from "lucide-react";
import { formatINR } from "@/lib/utils/currency";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderSuccess = params.order === "success";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalOrders = orders?.length || 0;
  const totalSpent =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orderSuccess && (
          <div className="mb-6 glass-card bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="text-green-900 font-semibold">
                Order placed successfully!
              </p>
              <p className="text-green-700 text-sm">
                Thank you for your purchase. Your order is being processed.
              </p>
            </div>
          </div>
        )}

        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-8">
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-muted-rose to-warm-amber flex items-center justify-center mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-gray-600 mb-6 flex items-center gap-2">
                  <Mail size={16} />
                  {user.email}
                </p>

                {profile?.is_admin && (
                  <span className="px-4 py-2 bg-gradient-to-r from-rose-200 to-amber-100 text-gray-900 text-sm font-semibold rounded-full mb-6">
                    Admin
                  </span>
                )}

                <div className="w-full space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-light-gray" />
                    <span>
                      Joined{" "}
                      {new Date(profile?.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-pink-600" />
                    <span className="text-gray-600">Total Orders</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {totalOrders}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-warm-amber" />
                    <span className="text-gray-600">Total Spent</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {formatINR(totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order History
              </h2>

              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/50 border border-gray-200/60 rounded-xl p-6 hover:bg-white/70 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Order ID</p>
                          <p className="text-gray-900 font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : order.status === "shipped"
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : order.status === "processing"
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : order.status === "cancelled"
                                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                                      : "bg-warm-gray text-gray-900 border border-misty-gray"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200/40 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-600 text-sm">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {formatINR(order.total)}
                          </p>
                        </div>

                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-gray-600 text-sm">Items:</p>
                            {order.order_items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 text-sm"
                              >
                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                                  {item.products?.image_url ? (
                                    <img
                                      src={item.products.image_url}
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package
                                      size={20}
                                      className="text-gray-600"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-gray-900 font-semibold">
                                  {formatINR(
                                    Number(item.product_price) * item.quantity,
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag
                    size={64}
                    className="mx-auto text-gray-600 mb-4"
                  />
                  <p className="text-gray-600 text-lg mb-2">No orders yet</p>
                  <p className="text-light-gray">
                    Start shopping to see your orders here!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
