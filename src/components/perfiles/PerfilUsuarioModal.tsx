"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Usuario } from "@/types/api";
import { formatDate, getInitials } from "@/lib/utils";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Phone,
  Briefcase,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface PerfilUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

export function PerfilUsuarioModal({ isOpen, onClose, usuario }: PerfilUsuarioModalProps) {
  if (!usuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil de Usuario del Sistema"
      description={`Perfil y privilegios de la cuenta @${usuario.username}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Cabecera / Identificación: Azul, Amarillo y Blanco */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#1d4ed8] text-white flex items-center gap-4 shadow-xl border border-blue-900/60">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-blue-950 border-2 border-white/60 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden shadow-md">
            <span>
              {getInitials(usuario.nombre, usuario.apellido)}
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
                @{usuario.username}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  usuario.estado
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                }`}
              >
                {usuario.estado ? "Activo" : "Desactivado"}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {usuario.nombre} {usuario.apellido}
            </h3>

            <p className="text-xs text-blue-200 font-medium">
              {usuario.cargo || "Usuario Registrado del Sistema"}
            </p>
          </div>
        </div>

        {/* Detalles de la cuenta */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
          <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">
            Detalles de Cuenta & Acceso
          </p>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" /> Correo Electrónico:
            </span>
            <span className="font-mono text-slate-800 font-medium">{usuario.correo}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> Teléfono Directo:
            </span>
            <span className="font-mono text-slate-700">{usuario.telefono || "No registrado"}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Fecha de Alta:
            </span>
            <span className="text-slate-700">{formatDate(usuario.fechaCreacion)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Último Acceso:
            </span>
            <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {usuario.ultimoAcceso || "2026-11-22 13:45"}
            </span>
          </div>
        </div>

        {/* Roles y Privilegios RBAC */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
            Roles Asignados & Nivel de Seguridad
          </p>

          <div className="flex flex-wrap gap-2">
            {usuario.roles?.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            {usuario.roles?.includes("ADMIN") ? (
              <span className="text-blue-950 font-medium flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                Acceso total irrestricto a todos los módulos y configuración de infraestructura escolar.
              </span>
            ) : usuario.roles?.includes("DIRECCION") ? (
              <span className="text-blue-950 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Acceso de supervisión académica, reportes, notas, llamados y gestión de personal.
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Permisos asignados según el perfil operativo del usuario en el sistema.
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar Perfil
          </button>
        </div>
      </div>
    </Modal>
  );
}
