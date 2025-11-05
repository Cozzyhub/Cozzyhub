import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    let query = supabase
      .from("stock_history")
      .select(
        `
        id,
        previous_stock,
        new_stock,
        adjustment,
        reason,
        created_at,
        product:products(id, name, slug, image_url),
        admin:profiles(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by product if specified
    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error("Error fetching stock history:", error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error("Error in stock history API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
