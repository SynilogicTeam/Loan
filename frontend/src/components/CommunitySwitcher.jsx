import { useEffect, useState } from "react";
import { getCommunities } from "../api/community.api";

export default function CommunitySwitcher() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("communityId") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const role = localStorage.getItem("role");
    
    // Only load communities for Super Admin
    if (role !== "SUPER_ADMIN") {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getCommunities();
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to load communities:", err);
      setError("Failed to load communities");
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  const change = (e) => {
    const id = e.target.value;
    setSelected(id);
    localStorage.setItem("communityId", id);
    window.location.reload(); // simple & safe
  };

  const role = localStorage.getItem("role");

  // For Super Admin, show a simple info header instead of dropdown
  if (role === "SUPER_ADMIN") {
    if (loading) {
      return (
        <div className="px-4 py-2 border-b border-slate-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-800">System Overview</span>
              <p className="text-xs text-blue-600">Loading communities...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-4 py-2 border-b border-slate-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-800">System Overview</span>
              <p className="text-xs text-blue-600">Viewing data across all communities</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 py-2 border-b border-slate-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-blue-800">System Overview</span>
            <p className="text-xs text-blue-600">Viewing data across all communities</p>
          </div>
          <div className="text-xs text-blue-600">
            {list.length} Communities Total
          </div>
        </div>
      </div>
    );
  }

  // For regular admin, don't show anything (they're assigned to one community)
  return null;
}
