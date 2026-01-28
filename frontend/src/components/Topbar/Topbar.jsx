import { Bell, Search, Settings, User, ChevronDown, Crown, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');
  const isSuper = role === "SUPER_ADMIN";
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug function to check auth state
  const debugAuth = () => {
    console.log("🔍 AUTH DEBUG:", {
      role: localStorage.getItem("role"),
      adminToken: localStorage.getItem("adminToken")?.substring(0, 20) + "...",
      userData: localStorage.getItem("userData"),
      isSuper
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("memberToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(isSuper ? "/admin/super-admin-profile" : "/admin/admin-profile");
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/admin/settings");
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {isSuper ? "System Dashboard" : "Community Dashboard"}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={handleNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-800">New member registration</p>
                  <p className="text-xs text-gray-500 mt-1">John Doe has registered</p>
                  <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-800">Payment received</p>
                  <p className="text-xs text-gray-500 mt-1">₹5,000 contribution received</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/admin/notifications');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button 
          onClick={handleSettings}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                {userData.name || (isSuper ? "Super Admin" : "Admin")}
                {isSuper && <Crown className="w-4 h-4 text-yellow-500" />}
              </p>
              <p className="text-xs text-gray-500">
                {isSuper ? "System Administrator" : "Community Administrator"}
              </p>
            </div>

            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
              isSuper ? "bg-yellow-500" : "bg-blue-500"
            }`}>
              {userData.name ? userData.name.charAt(0).toUpperCase() : (isSuper ? "SA" : "A")}
            </div>

            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                    isSuper ? "bg-yellow-500" : "bg-blue-500"
                  }`}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : (isSuper ? "SA" : "A")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {userData.name || (isSuper ? "Super Admin" : "Admin")}
                    </p>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={handleProfile}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  onClick={handleSettings}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-2 border-gray-100" />
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        ></div>
      )}
    </header>
  );
}
  