import React from "react";
import { useLocation } from "react-router-dom";

const titles = {
  "/dashboard":          { title: "Dashboard",          sub: "Overview of fraud detection activity" },
  "/predict":            { title: "Fraud Prediction",   sub: "Submit a claim for AI-powered analysis" },
  "/history":            { title: "Prediction History", sub: "All past prediction records" },
  "/model-performance":  { title: "Model Performance",  sub: "ML model evaluation metrics and comparison" },
  "/about":              { title: "About Project",      sub: "Technology stack and system architecture" },
};

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  // Match the first two segments to handle /history/:id
  const base = "/" + (pathname.split("/")[1] || "dashboard");
  const info = titles[pathname] || titles[base] || titles["/dashboard"];

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-bold text-gray-100">{info.title}</h1>
        <p className="text-xs text-gray-500">{info.sub}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
        FastAPI Service Online
      </div>
    </header>
  );
}
