import api from "./axios";

/* =========================
   GET MEMBER PROFILE
========================= */
export const getMemberProfile = () =>
  api.get("/members/profile");

/* =========================
   REQUEST PROFILE UPDATE
========================= */
export const requestProfileUpdate = (data) =>
  api.post("/members/profile-update-request", data);

/* =========================
   MAKE CONTRIBUTION
========================= */
export const makeContribution = (data) =>
  api.post("/members/contribution", data);

/* =========================
   APPLY FOR LOAN
========================= */
export const applyForLoan = (data) =>
  api.post("/members/loan-application", data);

/* =========================
   GET MEMBER TRANSACTIONS
========================= */
export const getMemberTransactions = (params) =>
  api.get("/members/transactions", { params });

/* =========================
   CONTACT ADMIN
========================= */
export const contactAdmin = (data) =>
  api.post("/members/contact-admin", data);

/* =========================
   REQUEST WITHDRAWAL
========================= */
export const requestWithdrawal = (data) =>
  api.post("/members/withdrawal-request", data);

/* =========================
   GET MEMBER WITHDRAWALS
========================= */
export const getMemberWithdrawals = () =>
  api.get("/members/withdrawals");