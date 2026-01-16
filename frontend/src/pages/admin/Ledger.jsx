import { useEffect, useState } from "react";

export default function Ledger() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ledger', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLedger(data || []);
      } else {
        console.error('Failed to load ledger');
        setLedger([]);
      }
    } catch (error) {
      console.error('Error loading ledger:', error);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
    
    // Auto-refresh ledger every 20 seconds
    const interval = setInterval(() => {
      loadLedger();
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Ledger / Reports</h2>
          <p className="text-slate-600">Transaction history and financial records</p>
        </div>
        <button
          onClick={loadLedger}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Balance</th>
              <th className="p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-3 text-center text-slate-400" colSpan={6}>
                  Loading ledger records...
                </td>
              </tr>
            )}
            {!loading && ledger.length === 0 && (
              <tr>
                <td className="p-3 text-center text-slate-400" colSpan={6}>
                  No ledger records found
                </td>
              </tr>
            )}
            {ledger.map((entry) => (
              <tr key={entry._id} className="border-t hover:bg-slate-50">
                <td className="p-3 text-slate-600">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.type === "CREDIT"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {entry.type}
                  </span>
                </td>
                <td className="p-3">{entry.category}</td>
                <td className="p-3 font-medium">
                  {entry.type === "CREDIT" ? "+" : "-"}₹{entry.amount}
                </td>
                <td className="p-3 font-bold">₹{entry.balance}</td>
                <td className="p-3 text-slate-600">{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
  