"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Users2,
  UserCog,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, canAccess, logout, isMockMode } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Estudiantes",
      href: "/dashboard/estudiantes",
      icon: GraduationCap,
      show: canAccess("estudiantes"),
    },
    {
      name: "Docentes",
      href: "/dashboard/docentes",
      icon: Briefcase,
      show: canAccess("docentes"),
    },
    {
      name: "Tutores / Padres",
      href: "/dashboard/tutores",
      icon: Users2,
      show: canAccess("tutores"),
    },
    {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: UserCog,
      show: canAccess("usuarios"),
    },
    {
      name: "Roles",
      href: "/dashboard/roles",
      icon: ShieldCheck,
      show: canAccess("roles"),
    },
    {
      name: "Pruebas de API",
      href: "/dashboard/diagnostico",
      icon: Stethoscope,
      show: canAccess("diagnostico"),
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              ICS Gestión
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">Control Estudiantil</p>
          </div>
        </div>

        {/* Mode Indicator Banner */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMockMode ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"
                }`}
              />
              {isMockMode ? "Modo Mock (Offline)" : "Modo Backend Real"}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isMockMode
                  ? "bg-amber-500/10 text-amber-300"
                  : "bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {isMockMode ? "DEMO" : "API :8080"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Módulos Principales
          </p>
          <nav className="space-y-1">
            {navigation
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.nombre || user?.username || "Usuario"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400 font-mono">
                  {user?.roles?.[0] || "USUARIO"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
