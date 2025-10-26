import { createClient } from "@/lib/supabase/server";
import UpdateOrderStatus from "@/components/admin/UpdateOrderStatus";
import { formatINR } from "@/lib/utils/currency";

export default async function AdminOrders() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage customer orders</p>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <UpdateOrderStatus
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Customer</p>
                <p className="text-white">{order.customer_name || "Guest"}</p>
                <p className="text-gray-300 text-sm">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total</p>
                <p className="text-2xl font-bold text-white">
                  {formatINR(Number(order.total))}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-2">Items</p>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {item.product_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-white font-semibold">
                      {formatINR(Number(item.product_price))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
