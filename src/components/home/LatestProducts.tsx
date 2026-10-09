import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../Context/CartContext";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  created_at: string;
}

function LatestProducts() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] =
    useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, store_id, name, description, price, stock, category, image_url, created_at"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(8);

    if (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      store_id: product.store_id,
    });

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-emerald-600 font-semibold">
            Fresh on VendorHub
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-1">
            Latest Products
          </h2>

          <p className="text-gray-500 mt-2 max-w-xl">
            Discover the newest products recently added
            by VendorHub vendors.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center justify-center text-emerald-600 font-semibold hover:text-emerald-700 transition"
        >
          View All Products
          <span className="ml-1">→</span>
        </Link>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-56 bg-gray-200" />

              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-7 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <h3 className="text-xl font-bold text-gray-900">
            No products available yet
          </h3>

          <p className="text-gray-500 mt-2">
            Products added by vendors will appear here.
          </p>

          <Link
            to="/shop"
            className="inline-block mt-5 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        /* PRODUCTS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col"
            >
              {/* IMAGE */}
              <Link
                to={`/product/${product.id}`}
                className="block"
              >
                <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        📦
                      </div>

                      <span className="text-sm text-gray-400">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* DETAILS */}
              <div className="p-5 flex flex-col flex-1">
                {product.category ? (
                  <p className="text-sm text-emerald-600 font-semibold">
                    {product.category}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Other
                  </p>
                )}

                <Link
                  to={`/product/${product.id}`}
                >
                  <h3 className="text-lg font-bold mt-1 text-gray-900 hover:text-emerald-600 transition">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {product.description ||
                    "Discover this product on VendorHub."}
                </p>

                <div className="mt-auto">
                  <p className="text-2xl font-bold mt-4 text-gray-900">
                    Le{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}
                  </p>

                  {/* STOCK */}
                  <p
                    className={`text-sm mt-2 font-medium ${
                      product.stock > 0
                        ? "text-gray-500"
                        : "text-red-500"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </p>

                  {/* ACTIONS */}
                  <div className="mt-5 space-y-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full text-center border border-emerald-600 text-emerald-600 py-2.5 rounded-lg hover:bg-emerald-50 transition"
                    >
                      View Product
                    </Link>

                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() =>
                        handleAddToCart(product)
                      }
                      className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
                        product.stock <= 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {product.stock <= 0
                        ? "Out of Stock"
                        : addedProductId ===
                          product.id
                        ? "✓ Added to Cart"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LatestProducts;