import axios from 'axios';

// Create an Axios instance with default settings
const apiClient = axios.create({
  // Base URL can be left empty for relative paths
  baseURL: '',
  withCredentials: true,
});

// Request interceptor to add Authorization header if token exists in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default apiClient;
