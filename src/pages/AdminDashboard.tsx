import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface AdminStats {
  customers: number;
  vendors: number;
  products: number;
  orders: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  full_name: string;
  total: number;
  status: string;
  created_at: string;
}

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    customers: 0,
    vendors: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Customers
      const { count: customerCount, error: customerError } =
        await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer");

      if (customerError) {
        console.error("Customer count error:", customerError);
      }

      // Vendors
      const { count: vendorCount, error: vendorError } =
        await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "vendor");

      if (vendorError) {
        console.error("Vendor count error:", vendorError);
      }

      // Products
      const { count: productCount, error: productError } =
        await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

      if (productError) {
        console.error("Product count error:", productError);
      }

      // Orders
      const { count: orderCount, error: orderError } =
        await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

      if (orderError) {
        console.error("Order count error:", orderError);
      }

      // Revenue
      const { data: revenueData, error: revenueError } =
        await supabase
          .from("orders")
          .select("total")
          .neq("status", "cancelled");

      if (revenueError) {
        console.error("Revenue error:", revenueError);
      }

      const totalRevenue =
        revenueData?.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        ) || 0;

      // Recent orders
      const { data: ordersData, error: recentOrdersError } =
        await supabase
          .from("orders")
          .select(
            "id, full_name, total, status, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(5);

      if (recentOrdersError) {
        console.error(
          "Recent orders error:",
          recentOrdersError
        );
      }

      setStats({
        customers: customerCount || 0,
        vendors: vendorCount || 0,
        products: productCount || 0,
        orders: orderCount || 0,
        revenue: totalRevenue,
      });

      setRecentOrders(ordersData || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Le ${amount.toLocaleString("en-SL")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-SL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-emerald-600 font-semibold">
            VendorHub Administration
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-1">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Monitor and manage your marketplace from one place.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Customers */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-gray-500 text-sm font-medium">
              Customers
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats.customers.toLocaleString()}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Registered customers
            </p>
          </div>

          {/* Vendors */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-gray-500 text-sm font-medium">
              Vendors
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats.vendors.toLocaleString()}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Marketplace vendors
            </p>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-gray-500 text-sm font-medium">
              Products
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats.products.toLocaleString()}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Products listed
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-gray-500 text-sm font-medium">
              Orders
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats.orders.toLocaleString()}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Total orders
            </p>
          </div>

        </div>

        {/* Revenue */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm font-medium">
            Total Revenue
          </p>

          <p className="text-4xl font-bold text-emerald-600 mt-2">
            {formatCurrency(stats.revenue)}
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Excluding cancelled orders
          </p>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

            <p className="text-gray-500 mt-1">
              The latest orders placed on VendorHub.
            </p>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No orders found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b text-left bg-gray-50">
                    <th className="px-6 py-4 text-sm font-semibold">
                      Order ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Total
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">
                        <span className="font-medium text-sm">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {order.full_name}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(Number(order.total))}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Quick Management */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-lg">
              User Management
            </h2>

            <p className="text-gray-500 mt-2">
              Manage customers, vendors and platform users.
            </p>

            <Link
  to="/admin/users"
  className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700"
>
  Manage Users →
</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-lg">
              Vendor Management
            </h2>

            <p className="text-gray-500 mt-2">
              Review vendors and manage marketplace stores.
            </p>

          <Link
  to="/admin/vendors"
  className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700"
>
  Manage Vendors →
</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-lg">
              Product Management
            </h2>

            <p className="text-gray-500 mt-2">
              Monitor products and marketplace inventory.
            </p>

            <Link
  to="/admin/products"
  className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700"
>
  Manage Products →
</Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;