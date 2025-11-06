import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueAuthToken } from "@/lib/utils/token";
import { sendAuthorizationEmail } from "@/lib/email/service";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/register
 * Register a new user with auth token generation
 */
export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create user account in Supabase Auth without email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || "",
        },
        emailRedirectTo: undefined, // Disable Supabase email confirmation
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Generate unique auth token
    const authToken = await generateUniqueAuthToken();
    console.log("[Registration] Generated auth token:", authToken, "for user:", authData.user.id);

    // Wait for profile to be created by trigger and update with auth token
    // Use admin client to bypass RLS policies and retry logic to handle race condition
    const adminClient = createAdminClient();
    let profileUpdated = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profileUpdated && attempts < maxAttempts) {
      const { data: existingProfile, error: checkError } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (existingProfile) {
        // Profile exists, update it using admin client
        const { error: updateError } = await adminClient
          .from("profiles")
          .update({
            auth_token: authToken,
            is_authorized: false,
          })
          .eq("id", authData.user.id);

        if (!updateError) {
          profileUpdated = true;
          console.log("[Registration] Successfully updated profile with auth token");
        } else {
          console.error("[Registration] Profile update error:", updateError);
        }
      } else {
        // Profile doesn't exist yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      attempts++;
    }

    if (!profileUpdated) {
      console.error("Failed to update profile after multiple attempts");
      return NextResponse.json(
        { error: "Failed to create user profile. Please try again." },
        { status: 500 }
      );
    }

    // Send authorization email
    try {
      await sendAuthorizationEmail(
        {
          email,
          full_name: full_name || email.split("@")[0],
        },
        authToken
      );
    } catch (emailError) {
      console.error("Failed to send authorization email:", emailError);
      // Don't fail registration if email fails
    }

    // Build authorization URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const authorizationUrl = `${baseUrl}/user/authorization/${authToken}`;

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to authorize your account.",
      authorization_url: authorizationUrl,
      auth_token: authToken,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
