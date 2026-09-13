import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 35000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — unwrap data or throw error
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// ── Prediction endpoints ───────────────────────────────────────────────────────
export const submitPrediction = (data)        => api.post("/predictions/predict", data);
export const fetchHistory     = (params = {}) => api.get("/predictions/history", { params });
export const fetchPrediction  = (id)          => api.get(`/predictions/${id}`);
export const deletePrediction = (id)          => api.delete(`/predictions/${id}`);
export const fetchStats       = ()            => api.get("/predictions/stats/summary");
export const fetchModelPerf   = ()            => api.get("/predictions/model-performance");
export const fetchMLHealth    = ()            => api.get("/predictions/ml-health");
export const fetchHealth      = ()            => api.get("/health");

export default api;
