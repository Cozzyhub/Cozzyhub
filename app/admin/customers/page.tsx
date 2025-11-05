import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Search, ShoppingBag, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Fetch all users with their order stats
  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      created_at,
      is_admin
    `)
    .order("created_at", { ascending: false });

  if (params.search) {
    query = query.ilike("full_name", `%${params.search}%`);
  }

  const { data: customers } = await query;

  // Fetch order counts and totals for each customer
  const customerStats = await Promise.all(
    (customers || []).map(async (customer) => {
      const { data: orders } = await supabase
        .from("orders")
        .select("total")
        .eq("user_id", customer.id);

      const orderCount = orders?.length || 0;
      const totalSpent =
        orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      return {
        ...customer,
        orderCount,
        totalSpent,
      };
    }),
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users size={32} />
            Customer Management
          </h1>
          <p className="text-gray-400">View and manage all customers</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form action="/admin/customers" method="GET">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="search"
                placeholder="Search customers..."
                defaultValue={params.search}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </form>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={24} />
              <h3 className="text-gray-400 text-sm">Total Customers</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {customerStats.length}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="text-green-500" size={24} />
              <h3 className="text-gray-400 text-sm">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {customerStats.reduce((sum, c) => sum + c.orderCount, 0)}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-purple-500" size={24} />
              <h3 className="text-gray-400 text-sm">Admin Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {customerStats.filter((c) => c.is_admin).length}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Customer
                  </th>
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Joined
                  </th>
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Orders
                  </th>
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Total Spent
                  </th>
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Role
                  </th>
                  <th className="text-left p-4 text-gray-400 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customerStats.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {customer.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {customer.full_name || "Anonymous"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {customer.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-white font-semibold">
                      {customer.orderCount}
                    </td>
                    <td className="p-4 text-green-400 font-semibold">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {customer.is_admin ? (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-pink-400 hover:text-pink-300 text-sm font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customerStats.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
