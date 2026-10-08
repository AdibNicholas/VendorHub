import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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

      const userPhone =
        user.user_metadata?.phone || "";

      const currentProfile = {
        id: user.id,
        email: user.email || "",
        name: userName,
        phone: userPhone,
      };

      setProfile(currentProfile);
      setName(userName);
      setPhone(userPhone);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } =
        await supabase.auth.updateUser({
          data: {
            name: name.trim(),
            phone: phone.trim(),
          },
        });

      if (error) {
        console.error(error);

        alert(
          "Unable to update your profile: " +
            error.message
        );

        return;
      }

      if (data.user) {
        setProfile({
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.name || "",
          phone:
            data.user.user_metadata?.phone || "",
        });
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">
          Loading account...
        </p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-8">
        My Account
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Account Menu */}
        <div className="bg-white shadow rounded-xl p-6 h-fit">

          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-emerald-600">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "U"}
            </span>
          </div>

          <h2 className="text-xl font-bold text-center mt-4">
            {profile.name || "VendorHub Customer"}
          </h2>

          <p className="text-gray-500 text-center text-sm break-all">
            {profile.email}
          </p>

          <div className="mt-6 space-y-2">

            <Link
              to="/orders"
              className="block w-full px-4 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
            >
              📦 My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              🚪 Logout
            </button>

          </div>
        </div>

        {/* Editable Profile */}
        <div className="md:col-span-2 bg-white shadow rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Profile Information
          </h2>

          <form
            onSubmit={handleSave}
            className="space-y-5"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              />

              <p className="text-xs text-gray-500 mt-2">
                Email changes are disabled for now.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="e.g. 076123456"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Account;