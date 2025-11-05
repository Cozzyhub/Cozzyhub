"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Package, Search } from "lucide-react";
import CategoryModal from "@/components/admin/CategoryModal";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.slug.toLowerCase().includes(query) ||
            cat.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        setFilteredCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (formData: CategoryFormData) => {
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create category");
    }

    await fetchCategories();
  };

  const handleUpdateCategory = async (formData: CategoryFormData) => {
    if (!editingCategory) return;

    const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update category");
    }

    await fetchCategories();
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage product categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition group"
          >
            {/* Category Image */}
            {category.image_url ? (
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Package size={48} className="text-purple-400/50" />
              </div>
            )}

            {/* Category Info */}
            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-sm font-mono">{category.slug}</p>
              </div>

              {category.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Product Count */}
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-purple-400" />
                <span className="text-gray-400 text-sm">
                  {category.product_count}{" "}
                  {category.product_count === 1 ? "product" : "products"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 font-medium rounded-lg hover:bg-blue-500/20 transition"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <DeleteCategoryButton
                  categoryId={category.id}
                  categoryName={category.name}
                  productCount={category.product_count}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? "No categories found" : "No categories yet"}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first category to organize your products"}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              <Plus size={20} />
              Add Category
            </button>
          )}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
      />
    </div>
  );
}
