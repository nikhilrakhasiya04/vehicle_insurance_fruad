import { Code2, Database, Brain, Globe, ShieldAlert, CheckCircle2 } from "lucide-react";

function Badge({ name, color = "blue" }) {
  const c = { blue:"bg-blue-900/30 text-blue-300 border-blue-800", green:"bg-green-900/30 text-green-300 border-green-800", purple:"bg-purple-900/30 text-purple-300 border-purple-800", yellow:"bg-yellow-900/30 text-yellow-300 border-yellow-800", red:"bg-red-900/30 text-red-300 border-red-800" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c[color]}`}>{name}</span>;
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Hero */}
      <div className="card bg-gradient-to-br from-primary-900/40 to-gray-900 border-primary-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-xl shrink-0"><ShieldAlert className="w-7 h-7 text-white" /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Insurance Fraud Detection System</h2>
            <p className="text-sm text-gray-400 mt-1">Production-ready full-stack ML application — Next.js + Express.js + Python Flask + XGBoost</p>
          </div>
        </div>
      </div>

      {/* Architecture flow */}
      <div className="card">
        <p className="text-sm font-bold text-gray-200 mb-5">System Architecture</p>
        <div className="space-y-3">
          {[
            { icon: Globe,    color:"text-blue-400",   bg:"bg-blue-900/30",   step:"1", title:"Next.js Frontend",     desc:"User fills form → sends POST to Express backend" },
            { icon: Code2,    color:"text-purple-400", bg:"bg-purple-900/30", step:"2", title:"Express.js Backend",   desc:"Validates input, saves to MongoDB, forwards to Flask" },
            { icon: Brain,    color:"text-green-400",  bg:"bg-green-900/30",  step:"3", title:"Flask ML Service",     desc:"Preprocesses input → runs through XGBoost pipeline" },
            { icon: Database, color:"text-yellow-400", bg:"bg-yellow-900/30", step:"4", title:"Prediction Response",  desc:"Fraud label + probability returned to frontend" },
          ].map(({ icon: Icon, color, bg, step, title, desc }, i, arr) => (
            <div key={step}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg shrink-0 ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
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
          { title:"Frontend",   icon: Globe,    color:"text-blue-400",   badges:[["Next.js 14","blue"],["React 18","blue"],["Tailwind CSS","blue"],["Recharts","purple"],["Axios","green"]] },
          { title:"Backend",    icon: Code2,    color:"text-purple-400", badges:[["Node.js","green"],["Express.js","green"],["MongoDB","yellow"],["Mongoose","yellow"],["Helmet","red"]] },
          { title:"ML Service", icon: Brain,    color:"text-green-400",  badges:[["Python","green"],["Flask","yellow"],["XGBoost","red"],["scikit-learn","blue"],["SMOTE","purple"],["joblib","blue"]] },
        ].map(({ title, icon: Icon, color, badges }) => (
          <div key={title} className="card">
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-sm font-semibold text-gray-200">{title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map(([n, c]) => <Badge key={n} name={n} color={c} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ML Pipeline steps */}
      <div className="card">
        <p className="text-sm font-bold text-gray-200 mb-4">ML Pipeline Steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            "Load CSV — handle * as missing values (na_values=['*'])",
            "Rename columns: 'policy deductible' → policy_deductible, etc.",
            "Drop claim_number (unique identifier)",
            "Parse claim_date → extract month, year, day features",
            "Replace negative annual_income values with NaN",
            "Winsorize outliers with IQR × 3 on financial columns",
            "Encode target: Y → 1 (Fraud), N → 0 (Not Fraud)",
            "Numerical: median imputation + StandardScaler",
            "Categorical: mode imputation + OneHotEncoder",
            "Handle class imbalance with SMOTE oversampling",
            "Train: Logistic Regression, Random Forest, XGBoost, SVM",
            "Select best model: 0.6 × F1 + 0.4 × PR-AUC composite score",
            "Save full pipeline with joblib to ml-service/model/",
            "Serve predictions via Flask REST API on port 5001",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div className="card">
        <p className="text-sm font-bold text-gray-200 mb-4">REST API Endpoints</p>
        <div className="space-y-1.5">
          {[
            ["POST",   "/api/predictions/predict",           "Submit claim for fraud prediction"],
            ["GET",    "/api/predictions/history",            "Paginated prediction history"],
            ["GET",    "/api/predictions/stats/summary",      "Dashboard statistics"],
            ["GET",    "/api/predictions/model-performance",  "Model evaluation metrics"],
            ["GET",    "/api/predictions/:id",               "Get single prediction"],
            ["DELETE", "/api/predictions/:id",               "Delete prediction"],
            ["GET",    "/api/health",                         "Backend health check"],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${method==="POST"?"bg-blue-900/40 text-blue-300":method==="DELETE"?"bg-red-900/40 text-red-300":"bg-green-900/40 text-green-300"}`}>{method}</span>
              <code className="text-xs text-gray-300 font-mono">{path}</code>
              <span className="text-xs text-gray-500 ml-auto">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
