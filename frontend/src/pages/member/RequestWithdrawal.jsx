import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Calendar, AlertCircle, FileText, User } from "lucide-react";
import { requestWithdrawal, getMemberProfile } from "../../api/memberProfile.api";

export default function RequestWithdrawal() {
  const navigate = useNavigate();
  const [memberProfile, setMemberProfile] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    reason: "",
    urgency: "normal",
    guarantor: "",
    repaymentPlan: "3_months",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  const fetchMemberProfile = async () => {
    try {
      const response = await getMemberProfile();
      setMemberProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await requestWithdrawal(form);
      
      alert(`Withdrawal Request Submitted! 📝\n\nRequest ID: ${response.data.requestId}\nAmount: ₹${form.amount}\nStatus: Pending Admin Approval\n\nNext Steps:\n1. Admin will review your request\n2. Committee approval (if amount > ₹10,000)\n3. Funds will be disbursed after approval\n\nYou will be notified of the decision within 2-3 business days.`);
      navigate("/member/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit withdrawal request";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const totalContributions = memberProfile?.contributionCount * 5000 || 0;
  const maxWithdrawal = Math.floor(totalContributions * 0.8); // 80% of total contributions

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate("/member/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Banknote className="w-6 h-6 text-orange-600" />
              Request Withdrawal
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Request to withdraw funds from your contributions
            </p>
          </div>

          {/* Eligibility Info */}
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Your Withdrawal Eligibility
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Contributions:</span>
                <div className="font-medium text-blue-900">₹{totalContributions.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-blue-700">Available for Withdrawal:</span>
                <div className="font-medium text-blue-900">₹{maxWithdrawal.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-blue-700">Withdrawal Limit:</span>
                <div className="font-medium text-blue-900">80% of contributions</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Banknote className="w-4 h-4 inline mr-1" />
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  min="1000"
                  max={maxWithdrawal}
                  step="500"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Minimum: ₹1,000 | Maximum: ₹{maxWithdrawal.toLocaleString()} (80% of your contributions)
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Reason for Withdrawal
              </label>
              <select
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              >
                <option value="">Select reason</option>
                <option value="medical_emergency">Medical Emergency</option>
                <option value="family_emergency">Family Emergency</option>
                <option value="education_expenses">Education Expenses</option>
                <option value="business_need">Business Need</option>
                <option value="home_repair">Home Repair/Maintenance</option>
                <option value="marriage_expenses">Marriage/Wedding Expenses</option>
                <option value="debt_repayment">Debt Repayment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="normal"
                    checked={form.urgency === "normal"}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm text-green-700">Normal</div>
                    <div className="text-xs text-slate-500">5-7 days</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="urgent"
                    checked={form.urgency === "urgent"}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm text-orange-700">Urgent</div>
                    <div className="text-xs text-slate-500">2-3 days</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="emergency"
                    checked={form.urgency === "emergency"}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm text-red-700">Emergency</div>
                    <div className="text-xs text-slate-500">Same day</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Guarantor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Guarantor Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.guarantor}
                onChange={(e) => setForm({ ...form, guarantor: e.target.value })}
                placeholder="Name of community member who can vouch for you"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Required for withdrawals above ₹5,000
              </p>
            </div>

            {/* Repayment Plan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Repayment Plan
              </label>
              <select
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.repaymentPlan}
                onChange={(e) => setForm({ ...form, repaymentPlan: e.target.value })}
                required
              >
                <option value="3_months">3 Months (No Interest)</option>
                <option value="6_months">6 Months (2% Interest)</option>
                <option value="12_months">12 Months (5% Interest)</option>
                <option value="lump_sum">Lump Sum (Next Contribution)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Choose how you plan to repay the withdrawn amount
              </p>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Details
              </label>
              <textarea
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="3"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Provide additional details about your withdrawal request..."
              />
            </div>

            {/* Terms & Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Terms & Conditions</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Withdrawal requests are subject to admin and committee approval</li>
                <li>• Emergency requests (same day) may incur a 1% processing fee</li>
                <li>• Repayment must be completed as per the selected plan</li>
                <li>• Failure to repay may affect future withdrawal eligibility</li>
                <li>• Maximum 2 withdrawals per year per member</li>
              </ul>
            </div>

            {/* Request Summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 mb-2">Request Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">Amount:</span>
                  <span className="font-medium text-orange-900">₹{form.amount || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Reason:</span>
                  <span className="font-medium text-orange-900 capitalize">
                    {form.reason.replace(/_/g, " ") || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Urgency:</span>
                  <span className="font-medium text-orange-900 capitalize">{form.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Repayment:</span>
                  <span className="font-medium text-orange-900">
                    {form.repaymentPlan.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/member/dashboard")}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.amount || parseFloat(form.amount) > maxWithdrawal}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : `Request ₹${form.amount || "0"}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}