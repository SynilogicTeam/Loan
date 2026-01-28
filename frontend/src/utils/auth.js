// Authentication utility functions

export const getAuthToken = () => {
  const role = localStorage.getItem('role');
  const adminToken = localStorage.getItem('adminToken');
  const memberToken = localStorage.getItem('memberToken');
  
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return adminToken;
  } else if (role === 'MEMBER') {
    return memberToken;
  }
  
  // Fallback to any available token
  return adminToken || memberToken || localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};

export const getCurrentUser = () => {
  const role = localStorage.getItem('role');
  const userData = localStorage.getItem('userData');
  
  return {
    role,
    userData: userData ? JSON.parse(userData) : null,
    isAuthenticated: !!getAuthToken()
  };
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('memberToken');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userData');
  localStorage.removeItem('permissions');
  
  window.location.href = '/login';
};