import { useState, useEffect } from "react";
import { Heart, ArrowLeft, DollarSign, Building, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CharityDonation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [memberProfile, setMemberProfile] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    charityName: "",
    charityDescription: "",
    organizationName: "",
    contactPerson: "",
    phoneNumber: "",
    address: "",
    donationMethod: "community_fund",
    memberRemarks: ""
  });

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  const fetchMemberProfile = async () => {
    try {
      const response = await api.get("/member/profile");
      setMemberProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Mock data for demo
      setMemberProfile({
        contributionCount: 10,
        name: "Demo Member",
        totalContributions: 50000
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.amount || !form.charityName || !form.charityDescription || !form.organizationName) {
      alert("Please fill all required fields");
      return;
    }

    const totalContributions = (memberProfile?.contributionCount || 0) * 5000;
    const maxDonation = Math.floor(totalContributions * 0.3); // 30% of contributions

    if (parseFloat(form.amount) > maxDonation) {
      alert(`Maximum donation allowed: ₹${maxDonation.toLocaleString()}\n\nThis is 30% of your total contributions (₹${totalContributions.toLocaleString()})`);
      return;
    }

    if (parseFloat(form.amount) < 100) {
      alert("Minimum donation amount is ₹100");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post("/charity/donate", {
        amount: parseFloat(form.amount),
        charityName: form.charityName,
        charityDescription: form.charityDescription,
        recipientDetails: {
          organizationName: form.organizationName,
          contactPerson: form.contactPerson,
          phoneNumber: form.phoneNumber,
          address: form.address
        },
        donationMethod: form.donationMethod,
        memberRemarks: form.memberRemarks
      });
      
      alert(`Charity donation request submitted successfully!\n\nDonation ID: ${response.data.donationId}\nAmount: ₹${form.amount}\nStatus: Pending Admin Approval\n\nYour donation will be processed after admin approval.`);
      navigate("/member/dashboard");
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(`Error submitting donation: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalContributions = (memberProfile?.contributionCount || 0) * 5000;
  const maxDonation = Math.floor(totalContributions * 0.3);

  const charityOptions = [
    { value: "orphanage", label: "Orphanage", icon: "👶", description: "Support orphan children" },
    { value: "old_age_home", label: "Old Age Home", icon: "👴", description: "Care for elderly people" },
    { value: "education_fund", label: "Education Fund", icon: "📚", description: "Support education initiatives" },
    { value: "medical_aid", label: "Medical Aid", icon: "🏥", description: "Help with medical expenses" },
    { value: "disaster_relief", label: "Disaster Relief", icon: "🆘", description: "Emergency disaster support" },
    { value: "animal_welfare", label: "Animal Welfare", icon: "🐕", description: "Animal care and protection" },
    { value: "environment", label: "Environment", icon: "🌱", description: "Environmental conservation" },
    { value: "women_empowerment", label: "Women Empowerment", icon: "👩", description: "Support women's rights" },
    { value: "skill_development", label: "Skill Development", icon: "🛠️", description: "Vocational training programs" },
    { value: "food_distribution", label: "Food Distribution", icon: "🍽️", description: "Feed the hungry" },
    { value: "other", label: "Other", icon: "❤️", description: "Other charitable causes" }
  ];

  const donationMethods = [
    { value: "community_fund", label: "Community Fund", description: "Deduct from community balance" },
    { value: "direct_transfer", label: "Direct Transfer", description: "Direct bank transfer to organization" },
    { value: "cash", label: "Cash", description: "Cash donation through admin" },
    { value: "cheque", label: "Cheque", description: "Cheque payment" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/member/dashboard")}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-pink-600" />
              Charity Donation
            </h1>
            <p className="text-slate-600">Make a charitable donation from your contributions</p>
          </div>
        </div>

        {/* Eligibility Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Your Donation Eligibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Total Contributions</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalContributions.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">Available for Donation</p>
              <p className="text-2xl font-bold text-green-600">₹{maxDonation.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-slate-600">Donation Limit</p>
              <p className="text-2xl font-bold text-pink-600">30%</p>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Donation Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter donation amount"
                min="100"
                max={maxDonation}
                required
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Minimum: ₹100 | Maximum: ₹{maxDonation.toLocaleString()}
            </p>
          </div>

          {/* Charity Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Charity Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {charityOptions.map((charity) => (
                <button
                  key={charity.value}
                  type="button"
                  onClick={() => setForm({ ...form, charityName: charity.value })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    form.charityName === charity.value
                      ? "border-pink-500 bg-pink-50 text-pink-900"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{charity.icon}</span>
                    <span className="font-medium">{charity.label}</span>
                  </div>
                  <p className="text-xs text-slate-600">{charity.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Donation Description *
            </label>
            <textarea
              value={form.charityDescription}
              onChange={(e) => setForm({ ...form, charityDescription: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              rows="3"
              placeholder="Describe the purpose of your donation..."
              required
            />
          </div>

          {/* Organization Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Organization Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Name of the organization"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Organization phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Organization address"
                />
              </div>
            </div>
          </div>

          {/* Donation Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Donation Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {donationMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setForm({ ...form, donationMethod: method.value })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    form.donationMethod === method.value
                      ? "border-pink-500 bg-pink-50 text-pink-900"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="font-medium mb-1">{method.label}</div>
                  <p className="text-xs text-slate-600">{method.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Member Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={form.memberRemarks}
              onChange={(e) => setForm({ ...form, memberRemarks: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              rows="3"
              placeholder="Any additional notes or special instructions..."
            />
          </div>

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Terms & Conditions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Charity donations require admin approval</li>
              <li>• Maximum donation is 30% of your total contributions</li>
              <li>• Donations are non-refundable once approved</li>
              <li>• Tax receipts will be provided for eligible donations</li>
              <li>• Admin reserves the right to verify organization details</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/member/dashboard")}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Submit Donation Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}