import { createClient } from "@/lib/supabase/server";
import AdminReportsClient from "@/components/admin/AdminReportsClient";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // Fetch data for reports
  const [ordersResult, productsResult, customersResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("*"),
    supabase.from("profiles").select("id, full_name, email, created_at"),
  ]);

  return (
    <AdminReportsClient
      initialOrders={ordersResult.data || []}
      initialProducts={productsResult.data || []}
      initialCustomers={customersResult.data || []}
    />
  );
}
