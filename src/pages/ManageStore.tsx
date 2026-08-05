import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AddProductForm from "../components/products/AddProductForm";
import ProductList from "../components/products/ProductsList";

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
}

function ManageStore() {
  const { id } = useParams();

  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setStore(data);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-emerald-600 mb-8">
        Manage Store
      </h1>

      {store && (
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold">{store.name}</h2>

          <p className="text-gray-600 mt-2">
            {store.description}
          </p>

          <p className="text-emerald-600 font-semibold mt-3">
            Category: {store.category}
          </p>
        </div>
      )}

     {store && (
  <>
    <AddProductForm storeId={store.id} />
    <ProductList storeId={store.id} />
  </>
)}
    </div>
  );
}

export default ManageStore;