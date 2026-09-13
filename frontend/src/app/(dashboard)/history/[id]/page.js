"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchPrediction } from "@/lib/api";
import PredictionResult from "@/components/prediction/PredictionResult";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { ArrowLeft } from "lucide-react";

export default function PredictionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchPrediction(id);
        setData(res.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <PageLoader message="Loading prediction…" />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h2 className="section-title">Prediction Detail</h2>
          <p className="text-xs font-mono text-gray-600">{id}</p>
        </div>
      </div>
      <PredictionResult result={data} />
    </div>
  );
}
