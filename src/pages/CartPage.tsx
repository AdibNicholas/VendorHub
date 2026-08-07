import Layout from "../components/layout/Layout";
import { useCart } from "../Context/CartContext";

function CartPage() {
  const { cart } = useCart();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-emerald-600 mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow rounded-xl p-6 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-2xl font-bold">
                    {item.name}
                  </h2>

                  <p>
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="text-2xl font-bold text-emerald-600">
                  Le {item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CartPage;