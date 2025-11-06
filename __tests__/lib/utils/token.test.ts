import {
  generateAuthToken,
  generateUniqueAuthToken,
  isValidAuthTokenFormat,
} from "@/lib/utils/token";
import { createClient } from "@/lib/supabase/server";

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Token Utility Functions", () => {
  describe("generateAuthToken", () => {
    it("should return a 16-character alphanumeric token", () => {
      const token = generateAuthToken();

      // Check length
      expect(token).toHaveLength(16);

      // Check that it only contains alphanumeric characters
      expect(token).toMatch(/^[A-Za-z0-9]{16}$/);
    });

    it("should generate different tokens on multiple calls", () => {
      const token1 = generateAuthToken();
      const token2 = generateAuthToken();
      const token3 = generateAuthToken();

      // Tokens should be different (extremely high probability)
      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it("should only use characters from the valid charset", () => {
      const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const token = generateAuthToken();

      for (const char of token) {
        expect(validChars).toContain(char);
      }
    });
  });

  describe("generateUniqueAuthToken", () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return a token that does not exist in the database", async () => {
      // Mock database response indicating token doesn't exist
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" }, // PostgreSQL error for no rows
      });

      const token = await generateUniqueAuthToken();

      // Verify token format
      expect(token).toHaveLength(16);
      expect(token).toMatch(/^[A-Za-z0-9]{16}$/);

      // Verify database was checked
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("auth_token");
      expect(mockSupabase.eq).toHaveBeenCalledWith("auth_token", expect.any(String));
    });

    it("should retry if token already exists and return unique token", async () => {
      // First call: token exists
      // Second call: token doesn't exist
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { auth_token: "existingToken123" },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      const token = await generateUniqueAuthToken();

      // Verify token format
      expect(token).toHaveLength(16);
      expect(token).toMatch(/^[A-Za-z0-9]{16}$/);

      // Verify database was checked twice
      expect(mockSupabase.single).toHaveBeenCalledTimes(2);
    });

    it("should return extended token if max attempts reached", async () => {
      // Mock all attempts finding existing tokens
      mockSupabase.single.mockResolvedValue({
        data: { auth_token: "existingToken123" },
        error: null,
      });

      const token = await generateUniqueAuthToken();

      // Token should be longer than 16 characters due to timestamp suffix
      expect(token.length).toBeGreaterThan(16);

      // First 16 characters should be alphanumeric
      expect(token.substring(0, 16)).toMatch(/^[A-Za-z0-9]{16}$/);

      // Verify max attempts were made
      expect(mockSupabase.single).toHaveBeenCalledTimes(10);
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error other than PGRST116
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST500", message: "Database error" },
      });

      const token = await generateUniqueAuthToken();

      // Should still return a token (with timestamp suffix after max attempts)
      expect(token.length).toBeGreaterThan(16);
    });
  });

  describe("isValidAuthTokenFormat", () => {
    it("should return true for valid 16-character alphanumeric tokens", () => {
      expect(isValidAuthTokenFormat("AbCdEfGh12345678")).toBe(true);
      expect(isValidAuthTokenFormat("1234567890ABCDEF")).toBe(true);
      expect(isValidAuthTokenFormat("aaBBccDD11223344")).toBe(true);
      expect(isValidAuthTokenFormat("zZ9999999999999z")).toBe(true);
    });

    it("should return false for tokens with invalid length", () => {
      expect(isValidAuthTokenFormat("")).toBe(false);
      expect(isValidAuthTokenFormat("short")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh1234567")).toBe(false); // 15 chars
      expect(isValidAuthTokenFormat("AbCdEfGh123456789")).toBe(false); // 17 chars
      expect(isValidAuthTokenFormat("ThisIsWayTooLongForAValidToken123")).toBe(false);
    });

    it("should return false for tokens with special characters", () => {
      expect(isValidAuthTokenFormat("AbCdEfGh1234567!")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh1234567@")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh1234567#")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh123456-7")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh123456_7")).toBe(false);
      expect(isValidAuthTokenFormat("AbCdEfGh123456 7")).toBe(false); // space
    });

    it("should return false for null or undefined values", () => {
      expect(isValidAuthTokenFormat(null as any)).toBe(false);
      expect(isValidAuthTokenFormat(undefined as any)).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isValidAuthTokenFormat(123456789 as any)).toBe(false);
      expect(isValidAuthTokenFormat({} as any)).toBe(false);
      expect(isValidAuthTokenFormat([] as any)).toBe(false);
    });
  });
});
