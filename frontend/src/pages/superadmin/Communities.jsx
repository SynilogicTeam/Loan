import { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  DollarSign, 
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown
} from "lucide-react";

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    planId: "",
    adminName: "",
    adminEmail: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [communitiesRes, plansRes] = await Promise.all([
        fetch('/api/platform/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/plans', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setCommunities(data);
      }
      
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data);
      }

    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (editingCommunity) {
        // Update existing community
        console.log("Updating community:", editingCommunity._id, form);
        response = await fetch(`/api/platform/communities/${editingCommunity._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: form.name,
            description: form.address, // Using address as description
            location: form.address,
            planId: form.planId,
            adminName: form.adminName,
            adminEmail: form.adminEmail
          })
        });
      } else {
        // Create new community
        console.log("Creating community:", form);
        response = await fetch('/api/platform/communities', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (editingCommunity) {
          alert(`Community "${form.name}" updated successfully!`);
        } else {
          alert(`Community "${form.name}" created successfully!\nAdmin Email: ${form.adminEmail}\nDefault Password: defaultPassword123`);
        }
        setShowCreateModal(false);
        setEditingCommunity(null);
        setForm({ name: "", address: "", planId: "", adminName: "", adminEmail: "" });
        loadData();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${editingCommunity ? 'update' : 'create'} community`);
      }
    } catch (error) {
      console.error(`${editingCommunity ? 'Update' : 'Create'} community error:`, error);
      alert(`Failed to ${editingCommunity ? 'update' : 'create'} community`);
    }
  };

  const toggleCommunityStatus = async (communityId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
      
      const response = await fetch(`/api/platform/communities/${communityId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Community ${newStatus.toLowerCase()} successfully!`);
        loadData();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Failed to update community status");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      TRIAL: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };
    
    const style = styles[status] || styles.TRIAL;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    if (!plan) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">No Plan</span>;
    
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[plan.name] || 'bg-gray-100 text-gray-800'}`}>
        {plan.displayName}
      </span>
    );
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
            <Building2 className="w-8 h-8 text-indigo-600" />
            Communities Management
          </h2>
          <p className="text-slate-600 mt-1">
            Create and manage all communities on the platform
          </p>
        </div>
        <button
          onClick={() => {
            console.log("Create Community button clicked!");
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create Community
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Communities</p>
              <p className="text-2xl font-bold text-slate-900">{communities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Communities</p>
              <p className="text-2xl font-bold text-slate-900">
                {communities.filter(c => c.subscriptionStatus === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Trial Communities</p>
              <p className="text-2xl font-bold text-slate-900">
                {communities.filter(c => c.subscriptionStatus === 'TRIAL').length}
              </p>
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
              <p className="text-2xl font-bold text-slate-900">
                ₹{communities.reduce((sum, c) => sum + (c.monthlyRevenue || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">All Communities ({communities.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Community</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admin</th>
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
                      <div className="text-sm text-slate-500">
                        {community.location || community.address || 'No location set'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Created: {new Date(community.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(community.currentPlan)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(community.subscriptionStatus)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{community.memberCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">{community.admin?.name || 'No Admin'}</div>
                      <div className="text-slate-500">{community.admin?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">₹{community.monthlyRevenue || 0}/month</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="View Details"
                        onClick={() => alert(`Community: ${community.name}\nMembers: ${community.memberCount}\nPlan: ${community.currentPlan?.displayName}\nStatus: ${community.subscriptionStatus}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                        title="Edit Community"
                        onClick={() => {
                          setEditingCommunity(community);
                          setForm({
                            name: community.name,
                            address: community.location || community.address || "",
                            planId: community.currentPlan?._id || "",
                            adminName: community.admin?.name || "",
                            adminEmail: community.admin?.email || ""
                          });
                          setShowCreateModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className={`p-1 rounded hover:bg-opacity-50 ${
                          community.subscriptionStatus === 'ACTIVE' 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={community.subscriptionStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleCommunityStatus(community._id, community.subscriptionStatus)}
                      >
                        {community.subscriptionStatus === 'ACTIVE' ? 
                          <XCircle className="w-4 h-4" /> : 
                          <CheckCircle className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {communities.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium">No communities found</p>
            <p className="text-sm">Create your first community to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCommunity ? 'Edit Community' : 'Create New Community'}
            </h3>
            
            <form onSubmit={createCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Shree Shyam Samiti"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Mumbai, Maharashtra, India"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter the city, state, and country</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subscription Plan *
                </label>
                <select
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.planId}
                  onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.displayName} - ₹{plan.price.monthly}/month
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
                  value={form.adminName}
                  onChange={(e) => setForm({ ...form, adminName: e.target.value })}
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
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  required
                />
              </div>

              {!editingCommunity && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Admin will be created with default password "defaultPassword123". 
                    They should change it on first login.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {editingCommunity ? 'Update Community' : 'Create Community'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCommunity(null);
                    setForm({ name: "", address: "", planId: "", adminName: "", adminEmail: "" });
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