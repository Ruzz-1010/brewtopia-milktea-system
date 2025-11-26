// Auth utility functions
export const getToken = () => {
    return localStorage.getItem('brewtopia_token');
  };
  
  export const getUser = () => {
    const userStr = localStorage.getItem('brewtopia_user');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  export const isAdmin = () => {
    const user = getUser();
    return user && user.role === 'admin';
  };
  
  export const isLoggedIn = () => {
    return !!getToken();
  };
  
  export const logout = () => {
    localStorage.removeItem('brewtopia_token');
    localStorage.removeItem('brewtopia_user');
    window.location.reload();
  };
  
  // Axios interceptor for adding tokens to requests
  export const setupAxiosInterceptor = () => {
    const axios = require('axios');
    
    axios.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  };