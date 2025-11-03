import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // TODO: RE-ENABLE AUTHENTICATION IN PRODUCTION!
    // Temporarily disabled for testing the browser extension
    // IMPORTANT: This allows anyone to add products without login!
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    // TEMPORARILY COMMENTED OUT - RE-ENABLE THIS IN PRODUCTION:
    // if (!user) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Please log in to add products." },
    //     { status: 401 }
    //   );
    // }

    // TODO: Add admin check here if needed
    // For now, any logged-in user can add products
    // You might want to check if user has admin role
    
    console.log('Import request from user:', user?.email || 'anonymous (auth disabled for testing)');

    const body = await request.json();
    
    const {
      title,
      price,
      description,
      images,
      category,
      stock,
      color,
      productHighlights,
      additionalDetails,
      sourceUrl,
      source
    } = body;

    // Validate required fields
    if (!title || !price) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    // Download and upload images to Supabase Storage
    const uploadedImages: string[] = [];
    
    console.log(`Processing ${images?.length || 0} images...`);
    
    if (images && images.length > 0) {
      for (let i = 0; i < Math.min(images.length, 6); i++) {
        const imageUrl = images[i];
        console.log(`Fetching image ${i + 1}: ${imageUrl}`);
        
        try {
          // Fetch the image
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image: ${imageResponse.status}`);
            continue;
          }
          const imageBlob = await imageResponse.blob();
          
          // Generate unique filename
          const filename = `${Date.now()}-${i}.jpg`;
          const filepath = `products/${filename}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("products")
            .upload(filepath, imageBlob, {
              contentType: imageBlob.type || "image/jpeg",
              upsert: false
            });

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filepath);

          uploadedImages.push(publicUrl);
          console.log(`Successfully uploaded image ${i + 1}: ${publicUrl}`);
        } catch (imageError) {
          console.error("Error processing image:", imageError);
          // Continue with other images even if one fails
        }
      }
    }

    console.log(`Uploaded ${uploadedImages.length} images successfully`);

    // If no images were uploaded, use the original URLs as fallback
    const finalImages = uploadedImages.length > 0 ? uploadedImages : images;
    console.log(`Using ${finalImages?.length || 0} final images for product`);

    // Create full description with product highlights and details
    let fullDescription = description || "";
    
    // Add color information
    if (color) {
      fullDescription += `\n\n**Color:** ${color}`;
    }
    
    // Add product highlights
    if (productHighlights && productHighlights.trim()) {
      fullDescription += "\n\n**Product Highlights:**\n" + productHighlights.trim();
    }
    
    // Add additional details
    if (additionalDetails && additionalDetails.trim()) {
      fullDescription += "\n\n**Additional Details:**\n" + additionalDetails.trim();
    }
    
    // Log the description being saved (for debugging)
    console.log('Description length:', fullDescription.length);

    // Generate slug from title
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    
    // Check if slug exists and make it unique if necessary
    const { data: existingProduct } = await supabase
      .from("products")
      .select("slug")
      .eq("slug", slug)
      .single();
    
    if (existingProduct) {
      // Append timestamp to make it unique
      slug = `${baseSlug}-${Date.now()}`;
    }

    // Insert product into database
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        name: title,
        slug: slug,
        description: fullDescription,
        price: Number(price),
        stock: Number(stock) || 100,
        category: category || "Uncategorized",
        image_url: finalImages[0] || null,
        images: finalImages || null, // Store ALL images (including first one)
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting product:", insertError);
      return NextResponse.json(
        { 
          error: "Failed to add product to database",
          details: insertError.message || insertError.toString(),
          code: insertError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Product added successfully"
    });

  } catch (error) {
    console.error("Error in import API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
