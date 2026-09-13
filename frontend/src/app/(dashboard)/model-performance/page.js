"use client";
import { useEffect, useState } from "react";
import { fetchModelPerf } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { ModelRadarChart, MetricsBarChart, ConfusionMatrixDisplay } from "@/components/performance/ModelMetricsChart";
import { Trophy, CheckCircle2 } from "lucide-react";

const METRIC_LABELS = { f1:"F1-Score", precision:"Precision", recall:"Recall", roc_auc:"ROC-AUC", pr_auc:"PR-AUC" };

export default function ModelPerformancePage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchModelPerf();
      setData(res.data);
      setSelected(res.data?.best_model);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader message="Loading model metrics…" />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;
  if (!data?.models) return <ErrorMessage message="No model data. Please run train.py first." />;

  const modelList = Object.entries(data.models).map(([name, m]) => ({ name, ...m, isSelected: name === data.best_model }));
  const selectedModel = modelList.find((m) => m.name === (selected || data.best_model));

  return (
    <div className="max-w-6xl space-y-6">
      {/* Best model banner */}
      <div className="card bg-gradient-to-r from-primary-900/40 to-gray-900 border-primary-800">
        <div className="flex items-center gap-3 flex-wrap">
          <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Best Selected Model</p>
            <p className="text-xl font-bold text-white">{data.best_model}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Dataset Split</p>
            <p className="text-sm text-gray-300">Train: {data.train_size?.toLocaleString()} | Test: {data.test_size?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Fraud rate: {((data.class_distribution?.fraud_rate || 0) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Model selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {modelList.map((m) => (
          <button key={m.name} onClick={() => setSelected(m.name)}
            className={`text-left p-4 rounded-xl border transition-all ${selected === m.name ? "border-primary-600 bg-primary-900/20" : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}>
            <div className="flex items-center gap-1.5 mb-2">
              {m.isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
              <p className="text-xs font-semibold text-gray-200 leading-tight">{m.name}</p>
            </div>
            {Object.entries(METRIC_LABELS).map(([k, l]) => (
              <div key={k} className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">{l.split(" ")[0]}</span>
                <span className={m.isSelected ? "text-green-400 font-semibold" : "text-gray-300"}>{(m[k] * 100).toFixed(1)}%</span>
              </div>
            ))}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-4">Radar Comparison</p>
          <ModelRadarChart models={modelList} />
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-3">F1-Score <span className="text-xs text-gray-500">(green = selected)</span></p>
          <MetricsBarChart models={modelList} metric="f1" label="F1-Score" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-3">PR-AUC</p>
          <MetricsBarChart models={modelList} metric="pr_auc" label="PR-AUC" />
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-3">ROC-AUC</p>
          <MetricsBarChart models={modelList} metric="roc_auc" label="ROC-AUC" />
        </div>
      </div>

      {/* Confusion matrix + report */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <ConfusionMatrixDisplay matrix={selectedModel.confusion_matrix} modelName={selectedModel.name} />
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-3 font-medium">Classification Report — <span className="text-blue-400">{selectedModel.name}</span></p>
            <div className="space-y-2">
              {["Not Fraud","Fraud"].map((cls) => {
                const r = selectedModel.classification_report?.[cls];
                if (!r) return null;
                return (
                  <div key={cls} className="bg-gray-800/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-300 mb-2">{cls}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[["Precision", r.precision],["Recall", r.recall],["F1", r["f1-score"]]].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-xs text-gray-500">{l}</p>
                          <p className="text-sm font-bold text-gray-100">{(v * 100).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-xs text-gray-500">Overall Accuracy</p>
                <p className="text-2xl font-bold text-primary-400">
                  {((selectedModel.classification_report?.accuracy || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
