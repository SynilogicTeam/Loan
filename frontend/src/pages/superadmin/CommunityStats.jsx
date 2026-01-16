import { useEffect, useState } from "react";
import { getCommunityStats } from "../../api/dashboard.api";

export default function CommunityStats() {
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getCommunityStats();
    setList(res.data || []);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">
        Community-wise Stats
      </h2>

      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Community</th>
            <th className="p-2 text-left">Members</th>
            <th className="p-2 text-left">Total Loans</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.totalMembers}</td>
              <td className="p-2">₹{c.totalLoans}</td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="text-center text-slate-400 py-6"
              >
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
