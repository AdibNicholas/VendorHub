import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
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
  const [searchParams] = useSearchParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    trackReferral();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading product:", error);
      setLoading(false);
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const trackReferral = async () => {
    const referralCode = searchParams.get("ref");

    if (!referralCode || !id) {
      return;
    }

    const { data: referralLink, error: referralError } =
      await supabase
        .from("referral_links")
        .select("id, product_id, is_active, expires_at")
        .eq("referral_code", referralCode)
        .eq("product_id", id)
        .eq("is_active", true)
        .single();

    if (referralError || !referralLink) {
      console.log("Invalid referral link.");
      return;
    }

    const expirationDate = new Date(
      referralLink.expires_at
    );

    if (expirationDate <= new Date()) {
      console.log("Referral link has expired.");
      return;
    }

    const { error: clickError } = await supabase
      .from("referral_clicks")
      .insert({
        referral_link_id: referralLink.id,
      });

    if (clickError) {
      console.error(
        "Error recording referral click:",
        clickError.message
      );

      return;
    }

    console.log("Referral click recorded successfully.");
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      store_id: product.store_id,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold">
          Product Not Found
        </h1>

        <p className="mt-3 text-gray-600">
          We couldn't find this product.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-2 gap-10">

          {/* Product Image */}
          <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
            <span className="text-gray-500">
              Product Image
            </span>
          </div>

          {/* Product Information */}
          <div>

            <h1 className="text-4xl font-bold">
              {product.name}
            </h1>

            <p className="mt-4 text-gray-600">
              {product.description}
            </p>

            <p className="mt-6 text-3xl font-bold text-emerald-600">
              Le{" "}
              {Number(product.price).toLocaleString()}
            </p>

            <p className="mt-3">
              Category:{" "}
              <span className="font-semibold">
                {product.category}
              </span>
            </p>

            <p className="mt-2">
              Stock:{" "}
              <span className="font-semibold">
                {product.stock}
              </span>
            </p>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`mt-8 px-8 py-4 rounded-lg text-white ${
                product.stock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : added
                ? "✓ Added to Cart"
                : "Add to Cart"}
            </button>

            {added && (
              <p className="mt-3 text-emerald-600 font-medium">
                Product added to your cart!
              </p>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductPage;