<<<<<<< ours
=======
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
>>>>>>> theirs
import { useCart } from "../Context/CartContext";

function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? 50 : 0;

  const total = subtotal + deliveryFee;

<<<<<<< ours
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-8">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-10 text-center">
          <h2 className="text-2xl font-semibold">
            Your cart is empty
          </h2>

          <p className="text-gray-500 mt-3">
            Add some products to your cart to get started.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-5">

            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow rounded-xl p-6"
              >
                <div className="flex justify-between gap-6">

                  <div>
                    <h2 className="text-xl font-bold">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      Le {item.price} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-5">

=======
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-SL").format(price);
  };

  // -----------------------------------------
  // EMPTY CART
  // -----------------------------------------

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-10 md:p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <ShoppingBag
                size={38}
                className="text-emerald-600"
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mt-6">
              Your cart is empty
            </h1>

            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              You haven't added any products to your
              cart yet. Explore VendorHub and find
              something you like.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center mt-7 bg-emerald-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Shopping Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {cart.length} item
              {cart.length !== 1 ? "s" : ""} in your
              cart
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-5 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* PRODUCT ICON / IMAGE AREA */}
                  <div className="w-20 h-20 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShoppingBag
                      size={30}
                      className="text-emerald-600"
                    />
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Le {formatPrice(item.price)} each
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">
>>>>>>> theirs
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
<<<<<<< ours
                        className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold"
                      >
                        −
                      </button>

                      <span className="font-semibold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
                      >
                        +
                      </button>

                    </div>

                    {/* Remove */}
                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="text-red-600 hover:text-red-700 mt-4 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-xl font-bold text-emerald-600">
                    Le{" "}
                    {item.price * item.quantity}
                  </div>

                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>

          </div>

          {/* Order Summary */}
          <div className="bg-white shadow rounded-xl p-6 h-fit">

            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span className="font-semibold">
                Le {subtotal}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Delivery</span>
              <span className="font-semibold">
                Le {deliveryFee}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-emerald-600">
                Le {total}
              </span>
            </div>

            <button
              onClick={() => {
                window.location.href = "/checkout";
              }}
              className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Proceed to Checkout
            </button>

          </div>

        </div>
      )}

=======
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-[32px] text-center font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium mt-4"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>

                  {/* ITEM TOTAL */}
                  <div className="sm:text-right">
                    <p className="text-sm text-gray-500">
                      Item Total
                    </p>

                    <p className="text-xl font-bold text-emerald-600 mt-1">
                      Le{" "}
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* CLEAR CART */}
            <div className="pt-2">
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
              >
                <Trash2 size={17} />
                Clear Cart
              </button>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    Le {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-semibold">
                    Le {formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-5">
                <div className="flex justify-between gap-4">
                  <span className="text-xl font-bold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-emerald-600">
                    Le {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* CHECKOUT */}
              <Link
                to="/checkout"
                className="block w-full text-center mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/shop"
                className="block w-full text-center mt-3 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>

              <p className="text-xs text-gray-400 text-center mt-5">
                Delivery charges may vary depending
                on your delivery location.
              </p>
            </div>
          </div>
        </div>
      </div>
>>>>>>> theirs
    </div>
  );
}

export default CartPage;