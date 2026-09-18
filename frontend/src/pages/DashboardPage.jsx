import React, { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { TrendChart, FraudPieChart, AccidentSiteChart } from "@/components/dashboard/DashboardCharts";
import { ShieldAlert, ShieldCheck, Activity, Percent, TrendingUp, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const s = stats || {};

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Predictions" value={s.total ?? 0} icon={Activity} color="blue" />
        <StatCard title="Fraud Detected" value={s.totalFraud ?? 0} icon={ShieldAlert} color="red" />
        <StatCard title="Legitimate" value={s.totalNotFraud ?? 0} icon={ShieldCheck} color="green" />
        <StatCard title="Fraud Rate" value={`${s.fraudRate ?? 0}%`} icon={Percent} color="yellow" />
        <StatCard title="Avg Confidence" value={`${s.avgConfidence ?? 0}%`} icon={TrendingUp} color="purple" />
        <StatCard title="Avg Fraud Prob." value={`${s.avgFraudProb ?? 0}%`} icon={BarChart3} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <p className="text-sm font-semibold text-gray-200 mb-4">Prediction Trend (Last 30 Days)</p>
          <TrendChart data={s.recentTrend || []} />
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-4">Fraud vs Legitimate</p>
          <FraudPieChart fraudCount={s.totalFraud} notFraudCount={s.totalNotFraud} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-4">Fraud by Accident Site</p>
          <AccidentSiteChart data={s.fraudByAccidentSite || []} />
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-gray-200 mb-4">Summary Breakdown</p>
          <div className="space-y-3">
            {[
              { label: "Total Predictions", value: s.total ?? 0, pct: 100, color: "bg-blue-500" },
              { label: "Fraud Detected", value: s.totalFraud ?? 0, pct: s.fraudRate ?? 0, color: "bg-red-500" },
              { label: "Legitimate Claims", value: s.totalNotFraud ?? 0, pct: (100 - (s.fraudRate ?? 0)).toFixed(1), color: "bg-green-500" },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{label}</span>
                  <span>{value} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
