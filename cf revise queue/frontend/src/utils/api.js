import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
const apiMethods = {
  // Get all problems
  getProblems: async () => {
    return await api.get('/problems');
  },

  // Add a new problem
  addProblem: async (problemLink) => {
    return await api.post('/problems', { problemLink });
  },

  // Pop the next problem (earliest revise date)
  popProblem: async () => {
    return await api.delete('/problems/pop');
  },

  // Delete a specific problem
  deleteProblem: async (id) => {
    return await api.delete(`/problems/${id}`);
  },

  // Health check
  healthCheck: async () => {
    return await api.get('/health');
  },
};

export default apiMethods;
