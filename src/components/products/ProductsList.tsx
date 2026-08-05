import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface ProductListProps {
  storeId: string;
}

function ProductList({ storeId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            stock={product.stock}
            category={product.category}
          />
        ))
      )}
    </div>
  );
}

export default ProductList;