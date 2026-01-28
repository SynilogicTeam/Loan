import { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Shield, AlertTriangle, RefreshCw, Users, Crown } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function PasswordManagement() {
  const [passwordData, setPasswordData] = useState({ admins: [], members: [] });
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [toast, setToast] = useState(null);
  const [resetModal, setResetModal] = useState({ show: false, user: null, userType: null });
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchPasswordData();
  }, []);

  const fetchPasswordData = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/superadmin/view-passwords');
      
      if (response.ok) {
        const data = await response.json();
        setPasswordData(data.data);
        setToast({
          type: 'info',
          message: '⚠️ Sensitive data loaded. Handle with care.'
        });
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Failed to load password data'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setToast({
        type: 'error',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    setResetting(true);
    try {
      const response = await makeAuthenticatedRequest('/api/superadmin/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          userId: resetModal.user._id,
          userType: resetModal.userType,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: `Password reset successfully for ${resetModal.user.name}`
        });
        setResetModal({ show: false, user: null, userType: null });
        setNewPassword('');
        fetchPasswordData(); // Refresh data
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Failed to reset password'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Network error occurred'
      });
    } finally {
      setResetting(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatPassword = (encryptedPassword, userId) => {
    if (showPasswords[userId]) {
      return encryptedPassword;
    }
    return '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Password Management"
        subtitle="View and manage user passwords (Super Admin Only)"
        icon={Key}
      />

      {/* Security Warning */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-xl text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">⚠️ Security Notice</h3>
            <p className="text-red-700 mt-1">
              This page shows encrypted password hashes. Original passwords cannot be recovered from BCrypt hashes.
              You can only reset passwords to new values.
            </p>
            <p className="text-red-600 text-sm mt-2 font-medium">
              🔐 BCrypt is a one-way encryption. This is secure and industry standard.
            </p>
          </div>
        </div>
      </div>

      {/* Admins Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Admin Passwords ({passwordData.admins.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encrypted Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {passwordData.admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        {admin.name}
                      </div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                      <div className="text-xs text-gray-400">
                        Role: {admin.role} | ID: {admin._id.slice(-6)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 p-2 rounded font-mono max-w-xs overflow-hidden">
                        {formatPassword(admin.encryptedPassword, admin._id)}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(admin._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[admin._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setResetModal({ show: true, user: admin, userType: 'ADMIN' })}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Member Passwords ({passwordData.members.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encrypted Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {passwordData.members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-xs text-gray-400">
                        Phone: {member.phone} | ID: {member._id.slice(-6)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 p-2 rounded font-mono max-w-xs overflow-hidden">
                        {formatPassword(member.encryptedPassword, member._id)}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(member._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[member._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setResetModal({ show: true, user: member, userType: 'MEMBER' })}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Reset Password</h3>
              <p className="text-slate-600 mt-2">
                Set new password for <strong>{resetModal.user?.name}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setResetModal({ show: false, user: null, userType: null });
                    setNewPassword('');
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resetting || newPassword.length < 6}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}