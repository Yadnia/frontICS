"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Bell,
  Settings,
  Server,
  Zap,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { PerfilUsuarioModal } from "../perfiles/PerfilUsuarioModal";

export function Navbar() {
  const { user, isMockMode, toggleMockMode, apiUrl, updateApiUrl } = useAuth();
  const { success, info } = useToast();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<"unknown" | "online" | "offline">("unknown");

  const currentUserAsUsuario = user
    ? {
        id: user.id,
        username: user.username,
        correo: user.correo || `${user.username}@colegio.edu.ni`,
        nombre: user.nombre.split(" ")[0] || user.nombre,
        apellido: user.nombre.split(" ").slice(1).join(" ") || "General",
        nombres: user.nombres || user.nombre.split(" ")[0] || user.nombre,
        apellidos: user.apellidos || user.nombre.split(" ").slice(1).join(" ") || "General",
        estado: true,
        activo: true,
        roles: user.roles,
        cargo: user.cargo || `Usuario del Sistema (${user.roles[0] || "USUARIO"})`,
        telefono: user.telefono || "8899-0011",
        fechaCreacion: user.fechaCreacion || "2026-01-10",
        ultimoAcceso: "2026-11-22 13:45",
      }
    : null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiUrl(tempUrl);
    setIsConfigOpen(false);
    success("Configuración de API actualizada");
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingStatus("unknown");
    try {
      const res = await fetch(`${tempUrl}/auth/login`, {
        method: "OPTIONS",
      });
      if (res.ok || res.status === 405 || res.status === 401 || res.status === 200) {
        setPingStatus("online");
        success("¡Servidor backend accesible!");
      } else {
        setPingStatus("offline");
      }
    } catch {
      setPingStatus("offline");
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
        {/* Left: Breadcrumbs or Active context */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">Colegio ICS</span>
            <span>/</span>
            <span className="text-blue-900 font-semibold">Panel de Administración</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Mock Mode Switcher */}
          <button
            onClick={() => {
              toggleMockMode();
              info(isMockMode ? "Conectado al Servidor Central" : "Cambiado a Modo Demostración Local");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isMockMode
                ? "bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
            }`}
            title="Alternar entre Servidor Central y Modo Local"
          >
            <Zap className={`w-3.5 h-3.5 ${isMockMode ? "text-yellow-600 fill-yellow-500" : "text-blue-600"}`} />
            <span className="hidden md:inline">
              {isMockMode ? "Modo Demostración" : "Servidor en Línea"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMockMode ? "bg-yellow-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
          </button>

          {/* Mi Perfil Button (Azul, Amarillo y Blanco) */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-yellow-50 text-blue-800 hover:text-blue-900 border border-blue-200 hover:border-yellow-400 transition-all shadow-xs"
            title="Ver Mi Perfil de Usuario"
          >
            <div className="w-5 h-5 rounded-md bg-yellow-400 text-blue-950 flex items-center justify-center font-bold text-[10px]">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-bold">Mi Perfil</span>
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              setTempUrl(apiUrl);
              setPingStatus("unknown");
              setIsConfigOpen(true);
            }}
            className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
            title="Configuración de Conexión de API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Modal de Conexión */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configuración del Servidor"
        description="Ajusta la dirección de red para conectarte al servidor central"
        maxWidth="md"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dirección del Servidor Central
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://localhost:5000/api"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors disabled:opacity-50"
              >
                {isPinging ? "Comprobando..." : "Comprobar"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dirección por defecto: <code>http://localhost:5000/api</code>
            </p>
          </div>

          {pingStatus !== "unknown" && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                pingStatus === "online"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {pingStatus === "online" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Conexión exitosa con el servidor central.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    No se pudo conectar a {tempUrl}. Verifica que el servicio esté activo en la red.
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
            >
              Guardar Conexión
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Perfil del Usuario Conectado */}
      <PerfilUsuarioModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        usuario={currentUserAsUsuario}
      />
    </>
  );
}
