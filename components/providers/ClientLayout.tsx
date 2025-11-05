"use client";

import PageTransition from "@/components/ui/PageTransition";
import { ToastProvider } from "@/lib/contexts/ToastContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <PageTransition>{children}</PageTransition>
    </ToastProvider>
  );
}
