import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "indigo" | "blue" | "emerald" | "amber" | "yellow" | "sky" | "purple";
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    blue: {
      bg: "bg-blue-600/10",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    yellow: {
      bg: "bg-yellow-400/20",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-yellow-400/20",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    purple: {
      bg: "bg-blue-900/10",
      text: "text-blue-900",
      border: "border-blue-200",
    },
  }[color];

  return (
    <div className={`p-6 rounded-2xl bg-white border ${colorMap.border} shadow-xs hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`p-2.5 rounded-xl ${colorMap.bg}`}>
          <Icon className={`w-5 h-5 ${colorMap.text}`} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
        {trend && (
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {trend}
          </span>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
}
