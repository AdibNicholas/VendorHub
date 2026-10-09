import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function Footer() {
  return (
    <footer className="mt-20 bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight text-red-500"
            >
              VendorHub
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              Connecting vendors and customers through one trusted
              marketplace.
            </p>

            <p className="mt-5 text-sm font-medium text-gray-300">
              Shop. Sell. Grow.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-lg font-semibold">
              Marketplace
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-red-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/shop"
                  className="transition hover:text-red-400"
                >
                  Shop Products
                </Link>
              </li>

              <li>
                <Link
                  to="/vendors"
                  className="transition hover:text-red-400"
                >
                  Browse Stores
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="transition hover:text-red-400"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold">
              Your Account
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-red-400"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition hover:text-red-400"
                >
                  Create Account
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="transition hover:text-red-400"
                >
                  My Orders
                </Link>
              </li>

              <li>
                <Link
                  to="/account"
                  className="transition hover:text-red-400"
                >
                  My Account
                </Link>
              </li>

              <li>
                <Link
                  to="/support"
                  className="transition hover:text-red-400"
                >
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold">
              Contact Us
            </h3>

            <div className="mt-4 space-y-4 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <a
                  href="tel:+23230180881"
                  className="transition hover:text-red-400"
                >
                  +232 30 180 881
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <a
                  href="mailto:brodericknathaniel64@gmail.com"
                  className="break-all transition hover:text-red-400"
                >
                  brodericknathaniel64@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <span>
                  Freetown, Sierra Leone
                </span>
              </div>
            </div>

           
          </div>
        </div>

        <div className="my-8 border-t border-gray-800" />

        <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} VendorHub. All rights
            reserved.
          </p>

          <p>
            Built for Sierra Leone 🇸🇱
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;