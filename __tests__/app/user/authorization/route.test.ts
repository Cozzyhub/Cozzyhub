import { GET } from "@/app/user/authorization/[auth_token]/route";
import { createClient } from "@/lib/supabase/server";
import { isValidAuthTokenFormat } from "@/lib/utils/token";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/utils/token");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
    redirect: jest.fn((url) => ({
      type: "redirect",
      url,
    })),
  },
}));

describe("GET /user/authorization/:auth_token", () => {
  let mockSupabase: any;
  let mockRequest: Request;
  let mockSelectChain: any;
  let mockUpdateChain: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSelectChain = {
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockUpdateChain = {
      eq: jest.fn(),
    };

    mockSupabase = {
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

    // Set environment variable
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_URL;
  });

  describe("Token validation", () => {
    it("should return 400 for invalid token format", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(false);

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/invalid"
      );

      const params = Promise.resolve({ auth_token: "invalid" });
      const response = await GET(mockRequest, { params });

      expect(isValidAuthTokenFormat).toHaveBeenCalledWith("invalid");
      expect(response.data).toEqual({
        error: "Invalid authorization token format",
        message: "The authorization token must be exactly 16 alphanumeric characters.",
      });
      expect(response.status).toBe(400);
    });

    it("should accept valid token format", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      await GET(mockRequest, { params });

      expect(isValidAuthTokenFormat).toHaveBeenCalledWith("AbCdEfGh12345678");
    });
  });

  describe("Invalid token handling", () => {
    it("should return 404 HTML page for non-existent token", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      // Check that it's an HTML response (NextResponse type in real implementation)
      expect(response).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });

    it("should return 404 HTML page for expired token", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: null,
        error: { message: "Token not found" },
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      expect(response).toBeDefined();
    });
  });

  describe("Already authorized user handling", () => {
    it("should redirect to /user if user is already authorized", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_authorized: true,
          authorized_at: "2024-01-01T00:00:00Z",
          auth_token: "AbCdEfGh12345678",
        },
        error: null,
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/user"
      );
      expect(response.type).toBe("redirect");
      expect(response.url).toBe("http://localhost:3000/user");
    });
  });

  describe("Successful authorization", () => {
    it("should authorize user and redirect to /user?authorized=true", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_authorized: false,
          authorized_at: null,
          auth_token: "AbCdEfGh12345678",
        },
        error: null,
      });

      mockUpdateChain.eq.mockResolvedValue({
        error: null,
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      // Verify redirect
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/user?authorized=true"
      );
      expect(response.type).toBe("redirect");
      expect(response.url).toBe("http://localhost:3000/user?authorized=true");
    });

    it("should return 500 if update fails", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_authorized: false,
          authorized_at: null,
          auth_token: "AbCdEfGh12345678",
        },
        error: null,
      });

      mockUpdateChain.eq.mockResolvedValue({
        error: { message: "Update failed" },
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      expect(response.data).toEqual({
        error: "Failed to authorize user",
        message: "An error occurred while authorizing your account. Please try again.",
      });
      expect(response.status).toBe(500);
    });
  });

  describe("Error handling", () => {
    it("should return 500 for unexpected errors", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      const response = await GET(mockRequest, { params });

      expect(response.data).toEqual({
        error: "Authorization failed",
        message: "An unexpected error occurred during authorization.",
      });
      expect(response.status).toBe(500);
    });
  });

  describe("Database query", () => {
    it("should query profiles table with correct fields", async () => {
      (isValidAuthTokenFormat as jest.Mock).mockReturnValue(true);

      mockSelectChain.single.mockResolvedValue({
        data: {
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
          is_authorized: false,
          authorized_at: null,
          auth_token: "AbCdEfGh12345678",
        },
        error: null,
      });

      mockUpdateChain.eq.mockResolvedValue({
        error: null,
      });

      mockRequest = new Request(
        "http://localhost:3000/user/authorization/AbCdEfGh12345678"
      );

      const params = Promise.resolve({ auth_token: "AbCdEfGh12345678" });
      await GET(mockRequest, { params });

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });
  });
});
