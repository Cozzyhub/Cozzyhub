import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the order
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Check if user owns the order
  if (order.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only allow cancellation of pending orders
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending orders can be cancelled" },
      { status: 400 },
    );
  }

  // Update order status to cancelled
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 },
    );
  }

  // Restore product stock
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", id);

  if (orderItems) {
    for (const item of orderItems) {
      await supabase.rpc("increment_product_stock", {
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Order cancelled successfully",
  });
}
