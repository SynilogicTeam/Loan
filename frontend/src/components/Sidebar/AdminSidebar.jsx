import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  BookOpen,
  CalendarRange,
  LogOut,
  Shield,
  Heart,
} from "lucide-react";

console.log("SIDEBAR RENDERED");

/* =========================
   ROLE UTILS
========================= */
const getRole = () => localStorage.getItem("role"); // "ADMIN" | "SUPER_ADMIN"
const getPermissions = () => {
  try {
    const permissions = localStorage.getItem("permissions");
    return permissions ? JSON.parse(permissions) : [];
  } catch {
    return [];
  }
};

const hasPermission = (permission) => {
  const role = getRole();
  if (role === "SUPER_ADMIN") return true; // Super Admin has all permissions
  
  const permissions = getPermissions();
  return permissions.includes(permission);
};

export default function AdminSidebar() {
  const navigate = useNavigate();
  const role = getRole();
  const permissions = getPermissions();

  console.log("Current role:", role);
  console.log("Current permissions:", permissions);

  /* =========================
     MENU CONFIG
  ========================= */
  const menu = role === "SUPER_ADMIN" 
    ? [
        // 🔸 SUPER ADMIN MENU (Platform Owner)
        {
          name: "Platform Management",
          path: "/admin/platform-management",
          icon: LayoutDashboard,
        },
        {
          name: "Communities",
          path: "/admin/communities",
          icon: Users,
        },
        {
          name: "Admins",
          path: "/admin/admins",
          icon: Users,
        },
        {
          name: "Admin Permissions",
          path: "/admin/admin-permissions",
          icon: Shield,
        },
        {
          name: "Sessions",
          path: "/admin/super-sessions",
          icon: CalendarRange,
        },
        {
          name: "System Overview",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ]
    : [
        // 🔹 ADMIN MENU (Permission-based)
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
          show: true, // Dashboard always visible
        },
        {
          name: "Members",
          path: "/admin/members",
          icon: Users,
          show: hasPermission('manage_members'),
          permission: 'manage_members'
        },
        {
          name: "Contributions",
          path: "/admin/contributions",
          icon: Wallet,
          show: hasPermission('manage_contributions'),
          permission: 'manage_contributions'
        },
        {
          name: "Loans",
          path: "/admin/loans",
          icon: HandCoins,
          show: hasPermission('manage_loans'),
          permission: 'manage_loans'
        },
        {
          name: "Withdrawals",
          path: "/admin/withdrawals",
          icon: Wallet,
          show: hasPermission('manage_members'),
          permission: 'manage_members'
        },
        {
          name: "Charity",
          path: "/admin/charity",
          icon: Heart,
          show: hasPermission('manage_members'),
          permission: 'manage_members'
        },
        {
          name: "Ledger",
          path: "/admin/ledger",
          icon: BookOpen,
          show: hasPermission('view_reports'),
          permission: 'view_reports'
        },
        {
          name: "Sessions",
          path: "/admin/sessions",
          icon: CalendarRange,
          show: hasPermission('manage_sessions'),
          permission: 'manage_sessions'
        },
      ].filter(item => item.show !== false); // Filter out items without permission

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-w-[16rem] shrink-0 bg-slate-900 text-white flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-xl font-bold tracking-wide">
          Community Fund
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {role === "SUPER_ADMIN" ? "Super Admin Panel" : "Admin Panel"}
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menu.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition
              ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
