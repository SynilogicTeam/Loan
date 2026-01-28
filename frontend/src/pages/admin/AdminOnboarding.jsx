import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, CheckCircle, Loader2, ArrowRight, Sparkles, Crown, Check } from "lucide-react";
import api from "../../api/axios";

export default function AdminOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        registrationNumber: "",
        planId: "",
        fixedContributionAmount: "5000",
        fixedContributionDueDay: "10"
    });

    useEffect(() => {
        checkCommunityStatus();
        loadPlans();
    }, []);

    const checkCommunityStatus = async () => {
        try {
            const response = await api.get("/admin/community/status");
            setAdminName(response.data.adminName);

            if (response.data.hasCommunity) {
                // Admin already has community, redirect to dashboard
                navigate("/admin/dashboard");
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error checking community status:", error);
            setLoading(false);
        }
    };

    const loadPlans = async () => {
        try {
            const response = await api.get("/platform/plans/public");
            setPlans(response.data);
            console.log("Loaded plans:", response.data);
        } catch (error) {
            console.error("Error loading plans:", error);
        }
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();

        if (!form.name || !form.description || !form.address) {
            alert("Please fill in all required fields");
            return;
        }

        if (!form.planId) {
            alert("Please select a subscription plan");
            return;
        }

        try {
            setCreating(true);
            const response = await api.post("/admin/community/create", {
                name: form.name,
                description: form.description,
                address: form.address,
                registrationNumber: form.registrationNumber,
                planId: form.planId,
                fixedContributionAmount: parseFloat(form.fixedContributionAmount),
                fixedContributionDueDay: parseInt(form.fixedContributionDueDay)
            });

            alert(`🎉 ${response.data.message}\n\nCommunity: ${response.data.community.name}\nSession: ${response.data.session.name}`);

            // Update permissions in local storage
            if (response.data.permissions) {
                localStorage.setItem("permissions", JSON.stringify(response.data.permissions));
            }

            // Update user data in local storage
            const userData = JSON.parse(localStorage.getItem("userData") || '{}');
            userData.communityId = response.data.community._id;
            userData.communityName = response.data.community.name;
            localStorage.setItem("userData", JSON.stringify(userData));

            // Redirect to dashboard
            navigate("/admin/dashboard");
            window.location.reload(); // Force refresh to load new community data

        } catch (error) {
            console.error("Error creating community:", error);
            alert(error.response?.data?.message || "Failed to create community");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Checking your account...</p>
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Community</h1>
                        <p className="text-slate-600">Set up your community fund management system</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <form onSubmit={handleCreateCommunity} className="space-y-6">
                            {/* Community Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Community Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Shree Shyam Samiti"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Brief description of your community..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Community address"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Subscription Plan Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Choose Subscription Plan <span className="text-red-500">*</span>
                                </label>
                                <div className="grid gap-4">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan._id}
                                            onClick={() => {
                                                setSelectedPlan(plan);
                                                setForm({ ...form, planId: plan._id });
                                            }}
                                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPlan?._id === plan._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            {plan.isPopular && (
                                                <div className="absolute -top-3 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <Crown className="w-3 h-3" />
                                                    POPULAR
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-slate-900">{plan.displayName}</h3>
                                                    <p className="text-sm text-slate-600 mt-1">{plan.description}</p>

                                                    <div className="mt-3 flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-blue-600">₹{plan.price.monthly}</span>
                                                        <span className="text-sm text-slate-500">/month</span>
                                                    </div>

                                                    {/* Features */}
                                                    <div className="mt-3 space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <Check className="w-4 h-4 text-green-600" />
                                                            <span>{plan.features.maxMembers === -1 ? 'Unlimited' : plan.features.maxMembers} members</span>
                                                        </div>
                                                        {plan.features.advancedReports && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                <Check className="w-4 h-4 text-green-600" />
                                                                <span>Advanced Reports</span>
                                                            </div>
                                                        )}
                                                        {plan.features.customBranding && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                <Check className="w-4 h-4 text-green-600" />
                                                                <span>Custom Branding</span>
                                                            </div>
                                                        )}
                                                        {plan.features.prioritySupport && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                <Check className="w-4 h-4 text-green-600" />
                                                                <span>Priority Support</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Permissions */}
                                                    {plan.permissions && plan.permissions.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                                            <p className="text-xs font-medium text-slate-700 mb-2">Included Permissions:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {plan.permissions.slice(0, 4).map((perm, idx) => (
                                                                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                        {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                ))}
                                                                {plan.permissions.length > 4 && (
                                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                                        +{plan.permissions.length - 4} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedPlan?._id === plan._id && (
                                                    <div className="ml-4">
                                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {plans.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">Loading plans...</p>
                                )}
                            </div>

                            {/* Contribution Settings */}
                            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                                <h3 className="font-medium text-slate-900">Monthly Contribution Settings</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Fixed Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={form.fixedContributionAmount}
                                            onChange={(e) => setForm({ ...form, fixedContributionAmount: e.target.value })}
                                            min="100"
                                            step="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Due Day (1-31)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={form.fixedContributionDueDay}
                                            onChange={(e) => setForm({ ...form, fixedContributionDueDay: e.target.value })}
                                            min="1"
                                            max="31"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                    disabled={creating}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create Community
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">
                        Welcome, {adminName}! 👋
                    </h1>
                    <p className="text-xl text-slate-600">
                        Let's get your community fund management started
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Option 1: Create Community */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 hover:border-blue-400 transition-all hover:shadow-2xl">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Building2 className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Create Community</h2>
                            <p className="text-slate-600 mb-6">
                                Set up your own community fund and start managing members, contributions, and loans immediately.
                            </p>

                            <div className="space-y-2 mb-6 text-left">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Instant setup in 2 minutes</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Full control over settings</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Start adding members right away</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 group"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Option 2: Wait for Assignment */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 hover:border-slate-300 transition-all">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Wait for Assignment</h2>
                            <p className="text-slate-600 mb-6">
                                If you're joining an existing community, wait for the Super Admin to assign you to a community.
                            </p>

                            <div className="space-y-2 mb-6 text-left">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Join existing community</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Access pre-configured settings</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">Work with existing members</span>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4 text-sm text-slate-700">
                                <p className="font-medium mb-1">📧 Contact Super Admin</p>
                                <p className="text-slate-600">
                                    Reach out to your Super Admin to get assigned to a community. You'll receive access once assigned.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skip Option */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="text-slate-600 hover:text-slate-900 font-medium underline"
                    >
                        Skip for now - Explore dashboard first
                    </button>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-4 text-sm text-slate-500">
                    <p>Need help? Contact support at support@communityfund.com</p>
                </div>
            </div>
        </div>
    );
}
