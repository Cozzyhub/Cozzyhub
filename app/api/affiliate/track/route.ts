import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { ref_code } = body;

    if (!ref_code) {
      return NextResponse.json(
        { error: "Reference code is required" },
        { status: 400 },
      );
    }

    // Get request headers for tracking
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const referer = headersList.get("referer") || "";
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Check if this is a general affiliate code or product-specific link
    let affiliateId: string | null = null;
    let productLinkId: string | null = null;
    let productId: string | null = null;

    // Check if it's a product link code (format: AFFCODE-PROD123)
    if (ref_code.includes("-")) {
      const { data: productLink } = await supabase
        .from("product_affiliate_links")
        .select("*, affiliates(id, referral_code)")
        .eq("link_code", ref_code)
        .eq("is_active", true)
        .single();

      if (productLink) {
        affiliateId = productLink.affiliate_id;
        productLinkId = productLink.id;
        productId = productLink.product_id;
      }
    }

    // If not a product link, check if it's a general affiliate code
    if (!affiliateId) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("referral_code", ref_code)
        .eq("status", "active")
        .single();

      if (affiliate) {
        affiliateId = affiliate.id;
      }
    }

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Invalid reference code" },
        { status: 404 },
      );
    }

    // Record the click
    const { data: click, error: clickError } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_id: affiliateId,
        referral_code: ref_code,
        product_link_id: productLinkId,
        product_id: productId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        landing_page: body.landing_page || "",
      })
      .select()
      .single();

    if (clickError) {
      console.error("Error recording click:", clickError);
      return NextResponse.json(
        { error: "Failed to record click" },
        { status: 500 },
      );
    }

    // Set cookie to track this affiliate (expires in 30 days)
    const response = NextResponse.json({
      success: true,
      message: "Click tracked successfully",
      click_id: click.id,
    });

    response.cookies.set("affiliate_ref", ref_code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (click.id) {
      response.cookies.set("affiliate_click_id", click.id, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in track API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
