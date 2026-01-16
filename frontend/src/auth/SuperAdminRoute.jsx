import { Navigate } from "react-router-dom";

export default function SuperAdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  if (!adminToken || role !== "SUPER_ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
