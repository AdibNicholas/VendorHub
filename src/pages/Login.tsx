import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Adjust the path if your supabase.ts is elsewhere

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("logged in user:",user);

  console.log("Logged in user ID:", user?.id);

  if (!user) {
    alert("Unable to get user information.");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
    console.log("Profile:", profile);
console.log("Profile Error:", profileError);


console.log("Logged in user:", user);
console.log("Logged in user ID:", user?.id);

  if (profileError) {
    alert(profileError.message);
    return;
  }
  if (!profile) {
  alert("Profile not found.");
  return;
}

  switch (profile.role) {
    case "customer":
      navigate("/customer");
      break;

    case "vendor":
      navigate("/vendor");
      break;

    case "marketer":
      navigate("/marketer");
      break;

    case "delivery":
      navigate("/delivery");
      break;

    case "admin":
      navigate("/admin");
      break;

    default:
      navigate("/");
  }
};

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-8 space-y-5"
    >
      <h2 className="text-3xl font-bold text-center text-emerald-600">
        Login to VendorHub
      </h2>

      <div>
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
      >
        Login
      </button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-emerald-600 font-semibold">
          Register
        </Link>
      </p>
    </form>
  );
}

export default Login;