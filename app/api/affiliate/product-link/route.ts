import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST - Create a new product affiliate link
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, custom_commission_rate, notes } = body;

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Get affiliate profile
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!affiliate) {
      return NextResponse.json(
        { error: "Active affiliate account not found" },
        { status: 403 }
      );
    }

    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if link already exists for this affiliate-product combo
    const { data: existingLink } = await supabase
      .from("product_affiliate_links")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .eq("product_id", product_id)
      .eq("is_active", true)
      .single();

    if (existingLink) {
      return NextResponse.json({
        link: existingLink,
        message: "Link already exists for this product"
      });
    }

    // Generate unique link code
    const { data: linkCode } = await supabase.rpc(
      "generate_product_link_code",
      { aff_id: affiliate.id, prod_id: product_id }
    );

    // Create the product affiliate link
    const { data: productLink, error: insertError } = await supabase
      .from("product_affiliate_links")
      .insert({
        affiliate_id: affiliate.id,
        product_id,
        link_code: linkCode,
        custom_commission_rate: custom_commission_rate || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating product link:", insertError);
      return NextResponse.json(
        { error: "Failed to create product link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      link: productLink,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${product.id}?ref=${linkCode}`,
      message: "Product affiliate link created successfully"
    });

  } catch (error) {
    console.error("Error in product link API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get all product links for current affiliate
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get affiliate profile
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate account not found" },
        { status: 403 }
      );
    }

    // Get all product links with product details
    const { data: productLinks, error } = await supabase
      .from("product_affiliate_links")
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock
        )
      `)
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching product links:", error);
      return NextResponse.json(
        { error: "Failed to fetch product links" },
        { status: 500 }
      );
    }

    // Add full URL to each link
    const linksWithUrls = productLinks?.map(link => ({
      ...link,
      full_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${link.product_id}?ref=${link.link_code}`
    })) || [];

    return NextResponse.json({ links: linksWithUrls });

  } catch (error) {
    console.error("Error in product link API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a product affiliate link
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json({ error: "Link ID is required" }, { status: 400 });
    }

    // Get affiliate profile
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate account not found" },
        { status: 403 }
      );
    }

    // Deactivate the link
    const { error } = await supabase
      .from("product_affiliate_links")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", linkId)
      .eq("affiliate_id", affiliate.id);

    if (error) {
      console.error("Error deactivating link:", error);
      return NextResponse.json(
        { error: "Failed to deactivate link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Link deactivated successfully" });

  } catch (error) {
    console.error("Error in product link API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
