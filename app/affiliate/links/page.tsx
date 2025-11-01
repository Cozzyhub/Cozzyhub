import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductLinkGenerator from "@/components/affiliate/ProductLinkGenerator";
import ProductLinksTable from "@/components/affiliate/ProductLinksTable";

export default async function AffiliateLinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get affiliate profile
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Affiliate Account Found
          </h1>
          <p className="text-gray-600 mb-6">
            You need to apply for an affiliate account to generate product links.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (affiliate.status !== "active") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Status: {affiliate.status}
          </h1>
          <p className="text-gray-600 mb-6">
            {affiliate.status === "pending"
              ? "Your affiliate application is pending approval. You'll be notified once approved."
              : "Your affiliate account is not active. Please contact support."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Get all products for the dropdown
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock")
    .gt("stock", 0)
    .order("name");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Affiliate Links
          </h1>
          <p className="text-gray-600">
            Generate unique affiliate links for specific products and track their performance
          </p>
        </div>

        {/* Affiliate Info Card */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-pink-100 text-sm mb-1">Your Referral Code</p>
              <p className="text-2xl font-bold">{affiliate.referral_code}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm mb-1">Commission Rate</p>
              <p className="text-2xl font-bold">{affiliate.commission_rate}%</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm mb-1">Total Clicks</p>
              <p className="text-2xl font-bold">{affiliate.total_clicks}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm mb-1">Total Sales</p>
              <p className="text-2xl font-bold">{affiliate.total_sales}</p>
            </div>
          </div>
        </div>

        {/* Product Link Generator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate New Product Link
          </h2>
          <ProductLinkGenerator 
            products={products || []} 
            defaultCommissionRate={affiliate.commission_rate}
          />
        </div>

        {/* Existing Product Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Product Links
          </h2>
          <ProductLinksTable />
        </div>
      </div>
    </div>
  );
}
