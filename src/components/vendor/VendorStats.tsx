import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function VendorStats() {
  const [storeCount, setStoreCount] = useState(0);

  useEffect(() => {
    fetchStoreCount();
  }, []);

  const fetchStoreCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count, error } = await supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setStoreCount(count || 0);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">Stores</h2>
        <p className="text-3xl font-bold">{storeCount}</p>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">Products</h2>
        <p className="text-3xl font-bold">0</p>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">Orders</h2>
        <p className="text-3xl font-bold">0</p>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-500">Revenue</h2>
        <p className="text-3xl font-bold">Le 0</p>
      </div>
    </div>
  );
}

export default VendorStats;