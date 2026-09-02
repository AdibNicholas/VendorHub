import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Vendor {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  "created-at": string;
}


interface VendorWithStats extends Vendor {
  store_count: number;
  product_count: number;
}

function AdminVendors() {
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);

    const { data: vendorData, error: vendorError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "vendor");

    if (vendorError) {
      console.error("Error fetching vendors:", vendorError.message);
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("id, vendor_id");

    if (storeError) {
      console.error("Error fetching stores:", storeError.message);
      setLoading(false);
      return;
    }

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, store_id");

    if (productError) {
      console.error("Error fetching products:", productError.message);
      setLoading(false);
      return;
    }

    const formattedVendors: VendorWithStats[] = (vendorData || []).map(
      (vendor) => {
        const vendorStores = (storeData || []).filter(
          (store) => store.vendor_id === vendor.id
        );

        const storeIds = vendorStores.map((store) => store.id);

        const vendorProducts = (productData || []).filter((product) =>
          storeIds.includes(product.store_id)
        );

        return {
          ...vendor,
          store_count: vendorStores.length,
          product_count: vendorProducts.length,
        };
      }
    );

    setVendors(formattedVendors);
    setLoading(false);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = search.toLowerCase();

    return (
      vendor.full_name?.toLowerCase().includes(searchText) ||
      vendor.email?.toLowerCase().includes(searchText) ||
      vendor.phone?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        Vendor Management
      </h1>

      <p className="text-gray-600 mb-8">
        Manage and monitor vendors across VendorHub.
      </p>

      <input
        type="text"
        placeholder="Search vendors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md border rounded-lg px-4 py-3 mb-6"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No vendors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Stores</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">
  <Link
    to={`/admin/vendors/${vendor.id}`}
    className="text-emerald-600 hover:underline"
  >
    {vendor.full_name || "Unknown"}
  </Link>
</td>
                    <td className="p-4">
                      {vendor.email || "N/A"}
                    </td>

                    <td className="p-4">
                      {vendor.phone || "N/A"}
                    </td>

                    <td className="p-4">
                      {vendor.store_count}
                    </td>

                    <td className="p-4">
                      {vendor.product_count}
                    </td>

                    <td className="p-4">
                      {new Date(
                        vendor["created-at"]
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminVendors;