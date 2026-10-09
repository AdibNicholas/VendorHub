import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ShoppingBag,
  Smartphone,
  User,
  Wallet,
} from "lucide-react";
import { useCart } from "../Context/CartContext";
import { supabase } from "../lib/supabase";

interface AffiliateReferral {
  affiliate_link_id: string;
  marketer_id: string;
  product_id: string;
  referral_code: string;
  saved_at: string;
}

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // Temporary delivery fee.
  // This will later be replaced by the VendorHub
  // delivery-fee engine.
  const deliveryFee = 100;

  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-SL").format(
      price
    );
  };

  // -----------------------------------------
  // AFFILIATE REFERRAL
  // -----------------------------------------

  const getAffiliateReferral =
    (): AffiliateReferral | null => {
      try {
        const savedReferral =
          localStorage.getItem(
            "vendorhub_affiliate_referral"
          );

        if (!savedReferral) {
          return null;
        }

        const referral: AffiliateReferral =
          JSON.parse(savedReferral);

        if (
          !referral.affiliate_link_id ||
          !referral.marketer_id ||
          !referral.product_id
        ) {
          return null;
        }

        return referral;
      } catch (error) {
        console.error(
          "Unable to read affiliate referral:",
          error
        );

        return null;
      }
    };

  // -----------------------------------------
  // RECORD AFFILIATE CONVERSION
  // -----------------------------------------

  const recordAffiliateConversion = async (
    orderId: string
  ) => {
    const referral =
      getAffiliateReferral();

    if (!referral) {
      return;
    }

    const {
      data: conversionId,
      error,
    } = await supabase.rpc(
      "record_affiliate_conversion",
      {
        p_order_id: orderId,
        p_affiliate_link_id:
          referral.affiliate_link_id,
      }
    );

    if (error) {
      console.error(
        "Affiliate conversion error:",
        error
      );

      /*
       * Do not cancel the customer's order if
       * affiliate attribution fails.
       */
      return;
    }

    if (conversionId) {
      console.log(
        "Affiliate conversion recorded:",
        conversionId
      );

      localStorage.removeItem(
        "vendorhub_affiliate_referral"
      );
    }
  };

  // -----------------------------------------
  // SUBMIT ORDER
  // -----------------------------------------

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage(
        "Your cart is empty."
      );
      navigate("/cart");
      return;
    }

    if (!paymentMethod) {
      setErrorMessage(
        "Please select a payment method."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // -----------------------------------------
      // 1. CHECK AUTHENTICATION
      // -----------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // -----------------------------------------
      // 2. PREPARE CART ITEMS
      // -----------------------------------------

      const orderItems = cart.map((item) => ({
        product_id: item.id,
        store_id: item.store_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal:
          item.price * item.quantity,
      }));

      // -----------------------------------------
      // 3. CREATE ORDER
      // -----------------------------------------

      const {
        data: orderId,
        error,
      } = await supabase.rpc(
        "create_order_with_stock",
        {
          p_customer_id: user.id,
          p_full_name: fullName,
          p_phone: phone,
          p_email: email,
          p_address: address,
          p_city: city,
          p_payment_method:
            paymentMethod,
          p_subtotal: subtotal,
          p_delivery_fee: deliveryFee,
          p_total: total,
          p_items: orderItems,
        }
      );

      if (error) {
        console.error(
          "Checkout error:",
          error
        );

        const message =
          error.message.toLowerCase();

        if (
          message.includes(
            "not enough stock"
          )
        ) {
          setErrorMessage(
            error.message
          );
        } else if (
          message.includes(
            "unavailable"
          )
        ) {
          setErrorMessage(
            "One of the products in your cart is no longer available."
          );
        } else {
          setErrorMessage(
            "Unable to place your order. Please try again."
          );
        }

        return;
      }

      // -----------------------------------------
      // 4. VERIFY ORDER ID
      // -----------------------------------------

      if (!orderId) {
        setErrorMessage(
          "Unable to create your order."
        );
        return;
      }

      // -----------------------------------------
      // 5. RECORD AFFILIATE CONVERSION
      // -----------------------------------------

      await recordAffiliateConversion(
        orderId
      );

      // -----------------------------------------
      // 6. CLEAR CART
      // -----------------------------------------

      clearCart();

      // -----------------------------------------
      // 7. SUCCESS
      // -----------------------------------------

      navigate(
        `/order-success/${orderId}`
      );
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setErrorMessage(
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------------------
  // EMPTY CART
  // -----------------------------------------

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
            <ShoppingBag
              size={32}
              className="text-emerald-600"
            />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Your cart is empty
          </h1>

          <p className="text-gray-500 mt-2">
            Add some products before proceeding
            to checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
            className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // CHECKOUT
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold">
            VendorHub Checkout
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Complete Your Order
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your delivery details and choose
            your preferred payment method.
          </p>
        </div>

        {/* CHECKOUT STEPS */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 size={19} />
              </div>

              <span className="hidden sm:inline">
                Cart
              </span>
            </div>

            <div className="h-px flex-1 bg-emerald-200 mx-3" />

            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                2
              </div>

              <span className="hidden sm:inline">
                Checkout
              </span>
            </div>

            <div className="h-px flex-1 bg-gray-200 mx-3" />

            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                3
              </div>

              <span className="hidden sm:inline">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* ERROR */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                <p className="font-semibold">
                  Unable to continue
                </p>

                <p className="text-sm mt-1">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* CUSTOMER INFORMATION */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <User
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Customer Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Tell us who will receive the order.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* FULL NAME */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block font-semibold mb-2">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl p-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="076 123 456"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block font-semibold mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            {/* DELIVERY */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MapPin
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Delivery Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold mb-2">
                    Delivery Address
                  </label>

                  <textarea
                    required
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="House number, street, community, landmark..."
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Freetown"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Wallet
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Payment Method
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* ORANGE MONEY */}
                <label
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    paymentMethod ===
                    "orange_money"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="orange_money"
                      checked={
                        paymentMethod ===
                        "orange_money"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="mt-1 accent-emerald-600"
                    />

                    <Smartphone
                      size={22}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-bold">
                        Orange Money
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Mobile money payment
                      </p>
                    </div>
                  </div>
                </label>

                {/* AFRIMONEY */}
                <label
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    paymentMethod ===
                    "afrimoney"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="afrimoney"
                      checked={
                        paymentMethod ===
                        "afrimoney"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="mt-1 accent-emerald-600"
                    />

                    <Smartphone
                      size={22}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-bold">
                        Afrimoney
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Mobile money payment
                      </p>
                    </div>
                  </div>
                </label>

                {/* CARD */}
                <label
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    paymentMethod === "card"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={
                        paymentMethod === "card"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="mt-1 accent-emerald-600"
                    />

                    <CreditCard
                      size={22}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-bold">
                        Debit / Credit Card
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Pay securely by card
                      </p>
                    </div>
                  </div>
                </label>

                {/* CASH */}
                <label
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    paymentMethod === "cash"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={
                        paymentMethod === "cash"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="mt-1 accent-emerald-600"
                    />

                    <Wallet
                      size={22}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-bold">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Pay when your order arrives
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <p className="text-xs text-gray-400 mt-5">
                Online payment processing will be
                connected to VendorHub's payment engine
                later.
              </p>
            </section>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
              <div className="flex items-center gap-3">
                <ShoppingBag
                  size={22}
                  className="text-emerald-600"
                />

                <h2 className="text-2xl font-bold">
                  Your Order
                </h2>
              </div>

              {/* ITEMS */}
              <div className="mt-6 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold whitespace-nowrap">
                      Le{" "}
                      {formatPrice(
                        item.price *
                          item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* TOTALS */}
              <div className="border-t border-gray-200 mt-6 pt-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    Le {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-semibold">
                    Le{" "}
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-xl font-bold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-emerald-600">
                    Le {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* PLACE ORDER */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By placing this order, you confirm that
                the information provided is correct.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default Checkout;