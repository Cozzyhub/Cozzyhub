import { POST } from "@/app/api/auth/register/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueAuthToken } from "@/lib/utils/token";
import { sendAuthorizationEmail } from "@/lib/email/service";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/supabase/admin");
jest.mock("@/lib/utils/token");
jest.mock("@/lib/email/service");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe("POST /api/auth/register", () => {
  let mockSupabase: any;
  let mockAdminClient: any;
  let mockRequest: Request;
  let mockSelectChain: any;
  let mockUpdateChain: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
      },
    };

    // Mock select and update chains
    mockSelectChain = {
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockUpdateChain = {
      eq: jest.fn(),
    };

    // Mock Admin client
    mockAdminClient = {
      from: jest.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: jest.fn(() => mockSelectChain),
            update: jest.fn(() => mockUpdateChain),
          };
        }
        return {};
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
    (generateUniqueAuthToken as jest.Mock).mockResolvedValue("AbCdEfGh12345678");
    (sendAuthorizationEmail as jest.Mock).mockResolvedValue(undefined);

    // Set environment variable
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_URL;
  });

  it("should successfully register a user, generate unique token, update profile, and send authorization email", async () => {
    // Mock request
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
        full_name: "Test User",
      }),
    });

    // Mock successful signup
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });

    // Mock profile exists on first check
    mockSelectChain.single.mockResolvedValueOnce({
      data: { id: "user-123" },
      error: null,
    });

    // Mock successful profile update
    mockUpdateChain.eq.mockResolvedValue({
      error: null,
    });

    const response = await POST(mockRequest);

    // Verify user signup was called correctly
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "securePassword123",
      options: {
        data: {
          full_name: "Test User",
        },
        emailRedirectTo: undefined,
      },
    });

    // Verify unique token was generated
    expect(generateUniqueAuthToken).toHaveBeenCalledTimes(1);

    // Verify profile was updated with auth token
    expect(mockAdminClient.from).toHaveBeenCalledWith("profiles");

    // Verify authorization email was sent
    expect(sendAuthorizationEmail).toHaveBeenCalledWith(
      {
        email: "test@example.com",
        full_name: "Test User",
      },
      "AbCdEfGh12345678"
    );

    // Verify response
    expect(response.data).toEqual({
      success: true,
      message: "Registration successful! Please check your email to authorize your account.",
      authorization_url: "http://localhost:3000/user/authorization/AbCdEfGh12345678",
      auth_token: "AbCdEfGh12345678",
      user: {
        id: "user-123",
        email: "test@example.com",
      },
    });
    expect(response.status).toBe(200);
  });

  it("should return 400 if email is missing", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        password: "securePassword123",
      }),
    });

    const response = await POST(mockRequest);

    expect(response.data).toEqual({
      error: "Email and password are required",
    });
    expect(response.status).toBe(400);
  });

  it("should return 400 if password is missing", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    const response = await POST(mockRequest);

    expect(response.data).toEqual({
      error: "Email and password are required",
    });
    expect(response.status).toBe(400);
  });

  it("should handle auth signup errors", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "weak",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: {
        message: "Password should be at least 6 characters",
      },
    });

    const response = await POST(mockRequest);

    expect(response.data).toEqual({
      error: "Password should be at least 6 characters",
    });
    expect(response.status).toBe(400);
  });

  it("should return 500 if user creation fails", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const response = await POST(mockRequest);

    expect(response.data).toEqual({
      error: "Failed to create user account",
    });
    expect(response.status).toBe(500);
  });

  it("should retry profile update if profile doesn't exist initially", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
        full_name: "Test User",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });

    // First check: profile doesn't exist
    // Second check: profile exists
    mockSelectChain.single
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      })
      .mockResolvedValueOnce({
        data: { id: "user-123" },
        error: null,
      });

    mockUpdateChain.eq.mockResolvedValue({
      error: null,
    });

    const response = await POST(mockRequest);

    // Should have checked for profile twice
    expect(mockSelectChain.single).toHaveBeenCalledTimes(2);
    expect(response.data.success).toBe(true);
  });

  it("should return 500 if profile update fails after max attempts", async () => {
    jest.useFakeTimers();

    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });

    // Profile never exists after max attempts
    mockSelectChain.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116" },
    });

    const responsePromise = POST(mockRequest);

    // Fast-forward all timers
    await jest.runAllTimersAsync();

    const response = await responsePromise;

    expect(response.data).toEqual({
      error: "Failed to create user profile. Please try again.",
    });
    expect(response.status).toBe(500);

    jest.useRealTimers();
  });

  it("should continue registration even if email sending fails", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
        full_name: "Test User",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });

    mockSelectChain.single.mockResolvedValueOnce({
      data: { id: "user-123" },
      error: null,
    });

    mockUpdateChain.eq.mockResolvedValue({
      error: null,
    });

    // Mock email service failure
    (sendAuthorizationEmail as jest.Mock).mockRejectedValue(
      new Error("Email service unavailable")
    );

    const response = await POST(mockRequest);

    // Registration should still succeed
    expect(response.data.success).toBe(true);
    expect(response.status).toBe(200);
  });

  it("should use default full_name if not provided", async () => {
    mockRequest = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword123",
      }),
    });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });

    mockSelectChain.single.mockResolvedValueOnce({
      data: { id: "user-123" },
      error: null,
    });

    mockUpdateChain.eq.mockResolvedValue({
      error: null,
    });

    await POST(mockRequest);

    // Verify email was sent with email prefix as full_name
    expect(sendAuthorizationEmail).toHaveBeenCalledWith(
      {
        email: "test@example.com",
        full_name: "test",
      },
      "AbCdEfGh12345678"
    );
  });
});
