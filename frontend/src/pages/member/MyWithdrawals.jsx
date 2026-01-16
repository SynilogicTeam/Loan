import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User } from "lucide-react";
import { getMemberWithdrawals } from "../../api/memberProfile.api";

export default function MyWithdrawals() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await getMemberWithdrawals();
      setWithdrawals(response.data);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      // Mock data for demo
      setWithdrawals([
        {
          _id: "1",
          amount: 15000,
          reason: "medical_emergency",
          urgency: "emergency",
          status: "APPROVED",
          requestDate: new Date("2024-01-15"),
          approvedDate: new Date("2024-01-15"),
          disbursedDate: new Date("2024-01-16"),
          repaymentPlan: "6_months",
          guarantor: "Suresh Kumar",
          remarks: "Hospital bills for mother's surgery",
          adminRemarks: "Approved due to medical emergency"
        },
        {
          _id: "2",
          amount: 8000,
          reason: "education_expenses",
          urgency: "normal",
          status: "PENDING",
          requestDate: new Date("2024-01-20"),
          repaymentPlan: "3_months",
          guarantor: "Rajesh Sharma",
          remarks: "College fee payment"
        },
        {
          _id: "3",
          amount: 5000,
          reason: "home_repair",
          urgency: "urgent",
          status: "REJECTED",
          requestDate: new Date("2024-01-10"),
          rejectedDate: new Date("2024-01-12"),
          repaymentPlan: "3_months",
          guarantor: "Amit Singh",
          remarks: "Roof repair after rain damage",
          adminRemarks: "Insufficient contribution history"
        }
      ]);
    } finally {
      setLoading(false);
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
        return "text-red-600";
      case "urgent":
        return "text-orange-600";
      case "normal":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === "all") return true;
    return withdrawal.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/member/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/member/request-withdrawal")}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              New Withdrawal Request
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Banknote className="w-6 h-6 text-orange-600" />
              My Withdrawal Requests
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track your withdrawal requests and repayment status
            </p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected", "disbursed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
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
          <div className="divide-y divide-slate-200">
            {filteredWithdrawals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Banknote className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No withdrawal requests</h3>
                <p className="text-slate-600 mb-4">
                  {filter === "all" 
                    ? "You haven't made any withdrawal requests yet."
                    : `No ${filter} withdrawal requests found.`
                  }
                </p>
                <button
                  onClick={() => navigate("/member/request-withdrawal")}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Make Your First Request
                </button>
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
                            ₹{withdrawal.amount.toLocaleString()} Withdrawal Request
                          </h3>
                          <p className="text-sm text-slate-600">
                            Requested on {withdrawal.requestDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-slate-500">Reason</span>
                          <p className="font-medium capitalize">
                            {withdrawal.reason.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Urgency</span>
                          <p className={`font-medium capitalize ${getUrgencyColor(withdrawal.urgency)}`}>
                            {withdrawal.urgency}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Repayment Plan</span>
                          <p className="font-medium">
                            {withdrawal.repaymentPlan.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Guarantor</span>
                          <p className="font-medium flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {withdrawal.guarantor}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Requested: {withdrawal.requestDate.toLocaleDateString()}</span>
                        </div>
                        {withdrawal.approvedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Approved: {withdrawal.approvedDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        {withdrawal.disbursedDate && (
                          <div className="flex items-center gap-1">
                            <Banknote className="w-4 h-4 text-blue-600" />
                            <span>Disbursed: {withdrawal.disbursedDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        {withdrawal.rejectedDate && (
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Rejected: {withdrawal.rejectedDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Remarks */}
                      {withdrawal.remarks && (
                        <div className="mb-3">
                          <span className="text-sm text-slate-500">Your Note:</span>
                          <p className="text-sm text-slate-700 italic">"{withdrawal.remarks}"</p>
                        </div>
                      )}

                      {/* Admin Remarks */}
                      {withdrawal.adminRemarks && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <span className="text-sm text-slate-500">Admin Response:</span>
                          <p className="text-sm text-slate-700 font-medium">"{withdrawal.adminRemarks}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {withdrawal.status === "PENDING" && (
                      <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200">
                        Cancel Request
                      </button>
                    )}
                    {withdrawal.status === "APPROVED" && (
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200">
                        View Repayment Schedule
                      </button>
                    )}
                    {withdrawal.status === "DISBURSED" && (
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                        Track Repayment
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {withdrawals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {withdrawals.filter(w => w.status === "PENDING").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Banknote className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Disbursed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {withdrawals.filter(w => w.status === "DISBURSED").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Banknote className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{withdrawals
                      .filter(w => w.status === "DISBURSED")
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}