import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  // 🔒 Only ADMIN & SUPER_ADMIN allowed
  if (!adminToken || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
