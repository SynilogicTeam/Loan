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
  XCircle,
  Shield,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

export default function SuperAdminSessions() {
  const [allSessions, setAllSessions] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [communities, setCommunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    openingBalance: "",
    communityId: "",
  });

  const loadCommunities = async () => {
    try {
      console.log("Loading communities...");
      // This should be a Super Admin API call to get all communities
      const response = await fetch('/api/platform/communities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Communities response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Communities loaded:", data);
        setCommunities(data);
      } else {
        console.error("Failed to load communities:", response.status);
        const error = await response.text();
        console.error("Error details:", error);
      }
    } catch (error) {
      console.error("Failed to load communities:", error);
    }
  };

  const loadAllSessions = async () => {
    try {
      setLoading(true);
      console.log("Loading all sessions...");
      
      // Super Admin should see all sessions across all communities
      const response = await fetch('/api/sessions/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Sessions response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Sessions loaded:", data);
        setAllSessions(data);
      } else {
        console.error("Failed to load sessions:", response.status);
        const error = await response.text();
        console.error("Error details:", error);
        setAllSessions([]);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setAllSessions([]);
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
    await Promise.all([loadAllSessions(), loadCommunities(), loadActivities(), loadStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    console.log("Super Admin Sessions page loaded");
    console.log("Current role:", localStorage.getItem("role"));
    console.log("Admin token:", localStorage.getItem("adminToken") ? "Present" : "Missing");
    
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const createSessionForCommunity = async (e) => {
    e.preventDefault();
    console.log("Create session form submitted");
    console.log("Form data:", form);

    if (!form.name || !form.startDate || !form.communityId) {
      alert("Name, start date, and community are required");
      return;
    }

    try {
      console.log("Calling create session API...");
      // Super Admin creates session for specific community
      const response = await fetch('/api/sessions/create-for-community', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate,
          openingBalance: Number(form.openingBalance || 0),
          communityId: form.communityId
        })
      });

      console.log("Create session response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Session created successfully:", result);
        setForm({ name: "", startDate: "", openingBalance: "", communityId: "" });
        setShowCreateModal(false);
        refreshData();
        alert("Session created successfully!");
      } else {
        const error = await response.json();
        console.error("Create session failed:", error);
        alert(error.message || "Failed to create session");
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session: " + error.message);
    }
  };

  const closeSessionById = async (sessionId) => {
    console.log("Attempting to close session:", sessionId);
    
    if (!confirm("Close this session?")) {
      console.log("User cancelled session close");
      return;
    }

    try {
      console.log("Calling closeSession API...");
      await closeSession(sessionId);
      console.log("Session closed successfully");
      refreshData();
      alert("Session closed successfully!");
    } catch (error) {
      console.error("Failed to close session:", error);
      alert("Failed to close session: " + error.message);
    }
  };

  const getStatusBadge = (session) => {
    if (session.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Closed</span>;
    }
  };

  const filteredSessions = selectedCommunity === 'all' 
    ? allSessions 
    : allSessions.filter(session => session.communityId === selectedCommunity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Super Admin - Session Management
          </h2>
          <p className="text-sm text-slate-600 mt-1">Manage sessions across all communities</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              console.log("Refresh button clicked!");
              refreshData();
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              console.log("Create Session button clicked!");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </button>
          <button
            onClick={() => {
              console.log("Test button clicked!");
              console.log("Current sessions:", allSessions);
              console.log("Current communities:", communities);
              console.log("Current stats:", stats);
              alert("Test button working! Check console for data.");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test
          </button>
        </div>
      </div>

      {/* Community Filter */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by Community:</label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Communities</option>
            {communities.map(community => (
              <option key={community._id} value={community._id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* System-wide Session Statistics */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            System-wide Session Statistics
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
              <p className="text-sm text-orange-700">across all communities</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Active Sessions</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {allSessions.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-indigo-700">running sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* All Sessions Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            All Sessions ({filteredSessions.length})
          </h3>
        </div>

        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading sessions...</p>
          </div>
        )}

        {!loading && filteredSessions.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            No sessions found for the selected community.
          </div>
        )}

        {!loading && filteredSessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Session Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Community
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Opening Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{session.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {communities.find(c => c._id === session.communityId)?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(session.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {session.endDate ? new Date(session.endDate).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      ₹{session.openingBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            console.log("View session clicked:", session);
                            alert(`Viewing session: ${session.name}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="View Session Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {session.isActive && (
                          <button 
                            onClick={() => {
                              console.log("Close session clicked:", session._id);
                              closeSessionById(session._id);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Close Session"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Activities */}
      {activities.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent System Activities
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.slice(0, 20).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {activity.type === 'contribution' && <DollarSign className="w-4 h-4 text-green-600" />}
                  {activity.type === 'loan' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'emi' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-slate-900 mt-1">₹{activity.amount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Session</h3>
            
            <form onSubmit={createSessionForCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Community
                </label>
                <select
                  value={form.communityId}
                  onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Community</option>
                  {communities.map(community => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
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

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}