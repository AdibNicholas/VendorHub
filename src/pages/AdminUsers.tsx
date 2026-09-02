import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  "created-at": string;
}

function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        'id, full_name, email, phone, role, "created-at"'
      )
      .order("created-at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading users:", error);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  };

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        searchText === "" ||
        user.full_name
          .toLowerCase()
          .includes(searchText) ||
        user.email
          .toLowerCase()
          .includes(searchText) ||
        user.phone.includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

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

  const getRoleClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "vendor":
        return "bg-blue-100 text-blue-700";

      case "customer":
        return "bg-green-100 text-green-700";

      case "delivery":
        return "bg-orange-100 text-orange-700";

      case "marketer":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">
            Loading users...
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
            User Management
          </h1>

          <p className="text-gray-600 mt-2">
            View and manage users on the marketplace.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
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
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">
                  All Roles
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="vendor">
                  Vendor
                </option>

                <option value="customer">
                  Customer
                </option>

                <option value="delivery">
                  Delivery
                </option>

                <option value="marketer">
                  Marketer
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* User count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {users.length}
            </span>{" "}
            users
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No users found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">

                    <th className="px-6 py-4 text-sm font-semibold">
                      User
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Role
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Joined
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div>
                          <p className="font-semibold">
                            {user.full_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>

                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {user.phone || "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(user["created-at"])}
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

export default AdminUsers;