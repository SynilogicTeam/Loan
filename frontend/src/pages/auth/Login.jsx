import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      addToast(`Welcome back! Logged in as ${role}`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMsg = err.userMessage || err.response?.data?.message || "Login failed";
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border shadow-xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">
            Community Fund
          </h2>
          <p className="text-slate-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Login As</label>
            <select
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        {/* Registration Links */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-3">Don't have an account?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register/admin"
              className="text-center py-2.5 px-4 border-2 border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
            >
              Register as Admin
            </Link>
            <Link
              to="/register/member"
              className="text-center py-2.5 px-4 border-2 border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium"
            >
              Register as Member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

