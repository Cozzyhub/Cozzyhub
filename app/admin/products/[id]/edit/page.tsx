"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import {
  getCategoryNames,
  getSubcategoriesForCategory,
} from "@/lib/categories";

export default function EditProductPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    subcategory: "",
    description: "",
    price: "",
    original_price: "",
    stock: "",
    image_url: "",
    is_active: true,
    is_featured: false,
  });
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const productId = params?.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product");
        router.push("/admin/products");
        return;
      }

      if (data) {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          category: data.category || "",
          subcategory: data.subcategory || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          original_price: data.original_price?.toString() || "",
          stock: data.stock?.toString() || "",
          image_url: data.image_url || "",
          is_active: data.is_active ?? true,
          is_featured: data.is_featured ?? false,
        });
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
        if (data.images && Array.isArray(data.images)) {
          setAdditionalImages(data.images);
        }
      }

      setFetchLoading(false);
    };

    fetchProduct();
  }, [productId, supabase, router]);

  const handleImageUpload = async (file: File) => {
    setImageLoading(true);
    try {
      // Optimize image using our API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("maxWidth", "1920");
      formData.append("maxHeight", "1080");
      formData.append("quality", "85");

      const response = await fetch("/api/optimize-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to optimize image");

      const optimizedBlob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;
      const { data, error } = await supabase.storage
        .from("products")
        .upload(fileName, optimizedBlob, {
          contentType: "image/webp",
          cacheControl: "3600",
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImagePreview(URL.createObjectURL(optimizedBlob));
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleAdditionalImageUpload = async (file: File, index: number) => {
    setUploadingImageIndex(index);
    try {
      // Optimize image using our API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("maxWidth", "1920");
      formData.append("maxHeight", "1080");
      formData.append("quality", "85");

      const response = await fetch("/api/optimize-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to optimize image");

      const optimizedBlob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;
      const { data, error } = await supabase.storage
        .from("products")
        .upload(fileName, optimizedBlob, {
          contentType: "image/webp",
          cacheControl: "3600",
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      setAdditionalImages((prev) => {
        const newImages = [...prev];
        newImages[index] = urlData.publicUrl;
        return newImages;
      });
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleAdditionalFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAdditionalImageUpload(file, index);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageSlot = () => {
    setAdditionalImages((prev) => [...prev, ""]);
  };

  const calculateDiscount = () => {
    if (formData.original_price && formData.price) {
      const original = parseFloat(formData.original_price);
      const current = parseFloat(formData.price);
      if (original > current && original > 0) {
        return Math.round(((original - current) / original) * 100);
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const allImages = additionalImages.filter((img) => img !== "");
    const discountPercentage = calculateDiscount();

    const { error } = await supabase
      .from("products")
      .update({
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_percentage: discountPercentage,
        stock: parseInt(formData.stock),
        images: allImages.length > 0 ? allImages : null,
      })
      .eq("id", productId);

    if (error) {
      alert("Error updating product: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin/products");
      router.refresh();
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (fetchLoading) {
    return (
      <div className="max-w-3xl">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-center text-gray-400">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={20} />
          Back to Products
        </button>
      </Link>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Premium Wireless Headphones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subcategory: "",
                  })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-slate-800 text-gray-300">
                  Select a category
                </option>
                {getCategoryNames().map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="bg-slate-800 text-white"
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory Selection */}
          {formData.category &&
            getSubcategoriesForCategory(formData.category).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Subcategory (Optional)
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" className="bg-slate-800 text-gray-300">
                    Select a subcategory (optional)
                  </option>
                  {getSubcategoriesForCategory(formData.category).map(
                    (subcat) => (
                      <option
                        key={subcat}
                        value={subcat}
                        className="bg-slate-800 text-white"
                      >
                        {subcat}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Original Price / MRP (INR)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) =>
                  setFormData({ ...formData, original_price: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1999.00"
              />
              <p className="text-xs text-gray-400 mt-1">
                The original price shown with strikethrough
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Selling Price (INR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="999.00"
              />
              {formData.original_price && formData.price && parseFloat(formData.original_price) > parseFloat(formData.price) && (
                <p className="text-xs text-green-400 mt-1 font-medium">
                  💰 {calculateDiscount()}% OFF - Saves ₹{(parseFloat(formData.original_price) - parseFloat(formData.price)).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Stock *
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Product Image
            </label>

            {!imagePreview ? (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/20 border-dashed rounded-lg cursor-pointer hover:bg-white/5 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <p className="text-xs text-purple-400 mt-1">
                      Auto-optimized to WebP
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={imageLoading}
                  />
                </label>

                <div className="text-center text-gray-400 text-sm">or</div>

                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Or paste image URL"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition"
                >
                  <X size={20} className="text-white" />
                </button>
                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                  ✓ Image optimized and uploaded
                </div>
              </div>
            )}

            {imageLoading && (
              <div className="mt-2 text-sm text-purple-400 animate-pulse">
                Optimizing and uploading image...
              </div>
            )}
          </div>

          {/* Additional Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Additional Product Images (Gallery)
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Upload multiple images to show in product gallery
            </p>

            <div className="space-y-3">
              {additionalImages.map((imageUrl, index) => (
                <div key={index} className="flex gap-3 items-start">
                  {!imageUrl ? (
                    <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer hover:bg-white/5 transition">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-400">
                          {uploadingImageIndex === index ? (
                            <span className="text-purple-400 animate-pulse">
                              Uploading...
                            </span>
                          ) : (
                            <span>Click to upload image {index + 1}</span>
                          )}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleAdditionalFileSelect(e, index)}
                        disabled={uploadingImageIndex === index}
                      />
                    </label>
                  ) : (
                    <div className="flex-1 relative">
                      <img
                        src={imageUrl}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addImageSlot}
                className="w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition text-sm"
              >
                + Add Another Image
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-purple-500"
              />
              <span>Active</span>
            </label>

            <label className="flex items-center gap-2 text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-purple-500"
              />
              <span>Featured</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
            <Link href="/admin/products">
              <button
                type="button"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
