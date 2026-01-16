import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoute({ allowed }){
  const role = localStorage.getItem("role");

  if (!allowed.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
