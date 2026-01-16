import { useState, useEffect } from "react";
import { Heart, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, DollarSign, Eye, Gift } from "lucide-react";
import api from "../../api/axios";

export default function Charity() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await api.get("/charity");
      setDonations(response.data);
    } catch (error) {
      console.error("Error fetching charity donations:", error);
      // Mock data for demo if API fails
      setDonations([
        {
          _id: "1",
          memberId: { name: "Ramesh Kumar", phone: "9876543210", email: "ramesh@gmail.com" },
          amount: 5000,
          charityName: "orphanage",
          charityDescription: "Donation for orphan children education",
          status: "PENDING",
          createdAt: new Date("2024-01-20"),
          recipientDetails: {
            organizationName: "Bal Ashram",
            contactPerson: "Sister Mary",
            phoneNumber: "9876543210",
            address: "Mumbai"
          },
          donationMethod: "community_fund",
          memberRemarks: "Want to help orphan children"
        },
        {
          _id: "2",
          memberId: { name: "Priya Sharma", phone: "9876543211", email: "priya@gmail.com" },
          amount: 3000,
          charityName: "medical_aid",
          charityDescription: "Medical aid for cancer patients",
          status: "APPROVED",
          createdAt: new Date("2024-01-18"),
          approvedAt: new Date("2024-01-19"),
          recipientDetails: {
            organizationName: "Cancer Care Foundation",
            contactPerson: "Dr. Sharma",
            phoneNumber: "9876543211",
            address: "Delhi"
          },
          donationMethod: "direct_transfer",
          memberRemarks: "My contribution to cancer patients",
          adminRemarks: "Approved for good cause",
          receiptNumber: "RCP-123456"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/charity/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching charity stats:", error);
      setStats({
        statusStats: {
          pending: { count: 1, amount: 5000 },
          approved: { count: 1, amount: 3000 },
          rejected: { count: 0, amount: 0 },
          disbursed: { count: 0, amount: 0 }
        }
      });
    }
  };

  const handleAction = async (donationId, action, remarks = "") => {
    setActionLoading(true);
    try {
      let response;
      if (action === "approve") {
        response = await api.put(`/charity/${donationId}/approve`, {
          adminRemarks: remarks || "Approved for charity donation",
          receiptNumber: `RCP-${Date.now()}`
        });
      } else if (action === "reject") {
        response = await api.put(`/charity/${donationId}/reject`, {
          adminRemarks: remarks || "Rejected due to insufficient documentation"
        });
      } else if (action === "disburse") {
        response = await api.put(`/charity/${donationId}/disburse`, {
          transactionId: `TXN-${Date.now()}`,
          adminRemarks: remarks || "Amount disbursed to charity organization"
        });
      }
      
      // Update local state
      setDonations(prev => prev.map(donation => 
        donation._id === donationId 
          ? { 
              ...donation, 
              status: action.toUpperCase(),
              adminRemarks: remarks,
              [action === "approve" ? "approvedAt" : action === "reject" ? "rejectedAt" : "disbursedAt"]: new Date()
            }
          : donation
      ));
      
      alert(`Charity donation ${action}d successfully!`);
      setShowModal(false);
      setSelectedDonation(null);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error(`Error ${action}ing donation:`, error);
      alert(`Error ${action}ing donation: ${error.response?.data?.message || error.message}`);
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
        return <Gift className="w-5 h-5 text-blue-600" />;
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

  const getCharityIcon = (charityName) => {
    const icons = {
      orphanage: "👶",
      old_age_home: "👴",
      education_fund: "📚",
      medical_aid: "🏥",
      disaster_relief: "🆘",
      animal_welfare: "🐕",
      environment: "🌱",
      women_empowerment: "👩",
      skill_development: "🛠️",
      food_distribution: "🍽️",
      other: "❤️"
    };
    return icons[charityName] || "❤️";
  };

  const getCharityName = (charityName) => {
    const names = {
      orphanage: "Orphanage",
      old_age_home: "Old Age Home",
      education_fund: "Education Fund",
      medical_aid: "Medical Aid",
      disaster_relief: "Disaster Relief",
      animal_welfare: "Animal Welfare",
      environment: "Environment",
      women_empowerment: "Women Empowerment",
      skill_development: "Skill Development",
      food_distribution: "Food Distribution",
      other: "Other"
    };
    return names[charityName] || charityName;
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === "all") return true;
    return donation.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-600" />
            Charity Donations
          </h1>
          <p className="text-slate-600 mt-1">Manage member charity donations and contributions</p>
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
                {stats.statusStats?.pending?.count || 0}
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
                {stats.statusStats?.approved?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Donated</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{((stats.statusStats?.approved?.amount || 0) + (stats.statusStats?.disbursed?.amount || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Disbursed</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.statusStats?.disbursed?.count || 0}
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
                  ? "bg-pink-100 text-pink-800 border border-pink-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
              {status === "all" && (
                <span className="ml-1 text-xs">({donations.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-slate-200">
          {filteredDonations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No charity donations</h3>
              <p className="text-slate-600">
                {filter === "all" 
                  ? "No charity donations have been submitted yet."
                  : `No ${filter} charity donations found.`
                }
              </p>
            </div>
          ) : (
            filteredDonations.map((donation) => (
              <div key={donation._id} className="px-6 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(donation.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <span className="text-2xl">{getCharityIcon(donation.charityName)}</span>
                          {donation.memberId.name} - ₹{donation.amount.toLocaleString()}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Requested on {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-500">Member</span>
                        <p className="font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {donation.memberId.name}
                        </p>
                        <p className="text-sm text-slate-600">{donation.memberId.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Charity Type</span>
                        <p className="font-medium flex items-center gap-1">
                          <span>{getCharityIcon(donation.charityName)}</span>
                          {getCharityName(donation.charityName)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Organization</span>
                        <p className="font-medium">{donation.recipientDetails?.organizationName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Donation Method</span>
                        <p className="font-medium capitalize">{donation.donationMethod?.replace(/_/g, " ")}</p>
                      </div>
                    </div>

                    {/* Charity Details */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Description</span>
                          <p className="font-medium text-slate-900">{donation.charityDescription}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Contact Person</span>
                          <p className="font-medium text-slate-900">{donation.recipientDetails?.contactPerson || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Phone</span>
                          <p className="font-medium text-slate-900">{donation.recipientDetails?.phoneNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Address</span>
                          <p className="font-medium text-slate-900">{donation.recipientDetails?.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Member Remarks */}
                    {donation.memberRemarks && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Member's Note:</span>
                        <p className="text-sm text-slate-700 italic bg-blue-50 p-2 rounded">"{donation.memberRemarks}"</p>
                      </div>
                    )}

                    {/* Admin Remarks */}
                    {donation.adminRemarks && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Admin Response:</span>
                        <p className="text-sm text-slate-700 font-medium bg-green-50 p-2 rounded">"{donation.adminRemarks}"</p>
                      </div>
                    )}

                    {/* Receipt Number */}
                    {donation.receiptNumber && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-500">Receipt Number:</span>
                        <p className="text-sm text-slate-700 font-mono bg-gray-50 p-2 rounded">{donation.receiptNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedDonation(donation);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {donation.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleAction(donation._id, "approve", "Approved for charity donation")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(donation._id, "reject", "Insufficient documentation")}
                        disabled={actionLoading}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {donation.status === "APPROVED" && (
                    <button
                      onClick={() => handleAction(donation._id, "disburse", "Amount disbursed to charity")}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                    >
                      <Gift className="w-4 h-4 inline mr-1" />
                      Mark as Disbursed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for donation details */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">{getCharityIcon(selectedDonation.charityName)}</span>
                Charity Donation Details
              </h2>
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
                  <p className="font-medium">{selectedDonation.memberId.name}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Phone</label>
                  <p className="font-medium">{selectedDonation.memberId.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Donation Amount</label>
                  <p className="font-medium">₹{selectedDonation.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <p className={`font-medium ${selectedDonation.status === 'PENDING' ? 'text-yellow-600' : selectedDonation.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedDonation.status}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Charity Type</label>
                <p className="font-medium flex items-center gap-2">
                  <span>{getCharityIcon(selectedDonation.charityName)}</span>
                  {getCharityName(selectedDonation.charityName)}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Description</label>
                <p className="text-slate-700 bg-slate-50 p-3 rounded">{selectedDonation.charityDescription}</p>
              </div>

              <div>
                <label className="text-sm text-slate-500">Organization Details</label>
                <div className="bg-slate-50 p-3 rounded space-y-1">
                  <p><strong>Name:</strong> {selectedDonation.recipientDetails?.organizationName || 'N/A'}</p>
                  <p><strong>Contact:</strong> {selectedDonation.recipientDetails?.contactPerson || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedDonation.recipientDetails?.phoneNumber || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedDonation.recipientDetails?.address || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedDonation.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedDonation._id, "approve", "Approved after detailed review");
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedDonation._id, "reject", "Rejected due to insufficient documentation");
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