import axios from 'axios';

/**
 * Centralized Axios instance configured for Spring Boot Backend.
 * Uses VITE_API_BASE_URL environment variable with fallback to http://localhost:8080/api.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: ready for Spring Boot JWT / Bearer authentication tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: formats error messages for UI presentation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Unable to reach the Spring Boot backend server.';

    if (error.response) {
      // Backend returned an error response (4xx, 5xx)
      friendlyMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Backend returned error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Backend didn't respond (offline, connection refused, or CORS issue)
      friendlyMessage = `Cannot connect to Spring Boot backend at ${API_BASE_URL}. Ensure your server is running on port 8080 with CORS enabled.`;
    } else {
      friendlyMessage = error.message;
    }

    const enhancedError = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

export default api;
