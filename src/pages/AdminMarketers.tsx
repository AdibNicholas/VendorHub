import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Marketer {
  id: string;
  marketer_code: string | null;
  status: "pending" | "active" | "suspended";
  orange_money_number: string | null;
  created_at: string;
  profiles:
    | {
        full_name: string;
        email: string;
        phone: string;
      }[]
    | null;
}

function AdminMarketers() {
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMarketers();
  }, []);

  const fetchMarketers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("marketer_profiles")
      .select(`
        id,
        marketer_code,
        status,
        orange_money_number,
        created_at,
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading marketers:", error);
      setLoading(false);
      return;
    }

    setMarketers((data as Marketer[]) || []);
    setLoading(false);
  };

  const updateStatus = async (
    marketerId: string,
    status: "active" | "suspended" | "pending"
  ) => {
    setUpdating(marketerId);

    // APPROVE MARKETER
    if (status === "active") {
      const { data, error } = await supabase.rpc(
        "approve_marketer",
        {
          target_marketer_id: marketerId,
        }
      );

      if (error) {
        console.error("Error approving marketer:", error);
        alert(`Could not approve marketer: ${error.message}`);
        setUpdating(null);
        return;
      }

      await fetchMarketers();

      alert(
        `Marketer approved successfully!\n\nMarketer Code: ${data}`
      );

      setUpdating(null);
      return;
    }

    // SUSPEND MARKETER
    const { error } = await supabase
      .from("marketer_profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", marketerId);

    if (error) {
      console.error("Error updating marketer:", error);
      alert(`Could not update marketer: ${error.message}`);
      setUpdating(null);
      return;
    }

    setMarketers((previous) =>
      previous.map((marketer) =>
        marketer.id === marketerId
          ? {
              ...marketer,
              status,
            }
          : marketer
      )
    );

    setUpdating(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-SL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "suspended":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredMarketers = marketers.filter((marketer) => {
    return filter === "all" || marketer.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">
            Loading marketers...
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
            Marketer Management
          </h1>

          <p className="text-gray-600 mt-2">
            Review, approve, and manage VendorHub marketers.
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white border rounded-2xl p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
          >
            <option value="all">All Marketers</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {filteredMarketers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {marketers.length}
            </span>{" "}
            marketers
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {filteredMarketers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No marketers found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-6 py-4 text-sm font-semibold">
                      Marketer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Code
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Orange Money
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
                  {filteredMarketers.map((marketer) => (
                    <tr
                      key={marketer.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* Marketer */}
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {marketer.profiles?.[0]?.full_name ||
                            "Unknown"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {marketer.profiles?.[0]?.email || "—"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {marketer.profiles?.[0]?.phone || "—"}
                        </p>
                      </td>

                      {/* Marketer Code */}
                      <td className="px-6 py-4 font-semibold">
                        {marketer.marketer_code || "Not assigned"}
                      </td>

                      {/* Orange Money */}
                      <td className="px-6 py-4">
                        {marketer.orange_money_number || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClass(
                            marketer.status
                          )}`}
                        >
                          {marketer.status}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(marketer.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">

                        {/* Pending → Approve */}
                        {marketer.status === "pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                marketer.id,
                                "active"
                              )
                            }
                            disabled={
                              updating === marketer.id
                            }
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {updating === marketer.id
                              ? "Updating..."
                              : "Approve"}
                          </button>
                        )}

                        {/* Active → Suspend */}
                        {marketer.status === "active" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                marketer.id,
                                "suspended"
                              )
                            }
                            disabled={
                              updating === marketer.id
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            {updating === marketer.id
                              ? "Updating..."
                              : "Suspend"}
                          </button>
                        )}

                        {/* Suspended → Reactivate */}
                        {marketer.status === "suspended" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                marketer.id,
                                "active"
                              )
                            }
                            disabled={
                              updating === marketer.id
                            }
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {updating === marketer.id
                              ? "Updating..."
                              : "Reactivate"}
                          </button>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminMarketers;