import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Profile {
  full_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  affiliate_enabled: boolean;
  affiliate_commission: number | null;
  store_id: string;
  stores?: {
    name: string;
  }[];
}

interface ReferralLink {
  id: string;
  product_id: string;
  referral_code: string;
  expires_at: string;
}

function MarketerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referralClicks, setReferralClicks] = useState(0);

  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const generateReferralCode = (name: string) => {
    const prefix =
      name
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase() || "Marketer";

    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `${prefix}-${randomPart}`;
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Get marketer profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Error loading marketer profile:",
        profileError.message
      );
    } else {
      setProfile(profileData);
    }

    // Get products available for promotion
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        image_url,
        affiliate_enabled,
        affiliate_commission,
        store_id,
        stores (
          name
        )
      `)
      .eq("affiliate_enabled", true)
      .eq("is_active", true);

    if (productError) {
      console.error(
        "Error loading affiliate products:",
        productError.message
      );
    } else {
      setProducts((productData as Product[]) || []);
    }

    // Get marketer's referral links
    const { data: referralData, error: referralError } = await supabase
      .from("referral_links")
      .select(
        "id, product_id, referral_code, expires_at"
      )
      .eq("marketer_id", user.id)
      .eq("is_active", true);

    if (referralError) {
      console.error(
        "Error loading referral links:",
        referralError.message
      );
    } else {
      const links = referralData || [];

      setReferralLinks(links);

      // Get all clicks belonging to this marketer's referral links
      if (links.length > 0) {
        const referralLinkIds = links.map(
          (link) => link.id
        );

        const { data: clickData, error: clickError } =
          await supabase
            .from("referral_clicks")
            .select("id")
            .in("referral_link_id", referralLinkIds);

        if (clickError) {
          console.error(
            "Error loading referral clicks:",
            clickError.message
          );
        } else {
          setReferralClicks(clickData?.length || 0);
        }
      } else {
        setReferralClicks(0);
      }
    }

    setLoading(false);
  };

  const createReferralLink = async (product: Product) => {
    setCreatingLink(product.id);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in as a marketer.");
      setCreatingLink(null);
      return;
    }

    // Check if marketer already has an active link for this product
    const existingLink = referralLinks.find(
      (link) =>
        link.product_id === product.id &&
        new Date(link.expires_at) > new Date()
    );

    if (existingLink) {
      const existingUrl =
        `${window.location.origin}/product/${product.id}?ref=${existingLink.referral_code}`;

      await navigator.clipboard.writeText(existingUrl);

      setMessage(
        "You already have a referral link for this product. The existing link has been copied."
      );

      setCreatingLink(null);
      return;
    }

    const referralCode = generateReferralCode(
      profile?.full_name || "Marketer"
    );

    // Referral link expires in 10 days
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 10);

    const { data, error } = await supabase
      .from("referral_links")
      .insert({
        marketer_id: user.id,
        product_id: product.id,
        referral_code: referralCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Error creating referral link:",
        error.message
      );

      setMessage(
        `Could not create referral link: ${error.message}`
      );

      setCreatingLink(null);
      return;
    }

    const referralUrl =
      `${window.location.origin}/product/${product.id}?ref=${data.referral_code}`;

    try {
      await navigator.clipboard.writeText(referralUrl);

      setMessage(
        `Referral link created and copied! Expires ${expiresAt.toLocaleDateString()}.`
      );
    } catch {
      setMessage(
        `Referral link created: ${referralUrl}`
      );
    }

    setReferralLinks((previous) => [
      ...previous,
      data,
    ]);

    setCreatingLink(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-center text-gray-600">
          Loading marketer dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold">
            VendorHub Marketer Portal
          </p>

          <h1 className="text-4xl font-bold mt-1">
            Welcome, {profile?.full_name || "Marketer"}
          </h1>

          <p className="text-gray-600 mt-2">
            Promote products, generate sales, and earn commissions.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          {/* Referral Clicks */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Referral Clicks
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {referralClicks}
            </h2>
          </div>

          {/* Sales */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Sales Generated
            </p>

            <h2 className="text-3xl font-bold mt-2">
              0
            </h2>
          </div>

          {/* Pending Commission */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Commission
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Le 0
            </h2>
          </div>

          {/* Available Commission */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Available Commission
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Le 0
            </h2>
          </div>

        </div>

        {/* Available Products */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Products Available to Promote
          </h2>

          <p className="text-gray-600 mt-1">
            Earn commissions by promoting affiliate-enabled products.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <p className="text-gray-500">
              No products are currently available for promotion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => {

              const existingLink = referralLinks.find(
                (link) =>
                  link.product_id === product.id &&
                  new Date(link.expires_at) > new Date()
              );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                >

                  {/* Product Image */}
                  <div className="h-48 bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">

                    <h3 className="text-lg font-bold">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {product.stores?.[0]?.name || "Unknown Store"}
                    </p>

                    <p className="font-semibold text-lg mt-3">
                      Le {Number(product.price).toLocaleString()}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Commission
                      </span>

                      <span className="font-bold text-emerald-600">
                        {product.affiliate_commission || 0}%
                      </span>
                    </div>

                    {/* Referral Status */}
                    {existingLink && (
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs text-emerald-700 font-semibold">
                          Referral link active
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Expires{" "}
                          {new Date(
                            existingLink.expires_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Promote Button */}
                    <button
                      type="button"
                      onClick={() =>
                        createReferralLink(product)
                      }
                      disabled={
                        creatingLink === product.id
                      }
                      className="w-full mt-5 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {creatingLink === product.id
                        ? "Creating Link..."
                        : existingLink
                        ? "Copy Referral Link"
                        : "Promote Product"}
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default MarketerDashboard;