import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link
          to="/"
          className="text-2xl font-bold text-emerald-600"
        >
          VendorHub
        </Link>

        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/vendors">Vendors</Link>
          <Link to="/marketers">Marketers</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;