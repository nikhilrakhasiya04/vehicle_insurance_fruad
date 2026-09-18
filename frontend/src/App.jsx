import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import PredictPage from "@/pages/PredictPage";
import HistoryPage from "@/pages/HistoryPage";
import PredictionDetailPage from "@/pages/PredictionDetailPage";
import ModelPerformancePage from "@/pages/ModelPerformancePage";
import AboutPage from "@/pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="predict" element={<PredictPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<PredictionDetailPage />} />
          <Route path="model-performance" element={<ModelPerformancePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
