import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

interface VendorOrder {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  order_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  store_id: string;
}

function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
        return;
      }

      // Get stores belonging to this vendor
      const { data: stores, error: storesError } =
        await supabase
          .from("stores")
          .select("id")
          .eq("vendor_id", user.id);

      if (storesError) {
        console.error("Stores error:", storesError);
        return;
      }

      const storeIds =
        stores?.map((store) => store.id) || [];

      if (storeIds.length === 0) {
        setOrders([]);
        return;
      }

      // Get order items belonging to vendor stores
      const { data: orderItems, error: itemsError } =
        await supabase
          .from("order_items")
          .select(
            "order_id, product_name, price, quantity, subtotal, store_id"
          )
          .in("store_id", storeIds);

      if (itemsError) {
        console.error(
          "Order items error:",
          itemsError
        );
        return;
      }

      const orderIds = [
        ...new Set(
          (orderItems || []).map(
            (item: OrderItem) => item.order_id
          )
        ),
      ];

      if (orderIds.length === 0) {
        setOrders([]);
        return;
      }

      // Get the actual orders
      const { data: ordersData, error: ordersError } =
        await supabase
          .from("orders")
          .select("*")
          .in("id", orderIds)
          .order("created_at", {
            ascending: false,
          });

      if (ordersError) {
        console.error(
          "Orders error:",
          ordersError
        );
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error(
        "Vendor orders error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      setUpdating(orderId);

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        console.error(error);
        alert(
          "Unable to update order status."
        );
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
    } catch (error) {
      console.error(error);
      alert(
        "Unable to update order status."
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-8">
          <p className="text-xl">
            Loading vendor orders...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold text-emerald-600 mb-8">
          Vendor Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white shadow rounded-xl p-8">
            <p className="text-gray-500">
              No orders found for your stores.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow rounded-xl p-6"
              >

                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">

                  <div>
                    <h2 className="text-xl font-bold">
                      Order #{order.id.slice(0, 8)}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-bold text-emerald-600">
                      Le{" "}
                      {Number(
                        order.total
                      ).toLocaleString()}
                    </p>

                    <span className="text-sm text-gray-500">
                      {order.payment_method}
                    </span>

                  </div>

                </div>

                {/* Customer Information */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">

                  <div>
                    <h3 className="font-bold mb-2">
                      Customer
                    </h3>

                    <p>{order.full_name}</p>
                    <p className="text-gray-600">
                      {order.phone}
                    </p>
                    <p className="text-gray-600">
                      {order.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">
                      Delivery Address
                    </h3>

                    <p>{order.address}</p>
                    <p className="text-gray-600">
                      {order.city}
                    </p>
                  </div>

                </div>

                {/* Status */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">

                  <label
                    htmlFor={`status-${order.id}`}
                    className="font-semibold"
                  >
                    Order Status:
                  </label>

                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    disabled={
                      updating === order.id
                    }
                    onChange={(event) =>
                      updateOrderStatus(
                        order.id,
                        event.target.value
                      )
                    }
                    className="border rounded-lg px-4 py-2"
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

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </Layout>
  );
}

export default VendorOrders;