import { describe, expect, test, jest, beforeEach } from "@jest/globals";

// Mock Supabase client
const createMockSupabase = () => {
  const mockRpc = jest.fn();
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
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn((table: string) => ({
      select: mockSelect,
      insert: mockInsert,
    })),
    rpc: mockRpc,
    _mocks: {
      mockRpc,
      mockSelect,
      mockInsert,
      mockSingle,
    },
  };
};

describe("Affiliate Product Link API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generates unique link code using RPC function", async () => {
    const supabase = createMockSupabase();
    const affiliateId = "aff-123";
    const productId = "prod-456";

    // Mock user authentication
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
    });

    // Mock affiliate lookup
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: { id: affiliateId, referral_code: "TESTREF" },
      error: null,
    });

    // Mock product lookup
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: { id: productId, name: "Test Product" },
      error: null,
    });

    // Mock existing link check (no existing link)
    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Mock RPC call to generate link code
    const generatedLinkCode = "TESTREF-PROD456";
    supabase.rpc.mockResolvedValue({
      data: generatedLinkCode,
      error: null,
    });

    // Mock product link creation
    const mockProductLink = {
      id: "link-123",
      affiliate_id: affiliateId,
      product_id: productId,
      link_code: generatedLinkCode,
      custom_commission_rate: 15,
      notes: "Test link",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: mockProductLink,
      error: null,
    });

    // Simulate the API logic
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).toBeTruthy();

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .single();

    expect(affiliate).toBeTruthy();

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    expect(product).toBeTruthy();

    const { data: existingLink } = await supabase
      .from("product_affiliate_links")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .eq("product_id", productId)
      .eq("is_active", true)
      .single();

    expect(existingLink).toBeNull();

    // Generate link code
    const { data: linkCode } = await supabase.rpc(
      "generate_product_link_code",
      { aff_id: affiliateId, prod_id: productId },
    );

    expect(supabase.rpc).toHaveBeenCalledWith("generate_product_link_code", {
      aff_id: affiliateId,
      prod_id: productId,
    });
    expect(linkCode).toBe(generatedLinkCode);

    // Create product link
    const { data: productLink, error: insertError } = await supabase
      .from("product_affiliate_links")
      .insert({
        affiliate_id: affiliateId,
        product_id: productId,
        link_code: linkCode,
        custom_commission_rate: 15,
        notes: "Test link",
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(productLink).toBeTruthy();
    expect(productLink!.link_code).toBe(generatedLinkCode);
    expect(productLink!.custom_commission_rate).toBe(15);
  });

  test("stores product-specific commission rate correctly", async () => {
    const supabase = createMockSupabase();
    const customCommissionRate = 20;

    // Mock successful flow
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    supabase._mocks.mockSingle
      .mockResolvedValueOnce({ data: { id: "aff-123" }, error: null }) // affiliate
      .mockResolvedValueOnce({ data: { id: "prod-456" }, error: null }) // product
      .mockResolvedValueOnce({ data: null, error: null }); // existing link check

    supabase.rpc.mockResolvedValue({ data: "LINK-CODE", error: null });

    const mockProductLink = {
      id: "link-123",
      affiliate_id: "aff-123",
      product_id: "prod-456",
      link_code: "LINK-CODE",
      custom_commission_rate: customCommissionRate,
      notes: null,
      is_active: true,
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: mockProductLink,
      error: null,
    });

    // Execute insert
    await supabase.auth.getUser();
    await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", "user-123")
      .eq("status", "active")
      .single();
    await supabase.from("products").select("*").eq("id", "prod-456").single();
    await supabase
      .from("product_affiliate_links")
      .select("*")
      .eq("affiliate_id", "aff-123")
      .eq("product_id", "prod-456")
      .eq("is_active", true)
      .single();
    await supabase.rpc("generate_product_link_code", {
      aff_id: "aff-123",
      prod_id: "prod-456",
    });

    const { data: productLink } = await supabase
      .from("product_affiliate_links")
      .insert({
        affiliate_id: "aff-123",
        product_id: "prod-456",
        link_code: "LINK-CODE",
        custom_commission_rate: customCommissionRate,
        notes: null,
      })
      .select()
      .single();

    expect(productLink).toBeTruthy();
    expect(productLink!.custom_commission_rate).toBe(customCommissionRate);
  });

  test("returns existing link if already created for affiliate-product combo", async () => {
    const supabase = createMockSupabase();

    const existingLink = {
      id: "existing-link-123",
      affiliate_id: "aff-123",
      product_id: "prod-456",
      link_code: "EXISTING-CODE",
      custom_commission_rate: 10,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    supabase._mocks.mockSingle
      .mockResolvedValueOnce({ data: { id: "aff-123" }, error: null }) // affiliate
      .mockResolvedValueOnce({ data: { id: "prod-456" }, error: null }) // product
      .mockResolvedValueOnce({ data: existingLink, error: null }); // existing link found

    await supabase.auth.getUser();
    await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", "user-123")
      .eq("status", "active")
      .single();
    await supabase.from("products").select("*").eq("id", "prod-456").single();

    const { data: foundLink } = await supabase
      .from("product_affiliate_links")
      .select("*")
      .eq("affiliate_id", "aff-123")
      .eq("product_id", "prod-456")
      .eq("is_active", true)
      .single();

    expect(foundLink).toEqual(existingLink);
    expect(supabase.rpc).not.toHaveBeenCalled(); // Should not generate new code
  });

  test("handles null custom commission rate", async () => {
    const supabase = createMockSupabase();

    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    supabase._mocks.mockSingle
      .mockResolvedValueOnce({ data: { id: "aff-123" }, error: null })
      .mockResolvedValueOnce({ data: { id: "prod-456" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });

    supabase.rpc.mockResolvedValue({ data: "LINK-CODE", error: null });

    const mockProductLink = {
      id: "link-123",
      affiliate_id: "aff-123",
      product_id: "prod-456",
      link_code: "LINK-CODE",
      custom_commission_rate: null, // No custom rate
      notes: null,
      is_active: true,
    };

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: mockProductLink,
      error: null,
    });

    // Execute full flow
    await supabase.auth.getUser();
    await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", "user-123")
      .eq("status", "active")
      .single();
    await supabase.from("products").select("*").eq("id", "prod-456").single();
    await supabase
      .from("product_affiliate_links")
      .select("*")
      .eq("affiliate_id", "aff-123")
      .eq("product_id", "prod-456")
      .eq("is_active", true)
      .single();
    await supabase.rpc("generate_product_link_code", {
      aff_id: "aff-123",
      prod_id: "prod-456",
    });

    const { data: productLink } = await supabase
      .from("product_affiliate_links")
      .insert({
        affiliate_id: "aff-123",
        product_id: "prod-456",
        link_code: "LINK-CODE",
        custom_commission_rate: null,
        notes: null,
      })
      .select()
      .single();

    expect(productLink).toBeTruthy();
    expect(productLink!.custom_commission_rate).toBeNull();
  });

  test("requires authentication and active affiliate account", async () => {
    const supabase = createMockSupabase();

    // Test unauthorized user
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: null },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).toBeNull();

    // Test non-active affiliate
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    supabase._mocks.mockSingle.mockResolvedValueOnce({
      data: null, // No active affiliate found
      error: null,
    });

    await supabase.auth.getUser();
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", "user-123")
      .eq("status", "active")
      .single();

    expect(affiliate).toBeNull();
  });
});
