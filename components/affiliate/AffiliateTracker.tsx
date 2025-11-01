"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams?.get("ref");

    if (refCode) {
      // Track the affiliate click
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref_code: refCode,
          landing_page: window.location.href,
        }),
      }).catch((error) => {
        console.error("Failed to track affiliate click:", error);
      });
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
