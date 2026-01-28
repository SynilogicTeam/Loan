import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Settings } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function InterestRates() {
  const [configs, setConfigs] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    communityId: '',
    loanType: 'PERSONAL',
    interestRate: 12,
    interestType: 'SIMPLE',
    minAmount: 10000,
    maxAmount: 500000,
    maxTenure: 24,
    processingFee: 500,
    lateFeeRate: 5,
    gracePeriod: 7
  });

  useEffect(() => {
    fetchConfigs();
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      // Admin users don't need to fetch all communities - they only manage their own
      // The communityId is already in their token/session
      // For now, skip this or fetch from user profile
      console.log('Admin manages their own community only');
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/interest-rates');

      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingConfig
        ? `/api/interest-rates/${editingConfig._id}`
        : '/api/interest-rates';

      const response = await makeAuthenticatedRequest(url, {
        method: editingConfig ? 'PUT' : 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: `Interest rate config ${editingConfig ? 'updated' : 'created'} successfully!`
        });
        fetchConfigs();
        setShowForm(false);
        setEditingConfig(null);
        resetForm();
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Failed to save config'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Network error occurred'
      });
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      communityId: config.communityId._id || config.communityId,
      loanType: config.loanType,
      interestRate: config.interestRate,
      interestType: config.interestType,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
      maxTenure: config.maxTenure,
      processingFee: config.processingFee,
      lateFeeRate: config.lateFeeRate,
      gracePeriod: config.gracePeriod
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/interest-rates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Configuration deleted successfully!'
        });
        fetchConfigs();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to delete configuration'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      communityId: '',
      loanType: 'PERSONAL',
      interestRate: 12,
      interestType: 'SIMPLE',
      minAmount: 10000,
      maxAmount: 500000,
      maxTenure: 24,
      processingFee: 500,
      lateFeeRate: 5,
      gracePeriod: 7
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interest Rate Configuration"
        subtitle="Manage interest rates for different loan types"
        icon={TrendingUp}
      />

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Settings className="w-4 h-4" />
          Configure interest rates, processing fees, and late fee policies
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingConfig(null);
            resetForm();
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Configuration
        </Button>
      </div>

      {/* Configurations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Tenure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No interest rate configurations found. Add your first configuration to get started.
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {config.loanType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.interestRate}% ({config.interestType})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{config.minAmount.toLocaleString()} - ₹{config.maxAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.maxTenure} months
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.lateFeeRate}% ({config.gracePeriod} days grace)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingConfig ? 'Edit' : 'Add'} Interest Rate Configuration
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community
                </label>
                <select
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <select
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="BUSINESS">Business Loan</option>
                  <option value="EMERGENCY">Emergency Loan</option>
                  <option value="EDUCATION">Education Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Type
                  </label>
                  <select
                    value={formData.interestType}
                    onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="SIMPLE">Simple Interest</option>
                    <option value="COMPOUND">Compound Interest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tenure (months)
                  </label>
                  <input
                    type="number"
                    value={formData.maxTenure}
                    onChange={(e) => setFormData({ ...formData, maxTenure: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.processingFee}
                    onChange={(e) => setFormData({ ...formData, processingFee: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Late Fee Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lateFeeRate}
                    onChange={(e) => setFormData({ ...formData, lateFeeRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.gracePeriod}
                    onChange={(e) => setFormData({ ...formData, gracePeriod: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingConfig ? 'Update' : 'Create'} Configuration
                </Button>
              </div>
            </form>
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