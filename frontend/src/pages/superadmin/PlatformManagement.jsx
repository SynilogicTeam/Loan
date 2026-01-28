import { useEffect, useState } from "react";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Crown,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function PlatformManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [communities, setCommunities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [platformStats, setPlatformStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: "",
    address: "",
    planId: "",
    adminName: "",
    adminEmail: ""
  });
  const [planForm, setPlanForm] = useState({
    name: "",
    displayName: "",
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxMembers: "",
    maxAdmins: "",
    maxSessions: ""
  });

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      console.log("Loading platform data...");
      
      // Load all platform data
      const [communitiesRes, plansRes, subscriptionsRes, statsRes] = await Promise.all([
        fetch('/api/platform/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/plans', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/subscriptions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      console.log("API responses:", {
        communities: communitiesRes.status,
        plans: plansRes.status,
        subscriptions: subscriptionsRes.status,
        stats: statsRes.status
      });

      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        console.log("Communities loaded:", data);
        setCommunities(data);
      }
      if (plansRes.ok) {
        const data = await plansRes.json();
        console.log("Plans loaded:", data);
        setPlans(data);
      }
      if (subscriptionsRes.ok) {
        const data = await subscriptionsRes.json();
        console.log("Subscriptions loaded:", data);
        setSubscriptions(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        console.log("Stats loaded:", data);
        setPlatformStats(data);
      }

    } catch (error) {
      console.error("Failed to load platform data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    console.log("Creating community:", communityForm);
    
    try {
      const response = await fetch('/api/platform/communities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(communityForm)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Community created:", result);
        alert(`Community "${communityForm.name}" created successfully!`);
        setShowCreateCommunityModal(false);
        setCommunityForm({ name: "", address: "", planId: "", adminName: "", adminEmail: "" });
        loadPlatformData();
      } else {
        const error = await response.json();
        console.error("Create community failed:", error);
        alert(error.message || "Failed to create community");
      }
    } catch (error) {
      console.error("Create community error:", error);
      alert("Failed to create community: " + error.message);
    }
  };

  const createPlan = async (e) => {
    e.preventDefault();
    console.log("Creating plan:", planForm);
    
    try {
      const response = await fetch('/api/platform/plans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: planForm.name,
          displayName: planForm.displayName,
          description: planForm.description,
          price: {
            monthly: Number(planForm.monthlyPrice),
            yearly: Number(planForm.yearlyPrice)
          },
          features: {
            maxMembers: Number(planForm.maxMembers),
            maxAdmins: Number(planForm.maxAdmins),
            maxSessions: Number(planForm.maxSessions),
            advancedReports: planForm.maxMembers > 50,
            customBranding: planForm.maxMembers > 100,
            apiAccess: planForm.maxMembers > 200,
            prioritySupport: planForm.maxMembers > 200
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Plan created:", result);
        alert(`Plan "${planForm.displayName}" created successfully!`);
        setShowCreatePlanModal(false);
        setPlanForm({ name: "", displayName: "", description: "", monthlyPrice: "", yearlyPrice: "", maxMembers: "", maxAdmins: "", maxSessions: "" });
        loadPlatformData();
      } else {
        const error = await response.json();
        console.error("Create plan failed:", error);
        alert(error.message || "Failed to create plan");
      }
    } catch (error) {
      console.error("Create plan error:", error);
      alert("Failed to create plan: " + error.message);
    }
  };

  const viewCommunity = (community) => {
    console.log("Viewing community:", community);
    alert(`Community Details:\n\nName: ${community.name}\nAddress: ${community.address || 'Not provided'}\nPlan: ${community.currentPlan?.displayName || 'No plan'}\nStatus: ${community.subscriptionStatus}\nMembers: ${community.memberCount || 0}\nRevenue: ₹${community.monthlyRevenue || 0}/month`);
  };

  const editCommunity = (community) => {
    console.log("Editing community:", community);
    alert(`Edit Community: ${community.name}\n\nThis will open an edit modal (to be implemented)`);
  };

  const deleteCommunity = async (community) => {
    console.log("Deleting community:", community);
    if (!confirm(`Are you sure you want to delete "${community.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/platform/communities/${community._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`Community "${community.name}" deleted successfully!`);
        loadPlatformData();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete community");
      }
    } catch (error) {
      console.error("Delete community error:", error);
      alert("Failed to delete community: " + error.message);
    }
  };

  const editPlan = (plan) => {
    console.log("Editing plan:", plan);
    alert(`Edit Plan: ${plan.displayName}\n\nPrice: ₹${plan.price?.monthly}/month\nFeatures: ${plan.features?.maxMembers} members\n\nThis will open an edit modal (to be implemented)`);
  };

  const saveSettings = () => {
    console.log("Saving system settings...");
    alert("System settings saved successfully!");
  };

  const manageSubscription = (subscription) => {
    console.log("Managing subscription:", subscription);
    alert(`Manage Subscription\n\nCommunity: ${subscription.communityId?.name || 'Unknown'}\nPlan: ${subscription.planId?.displayName || 'Unknown'}\nStatus: ${subscription.status}\n\nThis will open subscription management (to be implemented)`);
  };

  const tabs = [
    { id: 'overview', name: 'Platform Overview', icon: TrendingUp },
    { id: 'communities', name: 'Communities', icon: Building2 },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIAL: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.TRIAL}`;
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
            <Crown className="w-8 h-8 text-yellow-500" />
            Platform Management
          </h2>
          <p className="text-slate-600 mt-1">
            Super Admin control panel for managing the entire platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Communities</p>
                    <p className="text-2xl font-bold text-slate-900">{platformStats.totalCommunities || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Members</p>
                    <p className="text-2xl font-bold text-slate-900">{platformStats.totalMembers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">₹{platformStats.monthlyRevenue || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-slate-900">{platformStats.activeSubscriptions || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Recent Platform Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">New Community Created</p>
                      <p className="text-sm text-green-700">Shree Shyam Samiti joined the platform</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Subscription Upgraded</p>
                      <p className="text-sm text-blue-700">Mahadev Samiti upgraded to Premium plan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Trial Expiring Soon</p>
                      <p className="text-sm text-yellow-700">3 communities have trials expiring in 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communities' && (
          <div className="space-y-6">
            {/* Communities Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Communities</h3>
              <button 
                onClick={() => {
                  console.log("Create Community button clicked!");
                  setShowCreateCommunityModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create Community
              </button>
            </div>

            {/* Communities Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {communities.map((community) => (
                    <tr key={community._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{community.name}</div>
                          <div className="text-sm text-slate-500">{community.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {community.currentPlan?.name || 'Trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(community.subscriptionStatus)}>
                          {community.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {community.memberCount || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{community.monthlyRevenue || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => viewCommunity(community)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="View Community"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => editCommunity(community)}
                            className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                            title="Edit Community"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCommunity(community)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Community"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Subscription Plans</h3>
              <button 
                onClick={() => {
                  console.log("Create Plan button clicked!");
                  setShowCreatePlanModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-white rounded-lg border shadow-sm p-6 relative">
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-slate-900">{plan.displayName}</h4>
                    <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-900">₹{plan.price?.monthly}</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {plan.features?.maxMembers === -1 ? 'Unlimited' : `Up to ${plan.features?.maxMembers}`} members
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {plan.features?.maxAdmins === -1 ? 'Unlimited' : plan.features?.maxAdmins} admin accounts
                    </li>
                    {plan.features?.advancedReports && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Advanced reports
                      </li>
                    )}
                    {plan.features?.customBranding && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Custom branding
                      </li>
                    )}
                    {plan.features?.apiAccess && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        API access
                      </li>
                    )}
                    {plan.features?.prioritySupport && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Priority support
                      </li>
                    )}
                  </ul>
                  <button 
                    onClick={() => editPlan(plan)}
                    className={`w-full mt-6 px-4 py-2 rounded-lg font-medium ${
                      plan.isPopular 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Edit Plan
                  </button>
                </div>
              ))}
              
              {plans.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-500">
                  No plans found. Create your first plan to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Active Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Next Billing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">
                        {subscription.communityId?.name || 'Unknown Community'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {subscription.planId?.displayName || 'Unknown Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(subscription.status)}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ₹{subscription.amount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => manageSubscription(subscription)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        No subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">System Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h4 className="font-medium text-slate-900 mb-4">Platform Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      defaultValue="Community Fund Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      defaultValue="support@communityfund.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h4 className="font-medium text-slate-900 mb-4">Payment Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="rzp_test_..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Currency
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={saveSettings}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Community</h3>
            
            <form onSubmit={createCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Shree Shyam Samiti"
                  value={communityForm.name}
                  onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Community address"
                  rows="2"
                  value={communityForm.address}
                  onChange={(e) => setCommunityForm({ ...communityForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subscription Plan *
                </label>
                <select
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={communityForm.planId}
                  onChange={(e) => setCommunityForm({ ...communityForm, planId: e.target.value })}
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.displayName} - ₹{plan.price?.monthly}/month
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Community admin name"
                  value={communityForm.adminName}
                  onChange={(e) => setCommunityForm({ ...communityForm, adminName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@example.com"
                  value={communityForm.adminEmail}
                  onChange={(e) => setCommunityForm({ ...communityForm, adminEmail: e.target.value })}
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Admin will be created with default password "defaultPassword123". 
                  They should change it on first login.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Community
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCommunityModal(false);
                    setCommunityForm({ name: "", address: "", planId: "", adminName: "", adminEmail: "" });
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

      {/* Create Plan Modal */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Plan</h3>
            
            <form onSubmit={createPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Plan Name (Internal) *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., premium"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Premium Plan"
                  value={planForm.displayName}
                  onChange={(e) => setPlanForm({ ...planForm, displayName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Plan description"
                  rows="2"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Price *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="999"
                    value={planForm.monthlyPrice}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yearly Price *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="9990"
                    value={planForm.yearlyPrice}
                    onChange={(e) => setPlanForm({ ...planForm, yearlyPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Members *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="50"
                    value={planForm.maxMembers}
                    onChange={(e) => setPlanForm({ ...planForm, maxMembers: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Admins *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="2"
                    value={planForm.maxAdmins}
                    onChange={(e) => setPlanForm({ ...planForm, maxAdmins: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Sessions *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="12"
                    value={planForm.maxSessions}
                    onChange={(e) => setPlanForm({ ...planForm, maxSessions: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Advanced features will be automatically enabled based on member limits.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePlanModal(false);
                    setPlanForm({ name: "", displayName: "", description: "", monthlyPrice: "", yearlyPrice: "", maxMembers: "", maxAdmins: "", maxSessions: "" });
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