import api from "./axios";

/* =========================
   GET ALL MEMBERS (ADMIN)
========================= */
export const getMembers = () => {
  const role = localStorage.getItem("role");
  
  // Super Admin uses platform endpoint, regular Admin uses admin endpoint
  if (role === "SUPER_ADMIN") {
    return api.get("/platform/members");
  } else {
    return api.get("/admin/members");
  }
};

/* =========================
   CREATE MEMBER (ADMIN)
========================= */
export const createMember = (data) => {
  // Both Super Admin and regular Admin use admin endpoint for creating members
  return api.post("/admin/members", data);
};

/* =========================
   MEMBER LOGIN
========================= */
export const loginMember = (data) =>
  api.post("/members/login", data);
