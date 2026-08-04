import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StoreCard from "./StoreCard";

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
}

function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("vendor_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setStores(data || []);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Stores</h2>

      {stores.length === 0 ? (
        <p className="text-gray-500">No stores created yet.</p>
      ) : (
        stores.map((store) => (
          <StoreCard
            key={store.id}
            name={store.name}
            description={store.description}
            category={store.category}
          />
        ))
      )}
    </div>
  );
}

export default StoreList;