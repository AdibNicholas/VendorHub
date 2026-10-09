import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Store as StoreIcon, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Store {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
}

function Vendors() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("stores")
      .select(
        "id, name, description, category, logo_url, banner_url"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading stores:", error);
      setError("We couldn't load the stores. Please try again.");
      setStores([]);
      setLoading(false);
      return;
    }

    setStores(data || []);
    setLoading(false);
  };

  const searchText = search.toLowerCase().trim();

  const filteredStores = stores.filter((store) => {
    if (!searchText) {
      return true;
    }

    return (
      store.name.toLowerCase().includes(searchText) ||
      store.category?.toLowerCase().includes(searchText) ||
      store.description?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 text-emerald-100 font-semibold">
            <StoreIcon size={18} />
            <span>VendorHub Marketplace</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Explore Stores
          </h1>

          <p className="mt-4 max-w-2xl text-emerald-50 text-lg">
            Discover stores from vendors across VendorHub
            and find products that suit your needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* SEARCH */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
          <label className="block font-semibold mb-3">
            Search Stores
          </label>

          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores, categories, or descriptions..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All Stores
            </h2>

            {!loading && !error && searchText && (
              <p className="text-sm text-gray-500 mt-1">
                Showing results for "{search}"
              </p>
            )}
          </div>

          {!loading && !error && (
            <p className="text-gray-500">
              {filteredStores.length} store
              {filteredStores.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-red-500 font-semibold text-lg">
              Something went wrong
            </div>

            <p className="text-gray-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchStores}
              className="mt-5 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-gray-200" />

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-200" />

                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>

                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-11 bg-gray-200 rounded-lg mt-5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredStores.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <StoreIcon
                  size={30}
                  className="text-emerald-600"
                />
              </div>

              <h3 className="text-xl font-bold mt-5">
                No stores found
              </h3>

              <p className="text-gray-500 mt-2">
                Try searching for another store or category.
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

        {/* STORE GRID */}
        {!loading &&
          !error &&
          filteredStores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                >
                  {/* BANNER */}
                  <div className="h-40 bg-emerald-50 overflow-hidden">
                    {store.banner_url ? (
                      <img
                        src={store.banner_url}
                        alt={`${store.name} banner`}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <div className="text-center">
                          <StoreIcon
                            size={32}
                            className="mx-auto text-emerald-500"
                          />

                          <span className="block mt-2 text-emerald-600 font-semibold">
                            VendorHub Store
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4">
                      {/* LOGO */}
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt={`${store.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-emerald-700">
                            {store.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* NAME */}
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {store.name}
                        </h3>

                        {store.category && (
                          <p className="text-sm text-emerald-600 font-semibold mt-1">
                            {store.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-500 mt-4 line-clamp-2 flex-1">
                      {store.description ||
                        "Explore products from this VendorHub store."}
                    </p>

                    <Link
                      to={`/store/${store.id}`}
                      className="block text-center mt-5 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                    >
                      Visit Store
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

export default Vendors;