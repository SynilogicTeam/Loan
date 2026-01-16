import api from "./axios";

/* =========================
   GET ALL MEMBERS (ADMIN)
========================= */
export const getMembers = () =>
  api.get("/members");

/* =========================
   CREATE MEMBER (ADMIN)
========================= */
export const createMember = (data) =>
  api.post("/members", data);

/* =========================
   MEMBER LOGIN
========================= */
export const loginMember = (data) =>
  api.post("/members/login", data);
