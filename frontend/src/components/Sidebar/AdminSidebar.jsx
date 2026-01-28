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
  Settings,
  AlertTriangle,
  FileText,
  UserCheck,
  CreditCard,
  TrendingUp,
  Download,
  Building2,
  Crown,
  Key,
} from "lucide-react";

const getRole = () => localStorage.getItem("role");
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
  if (role === "SUPER_ADMIN") return true;
  const permissions = getPermissions();
  return permissions.includes(permission);
};

export default function AdminSidebar() {
  const navigate = useNavigate();
  const role = getRole();
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');

  const menu = role === "SUPER_ADMIN" 
    ? [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard
        },
        {
          name: "Communities",
          path: "/admin/communities",
          icon: Users
        },
        {
          name: "Admins",
          path: "/admin/admins",
          icon: Crown
        },
        {
          name: "Admin Permissions",
          path: "/admin/admin-permissions",
          icon: Shield
        },
        {
          name: "Password Management",
          path: "/admin/password-management",
          icon: Key
        },
        {
          name: "Sessions",
          path: "/admin/super-sessions",
          icon: CalendarRange
        },
        {
          name: "Interest Rates",
          path: "/admin/interest-rates",
          icon: TrendingUp
        },
        {
          name: "External Borrowers",
          path: "/admin/external-borrowers",
          icon: UserCheck
        },
        {
          name: "External Loans",
          path: "/admin/external-loans",
          icon: CreditCard
        },
        {
          name: "Alerts",
          path: "/admin/alerts",
          icon: AlertTriangle
        },
        {
          name: "Reports",
          path: "/admin/reports",
          icon: Download
        },
      ]
    : [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
          show: true
        },
        {
          name: "Members",
          path: "/admin/members",
          icon: Users,
          show: hasPermission('manage_members')
        },
        {
          name: "Contributions",
          path: "/admin/contributions",
          icon: Wallet,
          show: hasPermission('manage_contributions')
        },
        {
          name: "Loans",
          path: "/admin/loans",
          icon: HandCoins,
          show: hasPermission('manage_loans')
        },
        {
          name: "Withdrawals",
          path: "/admin/withdrawals",
          icon: Wallet,
          show: hasPermission('manage_members')
        },
        {
          name: "Charity",
          path: "/admin/charity",
          icon: Heart,
          show: hasPermission('manage_members')
        },
        {
          name: "Ledger",
          path: "/admin/ledger",
          icon: BookOpen,
          show: hasPermission('view_reports')
        },
        {
          name: "Sessions",
          path: "/admin/sessions",
          icon: CalendarRange,
          show: hasPermission('manage_sessions')
        },
        {
          name: "Interest Rates",
          path: "/admin/interest-rates",
          icon: TrendingUp,
          show: hasPermission('manage_loans')
        },
        {
          name: "External Borrowers",
          path: "/admin/external-borrowers",
          icon: UserCheck,
          show: hasPermission('manage_loans')
        },
        {
          name: "External Loans",
          path: "/admin/external-loans",
          icon: CreditCard,
          show: hasPermission('manage_loans')
        },
        {
          name: "Alerts",
          path: "/admin/alerts",
          icon: AlertTriangle,
          show: hasPermission('view_reports')
        },
        {
          name: "Reports",
          path: "/admin/reports",
          icon: Download,
          show: hasPermission('view_reports')
        },
        {
          name: "Social Fund",
          path: "/admin/social-fund",
          icon: Heart,
          show: hasPermission('manage_members')
        },
      ].filter(item => item.show !== false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("memberToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    localStorage.removeItem("permissions");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Community Fund</h2>
            <p className="text-xs text-gray-400">
              {role === "SUPER_ADMIN" ? "Super Admin" : "Admin Panel"}
            </p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              {userData.name ? userData.name.charAt(0).toUpperCase() : (role === "SUPER_ADMIN" ? "SA" : "A")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userData.name || (role === "SUPER_ADMIN" ? "Super Admin" : "Admin")}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userData.communityName || "System Administrator"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menu.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
