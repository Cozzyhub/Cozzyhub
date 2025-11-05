import { createClient } from "@/lib/supabase/server";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .order("created_at", { ascending: false });

  // Filter by status
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Search by customer name, email, or order ID
  if (params.search) {
    query = query.or(
      `customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%,id.ilike.%${params.search}%`,
    );
  }

  const { data: orders } = await query;

  return <AdminOrdersClient initialOrders={orders || []} initialParams={params} />;
}
