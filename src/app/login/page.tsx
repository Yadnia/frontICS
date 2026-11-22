"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  Database,
  Sparkles,
  Server,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isMockMode, toggleMockMode, apiUrl } = useAuth();
  const { success, error } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      await login({ username, password });
      success("Sesión iniciada correctamente");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Error al autenticar. Verifica las credenciales.";
      setAuthError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const autofillCredentials = (role: "admin" | "docente") => {
    if (role === "admin") {
      setUsername("admin");
      setPassword("CambiarEstaClave123!");
    } else {
      setUsername("mlopez");
      setPassword("Temporal#2026");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Left panel - Decorative & Information */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">ICS Educación</h2>
              <p className="text-xs text-indigo-300">Gestión Estudiantil y Académica</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Contrato REST v1.0 listo para Spring Boot
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Plataforma Integral de Control Académico y Estudiantil
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Módulos integrados con seguridad JWT y control de acceso basado en roles para
            Administración, Dirección, Secretaría, Docentes y Tutores.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="font-semibold text-slate-200">Base URL Spring Boot</p>
              <p className="font-mono text-[11px] text-indigo-400 truncate mt-0.5">{apiUrl}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="font-semibold text-slate-200">Seguridad</p>
              <p className="font-mono text-[11px] text-emerald-400 mt-0.5">Bearer Token (JWT)</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Sistema ICS · Tesis de Gestión Estudiantil
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">ICS Gestión</h2>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Acceso al Sistema</h2>
            <p className="text-sm text-slate-400 mt-1">
              Ingresa tus credenciales para acceder al panel de control
            </p>
          </div>

          {/* Toggle Modo Mock vs Real */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isMockMode ? "Modo Mock (Datos Ficticios)" : "Modo API Real (:8080)"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isMockMode
                    ? "Permite probar la interfaz sin backend activo"
                    : "Conectando directamente a Spring Boot"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleMockMode()}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                isMockMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
              }`}
            >
              {isMockMode ? "Activo" : "En Vivo"}
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Error de autenticación</p>
                <p className="mt-0.5 text-rose-400 leading-normal">{authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Usuario o Correo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin o mlopez"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Autofill Buttons */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Cargar datos de prueba del documento:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofillCredentials("admin")}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-slate-200">Admin Inicial</p>
                <p className="text-[10px] text-slate-500 font-mono">admin / CambiarEsta...</p>
              </button>
              <button
                type="button"
                onClick={() => autofillCredentials("docente")}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-slate-200">Docente María</p>
                <p className="text-[10px] text-slate-500 font-mono">mlopez / Temporal#...</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

