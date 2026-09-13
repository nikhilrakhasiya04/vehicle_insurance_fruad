import { cn } from "@/lib/utils";

export default function StatCard({ title, value, sub, icon: Icon, color = "blue", trend }) {
  const colorMap = {
    blue:   "text-blue-400 bg-blue-900/30",
    red:    "text-red-400 bg-red-900/30",
    green:  "text-green-400 bg-green-900/30",
    yellow: "text-yellow-400 bg-yellow-900/30",
    purple: "text-purple-400 bg-purple-900/30",
  };

  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={cn("p-2.5 rounded-lg shrink-0", colorMap[color] || colorMap.blue)}>
          <Icon className={cn("w-5 h-5", colorMap[color]?.split(" ")[0])} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
