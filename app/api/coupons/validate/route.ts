import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch coupon from database
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        success: false,
        message: "Invalid coupon code",
        discount: 0,
      });
    }

    // Check if coupon is expired
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({
        success: false,
        message: "This coupon has expired",
        discount: 0,
      });
    }

    // Check if coupon hasn't started yet
    if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
      return NextResponse.json({
        success: false,
        message: "This coupon is not yet active",
        discount: 0,
      });
    }

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return NextResponse.json({
        success: false,
        message: `Minimum purchase of ₹${coupon.min_purchase_amount} required`,
        discount: 0,
      });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({
        success: false,
        message: "This coupon has reached its usage limit",
        discount: 0,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (cartTotal * coupon.discount_value) / 100;
      
      // Apply max discount limit if specified
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      // Fixed amount discount
      discount = Math.min(coupon.discount_value, cartTotal);
    }

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      discount: Math.round(discount * 100) / 100, // Round to 2 decimals
      couponData: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
