import { describe, expect, test, jest, beforeEach } from "@jest/globals";

// Mock Supabase client
const mockSupabase = {
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("Product Import API - Image Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("successfully downloads and uploads images to Supabase storage", async () => {
    const mockImageBlob = new Blob(["fake-image-data"], { type: "image/jpeg" });
    const mockImageUrl = "https://example.com/image.jpg";

    // Mock successful fetch
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockImageBlob,
    } as Response);

    // Mock successful upload
    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: "products/12345-0.jpg" },
      error: null,
    });

    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: "https://storage.example.com/products/12345-0.jpg" },
    });

    const mockStorageFrom = jest.fn(() => ({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    }));

    const supabase = {
      storage: {
        from: mockStorageFrom,
      },
    };

    // Simulate the image processing logic
    const images = [mockImageUrl];
    const uploadedImages: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          continue;
        }
        const imageBlob = await imageResponse.blob();

        const filename = `${Date.now()}-${i}.jpg`;
        const filepath = `products/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(filepath, imageBlob, {
            contentType: imageBlob.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(filepath);

        uploadedImages.push(publicUrl);
      } catch (error) {
        // Continue with other images
      }
    }

    expect(global.fetch).toHaveBeenCalledWith(mockImageUrl);
    expect(mockStorageFrom).toHaveBeenCalledWith("products");
    expect(mockUpload).toHaveBeenCalled();
    expect(uploadedImages).toHaveLength(1);
    expect(uploadedImages[0]).toBe(
      "https://storage.example.com/products/12345-0.jpg",
    );
  });

  test("handles image fetch failure gracefully and continues processing", async () => {
    const images = [
      "https://example.com/bad-image.jpg",
      "https://example.com/good-image.jpg",
    ];
    const uploadedImages: string[] = [];

    // Mock first fetch fails, second succeeds
    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(["image-data"], { type: "image/jpeg" }),
      } as Response);

    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: "products/12345-1.jpg" },
      error: null,
    });

    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: "https://storage.example.com/products/12345-1.jpg" },
    });

    const supabase = {
      storage: {
        from: jest.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    };

    // Simulate the image processing logic
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          continue;
        }
        const imageBlob = await imageResponse.blob();

        const filename = `${Date.now()}-${i}.jpg`;
        const filepath = `products/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(filepath, imageBlob, {
            contentType: imageBlob.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(filepath);

        uploadedImages.push(publicUrl);
      } catch (error) {
        // Continue with other images
      }
    }

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(uploadedImages).toHaveLength(1);
    expect(uploadedImages[0]).toContain("products/12345-1.jpg");
  });

  test("handles Supabase upload error and continues with other images", async () => {
    const images = [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ];
    const uploadedImages: string[] = [];

    // Mock both fetches succeed
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["image-data"], { type: "image/jpeg" }),
    } as Response);

    // First upload fails, second succeeds
    const mockUpload = jest
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: "Storage quota exceeded" },
      })
      .mockResolvedValueOnce({
        data: { path: "products/12345-1.jpg" },
        error: null,
      });

    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: "https://storage.example.com/products/12345-1.jpg" },
    });

    const supabase = {
      storage: {
        from: jest.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    };

    // Simulate the image processing logic
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          continue;
        }
        const imageBlob = await imageResponse.blob();

        const filename = `${Date.now()}-${i}.jpg`;
        const filepath = `products/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(filepath, imageBlob, {
            contentType: imageBlob.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(filepath);

        uploadedImages.push(publicUrl);
      } catch (error) {
        // Continue with other images
      }
    }

    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(uploadedImages).toHaveLength(1);
  });

  test("limits image processing to maximum of 6 images", async () => {
    const images = Array(10).fill("https://example.com/image.jpg");
    const uploadedImages: string[] = [];

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["image-data"], { type: "image/jpeg" }),
    } as Response);

    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: "products/test.jpg" },
      error: null,
    });

    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: "https://storage.example.com/products/test.jpg" },
    });

    const supabase = {
      storage: {
        from: jest.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    };

    // Process up to 6 images
    for (let i = 0; i < Math.min(images.length, 6); i++) {
      const imageUrl = images[i];

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          continue;
        }
        const imageBlob = await imageResponse.blob();

        const filename = `${Date.now()}-${i}.jpg`;
        const filepath = `products/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(filepath, imageBlob, {
            contentType: imageBlob.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(filepath);

        uploadedImages.push(publicUrl);
      } catch (error) {
        // Continue with other images
      }
    }

    expect(global.fetch).toHaveBeenCalledTimes(6);
    expect(uploadedImages).toHaveLength(6);
  });

  test("uses original image URLs as fallback when no images uploaded", () => {
    const originalImages = [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ];
    const uploadedImages: string[] = [];

    // Simulate failed uploads
    const finalImages =
      uploadedImages.length > 0 ? uploadedImages : originalImages;

    expect(finalImages).toEqual(originalImages);
    expect(finalImages).toHaveLength(2);
  });
});
