import { createClient } from "@/lib/supabase/server";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { data: orders } = await supabase.from("orders").select("total");

  const totalRevenue =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  const stats = [
    {
      name: "Total Products",
      value: productsCount || 0,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Total Orders",
      value: ordersCount || 0,
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Revenue",
      value: formatINR(totalRevenue),
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Growth",
      value: "+12.5%",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, customer_name")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                >
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">
                {stat.name}
              </h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium pb-3">
                  Order ID
                </th>
                <th className="text-left text-gray-400 font-medium pb-3">
                  Customer
                </th>
                <th className="text-left text-gray-400 font-medium pb-3">
                  Total
                </th>
                <th className="text-left text-gray-400 font-medium pb-3">
                  Status
                </th>
                <th className="text-left text-gray-400 font-medium pb-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-white/5">
                  <td className="py-4 text-gray-300 font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="py-4 text-white">
                    {order.customer_name || "Guest"}
                  </td>
                  <td className="py-4 text-white font-semibold">
                    {formatINR(Number(order.total))}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-500/20 text-green-300"
                          : order.status === "shipped"
                            ? "bg-blue-500/20 text-blue-300"
                            : order.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
