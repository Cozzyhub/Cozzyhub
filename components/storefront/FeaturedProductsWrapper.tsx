import { createClient } from "@/lib/supabase/server";
import FeaturedProducts from "./FeaturedProducts";

export default async function FeaturedProductsWrapper() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(8);

  return <FeaturedProducts products={products || []} />;
}
