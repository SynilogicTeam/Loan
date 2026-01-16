import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberProfile from "../../components/Member/MemberProfile";
import { getMemberProfile, requestProfileUpdate } from "../../api/memberProfile.api";

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get member data from localStorage or API
    const role = localStorage.getItem("role");
    if (role !== "MEMBER") {
      navigate("/login");
      return;
    }

    loadMemberData();
    
    // Auto-refresh member data every 30 seconds
    const interval = setInterval(() => {
      loadMemberData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      
      // Get member profile
      const profileResponse = await getMemberProfile();
      const memberProfile = profileResponse.data;
      
      // Get member loans
      const loansResponse = await fetch('/api/members/loans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('memberToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let loanData = { activeLoans: 0, totalLoans: 0, approvedLoans: [] };
      if (loansResponse.ok) {
        const loans = await loansResponse.json();
        loanData = {
          activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
          totalLoans: loans.length,
          approvedLoans: loans.filter(l => l.status === 'APPROVED' || l.status === 'ACTIVE')
        };
      }
      
      // Combine profile and loan data
      setMemberData({
        ...memberProfile,
        ...loanData
      });
      
    } catch (err) {
      console.error("Failed to load member data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdateRequest = async (updateData) => {
    try {
      console.log("Profile update request received:", updateData);
      const response = await requestProfileUpdate(updateData);
      console.log("Profile update response:", response);
      alert(response.data.message);
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.message || "Failed to submit update request");
    }
  };

  const logout = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Community Fund - Member Portal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {memberData?.name || "Member"}
                </p>
                <p className="text-xs text-slate-500">Member</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error} - Using offline data</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <MemberProfile 
              memberData={memberData} 
              onUpdateRequest={handleProfileUpdateRequest}
            />
          </div>

          {/* Right Column - Dashboard Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome back, {memberData?.name?.split(' ')[0] || 'Member'}! 👋
              </h2>
              <p className="text-slate-600">
                Manage your contributions, loans, and community activities.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Contributions</p>
                    <p className="text-2xl font-bold text-slate-900">₹{((memberData?.contributionCount || 0) * 5000).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Loan History</p>
                    <p className="text-2xl font-bold text-slate-900">{memberData?.totalLoans || 0}</p>
                    {memberData?.activeLoans > 0 && (
                      <p className="text-xs text-green-600">{memberData.activeLoans} Active</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Account Status</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {memberData?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Profile loaded successfully</p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                  {memberData?.contributionCount > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {memberData.contributionCount} contributions made
                        </p>
                        <p className="text-xs text-slate-500">Total: ₹{(memberData.contributionCount * 5000).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {memberData?.loanHistory > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {memberData.loanHistory} loan(s) in history
                        </p>
                        <p className="text-xs text-slate-500">Good repayment record</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate("/member/make-contribution")}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="text-sm font-medium text-slate-900">Make Contribution</div>
                  <div className="text-xs text-slate-500 mt-1">Pay monthly contribution</div>
                </button>
                <button 
                  onClick={() => navigate("/member/request-withdrawal")}
                  className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 text-left transition"
                >
                  <div className="text-sm font-medium text-orange-900">Request Withdrawal</div>
                  <div className="text-xs text-orange-600 mt-1">Withdraw from contributions</div>
                </button>
                <button 
                  onClick={() => navigate("/member/apply-loan")}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="text-sm font-medium text-slate-900">Apply for Loan</div>
                  <div className="text-xs text-slate-500 mt-1">Submit loan application</div>
                </button>
                <button 
                  onClick={() => navigate("/member/charity-donation")}
                  className="p-4 border border-pink-200 rounded-lg hover:bg-pink-50 text-left transition"
                >
                  <div className="text-sm font-medium text-pink-900">Charity Donation</div>
                  <div className="text-xs text-pink-600 mt-1">Donate to charity</div>
                </button>
                <button 
                  onClick={() => navigate("/member/my-loans")}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="text-sm font-medium text-slate-900">My Loans & EMIs</div>
                  <div className="text-xs text-slate-500 mt-1">View loans and pay EMIs</div>
                </button>
                <button 
                  onClick={() => navigate("/member/my-withdrawals")}
                  className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 text-left transition"
                >
                  <div className="text-sm font-medium text-orange-900">My Withdrawals</div>
                  <div className="text-xs text-orange-600 mt-1">Track withdrawal requests</div>
                </button>
                <button 
                  onClick={() => navigate("/member/view-statement")}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="text-sm font-medium text-slate-900">View Statement</div>
                  <div className="text-xs text-slate-500 mt-1">Check account statement</div>
                </button>
                <button 
                  onClick={() => navigate("/member/contact-admin")}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="text-sm font-medium text-slate-900">Contact Admin</div>
                  <div className="text-xs text-slate-500 mt-1">Get help and support</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}