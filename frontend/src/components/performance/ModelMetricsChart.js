"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

const COLORS  = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
const tooltip = {
  contentStyle: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f3f4f6", fontSize: 12 },
};

export function ModelRadarChart({ models }) {
  if (!models?.length) return null;
  const metrics = ["f1", "precision", "recall", "roc_auc", "pr_auc"];
  const labels  = { f1: "F1", precision: "Precision", recall: "Recall", roc_auc: "ROC-AUC", pr_auc: "PR-AUC" };

  const data = metrics.map((m) => {
    const point = { metric: labels[m] };
    models.forEach((model) => {
      point[model.name] = parseFloat(((model[m] ?? 0) * 100).toFixed(1));
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        {models.map((model, i) => (
          <Radar
            key={model.name}
            name={model.name}
            dataKey={model.name}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function MetricsBarChart({ models, metric = "f1", label = "Score" }) {
  if (!models?.length) return null;
  const data = models.map((m, i) => ({
    name: m.name
      ? m.name
          .replace("Logistic Regression", "LR")
          .replace("Random Forest", "RF")
          .replace("XGBoost", "XGB")
          .replace("Decision Tree", "DT")
      : `Model ${i + 1}`,
    value: parseFloat(((m[metric] ?? 0) * 100).toFixed(2)),
    color: COLORS[i % COLORS.length],
    selected: m.isSelected,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} unit="%" />
        <Tooltip {...tooltip} formatter={(v) => [`${v}%`, label]} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} name={label}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.selected ? "#22c55e" : COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConfusionMatrixDisplay({ matrix, modelName }) {
  if (!matrix) return null;
  const [[tn, fp], [fn, tp]] = matrix;
  const total = tn + fp + fn + tp;

  const cells = [
    { label: "True Negative",  value: tn, color: "bg-green-900/30 text-green-400 border-green-800", desc: "Correctly identified as legitimate" },
    { label: "False Positive", value: fp, color: "bg-yellow-900/30 text-yellow-400 border-yellow-800", desc: "Legitimate wrongly flagged as fraud" },
    { label: "False Negative", value: fn, color: "bg-red-900/30 text-red-400 border-red-800", desc: "Fraud missed by the model" },
    { label: "True Positive",  value: tp, color: "bg-blue-900/30 text-blue-400 border-blue-800", desc: "Correctly identified as fraud" },
  ];

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Confusion Matrix — <span className="text-blue-400 font-medium">{modelName}</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        {cells.map(({ label, value, color, desc }) => (
          <div key={label} className={`rounded-xl p-4 border ${color}`}>
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs opacity-60 mt-1">{desc}</p>
            <p className="text-xs opacity-50 mt-0.5">{((value / total) * 100).toFixed(1)}% of total</p>
          </div>
        ))}
      </div>
    </div>
  );
}
