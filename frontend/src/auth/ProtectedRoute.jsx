import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  // 🔒 only ADMIN / SUPER_ADMIN allowed here
  if (!adminToken || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  // ✅ THIS IS THE MOST IMPORTANT LINE
  return children;
}
