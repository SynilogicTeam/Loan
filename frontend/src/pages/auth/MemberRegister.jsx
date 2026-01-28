import { useNavigate, Link } from "react-router-dom";

export default function MemberRegister() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white w-full max-w-md p-8 rounded-xl border shadow-lg text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Member Registration Disabled
          </h2>
          <p className="text-slate-600">
            Members can only be added by community administrators.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">For Admins:</h3>
            <p className="text-blue-600 text-sm mb-3">
              Register as an admin to create and manage your community.
            </p>
            <Link
              to="/admin-register"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Register as Admin
            </Link>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">For Members:</h3>
            <p className="text-green-600 text-sm mb-3">
              Contact your community admin to get added as a member.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Login if Already Member
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}