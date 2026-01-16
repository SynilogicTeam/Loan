import api from "./axios";

/* =========================
   CREATE LOAN (ADMIN)
========================= */
export const createLoan = (data) =>
  api.post("/loans", data);

/* =========================
   PAY EMI
========================= */
export const payEmi = (emiId) =>
  api.put(`/loans/emi/pay/${emiId}`);
