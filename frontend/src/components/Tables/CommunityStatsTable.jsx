export default function CommunityStatsTable({ rows = [], loading }) {
    if (loading) {
      return (
        <div className="bg-white rounded-xl border p-4 text-slate-400">
          Loading community stats…
        </div>
      );
    }
  
    if (!rows.length) {
      return (
        <div className="bg-white rounded-xl border p-6 text-center text-slate-400">
          No community data available
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-slate-600">
            Community-wise Overview
          </h3>
        </div>
  
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Community</th>
                <th className="px-4 py-2 text-right">Members</th>
                <th className="px-4 py-2 text-right">Contributions</th>
                <th className="px-4 py-2 text-right">Loans</th>
                <th className="px-4 py-2 text-right">Balance</th>
              </tr>
            </thead>
  
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id || r._id || r.name || i}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2 text-right">{r.members}</td>
                  <td className="px-4 py-2 text-right">
                    ₹{r.contributions}
                  </td>
                  <td className="px-4 py-2 text-right">₹{r.loans}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    ₹{r.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  