import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, productIds } = body;

    // Validate required fields
    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Action and product IDs are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "delete":
        // Delete products
        const { error: deleteError } = await supabase
          .from("products")
          .delete()
          .in("id", productIds);

        if (deleteError) throw deleteError;

        result = {
          success: true,
          message: `Successfully deleted ${productIds.length} product(s)`,
          count: productIds.length,
        };
        break;

      case "activate":
        // Set products as active
        const { error: activateError } = await supabase
          .from("products")
          .update({ is_active: true })
          .in("id", productIds);

        if (activateError) throw activateError;

        result = {
          success: true,
          message: `Successfully activated ${productIds.length} product(s)`,
          count: productIds.length,
        };
        break;

      case "deactivate":
        // Set products as inactive
        const { error: deactivateError } = await supabase
          .from("products")
          .update({ is_active: false })
          .in("id", productIds);

        if (deactivateError) throw deactivateError;

        result = {
          success: true,
          message: `Successfully deactivated ${productIds.length} product(s)`,
          count: productIds.length,
        };
        break;

      case "feature":
        // Set products as featured
        const { error: featureError } = await supabase
          .from("products")
          .update({ is_featured: true })
          .in("id", productIds);

        if (featureError) throw featureError;

        result = {
          success: true,
          message: `Successfully featured ${productIds.length} product(s)`,
          count: productIds.length,
        };
        break;

      case "unfeature":
        // Remove featured status
        const { error: unfeatureError } = await supabase
          .from("products")
          .update({ is_featured: false })
          .in("id", productIds);

        if (unfeatureError) throw unfeatureError;

        result = {
          success: true,
          message: `Successfully unfeatured ${productIds.length} product(s)`,
          count: productIds.length,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Valid actions: delete, activate, deactivate, feature, unfeature" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
