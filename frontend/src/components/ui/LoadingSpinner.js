import { cn } from "@/lib/utils";

export default function LoadingSpinner({ size = "md", className }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-700 border-t-primary-500", sizes[size], className)} />
  );
}

export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
