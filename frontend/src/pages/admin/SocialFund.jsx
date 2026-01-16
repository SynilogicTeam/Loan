import { useEffect, useState } from "react";
import { 
  Heart, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw
} from "lucide-react";

export default function SocialFund() {
  const [socialFunds, setSocialFunds] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAmount: "",
    category: "OTHER",
    priority: "MEDIUM",
    targetDate: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [socialFundsRes, statsRes] = await Promise.all([
        fetch('/api/socialfunds', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/socialfunds/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      if (socialFundsRes.ok) {
        const data = await socialFundsRes.json();
        setSocialFunds(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

    } catch (error) {
      console.error("Failed to load social funds:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    loadData();
  };

  const createSocialFund = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/socialfunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Social Fund "${form.name}" created successfully!`);
        setShowCreateModal(false);
        setForm({ name: "", description: "", targetAmount: "", category: "OTHER", priority: "MEDIUM", targetDate: "" });
        loadData();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create social fund");
      }
    } catch (error) {
      console.error("Create social fund error:", error);
      alert("Failed to create social fund: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      PAUSED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    
    const style = styles[status] || styles.ACTIVE;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      EMERGENCY: 'bg-red-100 text-red-800',
      INFRASTRUCTURE: 'bg-blue-100 text-blue-800',
      EDUCATION: 'bg-purple-100 text-purple-800',
      HEALTHCARE: 'bg-green-100 text-green-800',
      COMMUNITY_EVENT: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[category] || colors.OTHER}`}>
        {category.replace('_', ' ')}
      </span>
    );
  };

  const getProgressBar = (current, target) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const viewSocialFund = (fund) => {
    const contributors = fund.contributors?.length || 0;
    const expenses = fund.expenses?.length || 0;
    const completionPercentage = fund.targetAmount > 0 ? ((fund.currentAmount / fund.targetAmount) * 100).toFixed(1) : 0;
    
    alert(`Social Fund Details:\n\nName: ${fund.name}\nDescription: ${fund.description}\nCategory: ${fund.category}\nPriority: ${fund.priority}\nStatus: ${fund.status}\n\nTarget: ₹${fund.targetAmount.toLocaleString()}\nRaised: ₹${fund.currentAmount.toLocaleString()}\nCompletion: ${completionPercentage}%\n\nContributors: ${contributors}\nExpenses: ${expenses}\n\nCreated: ${new Date(fund.createdAt).toLocaleDateString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Social Fund Management
          </h2>
          <p className="text-slate-600 mt-1">
            Create and manage social funds for your community
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Create Social Fund
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Funds</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalFunds || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Raised</p>
              <p className="text-2xl font-bold text-slate-900">₹{(stats.totalCurrentAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Funds</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeFunds || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Funds Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Community Social Funds ({socialFunds.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fund Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {socialFunds.map((fund) => (
                <tr key={fund._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{fund.name}</div>
                      <div className="text-sm text-slate-500 max-w-xs truncate">{fund.description}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Created: {new Date(fund.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(fund.category)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fund.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      fund.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      fund.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fund.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>₹{fund.currentAmount.toLocaleString()}</span>
                        <span>₹{fund.targetAmount.toLocaleString()}</span>
                      </div>
                      {getProgressBar(fund.currentAmount, fund.targetAmount)}
                      <div className="text-xs text-slate-500 mt-1">
                        {fund.targetAmount > 0 ? ((fund.currentAmount / fund.targetAmount) * 100).toFixed(1) : 0}% complete
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(fund.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="View Details"
                        onClick={() => viewSocialFund(fund)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                        title="Edit Fund"
                        onClick={() => alert(`Edit functionality for ${fund.name} will be implemented`)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {socialFunds.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Heart className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium">No social funds found</p>
            <p className="text-sm">Create your first social fund to get started</p>
          </div>
        )}
      </div>

      {/* Create Social Fund Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Social Fund</h3>
            
            <form onSubmit={createSocialFund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fund Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Community Hall Renovation"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the purpose and details of this social fund"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Amount *
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="50000"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="OTHER">Other</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="EDUCATION">Education</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="COMMUNITY_EVENT">Community Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Social Fund
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({ name: "", description: "", targetAmount: "", category: "OTHER", priority: "MEDIUM", targetDate: "" });
                  }}
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
  