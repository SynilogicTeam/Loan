import api from "./axios";

/* =========================
   GET ACTIVE SESSION
========================= */
export const getActiveSession = () =>
  api.get("/sessions/active");

/* =========================
   CREATE SESSION
========================= */
export const createSession = (data) =>
  api.post("/sessions", data);

/* =========================
   CLOSE SESSION
========================= */
export const closeSession = (id) =>
  api.put(`/sessions/close/${id}`);
/* =========================
   GET SESSION ACTIVITIES
========================= */
export const getSessionActivities = () =>
  api.get("/sessions/activities");

/* =========================
   GET SESSION STATISTICS
========================= */
export const getSessionStats = () =>
  api.get("/sessions/stats");