import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
}

function FeaturedStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, description, category")
      .eq("is_active", true)
      .limit(6);

    if (error) {
      console.error(error);
      return;
    }

    setStores(data || []);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-8">
         Featured Stores
      </h2>

      {stores.length === 0 ? (
        <p>No stores available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white shadow rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold">
                {store.name}
              </h3>

              <p className="text-gray-600 mt-3">
                {store.description}
              </p>

              <p className="mt-3 text-emerald-600 font-semibold">
                {store.category}
              </p>

              <button
  onClick={() => navigate(`/store/${store.id}`)}
  className="mt-6 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
>
  Visit Store
</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedStores;