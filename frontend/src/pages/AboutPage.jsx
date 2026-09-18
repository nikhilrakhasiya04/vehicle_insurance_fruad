import React from "react";
import { Code2, Database, Brain, Globe, ShieldAlert, CheckCircle2 } from "lucide-react";

function Badge({ name, color = "blue" }) {
  const c = {
    blue: "bg-blue-900/30 text-blue-300 border-blue-800",
    green: "bg-green-900/30 text-green-300 border-green-800",
    purple: "bg-purple-900/30 text-purple-300 border-purple-800",
    yellow: "bg-yellow-900/30 text-yellow-300 border-yellow-800",
    red: "bg-red-900/30 text-red-300 border-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c[color]}`}>
      {name}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Hero */}
      <div className="card bg-gradient-to-br from-primary-900/40 to-gray-900 border-primary-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-xl shrink-0">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Insurance Fraud Detection System</h2>
            <p className="text-sm text-gray-400 mt-1">
              Production-ready full-stack ML application — React 18 + Python REST Backend + XGBoost & SQLite
            </p>
          </div>
        </div>
      </div>

      {/* Architecture flow */}
      <div className="card">
        <p className="text-sm font-bold text-gray-200 mb-5">System Architecture</p>
        <div className="space-y-3">
          {[
            {
              icon: Globe,
              color: "text-blue-400",
              bg: "bg-blue-900/30",
              step: "1",
              title: "React Frontend (Vite)",
              desc: "User enters claim details → sends POST request to Python REST API",
            },
            {
              icon: Code2,
              color: "text-purple-400",
              bg: "bg-purple-900/30",
              step: "2",
              title: "Python Backend (Flask/FastAPI)",
              desc: "Validates payload, coordinates inference, and manages SQLite persistence",
            },
            {
              icon: Brain,
              color: "text-green-400",
              bg: "bg-green-900/30",
              step: "3",
              title: "ML XGBoost Engine",
              desc: "Executes data preprocessing, feature transformations, and fraud probability inference",
            },
            {
              icon: Database,
              color: "text-yellow-400",
              bg: "bg-yellow-900/30",
              step: "4",
              title: "Prediction & Dashboard",
              desc: "Saves record to SQLite and returns fraud label + confidence scores to frontend",
            },
          ].map(({ icon: Icon, color, bg, step, title, desc }, i, arr) => (
            <div key={step}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg shrink-0 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Step {step}</p>
                  <p className="text-sm font-semibold text-gray-200">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
              {i < arr.length - 1 && <div className="ml-7 h-4 border-l border-gray-800 mt-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: "Frontend",
            icon: Globe,
            color: "text-blue-400",
            badges: [
              ["React 18", "blue"],
              ["Vite", "blue"],
              ["Tailwind CSS", "blue"],
              ["Recharts", "purple"],
              ["Axios", "green"],
              ["Lucide Icons", "yellow"],
            ],
          },
          {
            title: "Backend & ML",
            icon: Brain,
            color: "text-green-400",
            badges: [
              ["Python 3", "green"],
              ["Flask / FastAPI", "green"],
              ["XGBoost", "purple"],
              ["Scikit-Learn", "blue"],
              ["Pandas / NumPy", "yellow"],
              ["Imbalanced-Learn", "red"],
            ],
          },
          {
            title: "Database & Tooling",
            icon: Database,
            color: "text-yellow-400",
            badges: [
              ["SQLite", "yellow"],
              ["Joblib", "purple"],
              ["REST API", "green"],
              ["Responsive UI", "blue"],
            ],
          },
        ].map(({ title, icon: Icon, color, badges }) => (
          <div key={title} className="card">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-sm font-bold text-gray-200">{title}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.map(([name, col]) => (
                <Badge key={name} name={name} color={col} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
