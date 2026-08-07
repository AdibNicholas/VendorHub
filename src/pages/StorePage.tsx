import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchStore();
    fetchProducts();
  }, [id]);

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

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", id)
      .eq("is_active", true);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {store && (
        <>
          <h1 className="text-4xl font-bold text-emerald-600">
            {store.name}
          </h1>

          <p className="mt-4 text-gray-600">
            {store.description}
          </p>

          <p className="mt-3 font-semibold text-emerald-600">
            Category: {store.category}
          </p>
        </>
      )}

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">
          Products
        </h2>

        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow rounded-xl p-6"
              >
                <h3 className="text-2xl font-bold">
                  {product.name}
                </h3>

                <p className="text-gray-600 mt-3">
                  {product.description}
                </p>

                <p className="text-emerald-600 font-semibold mt-3">
                  {product.category}
                </p>

                <p className="text-2xl font-bold mt-2">
                  Le {product.price}
                </p>

                <button
  onClick={() => navigate(`/product/${product.id}`)}
  className="mt-5 w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700"
>
  View Product
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StorePage;