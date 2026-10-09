import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();

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
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
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
        setError("We couldn't load your orders. Please try again.");
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong while loading your orders.");
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

  const formatPaymentMethod = (method: string) => {
    return method
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusIndex = (status: string) => {
    return statuses.indexOf(status.toLowerCase());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock3 size={15} />;

      case "processing":
        return <Package size={15} />;

      case "shipped":
        return <Truck size={15} />;

      case "delivered":
        return <Check size={15} />;

      case "cancelled":
        return <XCircle size={15} />;

      default:
        return <Package size={15} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8">
            <div className="h-9 w-48 rounded-lg bg-gray-200" />
            <div className="mt-3 h-5 w-72 rounded bg-gray-200" />
          </div>

          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-5 w-64 rounded bg-gray-200" />
                  </div>

                  <div className="h-8 w-24 rounded-full bg-gray-200" />
                </div>

                <div className="mt-8 h-24 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <ShoppingBag size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Orders
              </h1>

              <p className="mt-1 text-gray-600">
                View and track your previous orders.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-700">
                Unable to load orders
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              onClick={fetchOrders}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              You haven't placed any orders yet. Start shopping and
              your orders will appear here.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Start Shopping
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatus = order.status.toLowerCase();
              const currentIndex = getStatusIndex(currentStatus);
              const isCancelled = currentStatus === "cancelled";

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Order Header */}
                  <div className="border-b border-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Order ID</span>
                        </div>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                          {order.id}
                        </p>
                      </div>

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </div>
                    </div>

                    {/* Order Information */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={16} />
                          Date
                        </div>

                        <p className="mt-2 font-semibold text-gray-900">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CreditCard size={16} />
                          Payment
                        </div>

                        <p className="mt-2 font-semibold text-gray-900">
                          {formatPaymentMethod(
                            order.payment_method
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ShoppingBag size={16} />
                          Total
                        </div>

                        <p className="mt-2 font-bold text-red-600">
                          Le{" "}
                          {Number(order.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}
                  {!isCancelled ? (
                    <div className="p-5 sm:p-6">
                      <div className="mb-7">
                        <h3 className="text-lg font-bold text-gray-900">
                          Order Tracking
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Follow the progress of your order.
                        </p>
                      </div>

                      <div className="overflow-x-auto pb-2">
                        <div className="relative min-w-[520px]">
                          {/* Background Line */}
                          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-gray-200" />

                          {/* Progress Line */}
                          <div
                            className="absolute left-0 top-5 h-1 rounded-full bg-red-500 transition-all duration-500"
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
                            {statuses.map((status, index) => {
                              const completed =
                                index <= currentIndex;

                              return (
                                <div
                                  key={status}
                                  className="flex w-24 flex-col items-center text-center"
                                >
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                                      completed
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {completed ? (
                                      <Check size={18} />
                                    ) : (
                                      index + 1
                                    )}
                                  </div>

                                  <p
                                    className={`mt-3 text-sm font-semibold ${
                                      completed
                                        ? "text-red-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {formatStatus(status)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 sm:p-6">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start gap-3">
                          <XCircle
                            className="mt-0.5 shrink-0 text-red-600"
                            size={21}
                          />

                          <div>
                            <p className="font-semibold text-red-700">
                              This order has been cancelled.
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                              Please contact support if you believe
                              this was a mistake.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <p className="text-sm text-gray-500">
                      Need help with this order?
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        to="/support"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Contact Support
                      </Link>

                      <Link
                        to={`/order-success/${order.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        View Order
                        <ChevronRight size={17} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;