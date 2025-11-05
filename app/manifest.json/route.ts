export function GET() {
  const manifest = {
    name: "CozzyHub - Your Cozy Corner for Comfort & Style",
    short_name: "CozzyHub",
    description:
      "Discover handpicked products that make your space feel like home. Shop curated collections for comfort and style.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ec4899",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["shopping", "lifestyle"],
    screenshots: [],
    orientation: "portrait-primary",
    dir: "ltr",
    lang: "en-US",
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
