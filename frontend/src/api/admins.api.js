import api from "./axios";

/* =========================
   GET ADMINS (SUPER ADMIN)
========================= */
export const getAdmins = () =>
  api.get("/admins");

/* =========================
   CREATE ADMIN (SUPER ADMIN)
========================= */
export const createAdmin = (data) =>
  api.post("/admins", data);

/* =========================
   RESET ADMIN PASSWORD
========================= */
export const resetAdminPassword = (id) =>
  api.post(`/admins/reset-password/${id}`);
