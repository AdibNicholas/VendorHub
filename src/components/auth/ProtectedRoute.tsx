import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking access:", error.message);
      setLoading(false);
      return;
    }

    if (
      profile?.role === allowedRole &&
      profile?.status === "active"
    ) {
      setAuthorized(true);
    }

    setLoading(false);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;