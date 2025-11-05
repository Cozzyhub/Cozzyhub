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

    const { order_ids, action, status } = await request.json();

    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid order IDs" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    switch (action) {
      case "update_status":
        if (!status) {
          return NextResponse.json(
            { error: "Status required" },
            { status: 400 }
          );
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update({ status })
          .in("id", order_ids);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          message: `${order_ids.length} order(s) updated to ${status}`,
        });

      case "mark_shipped":
        const { error: shipError } = await supabase
          .from("orders")
          .update({
            status: "shipped",
          })
          .in("id", order_ids);

        if (shipError) throw shipError;

        return NextResponse.json({
          success: true,
          message: `${order_ids.length} order(s) marked as shipped`,
        });

      case "mark_delivered":
        const now = new Date().toISOString();
        const { error: deliverError } = await supabase
          .from("orders")
          .update({
            status: "delivered",
            delivered_at: now,
          })
          .in("id", order_ids);

        if (deliverError) throw deliverError;

        return NextResponse.json({
          success: true,
          message: `${order_ids.length} order(s) marked as delivered`,
        });

      case "cancel":
        const { error: cancelError } = await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .in("id", order_ids);

        if (cancelError) throw cancelError;

        return NextResponse.json({
          success: true,
          message: `${order_ids.length} order(s) cancelled`,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Bulk order operation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
