import api from "./axios";

export const getCommunities = () =>
  api.get("/communities");

export const createCommunity = (data) =>
  api.post("/communities", data);
