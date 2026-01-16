import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import Topbar from "../components/Topbar/Topbar";
import CommunitySwitcher from "../components/CommunitySwitcher";
console.log("ADMIN LAYOUT RENDERED");

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <Topbar />

        {/* COMMUNITY INFO/SWITCHER */}
        <CommunitySwitcher />

        {/* PAGE CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
