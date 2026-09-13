import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatPercent(val, decimals = 1) {
  if (val == null || isNaN(val)) return "—";
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatCurrency(val) {
  if (val == null || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function getConfidenceLabel(confidence) {
  if (confidence >= 0.9) return { label: "Very High", color: "text-green-400" };
  if (confidence >= 0.75) return { label: "High", color: "text-blue-400" };
  if (confidence >= 0.6) return { label: "Moderate", color: "text-yellow-400" };
  return { label: "Low", color: "text-orange-400" };
}
