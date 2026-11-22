import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "indigo" | "emerald" | "amber" | "sky" | "purple";
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "indigo",
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-100",
    },
  }[color];

  return (
    <div className={`p-6 rounded-2xl bg-white border ${colorMap.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`p-2.5 rounded-xl ${colorMap.bg}`}>
          <Icon className={`w-5 h-5 ${colorMap.text}`} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
}
