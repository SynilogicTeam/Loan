import { useState, useEffect } from "react";
import { Banknote, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, FileText, Eye } from "lucide-react";
import api from "../../api/axios";

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get("/withdrawals");
      setWithdrawals(response.data);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      // Mock data for demo if API fails
      setWithdrawals([
        {
          _id: "1",
          memberId: { name: "Ramesh Kumar", phone: "9876543210" },
          amount: 15000,
          reason: "medical_emergency",
          urgency: "emergency",
          status: "PENDING",
          requestDate: new Date("2024-01-20"),
          guarantor: "Suresh Kumar",
          repaymentPlan: "6_months",
          remarks: "Hospital bills for mother's surgery",
          eligibleAmount: 40000,
          contributionHistory: 50000,
          processingFee: 150
        },
        {
          _id: "2",
          memberId: { name: "Priya Sharma", phone: "9876543211" },
          amount: 8000,
          reason: "education_expenses",
          urgency: "normal",
          status: "PENDING",
          requestDate: new Date("2024-01-18"),
          guarantor: "Rajesh Sharma",
          repaymentPlan: "3_months",
          remarks: "College fee payment for daughter",
          eligibleAmount: 32000,
          contributionHistory: 40000,
          processingFee: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (withdrawalId, action, remarks = "") => {
    setActionLoading(true);
    try {
      let response;
      if (action === "approve") {
        response = await api.put(`/withdrawals/${withdrawalId}/approve`, {
          adminRemarks: remarks || "Approved after review"
        });
      } else if (action === "reject") {
        response = await api.put(`/withdrawals/${withdrawalId}/reject`, {
          adminRemarks: remarks || "Rejected due to insufficient documentation"
        });
      } else if (action === "disburse") {
        response = await api.put(`/withdrawals/${withdrawalId}/disburse`, {
          disbursementMethod: "bank_transfer",
          adminRemarks: remarks || "Amount disbursed successfully"
        });
      }
      
      // Update local state
      setWithdrawals(prev => prev.map(w => 
        w._id === withdrawalId 
          ? { 
              ...w, 
              status: action.toUpperCase(),
              adminRemarks: remarks,
              [action === "approve" ? "approvedDate" : action === "reject" ? "rejectedDate" : "disbursedDate"]: new Date()
            }
          : w
      ));
      
      alert(`Withdrawal request ${action}d successfully!`);
      setShowModal(false);
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      alert(`Error ${action}ing withdrawal: ${error.response?.data?.message || error.message}`);
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
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "DISBURSED":
        return <Banknote className="w-5 h-5 text-blue-600" />;
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
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "DISBURSED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "text-red-600 bg-red-50 border-red-200";
      case "urgent":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "normal":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === "all") return true;
    return withdrawal.status === filter.toUpperCase();
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
            <Banknote className="w-8 h-8 text-orange-600" />
            Withdrawal Requests
          </h1>
          <p className="text-slate-600 mt-1">Review and manage member withdrawal requests</p>
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
                {withdrawals.filter(w => w.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-900">
                {withdrawals.filter(w => w.status === "APPROVED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{withdrawals
                  .filter(w => w.status === "APPROVED" || w.status === "DISBURSED")
                  .reduce((sum, w) => sum + w.amount, 0)
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
              <p className="text-sm text-slate-600">Emergency</p>
              <p className="text-2xl font-bold text-slate-900">
                {withdrawals.filter(w => w.urgency === "emergency" && w.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected", "disbursed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
              {status === "all" && (
                <span className="ml-1 text-xs">({withdrawals.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-slate-200">
          {filteredWithdrawals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Banknote className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No withdrawal requests</h3>
              <p className="text-slate-600">
                {filter === "all" 
                  ? "No withdrawal requests have been submitted yet."
                  : `No ${filter} withdrawal requests found.`
                }
              </p>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="px-6 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {withdrawal.memberId.name} - ₹{withdrawal.amount.toLocaleString()}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Requested on {withdrawal.requestDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(withdrawal.urgency)}`}>
                          {withdrawal.urgency}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-500">Member</span>
                        <p className="font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {withdrawal.memberId.name}
                        </p>
                        <p className="text-sm text-slate-600">{withdrawal.memberId.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Reason</span>
                        <p className="font-medium capitalize">
                          {withdrawal.reason.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Guarantor</span>
                        <p className="font-medium">{withdrawal.guarantor}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Repayment Plan</span>
                        <p className="font-medium">
                          {withdrawal.repaymentPlan.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Requested Amount</span>
                          <p className="font-semibold text-slate-900">₹{withdrawal.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Eligible Amount</span>
                          <p className="font-semibold text-green-600">₹{withdrawal.eligibleAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Total Contributions</span>
                          <p className="font-semibold text-blue-600">₹{withdrawal.contributionHistory.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Processing Fee</span>
                          <p className="font-semibold text-orange-600">₹{withdrawal.processingFee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {withdrawal.remarks && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Member's Note:</span>
                        <p className="text-sm text-slate-700 italic bg-blue-50 p-2 rounded">"{withdrawal.remarks}"</p>
                      </div>
                    )}

                    {/* Admin Remarks */}
                    {withdrawal.adminRemarks && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Admin Response:</span>
                        <p className="text-sm text-slate-700 font-medium bg-green-50 p-2 rounded">"{withdrawal.adminRemarks}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(withdrawal);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {withdrawal.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleAction(withdrawal._id, "approve", "Approved after review")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(withdrawal._id, "reject", "Insufficient documentation")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {withdrawal.status === "APPROVED" && (
                    <button
                      onClick={() => handleAction(withdrawal._id, "disburse", "Amount disbursed")}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                    >
                      <Banknote className="w-4 h-4 inline mr-1" />
                      Mark as Disbursed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for withdrawal details */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Withdrawal Request Details</h2>
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
                  <p className="font-medium">{selectedWithdrawal.memberId.name}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Phone</label>
                  <p className="font-medium">{selectedWithdrawal.memberId.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Amount</label>
                  <p className="font-medium">₹{selectedWithdrawal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <p className={`font-medium ${selectedWithdrawal.status === 'PENDING' ? 'text-yellow-600' : selectedWithdrawal.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedWithdrawal.status}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Reason</label>
                <p className="font-medium capitalize">{selectedWithdrawal.reason.replace(/_/g, " ")}</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Member's Note</label>
                <p className="text-slate-700 bg-slate-50 p-3 rounded">{selectedWithdrawal.remarks}</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedWithdrawal.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedWithdrawal._id, "approve", "Approved after detailed review");
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedWithdrawal._id, "reject", "Rejected due to insufficient documentation");
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}