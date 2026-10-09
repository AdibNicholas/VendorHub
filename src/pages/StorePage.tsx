import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Store as StoreIcon,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Store {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock: number;
}

function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [storeError, setStoreError] = useState("");
  const [productsError, setProductsError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;

    fetchStore();
    fetchProducts();
  }, [id]);

  const fetchStore = async () => {
    if (!id) return;

    setLoadingStore(true);
    setStoreError("");

    const { data, error } = await supabase
      .from("stores")
      .select(
        "id, name, description, category, logo_url, banner_url"
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error loading store:", error);
      setStoreError("We couldn't load this store.");
      setStore(null);
      setLoadingStore(false);
      return;
    }

    setStore(data);
    setLoadingStore(false);
  };

  const fetchProducts = async () => {
    if (!id) return;

    setLoadingProducts(true);
    setProductsError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, description, price, category, image_url, stock"
      )
      .eq("store_id", id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading products:", error);
      setProductsError(
        "We couldn't load the products from this store."
      );
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    setProducts(data || []);
    setLoadingProducts(false);
  };

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchText) ||
        product.category
          ?.toLowerCase()
          .includes(searchText) ||
        product.description
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [products, search]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-SL").format(price);
  };

  if (!loadingStore && !store) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-10 text-center">
          <StoreIcon
            size={48}
            className="mx-auto text-gray-400"
          />

          <h1 className="text-2xl font-bold mt-5">
            Store not found
          </h1>

          <p className="text-gray-500 mt-2">
            {storeError ||
              "This store may no longer be available."}
          </p>

          <Link
            to="/vendors"
            className="inline-block mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Explore Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BACK BUTTON */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* STORE HEADER */}
      {loadingStore ? (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="h-52 md:h-64 bg-gray-200" />

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gray-200" />

                <div className="flex-1 space-y-3">
                  <div className="h-7 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>

              <div className="h-4 bg-gray-200 rounded mt-6 w-3/4" />
            </div>
          </div>
        </div>
      ) : (
        store && (
          <section className="max-w-7xl mx-auto px-6 mt-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* BANNER */}
              <div className="h-52 md:h-64 bg-emerald-50 overflow-hidden">
                {store.banner_url ? (
                  <img
                    src={store.banner_url}
                    alt={`${store.name} banner`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <StoreIcon
                        size={48}
                        className="mx-auto text-emerald-500"
                      />

                      <p className="mt-3 text-emerald-600 font-semibold">
                        VendorHub Store
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* STORE INFO */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* LOGO */}
                  <div className="w-20 h-20 rounded-2xl bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-emerald-700">
                        {store.name
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {store.name}
                    </h1>

                    {store.category && (
                      <p className="mt-2 text-emerald-600 font-semibold">
                        {store.category}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-6 text-gray-600 max-w-3xl leading-relaxed">
                  {store.description ||
                    "Welcome to this VendorHub store. Explore our available products below."}
                </p>
              </div>
            </div>
          </section>
        )
      )}

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Store Products
            </h2>

            {!loadingProducts && !productsError && (
              <p className="text-gray-500 mt-1">
                {filteredProducts.length} product
                {filteredProducts.length !== 1
                  ? "s"
                  : ""}
              </p>
            )}
          </div>

          {/* SEARCH */}
          {!loadingProducts && products.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full border border-gray-200 bg-white rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* PRODUCT ERROR */}
        {productsError && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-bold">
              Unable to load products
            </h3>

            <p className="text-gray-500 mt-2">
              {productsError}
            </p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-5 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PRODUCT LOADING */}
        {loadingProducts && !productsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="h-52 bg-gray-200" />

                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/3 mt-4" />
                    <div className="h-11 bg-gray-200 rounded-lg mt-4" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* EMPTY */}
        {!loadingProducts &&
          !productsError &&
          filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <StoreIcon
                  size={30}
                  className="text-emerald-600"
                />
              </div>

              <h3 className="text-xl font-bold mt-5">
                {search
                  ? "No products found"
                  : "No products available"}
              </h3>

              <p className="text-gray-500 mt-2">
                {search
                  ? "Try searching for another product."
                  : "This store does not have any active products yet."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

        {/* PRODUCTS GRID */}
        {!loadingProducts &&
          !productsError &&
          filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <StoreIcon
                            size={34}
                            className="mx-auto"
                          />

                          <p className="mt-2 text-sm">
                            No image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-5 flex flex-col flex-1">
                    {product.category && (
                      <p className="text-sm text-emerald-600 font-semibold">
                        {product.category}
                      </p>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
                      {product.description ||
                        "Explore this product on VendorHub."}
                    </p>

                    <div className="mt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        Le {formatPrice(product.price)}
                      </p>

                      {product.stock > 0 ? (
                        <p className="text-sm text-green-600 mt-1">
                          In stock
                        </p>
                      ) : (
                        <p className="text-sm text-red-500 mt-1">
                          Out of stock
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/product/${product.id}`
                        )
                      }
                      className="mt-5 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}

export default StorePage;