import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

function Vendors() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: productsData, error: productsError } =
        await supabase
          .from("products")
          .select("id, name, price, stock")
          .order("name");

      if (productsError) {
        console.error(productsError);
      } else {
        setProducts(productsData || []);
      }

      const { data: ordersData, error: ordersError } =
        await supabase
          .from("orders")
          .select("id, total, status, created_at")
          .order("created_at", {
            ascending: false,
          })
          .limit(5);

      if (ordersError) {
        console.error(ordersError);
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  ).length;

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total),
    0
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">
            Loading vendor dashboard...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Vendor Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Manage your products and orders.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 text-center"
          >
            Manage Products
          </Link>

        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-gray-500">
              Total Products
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {totalProducts}
            </h2>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-gray-500">
              Recent Orders
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {totalOrders}
            </h2>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-gray-500">
              Recent Revenue
            </p>

            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              Le {totalRevenue}
            </h2>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-gray-500">
              Low Stock
            </p>

            <h2 className="text-3xl font-bold text-orange-500 mt-2">
              {lowStockProducts}
            </h2>
          </div>

        </div>

        {/* Products */}
        <div className="bg-white shadow rounded-xl p-6 mt-8">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              Products
            </h2>

            <Link
              to="/vendor/products"
              className="text-emerald-600 hover:underline"
            >
              View All
            </Link>

          </div>

          {products.length === 0 ? (
            <p className="text-gray-500">
              No products found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b">
                    <th className="py-3">
                      Product
                    </th>

                    <th className="py-3">
                      Price
                    </th>

                    <th className="py-3">
                      Stock
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {products.slice(0, 5).map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-4 font-medium">
                        {product.name}
                      </td>

                      <td className="py-4">
                        Le {product.price}
                      </td>

                      <td className="py-4">
                        <span
                          className={
                            product.stock <= 5
                              ? "text-orange-600 font-semibold"
                              : "text-green-600"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-xl p-6 mt-8">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

            <Link
              to="/vendor/orders"
              className="text-emerald-600 hover:underline"
            >
              View All
            </Link>

          </div>

          {orders.length === 0 ? (
            <p className="text-gray-500">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-4">

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b last:border-b-0 pb-4"
                >

                  <div>
                    <p className="font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="font-semibold">
                    Le {order.total}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize text-sm">
                    {order.status}
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </Layout>
  );
}

export default Vendors;