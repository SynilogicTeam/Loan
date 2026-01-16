import { Routes, Route, Navigate } from "react-router-dom";

/* =========================
   LAYOUT
========================= */
import AdminLayout from "./layout/AdminLayout";

/* =========================
   AUTH GUARDS
========================= */
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import SuperAdminRoute from "./auth/SuperAdminRoute";

/* =========================
   ADMIN PAGES
========================= */
import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import Contributions from "./pages/admin/Contributions";
import Loans from "./pages/admin/Loans";
import Withdrawals from "./pages/admin/Withdrawals";
import Charity from "./pages/admin/Charity";
import Sessions from "./pages/admin/Sessions";
import Reports from "./pages/admin/Reports";

/* =========================
   SUPER ADMIN PAGES
========================= */
import Communities from "./pages/superadmin/Communities";
import Admins from "./pages/superadmin/Admins";
import CommunityStats from "./pages/superadmin/CommunityStats";
import SuperAdminSessions from "./pages/superadmin/Sessions";
import AdminPermissions from "./pages/superadmin/AdminPermissions";
import PlatformManagement from "./pages/superadmin/PlatformManagement";
import SuperAdminSocialFunds from "./pages/superadmin/SocialFunds";

/* =========================
   AUTH PAGES
========================= */
import Login from "./pages/auth/Login";
import AdminRegister from "./pages/auth/AdminRegister";
import MemberRegister from "./pages/auth/MemberRegister";

/* =========================
   MEMBER PAGES
========================= */
import MemberDashboard from "./pages/member/MemberDashboard";
import MakeContribution from "./pages/member/MakeContribution";
import RequestWithdrawal from "./pages/member/RequestWithdrawal";
import MyWithdrawals from "./pages/member/MyWithdrawals";
import CharityDonation from "./pages/member/CharityDonation";
import ApplyLoan from "./pages/member/ApplyLoan";
import MyLoans from "./pages/member/MyLoans";
import ViewStatement from "./pages/member/ViewStatement";
import ContactAdmin from "./pages/member/ContactAdmin";

console.log("APP JSX RENDERED");

function App() {
  return (
    <Routes>
      {/* =========================
          AUTH
      ========================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/admin" element={<AdminRegister />} />
      <Route path="/register/member" element={<MemberRegister />} />

      {/* =========================
          ADMIN PANEL (COMMON LAYOUT)
      ========================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* DEFAULT REDIRECT */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* DASHBOARD (ADMIN + SUPER_ADMIN) */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* ========== ADMIN ONLY ROUTES ========== */}
        <Route
          path="members"
          element={
            <AdminRoute>
              <Members />
            </AdminRoute>
          }
        />

        <Route
          path="contributions"
          element={
            <AdminRoute>
              <Contributions />
            </AdminRoute>
          }
        />

        <Route
          path="loans"
          element={
            <AdminRoute>
              <Loans />
            </AdminRoute>
          }
        />

        <Route
          path="withdrawals"
          element={
            <AdminRoute>
              <Withdrawals />
            </AdminRoute>
          }
        />

        <Route
          path="charity"
          element={
            <AdminRoute>
              <Charity />
            </AdminRoute>
          }
        />

        <Route
          path="sessions"
          element={
            <AdminRoute>
              <Sessions />
            </AdminRoute>
          }
        />

        <Route
          path="ledger"
          element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          }
        />

        {/* ========== SUPER ADMIN ONLY ROUTES ========== */}
        <Route
          path="communities"
          element={
            <SuperAdminRoute>
              <Communities />
            </SuperAdminRoute>
          }
        />

        <Route
          path="admins"
          element={
            <SuperAdminRoute>
              <Admins />
            </SuperAdminRoute>
          }
        />

        <Route
          path="community-stats"
          element={
            <SuperAdminRoute>
              <CommunityStats />
            </SuperAdminRoute>
          }
        />

        <Route
          path="super-sessions"
          element={
            <SuperAdminRoute>
              <SuperAdminSessions />
            </SuperAdminRoute>
          }
        />

        <Route
          path="admin-permissions"
          element={
            <SuperAdminRoute>
              <AdminPermissions />
            </SuperAdminRoute>
          }
        />

        <Route
          path="platform-management"
          element={
            <SuperAdminRoute>
              <PlatformManagement />
            </SuperAdminRoute>
          }
        />

        <Route
          path="social-funds"
          element={
            <SuperAdminRoute>
              <SuperAdminSocialFunds />
            </SuperAdminRoute>
          }
        />

      </Route>

      {/* =========================
          MEMBER DASHBOARD
      ========================= */}
      <Route path="/member/dashboard" element={<MemberDashboard />} />
      <Route path="/member/make-contribution" element={<MakeContribution />} />
      <Route path="/member/request-withdrawal" element={<RequestWithdrawal />} />
      <Route path="/member/my-withdrawals" element={<MyWithdrawals />} />
      <Route path="/member/charity-donation" element={<CharityDonation />} />
      <Route path="/member/apply-loan" element={<ApplyLoan />} />
      <Route path="/member/my-loans" element={<MyLoans />} />
      <Route path="/member/view-statement" element={<ViewStatement />} />
      <Route path="/member/contact-admin" element={<ContactAdmin />} />

      {/* =========================
          FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
