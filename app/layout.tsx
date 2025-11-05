import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ClientLayout from "@/components/providers/ClientLayout";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import ComparisonBar from "@/components/storefront/ComparisonBar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "CozzyHub - Your Cozy Corner for Comfort & Style",
  description:
    "Discover handpicked products that make your space feel like home. Shop curated collections for comfort and style.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CozzyHub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ec4899" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        </Suspense>
        <ClientLayout>{children}</ClientLayout>
        <ComparisonBar />
      </body>
    </html>
  );
}
