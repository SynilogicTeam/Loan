import { ShieldCheck } from "lucide-react";

export default function AuditLogsTable({ rows = [], loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-4 text-slate-400">
        Loading audit logs…
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-slate-400">
        No audit activity yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <ShieldCheck size={16} className="text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-700">
          Audit Logs
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Actor</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Target</th>
              <th className="px-4 py-2 text-left">IP</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-medium">{r.actor}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-xs">
                    {r.action}
                  </span>
                </td>
                <td className="px-4 py-2">{r.target}</td>
                <td className="px-4 py-2 text-slate-500">{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
