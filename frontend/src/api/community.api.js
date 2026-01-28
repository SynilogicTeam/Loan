import api from "./axios";

export const getCommunities = () => {
  const role = localStorage.getItem("role");
  
  // Super Admin uses platform endpoint, regular Admin might not have access
  if (role === "SUPER_ADMIN") {
    return api.get("/platform/communities");
  } else {
    // Regular admins might not need to see all communities
    // For now, still use platform endpoint but this might need adjustment
    return api.get("/platform/communities");
  }
};

export const createCommunity = (data) => {
  const role = localStorage.getItem("role");
  
  // Only Super Admin can create communities
  if (role === "SUPER_ADMIN") {
    return api.post("/platform/communities", data);
  } else {
    throw new Error("Only Super Admin can create communities");
  }
};
