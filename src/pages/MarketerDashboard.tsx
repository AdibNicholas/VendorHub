import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Profile {
  full_name: string;
}

interface MarketerProfile {
  id: string;
  marketer_code: string | null;
  status: "pending" | "active" | "suspended";
  orange_money_number: string | null;
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

interface AffiliateLink {
  id: string;
  product_id: string;
  referral_code: string;
  is_active: boolean;
  created_at: string;
}

function MarketerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [marketerProfile, setMarketerProfile] =
    useState<MarketerProfile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [affiliateLinks, setAffiliateLinks] =
    useState<AffiliateLink[]>([]);

  const [referralClicks, setReferralClicks] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [salesGenerated, setSalesGenerated] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);
  const [payableCommission, setPayableCommission] = useState(0);
  const [paidCommission, setPaidCommission] = useState(0);

  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
   * Generate a referral code.
   *
   * The code is stored permanently with the affiliate link.
   * The link itself expires after 2 days.
   */
  const generateReferralCode = () => {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    return `VH-${randomPart}`;
  };

  /*
   * Ask the database to expire old affiliate links.
   *
   * The database function checks:
   *
   * created_at <= now() - 2 days
   *
   * and changes those links to:
   *
   * is_active = false
   */
  const expireAffiliateLinks = async () => {
    const { error } = await supabase.rpc(
      "expire_affiliate_links"
    );

    if (error) {
      console.error(
        "Could not expire affiliate links:",
        error
      );

      return false;
    }

    return true;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in as a marketer.");
        return;
      }

      /*
       * IMPORTANT:
       * Expire old links before loading active links.
       *
       * This makes the database the source of truth for
       * the 2-day expiration rule.
       */
      await expireAffiliateLinks();

      // -----------------------------------------
      // PROFILE
      // -----------------------------------------

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        );
      } else {
        setProfile(profileData);
      }

      // -----------------------------------------
      // MARKETER PROFILE
      // -----------------------------------------

      const {
        data: marketerData,
        error: marketerError,
      } = await supabase
        .from("marketer_profiles")
        .select(
          "id, marketer_code, status, orange_money_number"
        )
        .eq("id", user.id)
        .single();

      if (marketerError) {
        console.error(
          "Marketer profile error:",
          marketerError
        );

        setMarketerProfile(null);

        setMessage(
          "Your marketer application has not been approved yet."
        );

        return;
      }

      setMarketerProfile(marketerData);

      // -----------------------------------------
      // PRODUCTS AVAILABLE FOR PROMOTION
      // -----------------------------------------

      const {
        data: productData,
        error: productError,
      } = await supabase
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
          "Product error:",
          productError
        );
      } else {
        setProducts(
          (productData as Product[]) || []
        );
      }

      // -----------------------------------------
      // ACTIVE AFFILIATE LINKS
      // -----------------------------------------

      const {
        data: linksData,
        error: linksError,
      } = await supabase
        .from("affiliate_links")
        .select(
          "id, product_id, referral_code, is_active, created_at"
        )
        .eq("marketer_id", user.id)
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (linksError) {
        console.error(
          "Affiliate links error:",
          linksError
        );

        setAffiliateLinks([]);
      } else {
        setAffiliateLinks(
          (linksData as AffiliateLink[]) || []
        );
      }

      // -----------------------------------------
      // REFERRAL CLICKS
      // -----------------------------------------
      //
      // We intentionally count clicks using
      // marketer_id instead of only active links.
      //
      // Why?
      //
      // An affiliate link can expire after 2 days,
      // but its historical clicks should remain
      // part of the marketer's statistics.
      //

      const {
        count: clickCount,
        error: clickError,
      } = await supabase
        .from("affiliate_clicks")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("marketer_id", user.id);

      if (clickError) {
        console.error(
          "Click count error:",
          clickError
        );

        setReferralClicks(0);
      } else {
        setReferralClicks(clickCount || 0);
      }

      // -----------------------------------------
      // CONVERSIONS
      // -----------------------------------------

      const {
        data: conversionData,
        error: conversionError,
      } = await supabase
        .from("affiliate_conversions")
        .select(
          "sale_amount, commission_amount"
        )
        .eq("marketer_id", user.id);

      if (conversionError) {
        console.error(
          "Conversion error:",
          conversionError
        );

        setConversions(0);
        setSalesGenerated(0);
      } else {
        const conversionsList =
          conversionData || [];

        setConversions(
          conversionsList.length
        );

        const sales =
          conversionsList.reduce(
            (sum, item) =>
              sum +
              Number(item.sale_amount || 0),
            0
          );

        setSalesGenerated(sales);
      }

      // -----------------------------------------
      // COMMISSIONS
      // -----------------------------------------

      const {
        data: commissionData,
        error: commissionError,
      } = await supabase
        .from("marketer_commissions")
        .select("amount, status")
        .eq("marketer_id", user.id);

      if (commissionError) {
        console.error(
          "Commission error:",
          commissionError
        );

        setTotalCommission(0);
        setPendingCommission(0);
        setPayableCommission(0);
        setPaidCommission(0);
      } else {
        const commissions =
          commissionData || [];

        const total =
          commissions.reduce(
            (sum, item) =>
              sum + Number(item.amount || 0),
            0
          );

        const pending =
          commissions
            .filter(
              (item) =>
                item.status === "pending"
            )
            .reduce(
              (sum, item) =>
                sum +
                Number(item.amount || 0),
              0
            );

        const payable =
          commissions
            .filter(
              (item) =>
                item.status === "payable"
            )
            .reduce(
              (sum, item) =>
                sum +
                Number(item.amount || 0),
              0
            );

        const paid =
          commissions
            .filter(
              (item) =>
                item.status === "paid"
            )
            .reduce(
              (sum, item) =>
                sum +
                Number(item.amount || 0),
              0
            );

        setTotalCommission(total);
        setPendingCommission(pending);
        setPayableCommission(payable);
        setPaidCommission(paid);
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setMessage(
        "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // CREATE / COPY AFFILIATE LINK
  // -----------------------------------------

  const createAffiliateLink = async (
    product: Product
  ) => {
    if (!marketerProfile) {
      setMessage(
        "Your marketer profile was not found."
      );

      return;
    }

    if (marketerProfile.status !== "active") {
      setMessage(
        `Your marketer account is currently ${marketerProfile.status}.`
      );

      return;
    }

    setCreatingLink(product.id);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage(
          "Please log in again."
        );

        return;
      }

      /*
       * FIRST:
       * Ask the database to expire old links.
       *
       * We do this again when creating a link because
       * the dashboard may have been left open for hours.
       */
      const expirationSuccessful =
        await expireAffiliateLinks();

      if (!expirationSuccessful) {
        setMessage(
          "We could not verify your affiliate link status. Please try again."
        );

        return;
      }

      /*
       * SECOND:
       * Check the database for an existing ACTIVE
       * link for this marketer and product.
       *
       * We do not rely only on React state.
       */
      const {
        data: existingLink,
        error: existingLinkError,
      } = await supabase
        .from("affiliate_links")
        .select(
          "id, product_id, referral_code, is_active, created_at"
        )
        .eq("marketer_id", user.id)
        .eq("product_id", product.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existingLinkError) {
        console.error(
          "Existing link error:",
          existingLinkError
        );

        setMessage(
          "Could not check your existing affiliate link."
        );

        return;
      }

      /*
       * If an active link already exists,
       * don't create another one.
       */
      if (existingLink) {
        const existingUrl =
          `${window.location.origin}/product/${product.id}?ref=${existingLink.referral_code}`;

        /*
         * Make sure the existing link appears
         * in the dashboard state.
         */
        setAffiliateLinks((previous) => {
          const alreadyExists =
            previous.some(
              (link) =>
                link.id === existingLink.id
            );

          if (alreadyExists) {
            return previous;
          }

          return [
            existingLink as AffiliateLink,
            ...previous,
          ];
        });

        try {
          await navigator.clipboard.writeText(
            existingUrl
          );

          setMessage(
            "You already have an active referral link for this product. The link has been copied."
          );
        } catch {
          setMessage(
            `Your referral link: ${existingUrl}`
          );
        }

        return;
      }

      // -----------------------------------------
      // CREATE NEW LINK
      // -----------------------------------------

      const referralCode =
        generateReferralCode();

      const {
        data,
        error,
      } = await supabase
        .from("affiliate_links")
        .insert({
          marketer_id: user.id,
          product_id: product.id,
          referral_code: referralCode,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Create affiliate link error:",
          error
        );

        /*
         * This can happen if another request created
         * an active link at almost the same time.
         */
        if (
          error.code === "23505"
        ) {
          setMessage(
            "An active affiliate link already exists for this product. Please try again."
          );
        } else {
          setMessage(
            `Could not create affiliate link: ${error.message}`
          );
        }

        return;
      }

      const referralUrl =
        `${window.location.origin}/product/${product.id}?ref=${data.referral_code}`;

      // Add new link to dashboard state
      setAffiliateLinks((previous) => [
        data as AffiliateLink,
        ...previous,
      ]);

      try {
        await navigator.clipboard.writeText(
          referralUrl
        );

        setMessage(
          "Affiliate link created and copied. It will remain valid for 2 days."
        );
      } catch {
        setMessage(
          `Affiliate link created: ${referralUrl}`
        );
      }
    } catch (error) {
      console.error(
        "Affiliate link creation error:",
        error
      );

      setMessage(
        "Something went wrong while creating the affiliate link."
      );
    } finally {
      setCreatingLink(null);
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-center text-gray-600">
          Loading marketer dashboard...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // NO MARKETER PROFILE
  // -----------------------------------------

  if (!marketerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border p-8 text-center">
          <h1 className="text-2xl font-bold">
            Marketer Application Pending
          </h1>

          <p className="text-gray-600 mt-3">
            Your marketer account must be approved
            by VendorHub administration before you
            can promote products.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // PENDING / SUSPENDED
  // -----------------------------------------

  if (
    marketerProfile.status !== "active"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border p-8 text-center">
          <h1 className="text-2xl font-bold">
            Marketer Account{" "}
            {marketerProfile.status ===
            "pending"
              ? "Pending Approval"
              : "Suspended"}
          </h1>

          <p className="text-gray-600 mt-3">
            {marketerProfile.status ===
            "pending"
              ? "An administrator needs to approve your marketer account before you can promote products."
              : "Your marketer account is currently suspended."}
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // DASHBOARD
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold">
            VendorHub Marketer Portal
          </p>

          <h1 className="text-4xl font-bold mt-1">
            Welcome,{" "}
            {profile?.full_name ||
              "Marketer"}
          </h1>

          <p className="text-gray-600 mt-2">
            Promote products, generate sales,
            and earn commissions.
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Marketer Code:{" "}
            <span className="font-semibold">
              {marketerProfile.marketer_code ||
                "Not assigned"}
            </span>
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4">
            {message}
          </div>
        )}

        {/* MAIN STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          {/* REFERRAL CLICKS */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Referral Clicks
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {referralClicks}
            </h2>
          </div>

          {/* CONVERSIONS */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Conversions
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {conversions}
            </h2>
          </div>

          {/* SALES */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Sales Generated
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Le{" "}
              {salesGenerated.toLocaleString()}
            </h2>
          </div>

          {/* COMMISSION */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Commission
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Le{" "}
              {totalCommission.toLocaleString()}
            </h2>
          </div>

        </div>

        {/* COMMISSION SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          {/* PENDING */}
          <div className="bg-white rounded-2xl border p-6">
            <p className="text-sm text-gray-500">
              Pending Commission
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Le{" "}
              {pendingCommission.toLocaleString()}
            </h2>
          </div>

          {/* PAYABLE */}
          <div className="bg-white rounded-2xl border p-6">
            <p className="text-sm text-gray-500">
              Payable Commission
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Le{" "}
              {payableCommission.toLocaleString()}
            </h2>
          </div>

          {/* PAID */}
          <div className="bg-white rounded-2xl border p-6">
            <p className="text-sm text-gray-500">
              Paid Commission
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Le{" "}
              {paidCommission.toLocaleString()}
            </h2>
          </div>

        </div>

        {/* PRODUCTS SECTION */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Products Available to Promote
          </h2>

          <p className="text-gray-600 mt-1">
            Generate a referral link for any
            eligible product. Links remain valid
            for 2 days.
          </p>
        </div>

        {/* NO PRODUCTS */}
        {products.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <p className="text-gray-500">
              No products are currently available
              for promotion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => {

              /*
               * Because fetchDashboardData() calls
               * expire_affiliate_links() first,
               * this array should contain only active
               * links.
               *
               * The created_at check is kept as an
               * additional frontend safety check.
               */
              const existingLink =
                affiliateLinks.find(
                  (link) =>
                    link.product_id ===
                      product.id &&
                    link.is_active === true &&
                    new Date(
                      link.created_at
                    ).getTime() >
                      Date.now() -
                        2 *
                          24 *
                          60 *
                          60 *
                          1000
                );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                >

                  {/* PRODUCT IMAGE */}
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

                  {/* PRODUCT DETAILS */}
                  <div className="p-5">

                    <h3 className="text-lg font-bold">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {product.stores?.[0]
                        ?.name ||
                        "Unknown Store"}
                    </p>

                    <p className="font-semibold text-lg mt-3">
                      Le{" "}
                      {Number(
                        product.price
                      ).toLocaleString()}
                    </p>

                    {/* COMMISSION RATE */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Commission
                      </span>

                      <span className="font-bold text-emerald-600">
                        {Number(
                          product.affiliate_commission ||
                            0
                        )}
                        %
                      </span>
                    </div>

                    {/* ACTIVE LINK INFO */}
                    {existingLink && (
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs text-emerald-700 font-semibold">
                          Active referral link
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Created{" "}
                          {new Date(
                            existingLink.created_at
                          ).toLocaleDateString()}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Expires 2 days after
                          creation
                        </p>
                      </div>
                    )}

                    {/* ACTION BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        createAffiliateLink(
                          product
                        )
                      }
                      disabled={
                        creatingLink ===
                        product.id
                      }
                      className="w-full mt-5 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {creatingLink ===
                      product.id
                        ? "Creating Link..."
                        : existingLink
                        ? "Copy Affiliate Link"
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