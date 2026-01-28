import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../api/dashboard.api";
import { getCommunities } from "../../api/community.api";
import api from "../../api/axios";

// Components
import StatCard from "../../components/Cards/StatCard";
import FundChart from "../../components/Charts/FundChart";
import CommunityStatsTable from "../../components/Tables/CommunityStatsTable";
import AuditLogsTable from "../../components/Tables/AuditLogsTable";
import NewFeaturesCard from "../../components/Cards/NewFeaturesCard";

// Icons
import {
  Users,
  Wallet,
  HandCoins,
  AlertTriangle,
  Plus,
  RefreshCw,
  TrendingUp,
  Activity,
  Building2,
  Crown,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [hasCommunity, setHasCommunity] = useState(true); // Default to true to prevent flash
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: '',
    address: '',
    description: '',
    location: '',
    planId: ''
  });

  const role = localStorage.getItem("role"); // ADMIN | SUPER_ADMIN
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');
  // Removed duplicate hasCommunity declaration

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await api.get('/platform/plans/public');
      setPlans(response.data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDashboard();
      setData(res.data);

      // For Super Admin, also fetch communities data
      if (role === "SUPER_ADMIN") {
        try {
          const communitiesRes = await getCommunities();
          setCommunities(communitiesRes.data || []);
        } catch (err) {
          console.error("Failed to load communities:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin has community - redirect to onboarding if not
    // Check if admin has community
    const checkCommunity = async () => {
      if (role === "ADMIN") {
        try {
          const response = await api.get("/admin/community/status");
          setHasCommunity(response.data.hasCommunity);
          // Removed auto-redirect to allow dashboard exploration
        } catch (error) {
          console.error("Error checking community status:", error);
        }
      }
    };

    checkCommunity();
    load();
    loadPlans(); // Load plans when component mounts

    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      load();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();

    if (!communityForm.name.trim() || !communityForm.address.trim()) {
      alert('Community name and address are required');
      return;
    }

    if (!communityForm.planId) {
      alert('Please select a subscription plan');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/communities/create', communityForm);

      const selectedPlan = plans.find(p => p._id === communityForm.planId);
      alert(`Community created successfully with ${selectedPlan?.displayName} plan! You can now start adding members.`);

      // Update user data in localStorage
      const updatedUserData = {
        ...userData,
        communityId: response.data.community._id,
        communityName: response.data.community.name
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      // Refresh dashboard
      await load();
      setShowCreateCommunity(false);
      setCommunityForm({ name: '', address: '', description: '', location: '', planId: '' });

    } catch (error) {
      console.error('Error creating community:', error);
      alert(error.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CHART DATA
  ========================= */
  const chartData = data
    ? [
      { month: "Opening", amount: data.openingBalance || 0 },
      { month: "Contributions", amount: data.totalContributions || 0 },
      { month: "Loans", amount: data.totalLoans || 0 },
      { month: "Closing", amount: data.closingBalance || 0 },
    ]
    : [];

  /* =========================
     COMMUNITY TABLE DATA (REAL DATA FOR SUPER ADMIN)
  ========================= */
  const communityRows = role === "SUPER_ADMIN"
    ? (data?.communities || []).map(community => ({
      name: community.name,
      members: community.memberCount || 0,
      contributions: community.totalContributions || 0,
      loans: community.totalLoans || 0,
      balance: community.balance || 0,
    }))
    : [];

  /* =========================
     AUDIT LOGS (SUPER_ADMIN)
  ========================= */
  const auditRows = [
    {
      actor: "SuperAdmin",
      action: "CREATE_MEMBER",
      target: "Ramesh Kumar",
      ip: "103.21.45.11",
      createdAt: Date.now(),
    },
    {
      actor: "SuperAdmin",
      action: "APPROVE_LOAN",
      target: "Loan #4821",
      ip: "103.21.45.11",
      createdAt: Date.now(),
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-lg ${role === "SUPER_ADMIN"
            ? "bg-gradient-to-br from-yellow-500 to-orange-600"
            : "bg-gradient-to-br from-indigo-500 to-purple-600"
            }`}>
            {role === "SUPER_ADMIN" ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <Building2 className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {role === "SUPER_ADMIN" ? "System Control Center" : "Community Dashboard"}
            </h1>
            <p className="text-slate-600 font-medium">
              {role === "SUPER_ADMIN"
                ? "Monitor all communities and system-wide metrics"
                : "Overview of your community's financial activities"
              }
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Create Community Button - Only for admins without community */}
          {role === "ADMIN" && !hasCommunity && (
            <button
              onClick={() => setShowCreateCommunity(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Create Community
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Create Your Community</h3>
              <p className="text-slate-600 mt-2">Set up your community fund management</p>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={communityForm.name}
                  onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                  placeholder="Enter community name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={communityForm.address}
                  onChange={(e) => setCommunityForm({ ...communityForm, address: e.target.value })}
                  placeholder="Enter community address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={communityForm.location}
                  onChange={(e) => setCommunityForm({ ...communityForm, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  value={communityForm.description}
                  onChange={(e) => setCommunityForm({ ...communityForm, description: e.target.value })}
                  placeholder="Enter community description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subscription Plan *
                </label>
                {loadingPlans ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                    Loading plans...
                  </div>
                ) : (
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={communityForm.planId}
                    onChange={(e) => setCommunityForm({ ...communityForm, planId: e.target.value })}
                    required
                  >
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.displayName} - ₹{plan.price.monthly}/month ({plan.features.maxMembers === -1 ? 'Unlimited' : plan.features.maxMembers} members)
                      </option>
                    ))}
                  </select>
                )}
                {communityForm.planId && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const selectedPlan = plans.find(p => p._id === communityForm.planId);
                      return selectedPlan ? (
                        <div>
                          <p className="text-sm font-medium text-blue-800">{selectedPlan.displayName}</p>
                          <p className="text-xs text-blue-600 mt-1">{selectedPlan.description}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            Features: {selectedPlan.features.maxMembers === -1 ? 'Unlimited' : selectedPlan.features.maxMembers} members,
                            {selectedPlan.features.advancedReports ? ' Advanced Reports,' : ''}
                            {selectedPlan.features.customBranding ? ' Custom Branding,' : ''}
                            {selectedPlan.features.apiAccess ? ' API Access' : ''}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunity(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 font-semibold transition-all"
                >
                  {loading ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Community Message for Admins */}
      {role === "ADMIN" && !hasCommunity && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">Create Your Community</h3>
              <p className="text-purple-600 mt-1">
                You need to create a community first before you can start managing members and financial activities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Banner for Admins without Community */}
      {!hasCommunity && role === "ADMIN" && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Community Fund! 🚀</h2>
              <p className="text-blue-100 max-w-xl">
                You are currently in <strong>Viewer Mode</strong>. To start managing members, collecting contributions, and issuing loans, you need to set up your community and choose a subscription plan.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/onboarding")}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Complete Setup / Subscribe
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                {role === "SUPER_ADMIN" ? "Total Members (All)" : "Total Members"}
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "..." : data?.totalMembers ?? 0}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                {role === "SUPER_ADMIN" ? "Total Contributions (All)" : "Total Contributions"}
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "..." : `₹${(data?.totalContributions ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                {role === "SUPER_ADMIN" ? "Total Loans (All)" : "Total Loans"}
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "..." : `₹${(data?.totalLoans ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
              <HandCoins className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                {role === "SUPER_ADMIN" ? "Overdue EMIs (All)" : "Overdue EMIs"}
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "..." : data?.overdueEmis ?? 0}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {role === "SUPER_ADMIN" ? "System-wide Fund Flow" : "Fund Flow Analysis"}
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="font-medium">Loading chart data...</span>
            </div>
          </div>
        ) : (
          <FundChart data={chartData} />
        )}
      </div>

      {/* ================= NEW FEATURES CARD ================= */}
      <NewFeaturesCard />

      {/* ================= BALANCES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-green-700">
              {role === "SUPER_ADMIN" ? "Total Opening Balance" : "Opening Balance"}
            </p>
          </div>
          <p className="text-3xl font-bold text-green-800">
            ₹{(data?.openingBalance ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-blue-700">
              {role === "SUPER_ADMIN" ? "Total Closing Balance" : "Closing Balance"}
            </p>
          </div>
          <p className="text-3xl font-bold text-blue-800">
            ₹{(data?.closingBalance ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= COMMUNITY TABLE (SUPER ADMIN ONLY) ================= */}
      {role === "SUPER_ADMIN" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Community Overview</h3>
            </div>
          </div>
          <CommunityStatsTable
            rows={communityRows}
            loading={loading}
          />
        </div>
      )}

      {/* ================= AUDIT LOGS (SUPER_ADMIN ONLY) ================= */}
      {role === "SUPER_ADMIN" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Recent System Activity</h3>
            </div>
          </div>
          <AuditLogsTable rows={auditRows} loading={loading} />
        </div>
      )}
    </div>
  );
}
