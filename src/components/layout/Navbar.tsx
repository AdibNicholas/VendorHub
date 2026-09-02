import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

function Navbar() {
  const { cart } = useCart();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-bold text-emerald-600"
        >
          VendorHub
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">

          <Link
            to="/"
            className="hover:text-emerald-600"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-emerald-600"
          >
            Shop
          </Link>

          <Link
            to="/vendors"
            className="hover:text-emerald-600"
          >
            Stores
          </Link>

          <Link
            to="/login"
            className="hover:text-emerald-600"
          >
            Login
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="hover:text-emerald-600 flex items-center gap-1"
          >
            <span>🛒 Cart</span>

            {cartCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Register */}
          <Link
            to="/register"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Register
          </Link>
<Link
  to="/account"
  className="hover:text-emerald-600"
>
  Account
</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;