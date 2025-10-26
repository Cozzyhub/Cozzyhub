import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get optional parameters
    const maxWidth = parseInt(formData.get("maxWidth") as string) || 1920;
    const maxHeight = parseInt(formData.get("maxHeight") as string) || 1080;
    const quality = parseInt(formData.get("quality") as string) || 80;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp
    const optimizedImage = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    // Return optimized image (ensure ArrayBuffer body for NextResponse)
    const ab = new ArrayBuffer(optimizedImage.byteLength);
    new Uint8Array(ab).set(optimizedImage);
    return new NextResponse(ab, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}.webp"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize image" },
      { status: 500 },
    );
  }
}

// Handle GET requests to serve static optimized images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 },
      );
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 404 },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get optional parameters
    const maxWidth = parseInt(searchParams.get("maxWidth") || "1920");
    const maxHeight = parseInt(searchParams.get("maxHeight") || "1080");
    const quality = parseInt(searchParams.get("quality") || "80");

    // Optimize image
    const optimizedImage = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    const ab = new ArrayBuffer(optimizedImage.byteLength);
    new Uint8Array(ab).set(optimizedImage);
    return new NextResponse(ab, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 },
    );
  }
}
