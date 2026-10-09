import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  LogOut,
  Mail,
  Package,
  Phone,
  Save,
  User,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
}

function Account() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const userName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        "";

      const userPhone = user.user_metadata?.phone || "";

      const currentProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        name: userName,
        phone: userPhone,
      };

      setProfile(currentProfile);
      setName(userName);
      setPhone(userPhone);
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Unable to load your account information.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: trimmedName,
          phone: trimmedPhone,
        },
      });

      if (error) {
        console.error("Profile update error:", error);
        setError(
          "Unable to update your profile: " + error.message
        );
        return;
      }

      if (data.user) {
        const updatedName =
          data.user.user_metadata?.name || "";

        const updatedPhone =
          data.user.user_metadata?.phone || "";

        setProfile({
          id: data.user.id,
          email: data.user.email || "",
          name: updatedName,
          phone: updatedPhone,
        });

        setName(updatedName);
        setPhone(updatedPhone);
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      setError(
        "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        setError("Unable to log out. Please try again.");
        setLoggingOut(false);
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Something went wrong while logging out.");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-8 h-9 w-48 rounded-lg bg-gray-200" />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-72 rounded-2xl bg-white shadow-sm" />

            <div className="h-96 rounded-2xl bg-white shadow-sm md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <User size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Account
              </h1>

              <p className="mt-1 text-gray-600">
                Manage your personal information and account.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Check size={17} />
            </div>

            <p className="font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Account Summary */}
          <aside className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-red-600 px-6 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-red-600 shadow-sm">
                {initials}
              </div>

              <h2 className="mt-4 break-words text-xl font-bold text-white">
                {profile.name || "VendorHub Customer"}
              </h2>

              <p className="mt-1 break-all text-sm text-red-100">
                {profile.email}
              </p>
            </div>

            <div className="p-4">
              <Link
                to="/orders"
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-gray-700 transition hover:bg-red-50 hover:text-red-600"
              >
                <span className="flex items-center gap-3 font-medium">
                  <Package size={19} />
                  My Orders
                </span>

                <ChevronRight size={18} />
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <LogOut size={19} />

                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>

                {!loggingOut && (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>
          </aside>

          {/* Profile Form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your contact information up to date.
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="full-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-gray-500"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Email changes are disabled for now.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="e.g. 076123456"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Use a phone number you can be reached on for
                  deliveries.
                </p>
              </div>

              {/* Save */}
              <div className="flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Account;