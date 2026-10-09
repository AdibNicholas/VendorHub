import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ShoppingCart,
  Store as StoreIcon,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../Context/CartContext";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
}

interface Store {
  id: string;
  name: string;
  logo_url: string | null;
}

function ProductPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    trackAffiliateReferral();
  }, [id, searchParams]);

  // -----------------------------------------
  // LOAD PRODUCT
  // -----------------------------------------

  const fetchProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, store_id, name, description, price, stock, category, image_url"
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error loading product:", error);
      setProduct(null);
      setLoading(false);
      return;
    }

    setProduct(data);
    setLoading(false);

    fetchStore(data.store_id);
  };

  // -----------------------------------------
  // LOAD STORE
  // -----------------------------------------

  const fetchStore = async (storeId: string) => {
    setStoreLoading(true);

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, logo_url")
      .eq("id", storeId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error loading store:", error);
      setStore(null);
      setStoreLoading(false);
      return;
    }

    setStore(data);
    setStoreLoading(false);
  };

  // -----------------------------------------
  // TRACK AFFILIATE REFERRAL
  // -----------------------------------------

  const trackAffiliateReferral = async () => {
    const referralCode = searchParams.get("ref");

    if (!referralCode || !id) {
      return;
    }

    /*
     * Find the affiliate link using:
     *
     * referral code
     * product ID
     * active status
     */

    const {
      data: affiliateLink,
      error: affiliateError,
    } = await supabase
      .from("affiliate_links")
      .select(
        "id, marketer_id, product_id, referral_code, is_active, created_at"
      )
      .eq("referral_code", referralCode)
      .eq("product_id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (affiliateError) {
      console.error(
        "Error finding affiliate link:",
        affiliateError.message
      );

      return;
    }

    if (!affiliateLink) {
      console.log("Invalid or inactive affiliate link.");
      return;
    }

    /*
     * Extra expiration check.
     */

    const createdAt = new Date(
      affiliateLink.created_at
    );

    const expirationTime =
      createdAt.getTime() +
      2 * 24 * 60 * 60 * 1000;

    if (Date.now() >= expirationTime) {
      console.log("Affiliate link has expired.");
      return;
    }

    /*
     * Prevent duplicate click tracking
     * during the same browser session.
     */

    const clickStorageKey =
      `vendorhub_affiliate_click_${affiliateLink.id}`;

    const alreadyTracked =
      sessionStorage.getItem(clickStorageKey);

    if (alreadyTracked) {
      console.log(
        "Affiliate click already tracked for this session."
      );

      localStorage.setItem(
        "vendorhub_affiliate_referral",
        JSON.stringify({
          affiliate_link_id:
            affiliateLink.id,
          marketer_id:
            affiliateLink.marketer_id,
          product_id:
            affiliateLink.product_id,
          referral_code:
            affiliateLink.referral_code,
          saved_at:
            new Date().toISOString(),
        })
      );

      return;
    }

    /*
     * Record the affiliate click.
     */

    const { error: clickError } =
      await supabase
        .from("affiliate_clicks")
        .insert({
          affiliate_link_id:
            affiliateLink.id,
          marketer_id:
            affiliateLink.marketer_id,
          product_id:
            affiliateLink.product_id,
          session_id:
            getAffiliateSessionId(),
        });

    if (clickError) {
      console.error(
        "Error recording affiliate click:",
        clickError.message
      );

      return;
    }

    /*
     * Mark this referral as tracked
     * for this browser session.
     */

    sessionStorage.setItem(
      clickStorageKey,
      "true"
    );

    /*
     * Save referral information so checkout
     * can identify the marketer.
     */

    localStorage.setItem(
      "vendorhub_affiliate_referral",
      JSON.stringify({
        affiliate_link_id:
          affiliateLink.id,
        marketer_id:
          affiliateLink.marketer_id,
        product_id:
          affiliateLink.product_id,
        referral_code:
          affiliateLink.referral_code,
        saved_at:
          new Date().toISOString(),
      })
    );

    console.log(
      "Affiliate click recorded successfully."
    );
  };

  // -----------------------------------------
  // AFFILIATE SESSION ID
  // -----------------------------------------

  const getAffiliateSessionId = () => {
    const storageKey =
      "vendorhub_affiliate_session_id";

    const existingId =
      sessionStorage.getItem(storageKey);

    if (existingId) {
      return existingId;
    }

    const newId = crypto.randomUUID();

    sessionStorage.setItem(
      storageKey,
      newId
    );

    return newId;
  };

  // -----------------------------------------
  // ADD TO CART
  // -----------------------------------------

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return;
    }

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
    }, 2500);
  };

  // -----------------------------------------
  // PRICE FORMAT
  // -----------------------------------------

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-SL").format(price);
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="h-[500px] bg-gray-200 rounded-2xl" />

            <div className="space-y-5">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // PRODUCT NOT FOUND
  // -----------------------------------------

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart
              size={30}
              className="text-gray-400"
            />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            We couldn't find this product. It may have
            been removed or is no longer available.
          </p>

          <Link
            to="/shop"
            className="inline-block mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* BACK */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-emerald-600 font-medium transition"
        >
          ← Back
        </button>

        {/* PRODUCT */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* IMAGE */}
            <div className="bg-gray-100 min-h-[400px] md:min-h-[560px] flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full max-h-[560px] object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ShoppingCart
                    size={52}
                    className="mx-auto"
                  />

                  <p className="mt-3 font-medium">
                    No product image
                  </p>
                </div>
              )}
            </div>

            {/* INFORMATION */}
            <div className="p-6 md:p-10 flex flex-col">
              {/* CATEGORY */}
              {product.category && (
                <span className="inline-block self-start bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              )}

              {/* NAME */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
                {product.name}
              </h1>

              {/* DESCRIPTION */}
              <p className="text-gray-600 leading-relaxed mt-5">
                {product.description ||
                  "No description is available for this product."}
              </p>

              {/* PRICE */}
              <div className="mt-7">
                <p className="text-sm text-gray-500">
                  Price
                </p>

                <p className="text-4xl font-bold text-emerald-600 mt-1">
                  Le {formatPrice(product.price)}
                </p>
              </div>

              {/* STOCK */}
              <div className="mt-5">
                {isOutOfStock ? (
                  <span className="inline-flex items-center bg-red-50 text-red-600 px-3 py-2 rounded-lg font-semibold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg font-semibold">
                    {product.stock} available
                  </span>
                )}
              </div>

              {/* STORE */}
              {store && (
                <Link
                  to={`/store/${store.id}`}
                  className="mt-7 flex items-center gap-3 border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50 transition"
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <StoreIcon
                        size={22}
                        className="text-emerald-600"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Sold by
                    </p>

                    <p className="font-bold text-gray-900 truncate">
                      {store.name}
                    </p>
                  </div>

                  <span className="ml-auto text-emerald-600 font-semibold">
                    Visit →
                  </span>
                </Link>
              )}

              {storeLoading && (
                <div className="mt-7 h-20 rounded-xl bg-gray-100 animate-pulse" />
              )}

              {/* ADD TO CART */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`mt-7 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : added
                    ? "bg-green-600 text-white"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isOutOfStock ? (
                  "Out of Stock"
                ) : added ? (
                  <>
                    <Check size={22} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={22} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* SUCCESS MESSAGE */}
              {added && (
                <div className="mt-4 bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 text-center font-medium">
                  Product added to your cart successfully.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductPage;