import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { formatINR } from "@/lib/utils/currency";

export default async function AdminProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition">
            <Plus size={20} />
            Add Product
          </button>
        </Link>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium p-4">
                  Product
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Category
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Price
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Stock
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Status
                </th>
                <th className="text-right text-gray-400 font-medium p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-gray-400 text-sm">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">
                    {product.categories?.name || "Uncategorized"}
                  </td>
                  <td className="p-4 text-white font-semibold">
                    {formatINR(Number(product.price))}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10
                          ? "bg-green-500/20 text-green-300"
                          : product.stock > 0
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.is_active
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No products yet. Create your first product!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
