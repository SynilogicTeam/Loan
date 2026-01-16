import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "";
      let tokenKey = "";
      let redirectPath = "";

      if (role === "SUPER_ADMIN") {
        url = "/admin/login"; // Fixed: Super Admin uses same endpoint as Admin
        tokenKey = "adminToken";
        redirectPath = "/admin/dashboard";
      } 
      else if (role === "ADMIN") {
        url = "/admin/login";
        tokenKey = "adminToken";
        redirectPath = "/admin/dashboard";
      } 
      else if (role === "MEMBER") {
        url = "/members/login";
        tokenKey = "memberToken";
        redirectPath = "/member/dashboard";
      }

      const res = await api.post(url, { email, password });

      console.log("LOGIN RESPONSE 👉", res.data);

      // 🔐 STORE TOKEN & ROLE
      localStorage.setItem(tokenKey, res.data.token);
      localStorage.setItem("role", role);
      
      // 🔐 STORE PERMISSIONS (for admins)
      if (res.data.permissions) {
        localStorage.setItem("permissions", JSON.stringify(res.data.permissions));
        console.log("STORED PERMISSIONS 👉", res.data.permissions);
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white w-full max-w-md p-8 rounded-xl border shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Community Fund Manager
          </h2>
          <p className="text-slate-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Login As</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Registration Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-3">Don't have an account?</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register/admin"
              className="text-center py-2 px-4 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
            >
              Register as Admin
            </Link>
            <Link
              to="/register/member"
              className="text-center py-2 px-4 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium"
            >
              Register as Member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
