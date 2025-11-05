import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { product_id, email } = await request.json();

    if (!product_id || !email) {
      return NextResponse.json(
        { error: "Product ID and email required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("stock_notifications")
      .select("id")
      .eq("product_id", product_id)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Already subscribed to this product" },
        { status: 400 }
      );
    }

    // Create subscription
    const { error } = await supabase.from("stock_notifications").insert({
      product_id,
      email,
      user_id: user?.id || null,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("Stock notification error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
