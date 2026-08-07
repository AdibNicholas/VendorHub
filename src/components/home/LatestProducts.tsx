import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, category")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-8">
         Latest Products
      </h2>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded-xl p-5"
            >
              <h3 className="text-xl font-bold">
                {product.name}
              </h3>

              <p className="text-gray-600 mt-3">
                {product.description}
              </p>

              <p className="mt-3 text-emerald-600 font-semibold">
                {product.category}
              </p>

              <p className="mt-2 text-2xl font-bold">
                Le {product.price}
              </p>

              <button className="mt-5 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">
                View Product
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LatestProducts;