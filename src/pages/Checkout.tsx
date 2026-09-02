import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useCart } from "../Context/CartContext";
import { supabase } from "../lib/supabase";

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = 100;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/cart");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in before placing your order.");
        navigate("/login");
        return;
      }

      // Prepare cart items for the database function
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        store_id: item.store_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      // Create order + order items + reduce stock
      // in one database transaction
      const { data: orderId, error } = await supabase.rpc(
        "create_order_with_stock",
        {
          p_customer_id: user.id,
          p_full_name: fullName,
          p_phone: phone,
          p_email: email,
          p_address: address,
          p_city: city,
          p_payment_method: paymentMethod,
          p_subtotal: subtotal,
          p_delivery_fee: deliveryFee,
          p_total: total,
          p_items: orderItems,
        }
      );

      if (error) {
        console.error("Checkout error:", error);

        // Give the customer a useful stock message
        if (
          error.message.toLowerCase().includes("not enough stock")
        ) {
          alert(error.message);
        } else if (
          error.message.toLowerCase().includes("unavailable")
        ) {
          alert(
            "One of the products in your cart is no longer available."
          );
        } else {
          alert(
            "Unable to place your order: " + error.message
          );
        }

        return;
      }

      if (!orderId) {
        alert("Unable to create your order.");
        return;
      }

      // Everything succeeded
      clearCart();

      alert("Order placed successfully!");

      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);

      alert(
        "Something went wrong while placing your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <h1 className="text-3xl font-bold">
            Your cart is empty
          </h1>

          <button
            onClick={() => navigate("/shop")}
            className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="e.g. 076123456"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                Delivery Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">
                    Delivery Address
                  </label>

                  <textarea
                    required
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    rows={4}
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="e.g. Freetown"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="orange_money"
                    checked={
                      paymentMethod === "orange_money"
                    }
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <span>Orange Money</span>
                </label>

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="afrimoney"
                    checked={
                      paymentMethod === "afrimoney"
                    }
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <span>Afrimoney</span>
                </label>

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <span>Debit / Credit Card</span>
                </label>

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow rounded-xl p-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-medium">
                    Le {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Le {subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Le {deliveryFee}</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>

                <span className="text-emerald-600">
                  Le {total}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Placing Order..."
                : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default Checkout;