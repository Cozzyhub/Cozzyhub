import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";
import {
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

export default async function AffiliatesAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  // Fetch all affiliates
  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  // Calculate summary stats
  const stats = {
    total: affiliates?.length || 0,
    pending: affiliates?.filter((a) => a.status === "pending").length || 0,
    active: affiliates?.filter((a) => a.status === "active").length || 0,
    totalEarnings:
      affiliates?.reduce((sum, a) => sum + Number(a.total_earnings || 0), 0) ||
      0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="text-green-600" size={20} />;
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "suspended":
        return <Ban className="text-orange-600" size={20} />;
      case "rejected":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Affiliate Management
          </h1>
          <p className="text-gray-600">
            Manage affiliate partners and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Affiliates</span>
              <Users className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pending Approval</span>
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Affiliates</span>
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Commissions</span>
              <DollarSign className="text-pink-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatINR(stats.totalEarnings)}
            </p>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Affiliates
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliates && affiliates.length > 0 ? (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {affiliate.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {affiliate.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                          {affiliate.referral_code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(affiliate.status)}`}
                        >
                          {getStatusIcon(affiliate.status)}
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.commission_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.total_clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.total_sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                        {formatINR(Number(affiliate.total_earnings || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/affiliates/${affiliate.id}`}
                          className="text-pink-600 hover:text-pink-700 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <p className="text-lg mb-2">No affiliates yet</p>
                      <p className="text-sm">
                        Affiliate applications will appear here
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
