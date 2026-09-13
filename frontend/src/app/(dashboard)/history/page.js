"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchHistory, deletePrediction } from "@/lib/api";
import HistoryTable, { Pagination } from "@/components/history/HistoryTable";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import toast from "react-hot-toast";
import { Filter } from "lucide-react";

export default function HistoryPage() {
  const [items, setItems]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);
  const [filter, setFilter]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [deleting, setDeleting]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchHistory({ page, limit: 15, filter: filter || undefined });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this prediction?")) return;
    setDeleting(id);
    try {
      await deletePrediction(id);
      toast.success("Deleted");
      load();
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const handleFilter = (f) => { setFilter(f === filter ? "" : f); setPage(1); };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Prediction History</h2>
          <p className="section-sub">{pagination?.total ?? 0} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["fraud","not_fraud"].map((f) => (
            <button key={f} onClick={() => handleFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f
                ? f === "fraud" ? "bg-red-900/40 border-red-700 text-red-300" : "bg-green-900/40 border-green-700 text-green-300"
                : "border-gray-700 text-gray-400 hover:border-gray-600"}`}>
              {f === "fraud" ? "Fraud Only" : "Legitimate Only"}
            </button>
          ))}
          {filter && <button onClick={() => { setFilter(""); setPage(1); }} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>}
        </div>
      </div>
      <div className="card">
        {loading ? <PageLoader message="Loading…" /> : error ? <ErrorMessage message={error} onRetry={load} /> : (
          <>
            <HistoryTable items={items} onDelete={handleDelete} deleting={deleting} />
            <Pagination pagination={pagination} page={page} setPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
