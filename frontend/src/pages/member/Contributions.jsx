import { useEffect, useState } from "react";
import { DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "../../api/axios";

export default function Contributions() {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchContributions();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchContributions, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchContributions = async () => {
        try {
            setLoading(true);
            const response = await api.get("/contributions/my");
            console.log("Member Contributions:", response.data);
            setContributions(response.data || []);
        } catch (error) {
            console.error("Error fetching contributions:", error);
            setContributions([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PAID":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "PENDING":
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-slate-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-800 border-green-200";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };

    const filteredContributions = contributions.filter(c => {
        if (filter === "all") return true;
        return c.status === filter.toUpperCase();
    });

    const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const paidContributions = contributions.filter(c => c.status === "PAID").length;
    const pendingContributions = contributions.filter(c => c.status === "PENDING").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        My Contributions
                    </h1>
                    <p className="text-slate-600 mt-1">View your monthly contribution history</p>
                </div>
                <button
                    onClick={fetchContributions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total Amount</p>
                            <p className="text-2xl font-bold text-slate-900">
                                ₹{totalContributions.toLocaleString()}
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
                            <p className="text-sm text-slate-600">Paid</p>
                            <p className="text-2xl font-bold text-slate-900">{paidContributions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Pending</p>
                            <p className="text-2xl font-bold text-slate-900">{pendingContributions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap gap-2">
                    {["all", "paid", "pending"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === status
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {status}
                            {status === "all" && (
                                <span className="ml-1 text-xs">({contributions.length})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contributions List */}
            <div className="bg-white rounded-lg shadow">
                <div className="divide-y divide-slate-200">
                    {filteredContributions.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No contributions</h3>
                            <p className="text-slate-600">
                                {filter === "all"
                                    ? "No contributions have been created yet."
                                    : `No ${filter} contributions found.`}
                            </p>
                        </div>
                    ) : (
                        filteredContributions.map((contribution) => (
                            <div key={contribution._id} className="px-6 py-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {getStatusIcon(contribution.status)}
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {contribution.month} - ₹{contribution.amount.toLocaleString()}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    Due: {new Date(contribution.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contribution.status)}`}>
                                                {contribution.status}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <span className="text-sm text-slate-500">Amount</span>
                                                <p className="font-medium">₹{contribution.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-slate-500">Late Fee</span>
                                                <p className="font-medium text-red-600">₹{contribution.lateFee || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-slate-500">Total</span>
                                                <p className="font-medium text-blue-600">
                                                    ₹{((contribution.amount || 0) + (contribution.lateFee || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        {contribution.status === "PAID" && contribution.paidAt && (
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <p className="text-sm text-green-700">
                                                    ✓ Paid on {new Date(contribution.paidAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}

                                        {contribution.status === "PENDING" && (
                                            <div className="bg-yellow-50 rounded-lg p-3">
                                                <p className="text-sm text-yellow-700">
                                                    ⏳ Payment pending - Please pay before due date
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
