import { useState, useEffect } from 'react';
import { User, Mail, Shield, Building, Edit, Save, X, Key, Calendar } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const role = localStorage.getItem('role');
      let endpoint = '/api/admin/profile';
      
      // Use different endpoints based on role
      if (role === 'SUPER_ADMIN') {
        endpoint = '/api/superadmin/profile';
      } else if (role === 'MEMBER') {
        endpoint = '/api/members/profile';
      }
      
      console.log('Fetching profile from:', endpoint, 'Role:', role);
      
      const response = await makeAuthenticatedRequest(endpoint);
      if (response.ok) {
        const data = await response.json();
        console.log('Profile API response:', data);
        
        // Handle different response formats
        // Super Admin endpoint returns { admin: {...} }
        // Regular Admin endpoint returns admin object directly
        // Member endpoint returns member object directly
        const profileData = data.admin || data.profile || data || {};
        
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use localStorage data as fallback
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const fallbackProfile = {
        name: userData.name || 'Admin',
        email: userData.email || 'admin@example.com',
        role: userData.role || 'ADMIN',
        createdAt: new Date().toISOString(),
        communityId: { name: userData.communityName || 'Community' },
        ...userData
      };
      
      setProfile(fallbackProfile);
      setFormData({
        name: fallbackProfile.name,
        email: fallbackProfile.email,
        phone: fallbackProfile.phone || '',
        address: fallbackProfile.address || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const role = localStorage.getItem('role');
      let endpoint = '/api/admin/profile';
      
      // Use different endpoints based on role
      if (role === 'SUPER_ADMIN') {
        endpoint = '/api/superadmin/profile';
      } else if (role === 'MEMBER') {
        endpoint = '/api/members/profile';
      }
      
      const response = await makeAuthenticatedRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile update response:', data);
        
        // Handle different response formats
        const profileData = data.admin || data.profile || data || {};
        setProfile(profileData);
        setEditing(false);
        setToast({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          ...formData
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        type: 'error',
        message: error.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        type: 'error',
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    setSaving(true);
    try {
      const role = localStorage.getItem('role');
      let endpoint = '/api/admin/profile';
      
      // Use different endpoints based on role
      if (role === 'SUPER_ADMIN') {
        endpoint = '/api/superadmin/profile';
      } else if (role === 'MEMBER') {
        endpoint = '/api/members/profile';
      }
      
      const response = await makeAuthenticatedRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setToast({
          type: 'success',
          message: 'Password changed successfully!'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setToast({
        type: 'error',
        message: error.message || 'Failed to change password'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your administrator profile"
        icon={Shield}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
                {profile?.name || 'Admin'}
                <Shield className="w-5 h-5 text-indigo-500" />
              </h3>
              <p className="text-slate-600 flex items-center justify-center gap-2 mt-1">
                <Building className="w-4 h-4" />
                Community Administrator
              </p>
              <p className="text-sm text-slate-500 mt-2">{profile?.email}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-600 mb-2">
                  <strong>Community:</strong> {profile?.communityId?.name || 'Not assigned'}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h3>
              <div className="flex gap-2">
                {!editing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordChange(true)}
                      icon={Key}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      icon={Edit}
                    >
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          phone: profile?.phone || '',
                          address: profile?.address || ''
                        });
                      }}
                      icon={X}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      loading={saving}
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900">{profile?.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile?.email || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900">{profile?.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Community
                  </label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-500" />
                    {profile?.communityId?.name || 'Not assigned'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                {editing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-slate-900">{profile?.address || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Password
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                loading={saving}
                className="flex-1"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}