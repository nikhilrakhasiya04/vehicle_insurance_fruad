"use client";
import { Trash2, ExternalLink } from "lucide-react";
import { formatDate, formatPercent, formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function HistoryTable({ items, onDelete, deleting }) {
  if (!items?.length) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No predictions found. Submit a claim to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {["Date","Verdict","Fraud Prob.","Confidence","Accident Site","Total Claim","Actions"].map((h) => (
              <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {items.map((item) => {
            const isFraud = item.result?.prediction === 1;
            return (
              <tr key={item._id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3 pr-4 text-gray-400 whitespace-nowrap text-xs">
                  {formatDate(item.createdAt)}
                </td>
                <td className="py-3 pr-4">
                  <span className={isFraud ? "badge-fraud" : "badge-safe"}>
                    {isFraud ? "Fraud" : "Not Fraud"}
                  </span>
                </td>
                <td className="py-3 pr-4 font-semibold">
                  <span className={isFraud ? "text-red-400" : "text-green-400"}>
                    {formatPercent(item.result?.fraud_probability)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-300">
                  {formatPercent(item.result?.confidence)}
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  {item.inputData?.accident_site || "—"}
                </td>
                <td className="py-3 pr-4 text-gray-300">
                  {formatCurrency(item.inputData?.total_claim)}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/history/${item._id}`}
                      className="text-gray-500 hover:text-blue-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(item._id)}
                      disabled={deleting === item._id}
                      className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ pagination, page, setPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
      <p className="text-xs text-gray-500">
        Showing {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
      </p>
      <div className="flex gap-2">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">
          Previous
        </button>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3">
          Next
        </button>
      </div>
    </div>
  );
}
