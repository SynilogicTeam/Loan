import { useEffect, useState } from "react";
import {
  getActiveSession,
  createSession,
  closeSession,
  getSessionActivities,
  getSessionStats,
} from "../../api/session.api";
import { 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function Sessions() {
  const [active, setActive] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    openingBalance: "",
  });

  const loadActive = async () => {
    try {
      setLoading(true);
      const res = await getActiveSession();
      setActive(res.data);
    } catch {
      setActive(null); // no active session
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await getSessionActivities();
      setActivities(res.data.activities || []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getSessionStats();
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      setStats(null);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadActive(), loadActivities(), loadStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.startDate) {
      alert("Name and start date required");
      return;
    }

    await createSession({
      name: form.name,
      startDate: form.startDate,
      openingBalance: Number(form.openingBalance || 0),
    });

    setForm({ name: "", startDate: "", openingBalance: "" });
    refreshData();
  };

  const close = async () => {
    if (!active?._id) return;
    if (!confirm("Close current session?")) return;

    await closeSession(active._id);
    setActive(null);
    refreshData();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'contribution':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'loan':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'emi':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Session Management
        </h2>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ACTIVE SESSION */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Active Session
        </h3>

        {loading && <p>Loading…</p>}

        {!loading && !active && (
          <p className="text-slate-500">No active session</p>
        )}

        {!loading && active && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Name</p>
              <p className="text-lg font-semibold text-blue-900">{active.name}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Start Date</p>
              <p className="text-lg font-semibold text-green-900">
                {new Date(active.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">End Date</p>
              <p className="text-lg font-semibold text-orange-900">
                {active.endDate ? new Date(active.endDate).toLocaleDateString() : "Active Session"}
              </p>
            </div>
          </div>
        )}

        {active && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={close}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Close Session
            </button>
          </div>
        )}
      </div>

      {/* SESSION STATISTICS */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Session Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Contributions</span>
              </div>
              <p className="text-2xl font-bold text-green-900">₹{stats.contributions.total}</p>
              <p className="text-sm text-green-700">{stats.contributions.count} contributions</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Loans</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">₹{stats.loans.totalAmount}</p>
              <p className="text-sm text-blue-700">
                {stats.loans.approved} approved, {stats.loans.pending} pending
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">EMI Payments</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">₹{stats.emiPayments.total}</p>
              <p className="text-sm text-purple-700">{stats.emiPayments.count} payments</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Active Members</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.members.active}</p>
              <p className="text-sm text-orange-700">community members</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Opening Balance</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">₹{stats.sessionInfo.openingBalance}</p>
              <p className="text-sm text-indigo-700">{stats.sessionInfo.daysActive} days active</p>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Recent Activity (Last 7 Days)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-semibold text-slate-900">{stats.recentActivity.contributions}</p>
                <p className="text-sm text-slate-600">New Contributions</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-semibold text-slate-900">{stats.recentActivity.loans}</p>
                <p className="text-sm text-slate-600">Loan Applications</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-semibold text-slate-900">{stats.recentActivity.emiPayments}</p>
                <p className="text-sm text-slate-600">EMI Payments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME ACTIVITIES */}
      {activities.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activities
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.amount && (
                      <p className="text-sm font-semibold text-slate-900">₹{activity.amount}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE SESSION */}
      {!active && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Session
          </h3>
          
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Name
              </label>
              <input
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2024-25 Financial Year"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opening Balance
              </label>
              <input
                type="number"
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={form.openingBalance}
                onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              />
            </div>

            <div className="md:col-span-3">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
