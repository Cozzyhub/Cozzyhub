import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");

  const supabase = await createClient();

  try {
    let queryBuilder = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`,
      );
    }

    // Category filter
    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    // Price range filter
    if (minPrice) {
      queryBuilder = queryBuilder.gte("price", Number.parseFloat(minPrice));
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte("price", Number.parseFloat(maxPrice));
    }

    // Sorting
    const validSortColumns = [
      "created_at",
      "price",
      "name",
      "average_rating",
      "view_count",
    ];
    if (validSortColumns.includes(sortBy)) {
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === "asc",
      });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: products, error, count } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
