import { createClient } from "@/lib/supabase/server";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

export default async function AdminReviews() {
  const supabase = await createClient();

  // Fetch all reviews with product info
  const { data: reviews, error } = await supabase
    .from("product_reviews")
    .select(`
      *,
      products!product_reviews_product_id_fkey(name, slug, image_url)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  return <AdminReviewsClient initialReviews={reviews || []} />;
}
