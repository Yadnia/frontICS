"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Activity,
  Settings2,
  Database,
  ExternalLink,
  RefreshCw,
  Server,
  Sparkles,
} from "lucide-react";
import { Modal } from "../ui/Modal";

export function Navbar() {
  const { user, isMockMode, toggleMockMode, apiUrl, updateApiUrl } = useAuth();
  const { success, info } = useToast();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<"unknown" | "online" | "offline">("unknown");

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiUrl(tempUrl);
    setIsConfigOpen(false);
    success("Configuración de API actualizada");
  };

  const handlePingBackend = async () => {
    setIsPinging(true);
    setPingStatus("unknown");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${apiUrl}/roles`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.status === 200 || res.status === 401 || res.status === 403) {
        setPingStatus("online");
        info(`Backend responde con status ${res.status} (Servidor en línea)`);
      } else {
        setPingStatus("online");
      }
    } catch {
      setPingStatus("offline");
      info("No se recibió respuesta del backend en " + apiUrl);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              Sistema de Gestión Estudiantil ICS
            </span>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200">
              v1.0 REST
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Mock mode switch toggle */}
          <button
            onClick={() => {
              toggleMockMode();
              info(
                isMockMode
                  ? "Conectando al Backend Real en " + apiUrl
                  : "Modo Mock activado (datos simulados para pruebas)"
              );
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isMockMode
                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            }`}
            title="Haz clic para alternar entre Backend Real y Modo Mock"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isMockMode ? "Modo: Mock (Local)" : "Modo: API Real"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMockMode ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              setTempUrl(apiUrl);
              setIsConfigOpen(true);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Configurar URL del Backend"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Modal de configuración de conexión */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configuración de Conexión al Backend"
        description="Ajusta la URL base del servicio Spring Boot y prueba la conectividad"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              URL Base de la API REST
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://localhost:8080/api/v1"
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Valor por defecto según contrato: <code className="text-indigo-600">http://localhost:8080/api/v1</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs font-medium text-slate-700">Estado de Conectividad</p>
                <p className="text-[11px] text-slate-500">
                  {pingStatus === "unknown"
                    ? "Sin comprobar"
                    : pingStatus === "online"
                    ? "✓ Conectado al servidor"
                    : "✗ No se pudo alcanzar el servidor"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePingBackend}
              disabled={isPinging}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
              Probar Ping
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
