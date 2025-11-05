import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET wishlist items
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wishlist")
    .select(`
      id,
      created_at,
      product:products(
        id,
        name,
        slug,
        price,
        original_price,
        discount_percentage,
        image_url,
        stock,
        average_rating,
        is_active
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ wishlist: data });
}

// POST add to wishlist
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id } = await req.json();

  if (!product_id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already in wishlist" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("wishlist")
    .insert({ user_id: user.id, product_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// DELETE remove from wishlist
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("product_id");

  if (!product_id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", product_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
