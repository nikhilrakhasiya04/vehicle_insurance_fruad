import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="p-3 rounded-full bg-red-900/30">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm mt-1">
          Try Again
        </button>
      )}
    </div>
  );
}
