import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Order {
  id: string;
  full_name: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Listen for order status changes
    const channel = supabase
      .channel("customer-orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          setOrders((currentOrders) =>
            currentOrders.map((order) =>
              order.id === payload.new.id
                ? {
                    ...order,
                    status: payload.new.status,
                  }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, full_name, total, status, payment_method, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-SL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIndex = (status: string) => {
    return statuses.indexOf(status.toLowerCase());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          My Orders
        </h1>

        <p className="text-gray-600 mt-2">
          View and track your previous orders.
        </p>
      </div>

      {/* No orders */}
      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-10 text-center">

          <div className="text-5xl mb-4">
            🛍️
          </div>

          <h2 className="text-2xl font-bold">
            No Orders Yet
          </h2>

          <p className="text-gray-600 mt-2">
            You haven't placed any orders yet.
          </p>

          <Link
            to="/shop"
            className="inline-block mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            Start Shopping
          </Link>

        </div>
      ) : (

        <div className="space-y-6">

          {orders.map((order) => {

            const currentStatus =
              order.status.toLowerCase();

            const currentIndex =
              getStatusIndex(currentStatus);

            const isCancelled =
              currentStatus === "cancelled";

            return (
              <div
                key={order.id}
                className="bg-white shadow rounded-2xl p-6"
              >

                {/* Order header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-semibold break-all">
                      {order.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Date
                    </p>

                    <p className="font-medium">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment
                    </p>

                    <p className="font-medium capitalize">
                      {order.payment_method.replace(
                        "_",
                        " "
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="font-bold text-emerald-600">
                      Le{" "}
                      {Number(order.total).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                </div>

                {/* Tracking */}
                {!isCancelled ? (
                  <div className="mt-8">

                    <h3 className="font-bold text-lg mb-6">
                      Order Tracking
                    </h3>

                    <div className="relative">

                      {/* Progress line */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />

                      <div
                        className="absolute top-5 left-0 h-1 bg-emerald-500 transition-all duration-500"
                        style={{
                          width:
                            currentIndex <= 0
                              ? "0%"
                              : `${(
                                  currentIndex /
                                  (statuses.length - 1)
                                ) * 100}%`,
                        }}
                      />

                      {/* Steps */}
                      <div className="relative flex justify-between">

                        {statuses.map(
                          (status, index) => {

                            const completed =
                              index <= currentIndex;

                            return (
                              <div
                                key={status}
                                className="flex flex-col items-center"
                              >

                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow ${
                                    completed
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {completed
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <p
                                  className={`mt-3 text-sm font-semibold ${
                                    completed
                                      ? "text-emerald-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {formatStatus(status)}
                                </p>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                  </div>
                ) : (

                  <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-5">

                    <p className="font-semibold text-red-700">
                      This order has been cancelled.
                    </p>

                    <p className="text-sm text-red-600 mt-1">
                      Please contact support if you believe
                      this was a mistake.
                    </p>

                  </div>

                )}

                {/* View order */}
                <div className="mt-8 pt-5 border-t flex justify-end">

                  <Link
                    to={`/order-success/${order.id}`}
                    className="border border-emerald-600 text-emerald-600 px-5 py-2.5 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    View Order
                  </Link>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Orders;