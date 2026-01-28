import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, Search, Filter } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function ExternalBorrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    aadharNumber: '',
    panNumber: '',
    dateOfBirth: '',
    occupation: '',
    monthlyIncome: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: ''
    },
    guarantor1: {
      name: '',
      phone: '',
      address: ''
    },
    guarantor2: {
      name: '',
      phone: '',
      address: ''
    },
    remarks: ''
  });

  useEffect(() => {
    fetchBorrowers();
  }, [searchTerm, statusFilter]);

  const fetchBorrowers = async () => {
    try {
      let url = '/api/external-borrowers?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      
      const response = await makeAuthenticatedRequest(url);
      
      if (response.ok) {
        const data = await response.json();
        setBorrowers(data.borrowers || []);
      }
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBorrower 
        ? `/api/external-borrowers/${editingBorrower._id}`
        : '/api/external-borrowers';
      
      const response = await makeAuthenticatedRequest(url, {
        method: editingBorrower ? 'PUT' : 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: `Borrower ${editingBorrower ? 'updated' : 'created'} successfully!`
        });
        fetchBorrowers();
        setShowForm(false);
        setEditingBorrower(null);
        resetForm();
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Failed to save borrower'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Network error occurred'
      });
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/external-borrowers/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: `Borrower ${isVerified ? 'verified' : 'unverified'} successfully!`
        });
        fetchBorrowers();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to update verification status'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this borrower?')) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/external-borrowers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Borrower deleted successfully!'
        });
        fetchBorrowers();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to delete borrower'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      aadharNumber: '',
      panNumber: '',
      dateOfBirth: '',
      occupation: '',
      monthlyIncome: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      },
      guarantor1: {
        name: '',
        phone: '',
        address: ''
      },
      guarantor2: {
        name: '',
        phone: '',
        address: ''
      },
      remarks: ''
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="External Borrowers"
        subtitle="Manage non-member borrowers and their profiles"
        icon={UserCheck}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search borrowers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => {
            setShowForm(true);
            setEditingBorrower(null);
            resetForm();
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Borrower
        </Button>
      </div>

      {/* Borrowers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No external borrowers found. Add your first borrower to get started.
                  </td>
                </tr>
              ) : (
                borrowers.map((borrower) => (
                  <tr key={borrower._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrower.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {borrower.occupation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{borrower.phone}</div>
                      <div className="text-sm text-gray-500">{borrower.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          borrower.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {borrower.isVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          borrower.isActive 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {borrower.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Score: {borrower.creditScore || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Income: ₹{borrower.monthlyIncome?.toLocaleString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(borrower._id, !borrower.isVerified)}
                          className={`px-2 py-1 rounded text-xs ${
                            borrower.isVerified
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {borrower.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingBorrower(borrower);
                            setFormData({
                              name: borrower.name,
                              email: borrower.email,
                              phone: borrower.phone,
                              address: borrower.address,
                              aadharNumber: borrower.aadharNumber,
                              panNumber: borrower.panNumber,
                              dateOfBirth: borrower.dateOfBirth ? borrower.dateOfBirth.split('T')[0] : '',
                              occupation: borrower.occupation,
                              monthlyIncome: borrower.monthlyIncome,
                              bankDetails: borrower.bankDetails || {
                                accountNumber: '',
                                ifscCode: '',
                                bankName: '',
                                branchName: ''
                              },
                              guarantor1: borrower.guarantor1 || {
                                name: '',
                                phone: '',
                                address: ''
                              },
                              guarantor2: borrower.guarantor2 || {
                                name: '',
                                phone: '',
                                address: ''
                              },
                              remarks: borrower.remarks || ''
                            });
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(borrower._id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingBorrower ? 'Edit' : 'Add'} External Borrower
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({...formData, monthlyIncome: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* KYC Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">KYC Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBorrower(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBorrower ? 'Update' : 'Create'} Borrower
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