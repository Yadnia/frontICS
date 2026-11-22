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
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
  }[variant];

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm font-medium",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 ring-inset ${variantStyles} ${sizeStyles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === "success"
            ? "bg-emerald-500"
            : variant === "danger"
            ? "bg-rose-500"
            : variant === "warning"
            ? "bg-amber-500"
            : variant === "info"
            ? "bg-sky-500"
            : variant === "primary"
            ? "bg-indigo-500"
            : "bg-slate-400"
        }`}
      />
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const normalized = role.toUpperCase().replace(/^ROLE_/, "");
  let variant: "primary" | "warning" | "info" | "success" | "neutral" = "neutral";

  if (normalized === "ADMIN") variant = "danger" as any;
  else if (normalized === "DIRECCION") variant = "primary";
  else if (normalized === "SECRETARIA") variant = "info";
  else if (normalized === "DOCENTE") variant = "warning";
  else if (normalized === "TUTOR") variant = "success";

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border ${
        normalized === "ADMIN"
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : normalized === "DIRECCION"
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : normalized === "SECRETARIA"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : normalized === "DOCENTE"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : normalized === "TUTOR"
          ? "bg-teal-50 text-teal-700 border-teal-200"
          : "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {normalized}
    </span>
  );
}
