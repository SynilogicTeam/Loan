import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Mail, MapPin, Send, Clock } from "lucide-react";
import { contactAdmin } from "../../api/memberProfile.api";

export default function ContactAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await contactAdmin(form);
      
      alert(`Message sent successfully! 📧

Ticket ID: ${response.data.ticketId}
${response.data.message}

Expected response time based on priority (${form.priority}):
${form.priority === "urgent" ? "Within 2 hours" :
  form.priority === "high" ? "Within 6 hours" :
  form.priority === "normal" ? "Within 24 hours" : "Within 48 hours"}`);
      
      navigate("/member/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send message";
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Contact Admin
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Send a message to your community admin for help and support
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="contribution">Contribution Related</option>
                      <option value="loan">Loan Related</option>
                      <option value="account">Account Issues</option>
                      <option value="technical">Technical Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of your query"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Please provide detailed information about your query or issue..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 20 characters required
                  </p>
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
                    disabled={loading || form.message.length < 20}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-6">
            {/* Admin Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Admin Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Phone</p>
                    <p className="text-sm text-slate-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">admin@community.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Office Address</p>
                    <p className="text-sm text-slate-600">Community Center, Main Street</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Office Hours</p>
                    <p className="text-sm text-slate-600">Mon-Fri: 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Expected Response Time</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Urgent:</strong> Within 2 hours</li>
                <li>• <strong>High:</strong> Within 6 hours</li>
                <li>• <strong>Normal:</strong> Within 24 hours</li>
                <li>• <strong>Low:</strong> Within 48 hours</li>
              </ul>
            </div>

            {/* Quick FAQ */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">How do I make a contribution?</p>
                  <p className="text-xs text-slate-600">Use the "Make Contribution" button on your dashboard to pay monthly contributions.</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">When will my loan be approved?</p>
                  <p className="text-xs text-slate-600">Loan applications are typically reviewed within 3-5 business days.</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">How can I update my profile?</p>
                  <p className="text-xs text-slate-600">Use the "Request Profile Update" feature in your profile section.</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">What if I miss an EMI payment?</p>
                  <p className="text-xs text-slate-600">Contact admin immediately to avoid penalty charges and discuss payment options.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}