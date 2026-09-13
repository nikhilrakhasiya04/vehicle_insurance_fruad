"use client";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Cpu } from "lucide-react";
import { formatPercent, getConfidenceLabel, formatCurrency, formatDate } from "@/lib/utils";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

function ProbGauge({ value, isFraud }) {
  const color  = isFraud ? "#ef4444" : "#22c55e";
  const data   = [{ value: Math.round(value * 100), fill: color }];
  return (
    <ResponsiveContainer width={140} height={140}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%"
        data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background={{ fill: "#1f2937" }} dataKey="value" cornerRadius={6} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={22} fontWeight="700">
          {Math.round(value * 100)}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export default function PredictionResult({ result }) {
  if (!result) return null;

  const { result: r, inputData, createdAt } = result;
  const isFraud   = r.prediction === 1;
  const confInfo  = getConfidenceLabel(r.confidence);

  return (
    <div className="space-y-5">
      {/* Verdict Banner */}
      <div className={`rounded-xl p-5 border ${isFraud
        ? "bg-red-950/30 border-red-800"
        : "bg-green-950/30 border-green-800"}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isFraud ? "bg-red-900/40" : "bg-green-900/40"}`}>
            {isFraud
              ? <ShieldAlert className="w-8 h-8 text-red-400" />
              : <ShieldCheck  className="w-8 h-8 text-green-400" />}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Verdict</p>
            <h2 className={`text-3xl font-extrabold mt-0.5 ${isFraud ? "text-red-400" : "text-green-400"}`}>
              {r.label}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isFraud
                ? "This claim has been flagged as potentially fraudulent."
                : "This claim appears to be legitimate."}
            </p>
          </div>
        </div>
      </div>

      {/* Probability Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Fraud Probability</p>
          <ProbGauge value={r.fraud_probability} isFraud={true} />
        </div>
        <div className="card flex flex-col items-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Safe Probability</p>
          <ProbGauge value={r.not_fraud_probability} isFraud={false} />
        </div>
        <div className="card flex flex-col items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">Confidence</p>
            <p className={`text-3xl font-bold mt-1 ${confInfo.color}`}>
              {formatPercent(r.confidence)}
            </p>
            <p className={`text-xs mt-1 font-semibold ${confInfo.color}`}>{confInfo.label}</p>
          </div>
          <div className="w-full h-px bg-gray-800" />
          <div className="text-center">
            <p className="text-xs text-gray-500">Model Used</p>
            <div className="flex items-center gap-1.5 mt-1 justify-center">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-sm font-semibold text-blue-300">{r.model_used || "XGBoost"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="card">
        <p className="text-xs text-gray-500 font-medium mb-3">Probability Distribution</p>
        <div className="flex h-5 rounded-full overflow-hidden">
          <div
            className="bg-red-600 transition-all duration-700 flex items-center justify-center"
            style={{ width: `${r.fraud_probability * 100}%` }}>
            {r.fraud_probability > 0.15 && (
              <span className="text-xs font-bold text-white">{Math.round(r.fraud_probability * 100)}%</span>
            )}
          </div>
          <div
            className="bg-green-600 transition-all duration-700 flex items-center justify-center"
            style={{ width: `${r.not_fraud_probability * 100}%` }}>
            {r.not_fraud_probability > 0.15 && (
              <span className="text-xs font-bold text-white">{Math.round(r.not_fraud_probability * 100)}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-400">Fraud</span>
          <span className="text-xs text-green-400">Not Fraud</span>
        </div>
      </div>

      {/* Key Inputs Summary */}
      {inputData && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-3">Key Claim Information</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "Age of Driver",    value: inputData.age_of_driver },
              { label: "Gender",           value: inputData.gender === "M" ? "Male" : "Female" },
              { label: "Annual Income",    value: formatCurrency(inputData.annual_income) },
              { label: "Accident Site",    value: inputData.accident_site },
              { label: "Total Claim",      value: formatCurrency(inputData.total_claim) },
              { label: "Injury Claim",     value: formatCurrency(inputData.injury_claim) },
              { label: "Past Claims",      value: inputData.past_num_of_claims },
              { label: "Police Report",    value: inputData.police_report ? "Yes" : "No" },
              { label: "Witness Present",  value: inputData.witness_present ? "Yes" : "No" },
              { label: "Liability %",      value: `${inputData.liab_prct}%` },
              { label: "Vehicle Category", value: inputData.vehicle_category },
              { label: "Submitted",        value: formatDate(createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-100 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
