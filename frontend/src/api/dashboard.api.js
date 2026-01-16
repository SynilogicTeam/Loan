import api from "./axios";

export const getDashboard = () => api.get("/dashboard");

export const getCommunityStats = () =>
  api.get("/dashboard/community-stats");
