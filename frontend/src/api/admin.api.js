import api from "./axios";

export const getMembers = () => api.get("/members");

export const approveMember = (id) =>
  api.patch(`/members/${id}/approve`);

export const deactivateMember = (id) =>
  api.patch(`/members/${id}/deactivate`);
