import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, rating, title, comment } = body;

    // Validate
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Check if user already reviewed this product
    const { data: existing, error: existingError } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("product_id", product_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You've already reviewed this product" },
        { status: 400 },
      );
    }

    // Check if user purchased this product
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id, orders(user_id)")
      .eq("product_id", product_id);

    const hasPurchased = orderItems?.some(
      (item: any) => item.orders?.user_id === user.id,
    );

    // Create review
    const { data: review, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id,
        user_id: user.id,
        rating,
        title,
        comment,
        verified_purchase: hasPurchased,
      })
      .select()
      .single();

    if (error) {
      console.error("Review creation error:", error);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // First get reviews
    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 },
      );
    }

    // Then get user profiles for each review
    const reviewsWithProfiles = await Promise.all(
      (reviews || []).map(async (review) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", review.user_id)
          .single();
        
        return {
          ...review,
          profiles: profile || { full_name: "Anonymous" }
        };
      })
    );

    return NextResponse.json({ reviews: reviewsWithProfiles || [] });
  } catch (error) {
    console.error("Reviews GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
