import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Vendor {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  "created-at": string;
}

interface Store {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

function AdminVendorDetails() {
  const { id } = useParams();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    setLoading(true);

    const { data: vendorData, error: vendorError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "vendor")
      .single();

    if (vendorError) {
      console.error("Error fetching vendor:", vendorError.message);
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false });

    if (storeError) {
      console.error("Error fetching stores:", storeError.message);
    }

    const storeIds = (storeData || []).map((store) => store.id);

    let productData: Product[] = [];

    if (storeIds.length > 0) {
      const { data, error: productError } = await supabase
        .from("products")
        .select("id, store_id, name, price, stock, is_active")
        .in("store_id", storeIds);

      if (productError) {
        console.error("Error fetching products:", productError.message);
      } else {
        productData = data || [];
      }
    }

    setVendor(vendorData);
    setStores(storeData || []);
    setProducts(productData);
    setLoading(false);
  };

  const updateVendorStatus = async () => {
    if (!vendor) return;

    const newStatus =
      vendor.status === "active" ? "suspended" : "active";

    const action =
      newStatus === "suspended" ? "suspend" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this vendor?`
    );

    if (!confirmed) return;

    setUpdatingStatus(true);

    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", vendor.id);

    if (error) {
      alert(error.message);
      setUpdatingStatus(false);
      return;
    }

    setVendor({
      ...vendor,
      status: newStatus,
    });

    setUpdatingStatus(false);
  };

  const getStoreProductCount = (storeId: string) => {
    return products.filter(
      (product) => product.store_id === storeId
    ).length;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading vendor details...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold">
          Vendor not found.
        </p>

        <Link
          to="/admin/vendors"
          className="text-emerald-600 hover:underline"
        >
          Back to Vendor Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link
        to="/admin/vendors"
        className="inline-block mb-6 text-emerald-600 font-medium hover:underline"
      >
        ← Back to Vendor Management
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {vendor.full_name || "Vendor Details"}
          </h1>

          <p className="text-gray-600">
            Manage vendor information and marketplace activity.
          </p>
        </div>

        <button
          onClick={updateVendorStatus}
          disabled={updatingStatus}
          className={`px-5 py-3 rounded-lg text-white font-medium ${
            vendor.status === "active"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          } disabled:opacity-50`}
        >
          {updatingStatus
            ? "Updating..."
            : vendor.status === "active"
            ? "Suspend Vendor"
            : "Activate Vendor"}
        </button>
      </div>

      {/* Vendor Information */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-5">
          Vendor Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">
              {vendor.full_name || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">
              {vendor.email || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">
              {vendor.phone || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Status</p>

            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                vendor.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vendor.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Registered</p>
            <p className="font-medium">
              {new Date(
                vendor["created-at"]
              ).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Stores</p>
            <p className="font-medium">
              {stores.length}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Stores */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            Vendor Stores
          </h2>

          <p className="text-gray-600 text-sm mt-1">
            Stores owned by this vendor.
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            This vendor has no stores yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Store</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <p className="font-medium">
                        {store.name}
                      </p>

                      {store.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {store.description}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      {store.category || "N/A"}
                    </td>

                    <td className="p-4">
                      {getStoreProductCount(store.id)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          store.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {store.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      {new Date(
                        store.created_at
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

export default AdminVendorDetails;