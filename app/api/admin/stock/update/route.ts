import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    const { productId, adjustment, reason } = await request.json();

    if (!productId || typeof adjustment !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current product stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const previousStock = product.stock;
    const newStock = previousStock + adjustment;

    // Don't allow negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product stock:", updateError);
      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    // Record in stock history
    const { error: historyError } = await supabase
      .from("stock_history")
      .insert({
        product_id: productId,
        admin_id: user.id,
        previous_stock: previousStock,
        new_stock: newStock,
        adjustment,
        reason: reason || null,
      });

    if (historyError) {
      console.error("Error recording stock history:", historyError);
      // Continue anyway, stock was updated
    }

    return NextResponse.json({
      success: true,
      previousStock,
      newStock,
      adjustment,
    });
  } catch (error) {
    console.error("Error in stock update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
