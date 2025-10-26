"use client";

import { useState } from "react";
import { convertImageToWebP, optimizeImage } from "@/lib/ffmpeg/imageProcessor";

export default function ImageUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Client-side optimization using FFmpeg
  const handleClientOptimization = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const optimizedBlob = await optimizeImage(selectedFile, 1920, 1080, 80);
      const url = URL.createObjectURL(optimizedBlob);
      setOptimizedUrl(url);
    } catch (error) {
      console.error("Optimization error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Server-side optimization using API route
  const handleServerOptimization = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("maxWidth", "1920");
      formData.append("maxHeight", "1080");
      formData.append("quality", "80");

      const response = await fetch("/api/optimize-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setOptimizedUrl(url);
      }
    } catch (error) {
      console.error("Optimization error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Serve static optimized image from URL
  const getOptimizedImageUrl = (imageUrl: string) => {
    const params = new URLSearchParams({
      url: imageUrl,
      maxWidth: "1920",
      maxHeight: "1080",
      quality: "80",
    });
    return `/api/optimize-image?${params.toString()}`;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Image Optimization</h2>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="block w-full text-white"
        />

        <div className="flex gap-4">
          <button
            onClick={handleClientOptimization}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Optimize (Client-side FFmpeg)
          </button>

          <button
            onClick={handleServerOptimization}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Optimize (Server-side Sharp)
          </button>
        </div>

        {loading && <p className="text-white">Optimizing...</p>}

        {optimizedUrl && (
          <div className="mt-4">
            <h3 className="text-white mb-2">Optimized Image:</h3>
            <img
              src={optimizedUrl}
              alt="Optimized"
              className="max-w-full rounded-lg"
            />
          </div>
        )}

        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Usage Examples:</h3>
          <pre className="text-xs text-white overflow-x-auto">
            {`// Client-side with FFmpeg
import { optimizeImage } from "@/lib/ffmpeg/imageProcessor";
const blob = await optimizeImage(file, 1920, 1080, 80);

// Server-side API
const formData = new FormData();
formData.append("file", file);
const response = await fetch("/api/optimize-image", {
  method: "POST",
  body: formData
});

// Serve optimized static images
<img src="/api/optimize-image?url=https://example.com/image.jpg" />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
