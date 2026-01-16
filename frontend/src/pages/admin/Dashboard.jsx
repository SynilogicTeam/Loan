import { useEffect, useState } from "react";
import { getDashboard } from "../../api/dashboard.api";
import { getCommunities } from "../../api/community.api";

// Components
import StatCard from "../../components/Cards/StatCard";
import FundChart from "../../components/Charts/FundChart";
import CommunityStatsTable from "../../components/Tables/CommunityStatsTable";
import AuditLogsTable from "../../components/Tables/AuditLogsTable";

// Icons
import {
  Users,
  Wallet,
  HandCoins,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role"); // ADMIN | SUPER_ADMIN

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDashboard();
      setData(res.data);

      // For Super Admin, also fetch communities data
      if (role === "SUPER_ADMIN") {
        try {
          const communitiesRes = await getCommunities();
          setCommunities(communitiesRes.data || []);
        } catch (err) {
          console.error("Failed to load communities:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      load();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /* =========================
     CHART DATA
  ========================= */
  const chartData = data
    ? [
        { month: "Opening", amount: data.openingBalance || 0 },
        { month: "Contributions", amount: data.totalContributions || 0 },
        { month: "Loans", amount: data.totalLoans || 0 },
        { month: "Closing", amount: data.closingBalance || 0 },
      ]
    : [];

  /* =========================
     COMMUNITY TABLE DATA (REAL DATA FOR SUPER ADMIN)
  ========================= */
  const communityRows = role === "SUPER_ADMIN" 
    ? communities.map(community => ({
        name: community.name,
        members: community.memberCount || 0,
        contributions: community.totalContributions || 0,
        loans: community.totalLoans || 0,
        balance: community.balance || 0,
      }))
    : [];

  /* =========================
     AUDIT LOGS (SUPER_ADMIN)
  ========================= */
  const auditRows = [
    {
      actor: "SuperAdmin",
      action: "CREATE_MEMBER",
      target: "Ramesh Kumar",
      ip: "103.21.45.11",
      createdAt: Date.now(),
    },
    {
      actor: "SuperAdmin",
      action: "APPROVE_LOAN",
      target: "Loan #4821",
      ip: "103.21.45.11",
      createdAt: Date.now(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {role === "SUPER_ADMIN" ? "System Overview" : "Dashboard"}
          </h2>
          <p className="text-slate-600">
            {role === "SUPER_ADMIN" 
              ? "Monitor all communities and system-wide metrics" 
              : "Overview of your community's financial activities"
            }
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={role === "SUPER_ADMIN" ? "Total Members (All)" : "Total Members"}
          value={loading ? "Loading…" : data?.totalMembers ?? 0}
          icon={Users}
        />
        <StatCard
          title={role === "SUPER_ADMIN" ? "Total Contributions (All)" : "Total Contributions"}
          value={
            loading ? "Loading…" : `₹${data?.totalContributions ?? 0}`
          }
          icon={Wallet}
        />
        <StatCard
          title={role === "SUPER_ADMIN" ? "Total Loans (All)" : "Total Loans"}
          value={loading ? "Loading…" : `₹${data?.totalLoans ?? 0}`}
          icon={HandCoins}
        />
        <StatCard
          title={role === "SUPER_ADMIN" ? "Overdue EMIs (All)" : "Overdue EMIs"}
          value={loading ? "Loading…" : data?.overdueEmis ?? 0}
          icon={AlertTriangle}
        />
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-4 rounded-xl border">
        <h3 className="text-lg font-semibold mb-4">
          {role === "SUPER_ADMIN" ? "System-wide Fund Flow" : "Fund Flow"}
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading chart…</p>
        ) : (
          <FundChart data={chartData} />
        )}
      </div>

      {/* ================= BALANCES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-slate-500">
            {role === "SUPER_ADMIN" ? "Total Opening Balance" : "Opening Balance"}
          </p>
          <p className="text-2xl font-bold mt-1">
            ₹{data?.openingBalance ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-slate-500">
            {role === "SUPER_ADMIN" ? "Total Closing Balance" : "Closing Balance"}
          </p>
          <p className="text-2xl font-bold mt-1">
            ₹{data?.closingBalance ?? 0}
          </p>
        </div>
      </div>

      {/* ================= COMMUNITY TABLE (SUPER ADMIN ONLY) ================= */}
      {role === "SUPER_ADMIN" && (
        <CommunityStatsTable
          rows={communityRows}
          loading={loading}
        />
      )}

      {/* ================= AUDIT LOGS (SUPER_ADMIN ONLY) ================= */}
      {role === "SUPER_ADMIN" && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Recent System Activity</h3>
          </div>
          <AuditLogsTable rows={auditRows} loading={loading} />
        </div>
      )}
    </div>
  );
}
