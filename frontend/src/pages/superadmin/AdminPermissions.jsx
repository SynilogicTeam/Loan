import { useEffect, useState } from "react";
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Edit,
  Save,
  X,
  AlertTriangle
} from "lucide-react";

export default function AdminPermissions() {
  const [admins, setAdmins] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Available permissions
  const availablePermissions = [
    { key: 'manage_members', label: 'Manage Members', description: 'Add, edit, and remove members' },
    { key: 'manage_contributions', label: 'Manage Contributions', description: 'View and manage member contributions' },
    { key: 'manage_loans', label: 'Manage Loans', description: 'Approve/reject loans and manage EMIs' },
    { key: 'manage_sessions', label: 'Manage Sessions', description: 'Create and close financial sessions' },
    { key: 'view_reports', label: 'View Reports', description: 'Access financial reports and analytics' },
    { key: 'manage_settings', label: 'Manage Settings', description: 'Change community settings and configurations' }
  ];

  useEffect(() => {
    console.log("AdminPermissions component mounted");
    console.log("Current role:", localStorage.getItem("role"));
    console.log("Admin token:", localStorage.getItem("adminToken") ? "Present" : "Missing");
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load admins
      console.log("Loading admins...");
      const adminsResponse = await fetch('/api/platform/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        console.log("Admins loaded:", adminsData);
        setAdmins(adminsData);
      } else {
        console.error("Failed to load admins:", adminsResponse.status);
        const error = await adminsResponse.text();
        console.error("Error details:", error);
      }

      // Load communities
      console.log("Loading communities...");
      const communitiesResponse = await fetch('/api/platform/communities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (communitiesResponse.ok) {
        const communitiesData = await communitiesResponse.json();
        console.log("Communities loaded:", communitiesData);
        setCommunities(communitiesData);
      } else {
        console.error("Failed to load communities:", communitiesResponse.status);
        const error = await communitiesResponse.text();
        console.error("Error details:", error);
      }

    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (admin) => {
    console.log("Starting to edit admin:", admin);
    setEditingAdmin(admin._id);
    setPermissions({
      communityId: admin.communityId || '',
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false
    });
    console.log("Set permissions state:", {
      communityId: admin.communityId || '',
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false
    });
  };

  const cancelEditing = () => {
    setEditingAdmin(null);
    setPermissions({});
  };

  const savePermissions = async (adminId) => {
    try {
      console.log("Saving permissions for admin:", adminId);
      console.log("Permissions data:", permissions);
      
      const response = await fetch(`/api/platform/admins/${adminId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissions)
      });

      console.log("Save response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Save successful:", result);
        alert("Permissions updated successfully!");
        setEditingAdmin(null);
        loadData(); // Reload data
      } else {
        const error = await response.json();
        console.error("Save failed:", error);
        alert(error.message || "Failed to update permissions");
      }
    } catch (error) {
      console.error("Failed to save permissions:", error);
      alert("Failed to save permissions: " + error.message);
    }
  };

  const togglePermission = (permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...(prev.permissions || []), permissionKey]
    }));
  };

  const getStatusBadge = (admin) => {
    if (admin.isActive === false) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getCommunityName = (communityId) => {
    const community = communities.find(c => c._id === communityId);
    return community ? community.name : 'No Community Assigned';
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Admin Permissions Management
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Manage admin permissions and community assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Working Example Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-800">
          ✅ How Permission System Works
        </h3>
        
        <div className="space-y-4 text-sm text-green-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-medium mb-2">🔐 Super Admin Powers:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Can see ALL menu items</li>
                <li>• Can assign permissions to admins</li>
                <li>• Can activate/deactivate admin accounts</li>
                <li>• Has access to all communities</li>
              </ul>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-medium mb-2">👤 Admin Restrictions:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Only sees menu items they have permission for</li>
                <li>• Gets 403 error if accessing without permission</li>
                <li>• Can be deactivated by Super Admin</li>
                <li>• Limited to assigned community</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <h4 className="font-medium mb-2">🎯 Example Permission Scenarios:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2 bg-blue-50 rounded">
                <strong>Admin A:</strong> Only Members + Contributions
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <strong>Admin B:</strong> Only Loans + Sessions
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <strong>Admin C:</strong> Full Access (All permissions)
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Available Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePermissions.map(permission => (
            <div 
              key={permission.key} 
              className="p-4 bg-slate-50 rounded-lg border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer"
              onClick={() => {
                console.log("Permission clicked:", permission);
                alert(`Permission: ${permission.label}\nDescription: ${permission.description}\nKey: ${permission.key}`);
              }}
            >
              <h4 className="font-medium text-slate-900">{permission.label}</h4>
              <p className="text-sm text-slate-600 mt-1">{permission.description}</p>
              <div className="mt-2 text-xs text-indigo-600 font-medium">
                Click to see details
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>How to assign permissions:</strong> Scroll down to the Admin Accounts table and click the Edit button (pencil icon) next to any admin to assign these permissions.
          </p>
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">🔍 Debug Information</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
          <p><strong>Admins Found:</strong> {admins.length}</p>
          <p><strong>Communities Found:</strong> {communities.length}</p>
          <p><strong>Current Role:</strong> {localStorage.getItem("role")}</p>
          <p><strong>Has Admin Token:</strong> {localStorage.getItem("adminToken") ? "Yes" : "No"}</p>
          {admins.length > 0 && (
            <div>
              <p><strong>First Admin:</strong> {JSON.stringify(admins[0], null, 2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Accounts ({admins.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-slate-900">{admin.name}</div>
                      <div className="text-sm text-slate-500">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAdmin === admin._id ? (
                      <select
                        value={permissions.communityId}
                        onChange={(e) => setPermissions(prev => ({ ...prev, communityId: e.target.value }))}
                        className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">No Community</option>
                        {communities.map(community => (
                          <option key={community._id} value={community._id}>
                            {community.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-slate-600">
                        {getCommunityName(admin.communityId)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAdmin === admin._id ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={permissions.isActive}
                          onChange={(e) => setPermissions(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm">Active</span>
                      </label>
                    ) : (
                      getStatusBadge(admin)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingAdmin === admin._id ? (
                      <div className="space-y-2 max-w-xs">
                        {availablePermissions.map(permission => (
                          <label key={permission.key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={permissions.permissions?.includes(permission.key)}
                              onChange={() => togglePermission(permission.key)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {admin.permissions?.length > 0 ? (
                          admin.permissions.map(perm => {
                            const permission = availablePermissions.find(p => p.key === perm);
                            return permission ? (
                              <span key={perm} className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded mr-1 mb-1">
                                {permission.label}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="text-sm text-slate-500">No permissions assigned</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingAdmin === admin._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            console.log("Save button clicked for admin:", admin._id);
                            savePermissions(admin._id);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log("Cancel button clicked");
                            cancelEditing();
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          console.log("Edit button clicked for admin:", admin._id, admin);
                          startEditing(admin);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit Permissions"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            No admin accounts found.
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Permission Management Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Changes to admin permissions take effect immediately. Admins will need to refresh their browser 
              to see updated access levels. Be careful when modifying permissions as it affects system security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}