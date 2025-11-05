import { createClient } from "@/lib/supabase/server";
import AdminProductsList from "@/components/admin/AdminProductsList";

export default async function AdminProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return <AdminProductsList initialProducts={products || []} />;
}
