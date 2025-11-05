import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    const data = await request.json();

    // Create variant
    const { data: variant, error } = await supabase
      .from("product_variants")
      .insert([
        {
          product_id: data.product_id,
          name: `${data.variant_type}: ${data.value}`,
          variant_type: data.variant_type,
          value: data.value,
          price_adjustment: data.price_adjustment || 0,
          stock: data.stock || 0,
          sku: data.sku || null,
          is_available: data.is_available !== false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ variant });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
