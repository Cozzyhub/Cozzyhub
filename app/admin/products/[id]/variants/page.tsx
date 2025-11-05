import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductVariantsClient from "@/components/admin/ProductVariantsClient";

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("variant_type")
    .order("value");

  return (
    <ProductVariantsClient
      product={product}
      initialVariants={variants || []}
    />
  );
}
