export default function Topbar() {
    const role = localStorage.getItem("role");
    const isSuper = role === "SUPER_ADMIN";
    
    return (
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-slate-700">
          {isSuper ? "Super Admin Dashboard" : "Admin Dashboard"}
        </h1>
  
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">
              {isSuper ? "Super Admin" : "Admin"}
            </p>
            <p className="text-xs text-slate-500">
              {isSuper ? "System Administrator" : "Community Administrator"}
            </p>
          </div>
  
          <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            {isSuper ? "SA" : "A"}
          </div>
        </div>
      </header>
    );
  }
  