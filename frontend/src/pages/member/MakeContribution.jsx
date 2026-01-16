import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Calendar, DollarSign } from "lucide-react";
import { makeContribution } from "../../api/memberProfile.api";
import RazorpayPayment from "../../components/Payment/RazorpayPayment";

export default function MakeContribution() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "5000",
    month: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
    paymentMethod: "online",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [contributionId, setContributionId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await makeContribution(form);
      
      if (form.paymentMethod === "online") {
        // For online payments, show Razorpay
        setContributionId(response.data.contribution._id);
        setShowPayment(true);
        setLoading(false);
      } else {
        // For cash/bank payments, show confirmation
        if (form.paymentMethod === "cash") {
          alert("Contribution request submitted! 💵\n\nNext Steps:\n1. Pay cash amount to your community admin\n2. Admin will confirm receipt\n3. Contribution will be marked as paid\n\nStatus: Pending Cash Payment");
        } else {
          alert("Contribution request submitted! 🏦\n\nNext Steps:\n1. Transfer amount to community bank account\n2. Share transaction details with admin\n3. Admin will verify and confirm\n\nStatus: Pending Bank Transfer");
        }
        navigate("/member/dashboard");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to record contribution";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResponse, verificationData) => {
    alert(`Payment Successful! ✅\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\n\nYour contribution has been recorded and payment confirmed.`);
    navigate("/member/dashboard");
  };

  const handlePaymentError = (error) => {
    alert(`Payment Failed: ${error}\n\nYou can try again or choose a different payment method.`);
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setShowPayment(false)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Form
              </button>
            </div>
          </div>
        </header>

        {/* Payment Section */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                Complete Payment
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Secure payment powered by Razorpay
              </p>
            </div>

            <div className="p-6">
              {/* Payment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-900 mb-2">Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Contribution Amount:</span>
                    <span className="font-medium text-green-900">₹{form.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Month:</span>
                    <span className="font-medium text-green-900">
                      {new Date(form.month + "-01").toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay Payment Button */}
              <RazorpayPayment
                amount={parseFloat(form.amount)}
                description={`Monthly Contribution - ${new Date(form.month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                contributionId={contributionId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                buttonText={`Pay ₹${form.amount} with Razorpay`}
              />

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  Secure payment gateway • SSL encrypted • PCI DSS compliant
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <CreditCard className="w-6 h-6 text-green-600" />
              Make Monthly Contribution
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Pay your monthly contribution to the community fund
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Contribution Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  min="100"
                  step="100"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Standard monthly contribution is ₹5,000
              </p>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Contribution Month
              </label>
              <input
                type="month"
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={form.paymentMethod === "online"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">Online Payment</div>
                    <div className="text-xs text-slate-500">UPI/Card/Net Banking</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={form.paymentMethod === "cash"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">Cash Payment</div>
                    <div className="text-xs text-slate-500">Pay to admin</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={form.paymentMethod === "bank"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">Bank Transfer</div>
                    <div className="text-xs text-slate-500">Direct transfer</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Payment Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Amount:</span>
                  <span className="font-medium text-green-900">₹{form.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Month:</span>
                  <span className="font-medium text-green-900">
                    {new Date(form.month + "-01").toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Method:</span>
                  <span className="font-medium text-green-900 capitalize">
                    {form.paymentMethod === "online" ? "Online Payment" : 
                     form.paymentMethod === "cash" ? "Cash Payment" : "Bank Transfer"}
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
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Pay ₹${form.amount}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}