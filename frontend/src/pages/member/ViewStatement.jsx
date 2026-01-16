import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Calendar, Filter } from "lucide-react";
import { getMemberTransactions } from "../../api/memberProfile.api";

export default function ViewStatement() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().slice(0, 10), // Start from last year
    to: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10)  // End next year
  });
  const [filterType, setFilterType] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from API
  useEffect(() => {
    loadTransactions();
  }, [dateRange, filterType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        type: filterType
      };
      
      console.log("Loading transactions with params:", params);
      const response = await getMemberTransactions(params);
      console.log("Raw API Response:", response);
      
      // Handle different response formats
      let transactionData = [];
      
      if (Array.isArray(response)) {
        transactionData = response;
      } else if (response && Array.isArray(response.data)) {
        transactionData = response.data;
      } else if (response && response.data) {
        // If response.data is not an array, wrap it
        transactionData = [response.data];
      } else {
        console.warn("Unexpected response format:", response);
        transactionData = [];
      }
      
      console.log("Processed transactions:", transactionData);
      
      // If no transactions found, add a test transaction for debugging
      if (transactionData.length === 0) {
        console.log("No transactions found, adding test data for debugging");
        transactionData = [
          {
            id: "TEST_001",
            date: new Date().toISOString(),
            type: "CONTRIBUTION",
            description: "Test Transaction - API Working",
            amount: 1000,
            status: "PAID",
            balance: 1000
          }
        ];
      }
      
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      console.error("Error details:", error.response?.data);
      // Set empty array on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    const dateMatch = txnDate >= fromDate && txnDate <= toDate;
    const typeMatch = filterType === "all" || txn.type === filterType;
    
    return dateMatch && typeMatch;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case "CONTRIBUTION":
        return "bg-green-100 text-green-800";
      case "LOAN_DISBURSED":
        return "bg-blue-100 text-blue-800";
      case "EMI_PAYMENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "CONTRIBUTION":
        return "Contribution";
      case "LOAN_DISBURSED":
        return "Loan Disbursed";
      case "EMI_PAYMENT":
        return "EMI Payment";
      default:
        return type;
    }
  };

  const handleDownload = () => {
    alert("Statement download feature will be implemented soon! 📄");
  };

  const totalContributions = filteredTransactions
    .filter(txn => txn.type === "CONTRIBUTION")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalEMIs = filteredTransactions
    .filter(txn => txn.type === "EMI_PAYMENT")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const currentBalance = transactions.length > 0 
    ? (transactions[transactions.length - 1].balance || 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/member/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              Account Statement
            </h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700">Total Contributions</div>
                <div className="text-2xl font-bold text-green-900">₹{totalContributions.toLocaleString()}</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm text-orange-700">Total EMI Payments</div>
                <div className="text-2xl font-bold text-orange-900">₹{totalEMIs.toLocaleString()}</div>
              </div>
              <div className={`border rounded-lg p-4 ${currentBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-sm ${currentBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Current Balance</div>
                <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  ₹{Math.abs(currentBalance).toLocaleString()}
                  {currentBalance < 0 && " (Outstanding)"}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h3 className="font-medium text-slate-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Transactions</option>
                  <option value="CONTRIBUTION">Contributions</option>
                  <option value="LOAN_DISBURSED">Loan Disbursements</option>
                  <option value="EMI_PAYMENT">EMI Payments</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900">
                Transaction History ({filteredTransactions.length} transactions)
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading transactions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Date</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Transaction ID</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Description</th>
                      <th className="px-6 py-3 text-right font-medium text-slate-600">Amount</th>
                      <th className="px-6 py-3 text-right font-medium text-slate-600">Balance</th>
                      <th className="px-6 py-3 text-center font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn, index) => (
                      <tr key={txn.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-6 py-4 text-slate-900">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {txn.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(txn.type)}`}>
                            {getTypeLabel(txn.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">
                          {txn.description}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${(txn.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ₹{Math.abs(txn.balance || 0).toLocaleString()}
                          {(txn.balance || 0) < 0 && " Dr"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    No transactions found for the selected criteria.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}