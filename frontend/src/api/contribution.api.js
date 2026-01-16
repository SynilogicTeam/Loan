import api from "./axios";

/* =========================
   CREATE CONTRIBUTION (ADMIN)
========================= */
export const createContribution = (data) =>
  api.post("/contributions", data);

/* =========================
   PAY CONTRIBUTION
========================= */
export const markContributionPaid = (id) =>
  api.put(`/contributions/pay/${id}`);

/* =========================
   GET ALL CONTRIBUTIONS (ADMIN)
========================= */
export const getAllContributions = () =>
  api.get("/contributions");

/* =========================
   MEMBER CONTRIBUTIONS
========================= */
export const getMyContributions = () =>
  api.get("/contributions/my");
