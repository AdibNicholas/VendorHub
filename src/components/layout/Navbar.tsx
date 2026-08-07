import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl font-bold text-emerald-600"
        >
          VendorHub
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-emerald-600">
            Home
          </Link>

          <Link to="/shop" className="hover:text-emerald-600">
            Shop
          </Link>

          <Link to="/vendors" className="hover:text-emerald-600">
            Stores
          </Link>

          <Link to="/login" className="hover:text-emerald-600">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            <Link to="/cart" className="hover:text-emerald-600">
                       Cart
            </Link>
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;