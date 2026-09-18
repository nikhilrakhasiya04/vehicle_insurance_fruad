import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for friendly error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    // Handle network errors / connection refused gracefully
    if (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message === "Network Error"
    ) {
      message = "Unable to connect to prediction server. Please try again.";
    }

    return Promise.reject(new Error(message));
  }
);

// ── API Endpoints ─────────────────────────────────────────────────────────

// Submit claim for fraud prediction
export const submitPrediction = (data) => api.post("/predict", data);

// History & Records
export const fetchHistory = (params = {}) => api.get("/predictions/history", { params });
export const fetchPrediction = (id) => api.get(`/predictions/${id}`);
export const deletePrediction = (id) => api.delete(`/predictions/${id}`);

// Analytics & Model Info
export const fetchStats = () => api.get("/predictions/stats/summary");
export const fetchModelPerf = () => api.get("/predictions/model-performance");
export const fetchMLHealth = () => api.get("/predictions/ml-health");
export const fetchHealth = () => api.get("/health");

export default api;
