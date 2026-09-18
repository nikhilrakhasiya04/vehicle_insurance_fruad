import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  BarChart3,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/predict", icon: ShieldAlert, label: "Fraud Prediction" },
  { href: "/history", icon: History, label: "Prediction History" },
  { href: "/model-performance", icon: BarChart3, label: "Model Performance" },
  { href: "/about", icon: Info, label: "About Project" },
];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">FraudGuard</p>
            <p className="text-xs text-gray-500">ML Detection System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Service Status */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">FastAPI ML Active</span>
        </div>
      </div>
    </aside>
  );
}
