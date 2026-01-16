import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Building2,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key
} from "lucide-react";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    communityId: "",
    permissions: [],
    isActive: true
  });

  const availablePermissions = [
    { key: 'manage_members', label: 'Manage Members' },
    { key: 'manage_contributions', label: 'Manage Contributions' },
    { key: 'manage_loans', label: 'Manage Loans' },
    { key: 'manage_sessions', label: 'Manage Sessions' },
    { key: 'view_reports', label: 'View Reports' },
    { key: 'manage_settings', label: 'Manage Settings' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [adminsRes, communitiesRes] = await Promise.all([
        fetch('/api/platform/admins', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/platform/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data);
      }
      
      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setCommunities(data);
      }

    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Form data being submitted:", form);
      console.log("Editing admin:", editingAdmin);
      
      const url = editingAdmin 
        ? `/api/platform/admins/${editingAdmin._id}`
        : '/api/platform/admins';
      
      const method = editingAdmin ? 'PUT' : 'POST';
      
      const requestBody = {
        ...form,
        password: form.password || (editingAdmin ? undefined : "defaultPassword123")
      };

      // Remove password from request if editing and no new password provided
      if (editingAdmin && !form.password) {
        delete requestBody.password;
      }

      console.log("Request URL:", url);
      console.log("Request method:", method);
      console.log("Request body:", requestBody);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Success result:", result);
        
        if (editingAdmin) {
          alert(`Admin "${form.name}" updated successfully!`);
        } else {
          const passwordUsed = form.password || "defaultPassword123";
          alert(`Admin "${form.name}" created successfully!\nEmail: ${form.email}\nPassword: ${passwordUsed}`);
        }
        
        setShowCreateModal(false);
        setEditingAdmin(null);
        setForm({ name: "", email: "", password: "", communityId: "", permissions: [], isActive: true });
        loadData();
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        
        // Better error messages
        let errorMessage = error.message || `Failed to ${editingAdmin ? 'update' : 'create'} admin`;
        
        if (error.message && error.message.includes('duplicate key error') && error.message.includes('email')) {
          errorMessage = "An admin with this email address already exists. Please use a different email.";
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error(`${editingAdmin ? 'Update' : 'Create'} admin error:`, error);
      alert(`Failed to ${editingAdmin ? 'update' : 'create'} admin: ${error.message}`);
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      const response = await fetch(`/api/platform/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (response.ok) {
        alert(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        loadData();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Failed to update admin status");
    }
  };

  const resetPassword = async (adminId, adminName) => {
    if (!confirm(`Reset password for ${adminName}? New password will be "defaultPassword123"`)) return;
    
    try {
      const response = await fetch(`/api/platform/admins/${adminId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`Password reset successfully for ${adminName}!\nNew Password: defaultPassword123`);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Failed to reset password");
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  };

  const getCommunityName = (communityId) => {
    if (!communityId) return 'No Community';
    const community = communities.find(c => c._id === communityId);
    return community ? community.name : 'No Community';
  };

  const togglePermission = (permissionKey) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
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
            <Users className="w-8 h-8 text-indigo-600" />
            Admins Management
          </h2>
          <p className="text-slate-600 mt-1">
            Create and manage community administrators
          </p>
        </div>
        <button
          onClick={() => {
            console.log("Create Admin button clicked!");
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Admins</p>
              <p className="text-2xl font-bold text-slate-900">{admins.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Admins</p>
              <p className="text-2xl font-bold text-slate-900">
                {admins.filter(a => a.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Inactive Admins</p>
              <p className="text-2xl font-bold text-slate-900">
                {admins.filter(a => a.isActive === false).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building2 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Communities</p>
              <p className="text-2xl font-bold text-slate-900">{communities.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">All Admins ({admins.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admin Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Community</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{admin.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          Role: {admin.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        {admin.communityId ? 
                          (typeof admin.communityId === 'object' ? admin.communityId.name : getCommunityName(admin.communityId))
                          : 'No Community'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(admin.isActive)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions?.length > 0 ? (
                        admin.permissions.slice(0, 2).map(perm => {
                          const permission = availablePermissions.find(p => p.key === perm);
                          return permission ? (
                            <span key={perm} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                              {permission.label}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-xs text-slate-500">No permissions</span>
                      )}
                      {admin.permissions?.length > 2 && (
                        <span className="text-xs text-slate-500">+{admin.permissions.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="View Details"
                        onClick={() => {
                          const communityName = admin.communityId ? 
                            (typeof admin.communityId === 'object' ? admin.communityId.name : getCommunityName(admin.communityId))
                            : 'No Community';
                          alert(`Admin: ${admin.name}\nEmail: ${admin.email}\nCommunity: ${communityName}\nPermissions: ${admin.permissions?.join(', ') || 'None'}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                        title="Edit Admin"
                        onClick={() => {
                          setEditingAdmin(admin);
                          setForm({
                            name: admin.name,
                            email: admin.email,
                            password: "", // Empty for editing - will show password field
                            communityId: admin.communityId || "",
                            permissions: admin.permissions || [],
                            isActive: admin.isActive !== false
                          });
                          setShowCreateModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Reset Password to Default"
                        onClick={() => resetPassword(admin._id, admin.name)}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        className={`p-1 rounded hover:bg-opacity-50 ${
                          admin.isActive !== false 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={admin.isActive !== false ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                      >
                        {admin.isActive !== false ? 
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

        {admins.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium">No admins found</p>
            <p className="text-sm">Create your first admin to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
            </h3>
            
            <form onSubmit={createAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password {editingAdmin ? "(Leave empty to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={editingAdmin ? "Enter new password (optional)" : "Enter password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingAdmin}
                />
                {!editingAdmin && (
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty to use default password: "defaultPassword123"
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign Community
                </label>
                <select
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.communityId}
                  onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                >
                  <option value="">No Community (Super Admin)</option>
                  {communities.map(community => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {availablePermissions.map(permission => (
                    <label key={permission.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission.key)}
                        onChange={() => togglePermission(permission.key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active Account</span>
                </label>
              </div>

              {!editingAdmin && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Admin will be created with the password you provide, or "defaultPassword123" if left empty. 
                    They should change it on first login.
                  </p>
                </div>
              )}

              {editingAdmin && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Leave password field empty to keep the current password unchanged.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAdmin(null);
                    setForm({ name: "", email: "", password: "", communityId: "", permissions: [], isActive: true });
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
