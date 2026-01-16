import api from "./axios";

/* =========================
   GET SESSION LEDGER (ADMIN)
========================= */
export const getLedger = () =>
  api.get("/ledger");
