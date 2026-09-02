import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface VendorOrder {
  order_id: string;
  full_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
  product_name: string;
  quantity: number;
  subtotal: number;
  store_name: string;
}

function VendorOrderList() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Unable to get vendor:", userError);
        setLoading(false);
        return;
      }

      // Get this vendor's stores
      const { data: stores, error: storeError } =
        await supabase
          .from("stores")
          .select("id, name")
          .eq("vendor_id", user.id);

      if (storeError) {
        console.error(
          "Error loading vendor stores:",
          storeError
        );
        setLoading(false);
        return;
      }

      if (!stores || stores.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const storeIds = stores.map((store) => store.id);

      // Get order items belonging to this vendor's stores
      const { data: orderItems, error: itemError } =
        await supabase
          .from("order_items")
          .select(`
            order_id,
            product_name,
            price,
            quantity,
            subtotal,
            store_id
          `)
          .in("store_id", storeIds);

      if (itemError) {
        console.error(
          "Error loading order items:",
          itemError
        );
        setLoading(false);
        return;
      }

      if (!orderItems || orderItems.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = [
        ...new Set(
          orderItems.map((item) => item.order_id)
        ),
      ];

      // Get the actual orders
      const { data: orderData, error: orderError } =
        await supabase
          .from("orders")
          .select(
            "id, full_name, phone, total, status, created_at"
          )
          .in("id", orderIds)
          .order("created_at", {
            ascending: false,
          });

      if (orderError) {
        console.error(
          "Error loading orders:",
          orderError
        );
        setLoading(false);
        return;
      }

      const combinedOrders: VendorOrder[] = [];

      orderItems.forEach((item) => {
        const order = orderData?.find(
          (o) => o.id === item.order_id
        );

        if (!order) return;

        const store = stores.find(
          (s) => s.id === item.store_id
        );

        combinedOrders.push({
          order_id: order.id,
          full_name: order.full_name,
          phone: order.phone,
          total: Number(order.total),
          status: order.status,
          created_at: order.created_at,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          subtotal: Number(item.subtotal),
          store_name:
            store?.name || "Unknown Store",
        });
      });

      setOrders(combinedOrders);
    } catch (error) {
      console.error(
        "Unexpected error loading vendor orders:",
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
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error(
        "Error updating order:",
        error
      );

      alert(
        `Unable to update order: ${error.message}`
      );

      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.order_id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    alert("Order status updated successfully.");
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <p className="text-gray-500">
          Loading vendor orders...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">
          📦
        </div>

        <h3 className="text-xl font-semibold">
          No Vendor Orders Yet
        </h3>

        <p className="text-gray-500 mt-2">
          Orders containing products from your
          stores will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order, index) => (
        <div
          key={`${order.order_id}-${index}`}
          className="bg-white shadow rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="font-semibold break-all">
                {order.order_id}
              </p>
            </div>

            <div>
              <select
                value={order.status}
                onChange={(e) =>
                  updateOrderStatus(
                    order.order_id,
                    e.target.value
                  )
                }
                className="border rounded-lg px-4 py-2 bg-white"
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Customer
              </p>

              <p className="font-semibold">
                {order.full_name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="font-semibold">
                {order.phone}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Order Total
              </p>

              <p className="font-bold text-emerald-600">
                Le{" "}
                {order.total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 grid grid-cols-4 font-semibold text-sm">
              <span>Product</span>
              <span>Store</span>
              <span>Quantity</span>
              <span>Subtotal</span>
            </div>

            <div className="px-4 py-4 grid grid-cols-4 text-sm">
              <span>
                {order.product_name}
              </span>

              <span>
                {order.store_name}
              </span>

              <span>
                {order.quantity}
              </span>

              <span className="font-semibold">
                Le{" "}
                {order.subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Ordered{" "}
            {new Date(
              order.created_at
            ).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VendorOrderList;