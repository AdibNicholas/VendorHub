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
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? 50 : 0;

  const total = subtotal + deliveryFee;

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

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
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

    </div>
  );
}

export default CartPage;