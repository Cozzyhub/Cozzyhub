import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Calculate previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo);

    // Fetch orders for current period
    const { data: currentOrders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", startDate.toISOString());

    // Fetch orders for previous period
    const { data: previousOrders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString());

    // Calculate current period metrics
    const currentRevenue = currentOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
    const currentOrderCount = currentOrders?.length || 0;
    const currentAvgOrder = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

    // Calculate previous period metrics
    const previousRevenue = previousOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
    const previousOrderCount = previousOrders?.length || 0;

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const orderGrowth = previousOrderCount > 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Fetch top selling products
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity, product_price")
      .gte("created_at", startDate.toISOString());

    // Group by product and calculate totals
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    orderItems?.forEach(item => {
      const existing = productSales.get(item.product_id) || { 
        name: item.product_name, 
        quantity: 0, 
        revenue: 0 
      };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * Number(item.product_price);
      productSales.set(item.product_id, existing);
    });

    // Convert to array and sort by revenue
    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Fetch products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { count: activeProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get revenue by day for chart
    const revenueByDay: { [key: string]: number } = {};
    currentOrders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + Number(order.total);
    });

    const revenueChartData = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Order status breakdown
    const ordersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    currentOrders?.forEach(order => {
      if (order.status in ordersByStatus) {
        ordersByStatus[order.status as keyof typeof ordersByStatus]++;
      }
    });

    return NextResponse.json({
      overview: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrderCount,
        averageOrderValue: currentAvgOrder,
        totalProducts,
        activeProducts,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
      },
      topProducts,
      revenueChart: revenueChartData,
      ordersByStatus,
      period: daysAgo,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
