"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils/currency";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
}

interface Props {
  products: Product[];
  defaultCommissionRate: number;
}

export default function ProductLinkGenerator({ products, defaultCommissionRate }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customCommission, setCustomCommission] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedLink(null);

    try {
      const response = await fetch("/api/affiliate/product-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct,
          custom_commission_rate: customCommission ? parseFloat(customCommission) : null,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate link");
      }

      setGeneratedLink(data.url);
      // Reset form
      setSelectedProduct("");
      setCustomCommission("");
      setNotes("");
      
      // Refresh the page after 2 seconds to show new link in table
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert("Link copied to clipboard!");
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div>
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product *
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          >
            <option value="">Choose a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatINR(product.price)} ({product.category})
              </option>
            ))}
          </select>
        </div>

        {/* Product Preview */}
        {selectedProductData && (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            {selectedProductData.image_url && (
              <img
                src={selectedProductData.image_url}
                alt={selectedProductData.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{selectedProductData.name}</h3>
              <p className="text-pink-600 font-bold">{formatINR(selectedProductData.price)}</p>
              <p className="text-sm text-gray-500">Stock: {selectedProductData.stock}</p>
            </div>
          </div>
        )}

        {/* Custom Commission Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Commission Rate (Optional)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={customCommission}
              onChange={(e) => setCustomCommission(e.target.value)}
              placeholder={`Default: ${defaultCommissionRate}%`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-8"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Override default commission rate for this specific product link
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this link (e.g., campaign name, target audience)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Generated Link */}
        {generatedLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">✅ Link Generated Successfully!</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Affiliate Link"
          )}
        </button>
      </form>
    </div>
  );
}
