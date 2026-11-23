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
      name: "Estado del Sistema",
      href: "/dashboard/diagnostico",
      icon: Stethoscope,
      show: canAccess("diagnostico"),
    },
  ];

  return (
    <aside className="w-64 bg-[#0a1628] border-r border-[#172b4d] flex flex-col justify-between shrink-0 min-h-screen text-slate-300 select-none">
      <div>
        {/* Brand Header: Azul oscuro, birrete dorado/amarillo, texto blanco */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#172b4d] bg-[#071120]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center text-yellow-300 shadow-md shadow-blue-900/40 border border-yellow-400/30">
            <GraduationCap className="w-5 h-5 text-yellow-300 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-white text-base tracking-tight leading-none">
                IPSFAS
              </h1>
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" title="Sistema Activo" />
            </div>
            <p className="text-[11px] text-blue-300/80 mt-1 font-medium">Control Escolar</p>
          </div>
        </div>

        {/* Mode Indicator Banner */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[#0f223f] border border-[#1e3b68]">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-100">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMockMode ? "bg-yellow-400 animate-pulse" : "bg-emerald-400 animate-pulse"
                }`}
              />
              {isMockMode ? "Modo Demostración" : "Servidor Conectado"}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isMockMode
                  ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {isMockMode ? "DEMO" : "EN LÍNEA"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4">
          <p className="px-3 text-[11px] font-bold text-blue-300/60 uppercase tracking-wider mb-2">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-700/30 border-l-4 border-yellow-400 pl-2.5"
                        : "text-blue-200/80 hover:text-white hover:bg-[#142540]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-yellow-300" : "text-blue-300/70"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-yellow-300" />}
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-[#172b4d] bg-[#071120]">
        <div className="p-3 rounded-xl bg-[#0f223f] border border-[#1e3b68] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white border border-yellow-400/40 flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-inner">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.nombre || user?.username || "Usuario"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-yellow-300 font-mono font-medium">
                  {user?.roles?.[0] || "USUARIO"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg text-blue-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
