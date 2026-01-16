import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, DollarSign, Calendar, Percent } from "lucide-react";
import { applyForLoan } from "../../api/memberProfile.api";

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    purpose: "",
    duration: "12",
    guarantor1: "",
    guarantor2: "",
    monthlyIncome: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  const calculateEMI = () => {
    const principal = parseFloat(form.amount) || 0;
    const rate = 12 / 100 / 12; // 12% annual rate
    const months = parseInt(form.duration) || 12;
    
    if (principal > 0) {
      const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      return Math.round(emi);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await applyForLoan(form);
      
      alert(`Loan application submitted successfully! 📋

Application Details:
• Loan Amount: ₹${parseFloat(form.amount).toLocaleString()}
• Monthly EMI: ₹${response.data.emi.toLocaleString()}
• Total Amount: ₹${response.data.totalAmount.toLocaleString()}

Your application will be reviewed within 3-5 business days.`);
      
      navigate("/member/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit loan application";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Apply for Loan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Submit your loan application for community fund
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Loan Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    min="5000"
                    max="500000"
                    step="1000"
                    placeholder="50000"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Minimum: ₹5,000 | Maximum: ₹5,00,000
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Loan Duration <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  required
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purpose of Loan <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                required
              >
                <option value="">Select purpose</option>
                <option value="business">Business Investment</option>
                <option value="education">Education</option>
                <option value="medical">Medical Emergency</option>
                <option value="home">Home Improvement</option>
                <option value="marriage">Marriage/Function</option>
                <option value="agriculture">Agriculture</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Monthly Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Income <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.monthlyIncome}
                  onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                  min="5000"
                  placeholder="25000"
                  required
                />
              </div>
            </div>

            {/* Guarantors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Guarantor 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.guarantor1}
                  onChange={(e) => setForm({ ...form, guarantor1: e.target.value })}
                  placeholder="Full name of guarantor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Guarantor 2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.guarantor2}
                  onChange={(e) => setForm({ ...form, guarantor2: e.target.value })}
                  placeholder="Full name of guarantor"
                  required
                />
              </div>
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Information
              </label>
              <textarea
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Any additional information that supports your loan application..."
              />
            </div>

            {/* Loan Summary */}
            {form.amount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Loan Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 block">Principal Amount</span>
                    <span className="font-medium text-blue-900">₹{form.amount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block">Interest Rate</span>
                    <span className="font-medium text-blue-900">12% per annum</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block">Duration</span>
                    <span className="font-medium text-blue-900">{form.duration} months</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block">Monthly EMI</span>
                    <span className="font-medium text-blue-900">₹{calculateEMI()}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Total Amount Payable:</span>
                    <span className="font-medium text-blue-900">₹{calculateEMI() * parseInt(form.duration)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Terms & Conditions</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Loan approval is subject to community fund availability</li>
                <li>• Interest rate is 12% per annum (1% per month)</li>
                <li>• Two guarantors from the community are mandatory</li>
                <li>• EMI must be paid on or before the due date</li>
                <li>• Late payment may attract penalty charges</li>
              </ul>
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
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}