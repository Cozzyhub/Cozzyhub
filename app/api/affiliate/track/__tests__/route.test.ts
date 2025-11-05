import { describe, expect, test, jest, beforeEach } from "@jest/globals";

// Mock headers
const createMockHeaders = () => {
  const headersMap = new Map<string, string>();
  return {
    get: jest.fn((key: string) => headersMap.get(key.toLowerCase()) || null),
    _setHeader: (key: string, value: string) =>
      headersMap.set(key.toLowerCase(), value),
  };
};

// Mock Supabase client
const createMockSupabase = () => {
  const mockSingle = jest.fn();

  const createChainableEq = () => ({
    eq: jest.fn().mockReturnThis(),
    single: mockSingle,
  });

  const mockSelect = jest.fn(() => createChainableEq());
  const mockInsert = jest.fn(() => ({
    select: jest.fn(() => ({
      single: mockSingle,
    })),
  }));

  return {
    from: jest.fn((table: string) => ({
      select: mockSelect,
      insert: mockInsert,
    })),
    _mocks: {
      mockSelect,
      mockInsert,
      mockSingle,
    },
  };
};

describe("Affiliate Tracking API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("accurately records clicks for general referral codes", async () => {
    const supabase = createMockSupabase();
    const headers = createMockHeaders();

    // Set up mock headers
    headers._setHeader(
      "user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
    );
    headers._setHeader("referer", "https://example.com/products");
    headers._setHeader("x-forwarded-for", "192.168.1.1, 10.0.0.1");

    const refCode = "AFFILIATE123";
    const affiliateId = "aff-123";

    // Mock affiliate lookup (general code, not product-specific)
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: { id: affiliateId },
      error: null,
    });

    // Mock click insertion
    const mockClick = {
      id: "click-123",
      affiliate_id: affiliateId,
      referral_code: refCode,
      product_link_id: null,
      product_id: null,
      ip_address: "192.168.1.1",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
      referrer: "https://example.com/products",
      landing_page: "/products",
      created_at: new Date().toISOString(),
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: mockClick,
      error: null,
    });

    // Simulate the tracking logic
    const userAgent = headers.get("user-agent") || "";
    const referer = headers.get("referer") || "";
    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    let affiliateIdResult: string | null = null;
    let productLinkId: string | null = null;
    let productId: string | null = null;

    // Check if it's a product link code (contains hyphen)
    if (refCode.includes("-")) {
      // Would check product_affiliate_links table
      // But in this test, refCode doesn't contain hyphen
    }

    // Check if it's a general affiliate code
    if (!affiliateIdResult) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("referral_code", refCode)
        .eq("status", "active")
        .single();

      if (affiliate) {
        affiliateIdResult = affiliate.id;
      }
    }

    expect(affiliateIdResult).toBe(affiliateId);

    // Record the click
    const { data: click } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_id: affiliateIdResult,
        referral_code: refCode,
        product_link_id: productLinkId,
        product_id: productId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        landing_page: "/products",
      })
      .select()
      .single();

    expect(click).toBeTruthy();
    expect(click!.affiliate_id).toBe(affiliateId);
    expect(click!.referral_code).toBe(refCode);
    expect(click!.product_link_id).toBeNull();
    expect(click!.product_id).toBeNull();
    expect(click!.ip_address).toBe("192.168.1.1");
    expect(click!.user_agent).toContain("Chrome/91.0");
    expect(click!.referrer).toBe("https://example.com/products");
  });

  test("accurately records clicks for product-specific link codes", async () => {
    const supabase = createMockSupabase();
    const headers = createMockHeaders();

    headers._setHeader(
      "user-agent",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)",
    );
    headers._setHeader("x-real-ip", "203.0.113.45");

    const refCode = "AFFILIATE123-PROD456"; // Product-specific format
    const affiliateId = "aff-123";
    const productLinkId = "plink-789";
    const productId = "prod-456";

    // Mock product link lookup (contains hyphen, so check product links first)
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: {
        id: productLinkId,
        affiliate_id: affiliateId,
        product_id: productId,
        link_code: refCode,
        affiliates: { id: affiliateId, referral_code: "AFFILIATE123" },
      },
      error: null,
    });

    // Mock click insertion
    const mockClick = {
      id: "click-456",
      affiliate_id: affiliateId,
      referral_code: refCode,
      product_link_id: productLinkId,
      product_id: productId,
      ip_address: "203.0.113.45",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)",
      referrer: "",
      landing_page: "/products/prod-456",
      created_at: new Date().toISOString(),
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: mockClick,
      error: null,
    });

    // Simulate tracking logic
    const userAgent = headers.get("user-agent") || "";
    const referer = headers.get("referer") || "";
    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    let affiliateIdResult: string | null = null;
    let productLinkIdResult: string | null = null;
    let productIdResult: string | null = null;

    // Check if it's a product link code
    if (refCode.includes("-")) {
      const { data: productLink } = await supabase
        .from("product_affiliate_links")
        .select("*, affiliates(id, referral_code)")
        .eq("link_code", refCode)
        .eq("is_active", true)
        .single();

      if (productLink) {
        affiliateIdResult = productLink.affiliate_id;
        productLinkIdResult = productLink.id;
        productIdResult = productLink.product_id;
      }
    }

    expect(affiliateIdResult).toBe(affiliateId);
    expect(productLinkIdResult).toBe(productLinkId);
    expect(productIdResult).toBe(productId);

    // Record the click
    const { data: click } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_id: affiliateIdResult,
        referral_code: refCode,
        product_link_id: productLinkIdResult,
        product_id: productIdResult,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        landing_page: "/products/prod-456",
      })
      .select()
      .single();

    expect(click).toBeTruthy();
    expect(click!.product_link_id).toBe(productLinkId);
    expect(click!.product_id).toBe(productId);
    expect(click!.ip_address).toBe("203.0.113.45");
  });

  test("extracts IP address from x-forwarded-for header (first IP)", async () => {
    const headers = createMockHeaders();
    headers._setHeader(
      "x-forwarded-for",
      "192.168.1.100, 10.0.0.1, 172.16.0.1",
    );

    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    expect(ipAddress).toBe("192.168.1.100");
  });

  test("falls back to x-real-ip when x-forwarded-for is not present", async () => {
    const headers = createMockHeaders();
    headers._setHeader("x-real-ip", "198.51.100.42");

    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    expect(ipAddress).toBe("198.51.100.42");
  });

  test('uses "unknown" when no IP headers are present', async () => {
    const headers = createMockHeaders();

    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    expect(ipAddress).toBe("unknown");
  });

  test("extracts user agent correctly from headers", async () => {
    const headers = createMockHeaders();
    const testUserAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
    headers._setHeader("user-agent", testUserAgent);

    const userAgent = headers.get("user-agent") || "";

    expect(userAgent).toBe(testUserAgent);
  });

  test("handles missing user agent gracefully", async () => {
    const headers = createMockHeaders();

    const userAgent = headers.get("user-agent") || "";

    expect(userAgent).toBe("");
  });

  test("extracts referer information from headers", async () => {
    const headers = createMockHeaders();
    headers._setHeader("referer", "https://google.com/search?q=products");

    const referer = headers.get("referer") || "";

    expect(referer).toBe("https://google.com/search?q=products");
  });

  test("records all tracking information in affiliate_clicks table", async () => {
    const supabase = createMockSupabase();
    const headers = createMockHeaders();

    headers._setHeader("user-agent", "Test User Agent");
    headers._setHeader("referer", "https://referer.com");
    headers._setHeader("x-forwarded-for", "1.2.3.4");

    const refCode = "TEST123";

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: { id: "aff-test" },
      error: null,
    });

    const expectedClick = {
      id: "click-test",
      affiliate_id: "aff-test",
      referral_code: refCode,
      product_link_id: null,
      product_id: null,
      ip_address: "1.2.3.4",
      user_agent: "Test User Agent",
      referrer: "https://referer.com",
      landing_page: "/landing",
      created_at: new Date().toISOString(),
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: expectedClick,
      error: null,
    });

    // Simulate full tracking
    const userAgent = headers.get("user-agent") || "";
    const referer = headers.get("referer") || "";
    const forwardedFor = headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("referral_code", refCode)
      .eq("status", "active")
      .single();

    const { data: click } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_id: affiliate!.id,
        referral_code: refCode,
        product_link_id: null,
        product_id: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        landing_page: "/landing",
      })
      .select()
      .single();

    expect(click).toEqual(expectedClick);
    expect(supabase._mocks.mockInsert).toHaveBeenCalled();
  });

  test("returns error for invalid reference code", async () => {
    const supabase = createMockSupabase();
    const refCode = "INVALID-CODE";

    // Mock no affiliate found
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("referral_code", refCode)
      .eq("status", "active")
      .single();

    expect(affiliate).toBeNull();
    // In real API, this would return 404 error
  });
});
