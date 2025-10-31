"use client";

import PageTransition from "@/components/ui/PageTransition";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
