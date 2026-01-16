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
  Building2,
  BarChart3,
  RefreshCw
} from "lucide-react";

export default function SuperAdminSocialFunds() {
  const [socialFunds, setSocialFunds] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [socialFundsRes, communitiesRes, statsRes] = await Promise.all([
        fetch('/api/socialfunds/platform/all', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/socialfunds/platform/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      if (socialFundsRes.ok) {
        const data = await socialFundsRes.json();
        setSocialFunds(data);
      }
      
      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setCommunities(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

    } catch (error) {
      console.error("Failed to load social funds data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    loadData();
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

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || colors.MEDIUM}`}>
        {priority}
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
    
    alert(`Social Fund Details:\n\nName: ${fund.name}\nDescription: ${fund.description}\nCommunity: ${fund.communityId?.name}\nCategory: ${fund.category}\nPriority: ${fund.priority}\nStatus: ${fund.status}\n\nTarget: ₹${fund.targetAmount.toLocaleString()}\nRaised: ₹${fund.currentAmount.toLocaleString()}\nCompletion: ${completionPercentage}%\n\nContributors: ${contributors}\nExpenses: ${expenses}\n\nCreated: ${new Date(fund.createdAt).toLocaleDateString()}`);
  };

  const filteredFunds = socialFunds.filter(fund => {
    if (selectedCommunity !== 'all' && fund.communityId?._id !== selectedCommunity) return false;
    if (selectedStatus !== 'all' && fund.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && fund.category !== selectedCategory) return false;
    return true;
  });

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
            Social Funds Management
          </h2>
          <p className="text-slate-600 mt-1">
            Monitor and manage social funds across all communities
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Social Funds</p>
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
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Target Amount</p>
              <p className="text-2xl font-bold text-slate-900">₹{(stats.totalTargetAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Community</label>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Communities</option>
              {communities.map(community => (
                <option key={community._id} value={community._id}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="EDUCATION">Education</option>
              <option value="HEALTHCARE">Healthcare</option>
              <option value="COMMUNITY_EVENT">Community Event</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-slate-600">
              Showing {filteredFunds.length} of {socialFunds.length} funds
            </div>
          </div>
        </div>
      </div>

      {/* Social Funds Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">All Social Funds ({filteredFunds.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fund Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Community</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFunds.map((fund) => (
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
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{fund.communityId?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(fund.category)}
                  </td>
                  <td className="px-6 py-4">
                    {getPriorityBadge(fund.priority)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFunds.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Heart className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium">No social funds found</p>
            <p className="text-sm">No social funds match the selected filters</p>
          </div>
        )}
      </div>

      {/* Community-wise Statistics */}
      {stats.communityStats && stats.communityStats.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Community-wise Social Fund Statistics
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.communityStats.map((community) => (
                <div key={community._id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{community.communityName}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {community.totalFunds} funds
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-medium">₹{community.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Active Funds:</span>
                      <span className="font-medium">{community.activeFunds}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}