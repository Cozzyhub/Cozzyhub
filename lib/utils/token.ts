/**
 * Token Generation Utilities
 * Generates secure random alphanumeric tokens for user authorization
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Generate a secure 16-character alphanumeric token
 * Characters: A-Z, a-z, 0-9
 */
export function generateAuthToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  // Use crypto.getRandomValues for cryptographically secure randomness
  const randomValues = new Uint32Array(16);

  if (typeof window !== "undefined" && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(randomValues);
  } else {
    // Node.js environment
    const crypto = require("crypto");
    for (let i = 0; i < 16; i++) {
      randomValues[i] = crypto.randomInt(0, chars.length);
    }
  }

  for (let i = 0; i < 16; i++) {
    token += chars[randomValues[i] % chars.length];
  }

  return token;
}

/**
 * Generate a unique auth token by checking database
 * Ensures the token doesn't already exist
 */
export async function generateUniqueAuthToken(): Promise<string> {
  const supabase = await createClient();
  let token: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    token = generateAuthToken();

    // Check if token exists in database
    const { data, error } = await supabase
      .from("profiles")
      .select("auth_token")
      .eq("auth_token", token)
      .single();

    if (error && error.code === "PGRST116") {
      // Token doesn't exist - this is what we want
      isUnique = true;
      return token;
    }

    attempts++;
  }

  // Fallback: if we can't generate unique token after max attempts
  // Add timestamp to ensure uniqueness
  return generateAuthToken() + Date.now().toString(36).slice(-4);
}

/**
 * Validate auth token format
 * Should be exactly 16 alphanumeric characters
 */
export function isValidAuthTokenFormat(token: string): boolean {
  if (!token || token.length !== 16) {
    return false;
  }

  const alphanumericRegex = /^[A-Za-z0-9]{16}$/;
  return alphanumericRegex.test(token);
}
