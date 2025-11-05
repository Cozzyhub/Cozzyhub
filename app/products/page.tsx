import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import ProductsPageContent from "@/components/storefront/ProductsPageContent";
import ProductSort, { type SortOption } from "@/components/ui/ProductSort";
import { Suspense } from "react";

interface ProductsPageProps {
  searchParams: { 
    category?: string; 
    subcategory?: string; 
    page?: string;
    sort?: SortOption;
    priceMin?: string;
    priceMax?: string;
    rating?: string;
    inStock?: string;
    onSale?: string;
    featured?: string;
  };
}

const ITEMS_PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const supabase = await createClient();
  const { 
    category, 
    subcategory, 
    page, 
    sort = "newest",
    priceMin,
    priceMax,
    rating,
    inStock,
    onSale,
    featured,
  } = await searchParams;
  
  // Parse current page, default to 1
  const currentPage = parseInt(page || "1", 10);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Query with count to get total number of products
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // Filter by category if provided
  if (category) {
    query = query.eq("category", category);
  }

  // Filter by subcategory if provided
  if (subcategory) {
    query = query.eq("subcategory", subcategory);
  }

  // Filter by price range
  if (priceMin) {
    query = query.gte("price", parseFloat(priceMin));
  }
  if (priceMax) {
    query = query.lte("price", parseFloat(priceMax));
  }

  // Filter by rating
  if (rating) {
    query = query.gte("average_rating", parseFloat(rating));
  }

  // Filter by stock availability
  if (inStock === "true") {
    query = query.gt("stock", 0);
  }

  // Filter by sale status
  if (onSale === "true") {
    query = query.eq("on_sale", true);
  }

  // Filter by featured status
  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  // Apply sorting
  let orderColumn = "created_at";
  let ascending = false;

  switch (sort) {
    case "newest":
      orderColumn = "created_at";
      ascending = false;
      break;
    case "oldest":
      orderColumn = "created_at";
      ascending = true;
      break;
    case "price-low":
      orderColumn = "price";
      ascending = true;
      break;
    case "price-high":
      orderColumn = "price";
      ascending = false;
      break;
    case "rating-high":
      orderColumn = "average_rating";
      ascending = false;
      break;
    case "rating-low":
      orderColumn = "average_rating";
      ascending = true;
      break;
    case "name-asc":
      orderColumn = "name";
      ascending = true;
      break;
    case "name-desc":
      orderColumn = "name";
      ascending = false;
      break;
  }

  const { data: products, count } = await query
    .order(orderColumn, { ascending })
    .range(from, to);

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // Check if filters are active
  const hasFilters = !!(priceMin || priceMax || rating || inStock || onSale || featured);

  // Generate page title based on filters
  let pageTitle = "All Products";
  let pageDescription = "Discover our complete collection";

  if (subcategory) {
    pageTitle = subcategory;
    pageDescription = `Browse our ${subcategory.toLowerCase()} collection`;
  } else if (category) {
    pageTitle = category;
    pageDescription = `Explore ${category.toLowerCase()} products`;
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          {/* Breadcrumbs */}
          {(category || subcategory) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <a href="/" className="hover:text-pink-600 transition-colors">
                Home
              </a>
              <span>/</span>
              {category &&
                (subcategory ? (
                  <a
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="hover:text-pink-600 transition-colors"
                  >
                    {category}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{category}</span>
                ))}
              {subcategory && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {subcategory}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {pageTitle}
              </h1>
              <p className="text-gray-600 text-lg">{pageDescription}</p>
            </div>
            <Suspense fallback={<div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg" />}>
              <ProductSort />
            </Suspense>
          </div>

        </div>

        <ProductsPageContent
          products={products || []}
          currentPage={currentPage}
          totalPages={totalPages}
          count={count}
          hasFilters={hasFilters}
          queryParams={{
            ...(category && { category }),
            ...(subcategory && { subcategory }),
            ...(sort && sort !== "newest" && { sort }),
            ...(priceMin && { priceMin }),
            ...(priceMax && { priceMax }),
            ...(rating && { rating }),
            ...(inStock && { inStock }),
            ...(onSale && { onSale }),
            ...(featured && { featured }),
          }}
        />
      </div>
    </div>
  );
}
