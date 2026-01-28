import axios from "axios";

// ✅ USE NETWORK IP SO BOTH WEB AND MOBILE CONNECT TO SAME BACKEND
const api = axios.create({
  baseURL: "http://localhost:5001/api", // Changed to localhost to fix CORS
  // baseURL: "http://192.168.29.125:5001/api", // Network IP for mobile testing
});

/* ================= REQUEST INTERCEPTOR ================= */
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

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('members/')) {
      console.log("✅ Member API Success:", response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Log member API errors
    if (error.config?.url?.includes('members/')) {
      console.log("❌ Member API Error:", {
        url: error.config.url,
        status: error.response?.status,
        message: error.response?.data?.message,
        hasAuth: !!error.config?.headers?.Authorization,
        role: localStorage.getItem("role"),
      });
    }

    // Handle common errors with user-friendly messages
    let errorMessage = "An error occurred";

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (status === 404) {
        errorMessage = "Resource not found.";
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = data?.message || errorMessage;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = "Cannot connect to server. Please check your connection.";
    }

    // Store error message for components to use
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default api;
