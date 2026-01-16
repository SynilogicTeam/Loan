import { useState, useEffect } from "react";
import { User, Phone, Building, Hash, Edit, Shield, CheckCircle } from "lucide-react";

export default function MemberProfile({ memberData, onUpdateRequest }) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateRequest, setUpdateRequest] = useState({
    name: "",
    phone: "",
    reason: "",
  });

  // Calculate trust score based on member activity
  const calculateTrustScore = (member) => {
    let score = 0;
    
    // Base score for verified profile
    if (member?.isActive) score += 20;
    
    // Score for profile completeness
    if (member?.name) score += 15;
    if (member?.phone) score += 15;
    if (member?.email) score += 15;
    
    // Score for community engagement (mock data)
    const contributionCount = member?.contributionCount || 0;
    const loanHistory = member?.loanHistory || 0;
    
    score += Math.min(contributionCount * 5, 25); // Max 25 points for contributions
    score += Math.min(loanHistory * 3, 10); // Max 10 points for loan history
    
    return Math.min(score, 100); // Cap at 100
  };

  const trustScore = calculateTrustScore(memberData);

  const getTrustLevel = (score) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" };
    if (score >= 60) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (score >= 40) return { level: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Building", color: "text-orange-600", bgColor: "bg-orange-100" };
  };

  const trustInfo = getTrustLevel(trustScore);

  const handleUpdateRequest = (e) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", updateRequest);
    
    if (!updateRequest.name && !updateRequest.phone) {
      alert("Please provide at least one field to update");
      return;
    }

    if (!updateRequest.reason.trim()) {
      alert("Please provide a reason for the update");
      return;
    }

    // Call parent function to handle the update request
    console.log("Calling onUpdateRequest with:", updateRequest);
    onUpdateRequest(updateRequest);
    
    // Reset form
    setUpdateRequest({ name: "", phone: "", reason: "" });
    setShowUpdateForm(false);
    
    alert("Profile update request submitted successfully!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Member Profile
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowUpdateForm(!showUpdateForm);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <Edit className="w-4 h-4" />
              Request Update
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Trust Score Section */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-900">Trust Score</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${trustInfo.bgColor} ${trustInfo.color}`}>
              {trustInfo.level}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Trust Level</span>
              <span>{trustScore}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  trustScore >= 80 ? 'bg-green-500' :
                  trustScore >= 60 ? 'bg-blue-500' :
                  trustScore >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${trustScore}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500">
            Higher trust scores unlock better loan terms and community benefits
          </p>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Member Name */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Member Name</p>
              <p className="text-sm font-semibold text-slate-900">
                {memberData?.name || "Not provided"}
              </p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</p>
              <p className="text-sm font-semibold text-slate-900">
                {memberData?.phone || "Not provided"}
              </p>
            </div>
          </div>

          {/* Community Name */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Community</p>
              <p className="text-sm font-semibold text-slate-900">
                {memberData?.communityName || "Not assigned"}
              </p>
            </div>
          </div>

          {/* Member ID */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Hash className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Member ID</p>
              <p className="text-sm font-semibold text-slate-900 font-mono">
                {memberData?._id ? `#${memberData._id.slice(-8).toUpperCase()}` : "Not available"}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Account Status</p>
            <p className="text-xs text-green-700">
              {memberData?.isActive ? "Active Member" : "Inactive Member"}
            </p>
          </div>
        </div>

        {/* Update Request Form */}
        {showUpdateForm && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Request Profile Update</h4>
            <form onSubmit={handleUpdateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Name (optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateRequest.name}
                  onChange={(e) => setUpdateRequest({ ...updateRequest, name: e.target.value })}
                  placeholder="Enter new name if you want to change it"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Phone Number (optional)
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateRequest.phone}
                  onChange={(e) => setUpdateRequest({ ...updateRequest, phone: e.target.value })}
                  placeholder="Enter new phone number if you want to change it"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Update <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={updateRequest.reason}
                  onChange={(e) => setUpdateRequest({ ...updateRequest, reason: e.target.value })}
                  placeholder="Please explain why you need to update your profile information"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trust Building Tips */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Build Your Trust Score</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Make regular monthly contributions</li>
            <li>• Maintain a good loan repayment history</li>
            <li>• Keep your profile information updated</li>
            <li>• Participate actively in community activities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
