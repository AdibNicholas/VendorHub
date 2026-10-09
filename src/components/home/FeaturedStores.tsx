import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Store {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
  created_at: string;
}

function FeaturedStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("stores")
      .select(
        "id, name, description, category, logo_url, banner_url, created_at"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(6);

    if (error) {
      console.error("Error loading stores:", error);
      setError("Unable to load featured stores.");
      setStores([]);
      setLoading(false);
      return;
    }

    setStores(data || []);
    setLoading(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-emerald-600 font-semibold">
            Discover Vendors
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-1">
            Featured Stores
          </h2>

          <p className="text-gray-500 mt-2 max-w-xl">
            Explore stores from VendorHub vendors and
            discover products that match what you need.
          </p>
        </div>

        <Link
          to="/vendors"
          className="inline-flex items-center justify-center text-emerald-600 font-semibold hover:text-emerald-700 transition"
        >
          View All Stores
          <span className="ml-1">→</span>
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-200" />

              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <h3 className="text-xl font-bold text-gray-900">
            No stores available yet
          </h3>

          <p className="text-gray-500 mt-2">
            New stores will appear here as vendors join
            VendorHub.
          </p>

          <Link
            to="/vendors"
            className="inline-block mt-5 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Browse Stores
          </Link>
        </div>
      ) : (
        /* STORES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              {/* BANNER */}
              <Link
                to={`/store/${store.id}`}
                className="block"
              >
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {store.banner_url ? (
                    <img
                      src={store.banner_url}
                      alt={`${store.name} banner`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">
                        VendorHub Store
                      </span>
                    </div>
                  )}

                  {/* LOGO */}
                  <div className="absolute -bottom-7 left-6">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md p-1">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-xl">
                            {store.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* DETAILS */}
              <div className="p-6 pt-10 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {store.name}
                </h3>

                {store.category ? (
                  <p className="text-sm text-emerald-600 font-semibold mt-1">
                    {store.category}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">
                    VendorHub Store
                  </p>
                )}

                <p className="text-gray-500 mt-3 line-clamp-2">
                  {store.description ||
                    "Discover products from this VendorHub store."}
                </p>

                <div className="mt-auto pt-5">
                  <Link
                    to={`/store/${store.id}`}
                    className="block text-center bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedStores;