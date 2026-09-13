"use client";
import { useState } from "react";
import PredictionForm from "@/components/prediction/PredictionForm";
import PredictionResult from "@/components/prediction/PredictionResult";
import { ArrowLeft } from "lucide-react";

export default function PredictPage() {
  const [result, setResult] = useState(null);
  return (
    <div className="max-w-5xl space-y-6">
      {result ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Prediction Result</h2>
              <p className="section-sub">AI analysis complete</p>
            </div>
            <button onClick={() => setResult(null)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> New Prediction
            </button>
          </div>
          <PredictionResult result={result} />
        </>
      ) : (
        <>
          <div>
            <h2 className="section-title">Submit Insurance Claim</h2>
            <p className="section-sub">Fill in the claim details. All fields marked <span className="text-red-400">*</span> are required.</p>
          </div>
          <div className="card">
            <PredictionForm onResult={setResult} />
          </div>
        </>
      )}
    </div>
  );
}
