import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Layout from "../components/layout/Layout";
import { useCart } from "../Context/CartContext";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

function ProductPage() {
  const { id } = useParams();
const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProduct(data);
  };

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-8">
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">

        <div className="grid md:grid-cols-2 gap-10">

          <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
            Product Image
          </div>

          <div>

            <h1 className="text-4xl font-bold">
              {product.name}
            </h1>

            <p className="mt-4 text-gray-600">
              {product.description}
            </p>

            <p className="mt-6 text-3xl font-bold text-emerald-600">
              Le {product.price}
            </p>

            <p className="mt-3">
              Category:
              <span className="font-semibold">
                {" "}
                {product.category}
              </span>
            </p>

            <p className="mt-2">
              Stock:
              <span className="font-semibold">
                {" "}
                {product.stock}
              </span>
            </p>

            <button
  onClick={() =>
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    })
  }
  className="mt-8 bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700"
>
  Add to Cart
</button>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default ProductPage;