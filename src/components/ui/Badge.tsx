import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "neutral", size = "sm" }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-300 ring-yellow-500/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10",
    primary: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
  }[variant];

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-sm font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${variantStyles} ${sizeStyles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === "success"
            ? "bg-emerald-500"
            : variant === "danger"
            ? "bg-rose-500"
            : variant === "warning"
            ? "bg-yellow-500"
            : variant === "info"
            ? "bg-sky-500"
            : variant === "primary"
            ? "bg-blue-600"
            : "bg-slate-400"
        }`}
      />
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const normalized = role.toUpperCase().replace(/^ROLE_/, "");

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md border shadow-xs ${
        normalized === "ADMIN"
          ? "bg-[#0a1628] text-yellow-300 border-yellow-400/50"
          : normalized === "DIRECCION"
          ? "bg-blue-600 text-white border-blue-700"
          : normalized === "SECRETARIA"
          ? "bg-blue-50 text-blue-800 border-blue-200"
          : normalized === "DOCENTE"
          ? "bg-yellow-100 text-yellow-900 border-yellow-300"
          : normalized === "TUTOR"
          ? "bg-yellow-400 text-blue-950 border-yellow-500"
          : "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {normalized}
    </span>
  );
}
