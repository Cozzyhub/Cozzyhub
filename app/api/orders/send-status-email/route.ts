import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch order with items
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Send appropriate email based on status
    let result;
    if (status === "shipped") {
      result = await sendOrderShipped(order);
    } else if (status === "delivered") {
      result = await sendOrderDelivered(order);
    } else {
      return NextResponse.json(
        { error: "No email template for this status" },
        { status: 400 }
      );
    }

    if (!result.success) {
      console.error("Email sending failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: result.id,
    });
  } catch (error) {
    console.error("Error sending status email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
