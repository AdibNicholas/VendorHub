import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function VendorStats() {
  const [storeCount, setStoreCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorStats();
  }, []);

  const fetchVendorStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // --------------------------------
      // 1. Get vendor's stores
      // --------------------------------

      const { data: stores, error: storesError } =
        await supabase
          .from("stores")
          .select("id")
          .eq("vendor_id", user.id);

      if (storesError) {
        console.error(
          "Store error:",
          storesError
        );

        setLoading(false);
        return;
      }

      const storeIds =
        stores?.map((store) => store.id) || [];

      setStoreCount(storeIds.length);

      // If vendor has no stores, there
      // cannot be any products/orders yet.
      if (storeIds.length === 0) {
        setProductCount(0);
        setOrderCount(0);
        setRevenue(0);
        setLoading(false);
        return;
      }

      // --------------------------------
      // 2. Count vendor's products
      // --------------------------------

      const { count: productsCount, error: productsError } =
        await supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          })
          .in("store_id", storeIds);

      if (productsError) {
        console.error(
          "Products error:",
          productsError
        );
      } else {
        setProductCount(productsCount || 0);
      }

      // --------------------------------
      // 3. Get vendor's order items
      // --------------------------------

      const { data: orderItems, error: orderItemsError } =
        await supabase
          .from("order_items")
          .select(
            "order_id, store_id, subtotal"
          )
          .in("store_id", storeIds);

      if (orderItemsError) {
        console.error(
          "Order items error:",
          orderItemsError
        );

        setLoading(false);
        return;
      }

      // --------------------------------
      // 4. Count unique orders
      // --------------------------------

      const uniqueOrderIds = new Set(
        (orderItems || []).map(
          (item) => item.order_id
        )
      );

      setOrderCount(uniqueOrderIds.size);

      // --------------------------------
      // 5. Calculate revenue
      // --------------------------------

      const totalRevenue = (
        orderItems || []
      ).reduce(
        (total, item) =>
          total + Number(item.subtotal || 0),
        0
      );

      setRevenue(totalRevenue);

    } catch (error) {
      console.error(
        "Vendor stats error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Stores */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">
          Stores
        </h2>

        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : storeCount}
        </p>
      </div>

      {/* Products */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">
          Products
        </h2>

        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : productCount}
        </p>
      </div>

      {/* Orders */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">
          Orders
        </h2>

        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : orderCount}
        </p>
      </div>

      {/* Revenue */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">
          Revenue
        </h2>

        <p className="text-3xl font-bold mt-2">
          {loading
            ? "..."
            : `Le ${revenue.toLocaleString()}`}
        </p>
      </div>

    </div>
  );
}

export default VendorStats;