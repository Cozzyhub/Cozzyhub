import { createClient } from "@/lib/supabase/server";
import { isValidAuthTokenFormat } from "@/lib/utils/token";
import { NextResponse } from "next/server";

/**
 * GET /user/authorization/:auth_token
 * Validate authorization token and redirect to user page
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ auth_token: string }> }
) {
  try {
    const { auth_token: authToken } = await params;

    console.log("[Authorization] Received token:", authToken);

    // Validate token format
    if (!isValidAuthTokenFormat(authToken)) {
      console.log("[Authorization] Invalid token format:", authToken);
      return NextResponse.json(
        {
          error: "Invalid authorization token format",
          message: "The authorization token must be exactly 16 alphanumeric characters.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up user by auth token
    console.log("[Authorization] Looking up profile with token:", authToken);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_authorized, authorized_at, auth_token")
      .eq("auth_token", authToken)
      .single();

    console.log("[Authorization] Profile lookup result:", { profile, profileError });

    if (profileError || !profile) {
      // Invalid or expired token
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Authorization Token</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 500px;
              text-align: center;
            }
            h1 { color: #ef4444; margin: 0 0 20px 0; }
            p { color: #6b7280; line-height: 1.6; margin: 15px 0; }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: bold;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Invalid Authorization Token</h1>
            <p>The authorization token you provided is invalid or has expired.</p>
            <p>Please check your email for the correct authorization link, or contact support if you continue to experience issues.</p>
            <a href="/signup" class="button">Back to Signup</a>
          </div>
        </body>
        </html>
      `,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Check if already authorized
    if (profile.is_authorized) {
      // Already authorized, redirect to user page
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      return NextResponse.redirect(`${baseUrl}/user`);
    }

    // Mark user as authorized
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_authorized: true,
        authorized_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to update authorization status:", updateError);
      return NextResponse.json(
        {
          error: "Failed to authorize user",
          message: "An error occurred while authorizing your account. Please try again.",
        },
        { status: 500 }
      );
    }

    // Success! Redirect to user page
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/user?authorized=true`);
  } catch (error) {
    console.error("Authorization error:", error);
    return NextResponse.json(
      {
        error: "Authorization failed",
        message: "An unexpected error occurred during authorization.",
      },
      { status: 500 }
    );
  }
}
