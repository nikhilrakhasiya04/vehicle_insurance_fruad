"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

const tooltipStyle = {
  contentStyle: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f3f4f6", fontSize: 12 },
  labelStyle:   { color: "#9ca3af" },
};

export function TrendChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
        <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorTotal)" strokeWidth={2} name="Total" />
        <Area type="monotone" dataKey="fraud" stroke="#ef4444" fill="url(#colorFraud)" strokeWidth={2} name="Fraud" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FraudPieChart({ fraudCount, notFraudCount }) {
  const data = [
    { name: "Fraud",     value: fraudCount    || 0 },
    { name: "Not Fraud", value: notFraudCount || 0 },
  ];
  if (!data[0].value && !data[1].value) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
          paddingAngle={3} dataKey="value">
          <Cell fill="#ef4444" />
          <Cell fill="#22c55e" />
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AccidentSiteChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="site" tick={{ fill: "#6b7280", fontSize: 11 }} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Fraud Cases">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-600">
      No data available yet
    </div>
  );
}
