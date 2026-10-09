import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function RegisterForm() {
  const [searchParams] = useSearchParams();

  const requestedRole = searchParams.get("role");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      requestedRole === "vendor" ||
      requestedRole === "marketer" ||
      requestedRole === "delivery"
    ) {
      setRole(requestedRole);
    }
  }, [requestedRole]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    setLoading(false);

    alert(
      role === "vendor"
        ? "Vendor account created successfully! Please check your email to verify your account."
        : "Account created successfully! Please check your email to verify your account."
    );
  };

  const getTitle = () => {
    if (role === "vendor") {
      return "Become a Vendor";
    }

    if (role === "marketer") {
      return "Become a Marketer";
    }

    if (role === "delivery") {
      return "Join as a Delivery Rider";
    }

    return "Create Your VendorHub Account";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-5"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-emerald-600">
          {getTitle()}
        </h2>

        <p className="text-gray-500 mt-2 text-sm">
          Join VendorHub and become part of the marketplace.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block mb-2 font-medium">
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 font-medium">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block mb-2 font-medium">
          Phone Number
        </label>

        <input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Register As */}
      <div>
        <label className="block mb-2 font-medium">
          Register As
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="marketer">Marketer</option>
          <option value="delivery">Delivery Rider</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label className="block mb-2 font-medium">
          Password
        </label>

        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block mb-2 font-medium">
          Confirm Password
        </label>

        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-1"
        />

        <label className="text-sm text-gray-600">
          I agree to the Terms & Conditions.
        </label>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Login */}
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-emerald-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;