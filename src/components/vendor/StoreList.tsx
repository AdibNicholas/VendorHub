import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StoreCard from "./StoreCard";

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active?: boolean;
  created_at?: string;
}

function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Unable to identify your account.");
      setLoading(false);
      return;
    }

    const { data, error: storesError } = await supabase
      .from("stores")
      .select(
        "id, name, description, category, is_active, created_at"
      )
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    if (storesError) {
      console.error("Error loading stores:", storesError);
      setError("Unable to load your stores.");
      setLoading(false);
      return;
    }

    setStores(data || []);
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">Your Stores</h2>
          <p className="text-gray-500 mt-1">
            Manage all stores belonging to your VendorHub account.
          </p>
        </div>

        {!loading && (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
            {stores.length}{" "}
            {stores.length === 1 ? "Store" : "Stores"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Loading your stores...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-red-700">{error}</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            No stores yet
          </h3>

          <p className="text-gray-500 mt-2">
            Create your first store to start selling on VendorHub.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              description={store.description}
              category={store.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StoreList;