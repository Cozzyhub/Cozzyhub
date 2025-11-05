import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_available", true)
      .order("variant_type")
      .order("value");

    if (error) throw error;

    return NextResponse.json({ variants: variants || [] });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
