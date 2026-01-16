import { useEffect, useState } from "react";
import { getMembers, createMember } from "../../api/member.api";
import { getCommunities } from "../../api/community.api";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const role = localStorage.getItem("role");
  const isSuper = role === "SUPER_ADMIN";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    communityId: "",
  });

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await getMembers();
      setMembers(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunities = async () => {
    if (isSuper) {
      try {
        const res = await getCommunities();
        setCommunities(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    loadMembers();
    loadCommunities();

    // Auto-refresh members every 30 seconds
    const interval = setInterval(() => {
      loadMembers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      addToast("All fields are required", "warning");
      return;
    }

    if (isSuper && !form.communityId) {
      addToast("Please select a community", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await createMember(form);
      setForm({ name: "", email: "", phone: "", password: "", communityId: "" });
      loadMembers();
      addToast("Member created successfully!", "success");
    } catch (err) {
      const errorMsg = err.userMessage || err.response?.data?.message || "Failed to create member";
      addToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Members</h2>
          <p className="text-slate-600">
            {isSuper ? "Manage members across all communities" : "Manage your community members"}
          </p>
        </div>
        <Button
          onClick={loadMembers}
          loading={loading}
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* CREATE MEMBER */}
      <form
        onSubmit={submit}
        className="bg-white p-4 rounded-lg border"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="password"
            className="border p-2 rounded"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Community Selector for Super Admin */}
          {isSuper && (
            <select
              className="border p-2 rounded col-span-2"
              value={form.communityId}
              onChange={(e) => setForm({ ...form, communityId: e.target.value })}
            >
              <option value="">Select Community</option>
              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Button
          type="submit"
          loading={submitting}
          className="w-full mt-3"
        >
          {submitting ? "Adding Member..." : "Add Member"}
        </Button>
      </form>

      {/* MEMBERS LIST */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              {isSuper && <th className="p-3 text-left">Community</th>}
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-3 text-center text-slate-400" colSpan={isSuper ? 5 : 4}>
                  Loading members...
                </td>
              </tr>
            )}
            {!loading && members.length === 0 && (
              <tr>
                <td className="p-3 text-center text-slate-400" colSpan={isSuper ? 5 : 4}>
                  No members found
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-slate-600">{m.email}</td>
                <td className="p-3 text-slate-600">{m.phone}</td>
                {isSuper && (
                  <td className="p-3 text-slate-600">
                    {communities.find(c => c._id === m.communityId)?.name || "Unknown"}
                  </td>
                )}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${m.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {m.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
