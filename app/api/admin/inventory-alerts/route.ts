import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

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

    // Get threshold from query params (default: 10)
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get("threshold") || "10");
    const sortBy = searchParams.get("sortBy") || "stock"; // stock, name, category
    const order = searchParams.get("order") || "asc"; // asc, desc

    // Fetch low stock products with category info
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        stock,
        price,
        image_url,
        is_active,
        category:categories(id, name, slug),
        created_at,
        updated_at
      `
      )
      .lte("stock", threshold);

    // Apply sorting
    switch (sortBy) {
      case "name":
        query = query.order("name", { ascending: order === "asc" });
        break;
      case "category":
        query = query.order("category_id", { ascending: order === "asc" });
        break;
      case "stock":
      default:
        query = query.order("stock", { ascending: order === "asc" });
        break;
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching low stock products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const outOfStock = products?.filter((p) => p.stock === 0).length || 0;
    const critical = products?.filter(
      (p) => p.stock > 0 && p.stock <= threshold / 2
    ).length || 0;
    const low = products?.filter(
      (p) => p.stock > threshold / 2 && p.stock <= threshold
    ).length || 0;

    return NextResponse.json({
      products: products || [],
      stats: {
        total: products?.length || 0,
        outOfStock,
        critical,
        low,
        threshold,
      },
    });
  } catch (error) {
    console.error("Error in inventory alerts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
