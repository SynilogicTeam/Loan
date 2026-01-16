import { useEffect, useState } from "react";
import {
  createContribution,
  markContributionPaid,
  getAllContributions,
} from "../../api/contribution.api";

export default function Contributions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state (admin create)
  const [form, setForm] = useState({
    memberId: "",
    month: "",
    amount: "",
    dueDate: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllContributions(); // Changed from getMyContributions
      console.log("Admin Contributions Response:", res.data);
      setList(res.data || []);
    } catch (error) {
      console.error("Failed to load contributions:", error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
    // Auto-refresh contributions every 15 seconds
    const interval = setInterval(() => {
      load();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.month || !form.amount || !form.dueDate) {
      alert("All fields required");
      return;
    }
    await createContribution({
      memberId: form.memberId,
      month: form.month,
      amount: Number(form.amount),
      dueDate: form.dueDate,
    });
    setForm({ memberId: "", month: "", amount: "", dueDate: "" });
    load();
  };

  const pay = async (id) => {
    if (!confirm("Mark contribution as PAID?")) return;
    await markContributionPaid(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contributions</h2>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* CREATE (ADMIN) */}
      <form
        onSubmit={submit}
        className="bg-white p-4 rounded-lg border grid grid-cols-4 gap-3"
      >
        <input
          className="border p-2 rounded"
          placeholder="Member ID"
          value={form.memberId}
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Month (e.g. Apr-2025)"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
        <button className="col-span-4 bg-indigo-600 text-white py-2 rounded">
          Create Contribution
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Member</th>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Late Fee</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-3" colSpan={6}>Loading…</td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td className="p-3" colSpan={6}>No records</td>
              </tr>
            )}
            {list.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-2">
                  <div>
                    <div className="font-medium">{c.memberId?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{c.memberId?.email || ''}</div>
                  </div>
                </td>
                <td className="p-2">{c.month}</td>
                <td className="p-2">₹{c.amount}</td>
                <td className="p-2">₹{c.lateFee || 0}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-2">
                  {c.status === "PENDING" && (
                    <button
                      onClick={() => pay(c._id)}
                      className="text-indigo-600 hover:underline"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
