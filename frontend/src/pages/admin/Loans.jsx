import { useEffect, useState } from "react";
import { HandCoins, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, DollarSign, Eye, Ban } from "lucide-react";
import api from "../../api/axios";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get("/loans");
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
      // Mock data for demo if API fails
      setLoans([
        {
          _id: "1",
          memberId: { name: "Ramesh Kumar", phone: "9876543210", email: "ramesh@gmail.com" },
          principalAmount: 50000,
          interestRate: 12,
          duration: 12,
          monthlyEMI: 4442,
          totalAmount: 53304,
          outstandingAmount: 45000,
          purpose: "Business expansion",
          status: "ACTIVE",
          appliedAt: new Date("2024-01-15"),
          approvedAt: new Date("2024-01-20"),
          guarantor1: "John Doe",
          guarantor2: "Jane Smith",
          monthlyIncome: 25000
        },
        {
          _id: "2",
          memberId: { name: "Priya Sharma", phone: "9876543211", email: "priya@gmail.com" },
          principalAmount: 25000,
          interestRate: 10,
          duration: 6,
          monthlyEMI: 4274,
          totalAmount: 25644,
          outstandingAmount: 25000,
          purpose: "Medical emergency",
          status: "PENDING",
          appliedAt: new Date("2024-01-18"),
          guarantor1: "Rajesh Sharma",
          monthlyIncome: 20000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (loanId, action, remarks = "") => {
    setActionLoading(true);
    try {
      let response;
      if (action === "approve") {
        response = await api.put(`/loans/${loanId}/approve`, {
          adminRemarks: remarks || "Approved after review"
        });
      } else if (action === "reject") {
        response = await api.put(`/loans/${loanId}/reject`, {
          adminRemarks: remarks || "Rejected due to insufficient documentation"
        });
      } else if (action === "cancel") {
        if (!confirm("Are you sure you want to cancel this loan? This action cannot be undone.")) {
          setActionLoading(false);
          return;
        }
        response = await api.put(`/loans/${loanId}/cancel`, {
          adminRemarks: remarks || "Loan cancelled by admin"
        });
      }

      // Update local state
      setLoans(prev => prev.map(loan =>
        loan._id === loanId
          ? {
            ...loan,
            status: action.toUpperCase(),
            adminRemarks: remarks,
            [action === "approve" ? "approvedAt" : action === "reject" ? "rejectedAt" : "cancelledAt"]: new Date()
          }
          : loan
      ));

      alert(`Loan ${action}d successfully!`);
      setShowModal(false);
      setSelectedLoan(null);
    } catch (error) {
      console.error(`Error ${action}ing loan:`, error);
      alert(`Error ${action}ing loan: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "ACTIVE":
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "CANCELLED":
        return <Ban className="w-5 h-5 text-gray-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === "all") return true;
    return loan.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HandCoins className="w-8 h-8 text-blue-600" />
            Loan Management
          </h1>
          <p className="text-slate-600 mt-1">Review and manage member loan applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900">
                {loans.filter(l => l.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Loans</p>
              <p className="text-2xl font-bold text-slate-900">
                {loans.filter(l => l.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <HandCoins className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{loans
                  .filter(l => l.status === "ACTIVE" || l.status === "APPROVED")
                  .reduce((sum, l) => sum + l.principalAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Outstanding</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{loans
                  .filter(l => l.status === "ACTIVE")
                  .reduce((sum, l) => sum + (l.outstandingAmount || l.principalAmount), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "active", "rejected", "cancelled", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === status
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {status}
              {status === "all" && (
                <span className="ml-1 text-xs">({loans.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-slate-200">
          {filteredLoans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <HandCoins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No loan applications</h3>
              <p className="text-slate-600">
                {filter === "all"
                  ? "No loan applications have been submitted yet."
                  : `No ${filter} loan applications found.`
                }
              </p>
            </div>
          ) : (
            filteredLoans.map((loan) => (
              <div key={loan._id} className="px-6 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(loan.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {loan.memberId?.name || 'Unknown Member'} - ₹{loan.principalAmount.toLocaleString()}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Applied on {new Date(loan.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-500">Member</span>
                        <p className="font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {loan.memberId?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-600">{loan.memberId?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Purpose</span>
                        <p className="font-medium">{loan.purpose}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Duration</span>
                        <p className="font-medium">{loan.duration} months</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Monthly EMI</span>
                        <p className="font-medium">₹{loan.monthlyEMI.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Principal Amount</span>
                          <p className="font-semibold text-slate-900">₹{loan.principalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Interest Rate</span>
                          <p className="font-semibold text-blue-600">{loan.interestRate}% per annum</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Total Amount</span>
                          <p className="font-semibold text-green-600">₹{loan.totalAmount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Outstanding</span>
                          <p className="font-semibold text-orange-600">₹{(loan.outstandingAmount || loan.principalAmount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Guarantors */}
                    {(loan.guarantor1 || loan.guarantor2) && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Guarantors:</span>
                        <p className="text-sm text-slate-700">
                          {[loan.guarantor1, loan.guarantor2].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Admin Remarks */}
                    {loan.adminRemarks && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Admin Response:</span>
                        <p className="text-sm text-slate-700 font-medium bg-blue-50 p-2 rounded">"{loan.adminRemarks}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedLoan(loan);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {loan.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleAction(loan._id, "approve", "Approved after review")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(loan._id, "reject", "Insufficient documentation")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </>
                  )}

                  {(loan.status === "APPROVED" || loan.status === "ACTIVE") && (
                    <button
                      onClick={() => handleAction(loan._id, "cancel", "Loan cancelled by admin")}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4 inline mr-1" />
                      Cancel Loan
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for loan details */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Loan Application Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Member Name</label>
                  <p className="font-medium">{selectedLoan.memberId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Phone</label>
                  <p className="font-medium">{selectedLoan.memberId?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Email</label>
                  <p className="font-medium">{selectedLoan.memberId?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Monthly Income</label>
                  <p className="font-medium">₹{selectedLoan.monthlyIncome?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Loan Amount</label>
                  <p className="font-medium">₹{selectedLoan.principalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <p className={`font-medium ${selectedLoan.status === 'PENDING' ? 'text-yellow-600' : selectedLoan.status === 'APPROVED' || selectedLoan.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLoan.status}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Purpose</label>
                <p className="font-medium">{selectedLoan.purpose}</p>
              </div>

              <div>
                <label className="text-sm text-slate-500">Guarantors</label>
                <p className="text-slate-700">{[selectedLoan.guarantor1, selectedLoan.guarantor2].filter(Boolean).join(", ") || "None"}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedLoan.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedLoan._id, "approve", "Approved after detailed review");
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedLoan._id, "reject", "Rejected due to insufficient documentation");
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {(selectedLoan.status === "APPROVED" || selectedLoan.status === "ACTIVE") && (
                  <button
                    onClick={() => {
                      handleAction(selectedLoan._id, "cancel", "Loan cancelled by admin decision");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel Loan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
