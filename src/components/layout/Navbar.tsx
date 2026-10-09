import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useCart } from "../../Context/CartContext";
import { supabase } from "../../lib/supabase";

function Navbar() {
  const { cart } = useCart();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setIsLoggedIn(!!session);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `flex items-center gap-2 text-sm font-medium transition ${
      isActive(path)
        ? "text-red-600"
        : "text-gray-700 hover:text-red-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="shrink-0 text-2xl font-extrabold tracking-tight text-red-600 sm:text-3xl"
          >
            VendorHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              to="/"
              className={linkClass("/")}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={linkClass("/shop")}
            >
              Shop
            </Link>

            <Link
              to="/vendors"
              className={linkClass("/vendors")}
            >
              <Store size={17} />
              Stores
            </Link>

            {isLoggedIn && (
              <Link
                to="/orders"
                className={linkClass("/orders")}
              >
                <Package size={17} />
                Orders
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 text-sm font-medium transition ${
                isActive("/cart")
                  ? "text-red-600"
                  : "text-gray-700 hover:text-red-600"
              }`}
            >
              <ShoppingCart size={18} />
              Cart

              {cartCount > 0 && (
                <span className="absolute -right-4 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <Link
                to="/account"
                className={linkClass("/account")}
              >
                <User size={17} />
                Account
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 transition hover:text-red-600"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Tablet / Mobile Cart + Menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Cart"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() =>
                setIsMenuOpen((current) => !current)
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100"
              aria-label={
                isMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Home
              </Link>

              <Link
                to="/shop"
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/shop")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Shop
              </Link>

              <Link
                to="/vendors"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/vendors")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Store size={18} />
                Stores
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    to="/orders"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive("/orders")
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Package size={18} />
                    My Orders
                  </Link>

                  <Link
                    to="/account"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive("/account")
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User size={18} />
                    My Account
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/cart")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart size={18} />
                  Cart
                </span>

                {cartCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {!isLoggedIn && (
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <Link
                    to="/login"
                    className="rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;