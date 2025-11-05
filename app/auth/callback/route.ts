import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/login?error=verification_failed`);
    }

    // Successfully verified and logged in
    // Redirect to home page
    return NextResponse.redirect(`${origin}/?verified=true`);
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
