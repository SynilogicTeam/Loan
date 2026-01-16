import { useEffect, useState } from "react";
import { getLedger } from "../../api/ledger.api";

export default function Reports() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await getLedger();
      setLedger(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ledger / Reports</h2>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Description</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-3">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && ledger.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3">
                  No ledger records found
                </td>
              </tr>
            )}

            {ledger.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-2">
                  {new Date(l.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      l.type === "CREDIT"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.type}
                  </span>
                </td>
                <td className="p-2">{l.category}</td>
                <td className="p-2 font-medium">₹{l.amount}</td>
                <td className="p-2 text-slate-600">
                  {l.description || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
