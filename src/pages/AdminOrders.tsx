import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

interface Order {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  store_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (orderError) {
      console.error(
        "Error fetching orders:",
        orderError.message
      );
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } =
      await supabase
        .from("order_items")
        .select("*")
        .order("created_at", { ascending: true });

    if (itemError) {
      console.error(
        "Error fetching order items:",
        itemError.message
      );
      setLoading(false);
      return;
    }

    setOrders(orderData || []);
    setOrderItems(itemData || []);
    setLoading(false);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    setUpdating(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error(
        "Error updating order:",
        error.message
      );

      alert(
        `Failed to update order: ${error.message}`
      );

      setUpdating(false);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    setSelectedOrder((currentOrder) =>
      currentOrder &&
      currentOrder.id === orderId
        ? {
            ...currentOrder,
            status: newStatus,
          }
        : currentOrder
    );

    alert("Order status updated successfully!");

    setUpdating(false);
  };

  const filteredOrders = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    return orders.filter((order) => {
      const matchesSearch =
        searchText === "" ||
        order.full_name
          .toLowerCase()
          .includes(searchText) ||
        order.email
          .toLowerCase()
          .includes(searchText) ||
        order.phone
          .toLowerCase()
          .includes(searchText) ||
        order.id
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getOrderItems = (orderId: string) => {
    return orderItems.filter(
      (item) => item.order_id === orderId
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatMoney = (amount: number) => {
    return `Le ${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Order Management
        </h1>

        <p className="text-gray-600 mt-2">
          Monitor and manage marketplace orders.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer, email, phone or order ID..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="shipped">
                Shipped
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {(search ||
          statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-4 text-sm text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Showing{" "}
        <span className="font-semibold">
          {filteredOrders.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {orders.length}
        </span>{" "}
        orders
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No orders found.
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No orders match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">
                    Order
                  </th>

                  <th className="p-4">
                    Customer
                  </th>

                  <th className="p-4">
                    Total
                  </th>

                  <th className="p-4">
                    Payment
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Date
                  </th>

                  <th className="p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm">
                          {order.id.slice(
                            0,
                            8
                          )}
                          ...
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {order.full_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.email}
                        </p>
                      </td>

                      <td className="p-4 font-semibold">
                        {formatMoney(
                          order.total
                        )}
                      </td>

                      <td className="p-4 capitalize">
                        {order.payment_method}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status ===
                            "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status ===
                                "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status ===
                                "processing"
                              ? "bg-blue-100 text-blue-700"
                              : order.status ===
                                "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Order Details
                </h2>

                <p className="text-sm text-gray-500 font-mono mt-1">
                  {selectedOrder.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

            </div>

            <div className="p-6 space-y-6">

              {/* Customer */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Customer
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedOrder.full_name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedOrder.email}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedOrder.phone}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedOrder.address},{" "}
                    {selectedOrder.city}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Order Items
                </h3>

                <div className="border rounded-xl overflow-hidden">

                  {getOrderItems(
                    selectedOrder.id
                  ).length === 0 ? (
                    <p className="p-4 text-gray-500">
                      No order items found.
                    </p>
                  ) : (
                    getOrderItems(
                      selectedOrder.id
                    ).map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border-b last:border-b-0 flex justify-between gap-4"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {item.quantity} ×{" "}
                            {formatMoney(
                              item.price
                            )}
                          </p>
                        </div>

                        <p className="font-semibold">
                          {formatMoney(
                            item.subtotal
                          )}
                        </p>
                      </div>
                    ))
                  )}

                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Payment Summary
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">

                  <div className="flex justify-between">
                    <span>
                      Payment Method
                    </span>

                    <span className="font-medium capitalize">
                      {
                        selectedOrder.payment_method
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatMoney(
                        selectedOrder.subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Delivery Fee
                    </span>

                    <span>
                      {formatMoney(
                        selectedOrder.delivery_fee
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>

                    <span>
                      {formatMoney(
                        selectedOrder.total
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Status Management */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Manage Order Status
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">

                  <select
                    value={selectedOrder.status}
                    disabled={updating}
                    onChange={(e) =>
                      updateOrderStatus(
                        selectedOrder.id,
                        e.target.value
                      )
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="processing">
                      Processing
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>

                  {updating && (
                    <div className="flex items-center text-gray-500">
                      Updating...
                    </div>
                  )}

                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Changing this status will update
                  the order for the marketplace.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t">

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                disabled={updating}
                className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;