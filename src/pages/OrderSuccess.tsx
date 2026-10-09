import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
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

  const [order, setOrder] =
    useState<Order | null>(null);

  const [orderItems, setOrderItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // -----------------------------------------
      // GET ORDER
      // -----------------------------------------

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select(
          "id, full_name, phone, email, address, city, payment_method, subtotal, delivery_fee, total, status, created_at"
        )
        .eq("id", id)
        .single();

      if (orderError) {
        console.error(
          "Error loading order:",
          orderError
        );

        setOrder(null);
        return;
      }

      setOrder(orderData);

      // -----------------------------------------
      // GET ORDER ITEMS
      // -----------------------------------------

      const {
        data: itemsData,
        error: itemsError,
      } = await supabase
        .from("order_items")
        .select(
          "id, order_id, product_name, price, quantity, subtotal"
        )
        .eq("order_id", id)
        .order("created_at", {
          ascending: true,
        });

      if (itemsError) {
        console.error(
          "Error loading order items:",
          itemsError
        );
      } else {
        setOrderItems(itemsData || []);
      }
    } catch (error) {
      console.error(
        "Error fetching order:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // FORMAT PRICE
  // -----------------------------------------

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-SL").format(
      price
    );
  };

  // -----------------------------------------
  // FORMAT DATE
  // -----------------------------------------

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-SL",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatPaymentMethod = (
    method: string
  ) => {
    return method
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-10 animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />

            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mt-6" />

            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mt-3" />

            <div className="space-y-4 mt-10">
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // ORDER NOT FOUND
  // -----------------------------------------

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <Package
              size={32}
              className="text-red-500"
            />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Order Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            We couldn't find this order. It may not
            exist or may no longer be available.
          </p>

          <Link
            to="/shop"
            className="inline-block mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        {/* SUCCESS HEADER */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2
              size={48}
              className="text-emerald-600"
            />
          </div>

          <p className="text-emerald-600 font-semibold mt-6">
            Thank you for shopping with VendorHub
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Your order has been received. You can
            track and manage it from your orders page.
          </p>
        </div>

        {/* ORDER CARD */}
        <div className="bg-white rounded-2xl shadow-sm mt-10 overflow-hidden">
          {/* ORDER HEADER */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Package
                      size={21}
                      className="text-emerald-600"
                    />
                  </div>

                  <h2 className="text-2xl font-bold">
                    Order Details
                  </h2>
                </div>

                <p className="text-sm text-gray-500 mt-4 break-all">
                  Order ID:{" "}
                  <span className="font-medium text-gray-700">
                    {order.id}
                  </span>
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <span className="inline-flex self-start px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-semibold capitalize">
                {order.status}
              </span>
            </div>
          </div>

          {/* CUSTOMER + DELIVERY */}
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 border-b border-gray-100">
            {/* CUSTOMER */}
            <div className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ShoppingBag
                    size={18}
                    className="text-gray-600"
                  />
                </div>

                <h3 className="font-bold">
                  Customer
                </h3>
              </div>

              <div className="mt-4 space-y-1 text-sm">
                <p className="font-semibold">
                  {order.full_name}
                </p>

                <p className="text-gray-600">
                  {order.phone}
                </p>

                <p className="text-gray-600 break-all">
                  {order.email}
                </p>
              </div>
            </div>

            {/* DELIVERY */}
            <div className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin
                    size={18}
                    className="text-gray-600"
                  />
                </div>

                <h3 className="font-bold">
                  Delivery Address
                </h3>
              </div>

              <div className="mt-4 text-sm">
                <p>{order.address}</p>

                <p className="text-gray-600 mt-1">
                  {order.city}
                </p>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">
                Items in Your Order
              </h3>

              <span className="text-sm text-gray-500">
                {orderItems.length}{" "}
                {orderItems.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>

            {orderItems.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500">
                  No order items found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.product_name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Le{" "}
                        {formatPrice(item.price)}{" "}
                        × {item.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-gray-900">
                      Le{" "}
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Wallet
                  size={18}
                  className="text-emerald-600"
                />
              </div>

              <h3 className="font-bold">
                Payment Method
              </h3>
            </div>

            <p className="mt-4 font-medium">
              {formatPaymentMethod(
                order.payment_method
              )}
            </p>
          </div>

          {/* TOTALS */}
          <div className="p-6 md:p-8">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  Le{" "}
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery Fee
                </span>

                <span className="font-semibold">
                  Le{" "}
                  {formatPrice(
                    order.delivery_fee
                  )}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-xl font-bold text-emerald-600">
                  Le{" "}
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link
            to="/shop"
            className="flex-1 sm:flex-none text-center bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="flex-1 sm:flex-none text-center border border-emerald-600 text-emerald-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-50 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;