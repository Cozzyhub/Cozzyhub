export function GET() {
  const robotsTxt = `# Cozzyhub Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /cart
Disallow: /checkout
Disallow: /profile

# Sitemaps
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml

# Crawl Delay
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
