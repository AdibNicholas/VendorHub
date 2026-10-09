import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../Context/CartContext";
import { PRODUCT_CATEGORIES } from "../constants/categories";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
  created_at: string;
  is_active: boolean;
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );

  const [sort, setSort] = useState("latest");

  const [addedProductId, setAddedProductId] =
    useState<string | null>(null);

  // -----------------------------------------
  // LOAD PRODUCTS
  // -----------------------------------------

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, store_id, name, description, price, stock, category, image_url, created_at, is_active"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading products:", error);
      setError("Unable to load products. Please try again.");
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  // -----------------------------------------
  // URL SEARCH
  // -----------------------------------------

  const handleSearchChange = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  };

  // -----------------------------------------
  // CATEGORY
  // -----------------------------------------

  const handleCategoryChange = (value: string) => {
    setCategory(value);

    const params = new URLSearchParams(searchParams);

    if (value === "All") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    setSearchParams(params);
  };

  // -----------------------------------------
  // FILTER PRODUCTS
  // -----------------------------------------

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      product.name.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  // -----------------------------------------
  // SORT PRODUCTS
  // -----------------------------------------

  const sortedProducts = [...filteredProducts].sort(
    (a, b) => {
      if (sort === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    }
  );

  // -----------------------------------------
  // ADD TO CART
  // -----------------------------------------

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

  // -----------------------------------------
  // CLEAR FILTERS
  // -----------------------------------------

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSearchParams({});
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-emerald-600 font-semibold">
              VendorHub Marketplace
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Shop
            </h1>

            <p className="text-gray-500 mt-3">
              Loading products...
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="h-56 bg-gray-200" />

                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="text-emerald-100 font-semibold mb-2">
            VendorHub Marketplace
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Shop
          </h1>

          <p className="mt-3 text-emerald-50 max-w-2xl">
            Discover products from trusted vendors
            across VendorHub.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* SEARCH + FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Search Products
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
                placeholder="Search by product name, description..."
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value)
                }
                className="w-full border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">
                  All Categories
                </option>

                {PRODUCT_CATEGORIES.map(
                  (categoryOption) => (
                    <option
                      key={categoryOption}
                      value={categoryOption}
                    >
                      {categoryOption}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className="w-full border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="latest">
                  Latest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name: A-Z
                </option>
              </select>
            </div>
          </div>

          {(search || category !== "All") && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Active filters applied
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* RESULTS INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Products
            </h2>

            <p className="text-gray-500 mt-1">
              Browse products available on VendorHub.
            </p>
          </div>

          <p className="text-gray-500">
            {sortedProducts.length} product
            {sortedProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* EMPTY STATE */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h3 className="text-2xl font-bold">
              No products found
            </h3>

            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              We couldn't find any products matching
              your search or selected category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* PRODUCTS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <Link to={`/product/${product.id}`}>
                  <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    ) : (
                      <span className="text-gray-400">
                        No Image
                      </span>
                    )}
                  </div>
                </Link>

                {/* DETAILS */}
                <div className="p-5">
                  <p className="text-sm text-emerald-600 font-medium">
                    {product.category || "Other"}
                  </p>

                  <Link
                    to={`/product/${product.id}`}
                  >
                    <h3 className="text-lg font-bold mt-1 hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <p className="text-2xl font-bold mt-4">
                    Le{" "}
                    {Number(product.price).toLocaleString()}
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
                      className={`w-full py-2.5 rounded-lg text-white transition ${
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;