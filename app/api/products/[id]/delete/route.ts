import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Get product to retrieve image URLs
    const { data: product } = await supabase
      .from("products")
      .select("image_url, images")
      .eq("id", id)
      .single();

    if (product) {
      // Delete images from storage
      const imagesToDelete: string[] = [];

      if (product.image_url) {
        // Extract filename from URL
        const urlParts = product.image_url.split("/");
        const filename = urlParts[urlParts.length - 1];
        imagesToDelete.push(`products/${filename}`);
      }

      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imageUrl: string) => {
          const urlParts = imageUrl.split("/");
          const filename = urlParts[urlParts.length - 1];
          imagesToDelete.push(`products/${filename}`);
        });
      }

      // Delete images from storage (ignore errors if files don't exist)
      if (imagesToDelete.length > 0) {
        await supabase.storage.from("products").remove(imagesToDelete);
      }
    }

    // Delete product from database
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
