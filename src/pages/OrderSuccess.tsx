import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

interface Order {
  id: string;
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
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      // Get the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) {
        console.error("Error loading order:", orderError);
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Get items belonging to this order
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(
          "id, order_id, product_name, price, quantity, subtotal"
        )
        .eq("order_id", id);

      if (itemsError) {
        console.error("Error loading order items:", itemsError);
      } else {
        setOrderItems(itemsData || []);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">
            Loading your order...
          </p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <h1 className="text-3xl font-bold">
            Order Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            We couldn't find this order.
          </p>

          <Link
            to="/shop"
            className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Success Message */}
        <div className="text-center">

          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl text-emerald-600">
              ✓
            </span>
          </div>

          <h1 className="text-4xl font-bold mt-6">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for shopping with VendorHub.
          </p>

        </div>

        {/* Order Details */}
        <div className="mt-10 bg-white shadow rounded-xl p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">

            <div>
              <h2 className="text-2xl font-bold">
                Order Details
              </h2>

              <p className="text-sm text-gray-500 mt-1 break-all">
                Order ID: {order.id}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Date: {formatDate(order.created_at)}
              </p>
            </div>

            <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 capitalize self-start">
              {order.status}
            </span>

          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div>
              <h3 className="font-bold text-lg">
                Customer
              </h3>

              <p className="mt-2">
                {order.full_name}
              </p>

              <p className="text-gray-600">
                {order.phone}
              </p>

              <p className="text-gray-600">
                {order.email}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Delivery Address
              </h3>

              <p className="mt-2">
                {order.address}
              </p>

              <p className="text-gray-600">
                {order.city}
              </p>
            </div>

          </div>

          {/* Order Items */}
          <div className="mt-8 border-t pt-6">

            <div className="flex justify-between items-center mb-4">

              <h3 className="font-bold text-lg">
                Items in Your Order
              </h3>

              <span className="text-sm text-gray-500">
                {orderItems.length}{" "}
                {orderItems.length === 1 ? "item" : "items"}
              </span>

            </div>

            {orderItems.length === 0 ? (

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  No order items found.
                </p>
              </div>

            ) : (

              <div className="space-y-4">

                {orderItems.map((item) => (

                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-4"
                  >

                    <div>

                      <p className="font-semibold">
                        {item.product_name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Le{" "}
                        {Number(item.price).toLocaleString()}{" "}
                        × {item.quantity}
                      </p>

                    </div>

                    <p className="font-bold">
                      Le{" "}
                      {Number(item.subtotal).toLocaleString()}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* Payment */}
          <div className="mt-8 border-t pt-6">

            <h3 className="font-bold text-lg">
              Payment
            </h3>

            <p className="mt-2 capitalize">
              {order.payment_method.replace("_", " ")}
            </p>

          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-6 space-y-3">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                Le{" "}
                {Number(order.subtotal).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>

              <span>
                Le{" "}
                {Number(order.delivery_fee).toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between text-xl font-bold">

              <span>Total</span>

              <span className="text-emerald-600">
                Le{" "}
                {Number(order.total).toLocaleString()}
              </span>

            </div>

          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

          <Link
            to="/shop"
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-center hover:bg-emerald-700"
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="border border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg text-center hover:bg-emerald-50"
          >
            View My Orders
          </Link>

        </div>

      </div>
    </Layout>
  );
}

export default OrderSuccess;