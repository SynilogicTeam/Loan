import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  // Debug logging
  console.log("🔒 ProtectedRoute Check:", {
    hasAdminToken: !!adminToken,
    role: role,
    tokenPreview: adminToken?.substring(0, 20) + "..."
  });

  // 🔒 only ADMIN / SUPER_ADMIN allowed here
  if (!adminToken || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    console.log("❌ ProtectedRoute: Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ProtectedRoute: Access granted");
  // ✅ THIS IS THE MOST IMPORTANT LINE
  return children;
}
