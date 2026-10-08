import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Vendor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  "created-at": string;
}

interface Store {
  id: string;
  vendor_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface VendorWithStores extends Vendor {
  stores: Store[];
}

function AdminVendors() {
  const [vendors, setVendors] = useState<VendorWithStores[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);

    try {
      // Get all vendors
      const { data: vendorData, error: vendorError } =
        await supabase
          .from("profiles")
          .select(
            'id, full_name, email, phone, role, "created-at"'
          )
          .eq("role", "vendor")
          .order("created-at", {
            ascending: false,
          });

      if (vendorError) {
        console.error(
          "Error loading vendors:",
          vendorError
        );
        return;
      }

      // Get all stores
      const { data: storeData, error: storeError } =
        await supabase
          .from("stores")
          .select(
            "id, vendor_id, name, is_active, created_at"
          )
          .order("created_at", {
            ascending: false,
          });

      if (storeError) {
        console.error(
          "Error loading stores:",
          storeError
        );
        return;
      }

      const vendorList: VendorWithStores[] =
        (vendorData || []).map((vendor) => ({
          ...vendor,
          stores: (storeData || []).filter(
            (store) => store.vendor_id === vendor.id
          ),
        }));

      setVendors(vendorList);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return vendors.filter((vendor) => {
      const matchesSearch =
        searchText === "" ||
        vendor.full_name
          .toLowerCase()
          .includes(searchText) ||
        vendor.email
          .toLowerCase()
          .includes(searchText) ||
        vendor.phone.includes(searchText);

      const activeStores = vendor.stores.filter(
        (store) => store.is_active
      ).length;

      const inactiveStores = vendor.stores.filter(
        (store) => !store.is_active
      ).length;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          activeStores > 0) ||
        (statusFilter === "inactive" &&
          inactiveStores > 0);

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-SL",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const totalStores = vendors.reduce(
    (total, vendor) =>
      total + vendor.stores.length,
    0
  );

  const activeStores = vendors.reduce(
    (total, vendor) =>
      total +
      vendor.stores.filter(
        (store) => store.is_active
      ).length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">
            Loading vendors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold">
            VendorHub Administration
          </p>

          <h1 className="text-4xl font-bold mt-1">
            Vendor Management
          </h1>

          <p className="text-gray-600 mt-2">
            Review and manage marketplace vendors
            and their stores.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-gray-500 text-sm">
              Total Vendors
            </p>

            <p className="text-3xl font-bold mt-2">
              {vendors.length}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-gray-500 text-sm">
              Total Stores
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalStores}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-gray-500 text-sm">
              Active Stores
            </p>

            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {activeStores}
            </p>
          </div>

        </div>

        {/* Search and Filter */}
        <div className="bg-white border rounded-2xl p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vendors
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search name, email or phone..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">
                  All Stores
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* Result Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {filteredVendors.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {vendors.length}
            </span>{" "}
            vendors
          </p>
        </div>

        {/* Vendors */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {filteredVendors.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No vendors found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">

                    <th className="px-6 py-4 text-sm font-semibold">
                      Vendor
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Stores
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredVendors.map((vendor) => {
                    const active =
                      vendor.stores.filter(
                        (store) =>
                          store.is_active
                      ).length;

                    return (
                      <tr
                        key={vendor.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">
                          <p className="font-semibold">
                            {vendor.full_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {vendor.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {vendor.phone || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold">
                            {vendor.stores.length}
                          </span>
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              active > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {active > 0
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(
                            vendor["created-at"]
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <Link
                            to={`/admin/vendors/${vendor.id}`}
                            className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 text-sm font-medium"
                          >
                            View
                          </Link>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AdminVendors;