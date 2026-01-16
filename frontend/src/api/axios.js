import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Use relative URL to work with Vite proxy
});

/* ================= INTERCEPTOR ================= */
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const memberToken = localStorage.getItem("memberToken");
  const role = localStorage.getItem("role");

  // Debug: Log token status for member requests
  if (config.url?.includes('members/')) {
    console.log("🔍 Member API Request:", {
      url: config.url,
      role: role,
      hasMemberToken: !!memberToken,
      hasAdminToken: !!adminToken,
      memberTokenPreview: memberToken ? memberToken.substring(0, 20) + "..." : null,
    });
  }

  // 🔐 USE TOKEN BASED ON CURRENT ROLE (NOT TOKEN AVAILABILITY)
  if (role === "MEMBER" && memberToken) {
    config.headers.Authorization = `Bearer ${memberToken}`;
    if (config.url?.includes('members/')) {
      console.log("✅ Using member token for:", config.url);
    }
  }
  else if ((role === "ADMIN" || role === "SUPER_ADMIN") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  else {
    // Fallback: Use any available token
    if (memberToken) {
      config.headers.Authorization = `Bearer ${memberToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    if (config.url?.includes('members/')) {
      console.log("❌ No appropriate token found for member API:", config.url);
    }
  }

  return config;
});

// Add response interceptor for member API debugging
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('members/')) {
      console.log("✅ Member API Success:", response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (error.config?.url?.includes('members/')) {
      console.log("❌ Member API Error:", {
        url: error.config.url,
        status: error.response?.status,
        message: error.response?.data?.message,
        hasAuth: !!error.config?.headers?.Authorization,
        role: localStorage.getItem("role"),
      });
    }
    return Promise.reject(error);
  }
);

export default api;