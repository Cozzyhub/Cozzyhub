"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils/currency";
import {
  Copy,
  ExternalLink,
  TrendingUp,
  MousePointer,
  ShoppingCart,
} from "lucide-react";

interface ProductLink {
  id: string;
  link_code: string;
  product_id: string;
  custom_commission_rate: number | null;
  clicks: number;
  conversions: number;
  total_revenue: number;
  total_commission: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  full_url: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
  };
}

export default function ProductLinksTable() {
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/affiliate/product-link");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch links");
      }

      setLinks(data.links);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No product links yet</p>
        <p className="text-gray-400 text-sm">
          Generate your first product link above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Product
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Link Code
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
              <div className="flex items-center justify-center gap-1">
                <MousePointer size={14} />
                Clicks
              </div>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
              <div className="flex items-center justify-center gap-1">
                <ShoppingCart size={14} />
                Sales
              </div>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp size={14} />
                Commission
              </div>
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr
              key={link.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {/* Product Info */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  {link.products.image_url && (
                    <img
                      src={link.products.image_url}
                      alt={link.products.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {link.products.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {link.products.category}
                    </p>
                    <p className="text-xs font-semibold text-pink-600">
                      {formatINR(link.products.price)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Link Code */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-mono">
                    {link.link_code}
                  </code>
                  <button
                    onClick={() => copyCode(link.link_code)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                {link.custom_commission_rate && (
                  <p className="text-xs text-orange-600 mt-1">
                    Custom: {link.custom_commission_rate}%
                  </p>
                )}
              </td>

              {/* Clicks */}
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-gray-900">
                  {link.clicks}
                </span>
              </td>

              {/* Conversions */}
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-green-600">
                  {link.conversions}
                </span>
                {link.clicks > 0 && (
                  <p className="text-xs text-gray-500">
                    {((link.conversions / link.clicks) * 100).toFixed(1)}%
                  </p>
                )}
              </td>

              {/* Commission */}
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-bold text-pink-600">
                  {formatINR(link.total_commission)}
                </span>
                {link.total_revenue > 0 && (
                  <p className="text-xs text-gray-500">
                    of {formatINR(link.total_revenue)}
                  </p>
                )}
              </td>

              {/* Actions */}
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyLink(link.full_url)}
                    className="px-3 py-1.5 bg-pink-600 text-white text-xs font-medium rounded hover:bg-pink-700 transition flex items-center gap-1"
                    title="Copy full URL"
                  >
                    <Copy size={12} />
                    Copy Link
                  </button>
                  <a
                    href={link.full_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                    title="Open link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Links</p>
          <p className="text-2xl font-bold text-gray-900">{links.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Clicks</p>
          <p className="text-2xl font-bold text-blue-600">
            {links.reduce((sum, link) => sum + link.clicks, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">
            {links.reduce((sum, link) => sum + link.conversions, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Commission</p>
          <p className="text-2xl font-bold text-pink-600">
            {formatINR(
              links.reduce((sum, link) => sum + link.total_commission, 0),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
