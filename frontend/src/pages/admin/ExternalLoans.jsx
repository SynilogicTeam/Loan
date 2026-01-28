import { useState, useEffect } from 'react';
import { Plus, Edit, Check, X, CreditCard, Search, Filter } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function ExternalLoans() {
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    borrowerId: '',
    principalAmount: '',
    interestRate: 12,
    interestType: 'SIMPLE',
    duration: 12,
    purpose: '',
    collateral: '',
    processingFee: 500,
    riskAssessment: 'LOW'
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch loans
      let loansUrl = '/api/external-loans?';
      if (statusFilter) loansUrl += `status=${statusFilter}&`;
      
      const loansResponse = await makeAuthenticatedRequest(loansUrl);
      
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setLoans(loansData.loans || []);
      }

      // Fetch borrowers for dropdown
      const borrowersResponse = await makeAuthenticatedRequest('/api/external-borrowers');
      
      if (borrowersResponse.ok) {
        const borrowersData = await borrowersResponse.json();
        setBorrowers(borrowersData.borrowers || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingLoan 
        ? `/api/external-loans/${editingLoan._id}`
        : '/api/external-loans';
      
      const response = await makeAuthenticatedRequest(url, {
        method: editingLoan ? 'PUT' : 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: `External loan ${editingLoan ? 'updated' : 'created'} successfully!`
        });
        fetchData();
        setShowForm(false);
        setEditingLoan(null);
        resetForm();
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Failed to save loan'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Network error occurred'
      });
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/external-loans/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ adminRemarks: 'Approved by admin' })
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Loan approved successfully!'
        });
        fetchData();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to approve loan'
      });
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/external-loans/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ adminRemarks: reason })
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Loan rejected successfully!'
        });
        fetchData();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to reject loan'
      });
    }
  };

  const handleDisburse = async (id) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/external-loans/${id}/disburse`, {
        method: 'PUT',
        body: JSON.stringify({ disbursementRemarks: 'Disbursed by admin' })
      });

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Loan disbursed successfully!'
        });
        fetchData();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to disburse loan'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      borrowerId: '',
      principalAmount: '',
      interestRate: 12,
      interestType: 'SIMPLE',
      duration: 12,
      purpose: '',
      collateral: '',
      processingFee: 500,
      riskAssessment: 'LOW'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="External Loans"
        subtitle="Manage loans for non-member borrowers"
        icon={CreditCard}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search loans..."
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null);
            resetForm();
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Loan
        </Button>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount & Terms
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
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No external loans found. Create your first loan to get started.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.loanNumber || `Loan #${loan._id.slice(-6)}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.purpose}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {loan.borrowerId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.borrowerId?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{loan.principalAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.interestRate}% • {loan.duration} months
                      </div>
                      <div className="text-sm text-gray-500">
                        EMI: ₹{loan.monthlyEMI?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(loan._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(loan._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {loan.status === 'APPROVED' && (
                          <button
                            onClick={() => handleDisburse(loan._id)}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                          >
                            Disburse
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingLoan(loan);
                            setFormData({
                              borrowerId: loan.borrowerId?._id || '',
                              principalAmount: loan.principalAmount,
                              interestRate: loan.interestRate,
                              interestType: loan.interestType,
                              duration: loan.duration,
                              purpose: loan.purpose,
                              collateral: loan.collateral || '',
                              processingFee: loan.processingFee,
                              riskAssessment: loan.riskAssessment || 'LOW'
                            });
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingLoan ? 'Edit' : 'Create'} External Loan
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Borrower *
                </label>
                <select
                  value={formData.borrowerId}
                  onChange={(e) => setFormData({...formData, borrowerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a borrower...</option>
                  {borrowers.filter(b => b.isVerified).map((borrower) => (
                    <option key={borrower._id} value={borrower._id}>
                      {borrower.name} - {borrower.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({...formData, principalAmount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (months) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Type *
                  </label>
                  <select
                    value={formData.interestType}
                    onChange={(e) => setFormData({...formData, interestType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="SIMPLE">Simple Interest</option>
                    <option value="COMPOUND">Compound Interest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose *
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Business expansion, Medical emergency"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.processingFee}
                    onChange={(e) => setFormData({...formData, processingFee: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Assessment
                  </label>
                  <select
                    value={formData.riskAssessment}
                    onChange={(e) => setFormData({...formData, riskAssessment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collateral Details
                </label>
                <textarea
                  value={formData.collateral}
                  onChange={(e) => setFormData({...formData, collateral: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe any collateral or security provided"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLoan ? 'Update' : 'Create'} Loan
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