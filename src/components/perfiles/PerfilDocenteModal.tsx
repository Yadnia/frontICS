"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Docente } from "@/types/api";
import { getInitials } from "@/lib/utils";
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Clock,
  UserCheck,
  Shield,
} from "lucide-react";

interface PerfilDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  docente: Docente | null;
}

export function PerfilDocenteModal({ isOpen, onClose, docente }: PerfilDocenteModalProps) {
  if (!docente) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil Profesional del Docente"
      description={`Expediente y asignaciones académicas de ${docente.nombre} ${docente.apellido}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Cabecera / Identificación: Azul, Amarillo y Blanco */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#1d4ed8] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-blue-900/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-blue-950 border-2 border-white/60 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden shadow-md">
              {docente.foto ? (
                <img src={docente.foto} alt={docente.nombre} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(docente.nombre, docente.apellido)}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
                  Cédula: {docente.cedula}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    docente.estado
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  }`}
                >
                  {docente.estado ? "Docente Activo" : "Inactivo"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                {docente.nombre} {docente.apellido}
              </h3>

              <div className="flex items-center gap-2 text-xs text-blue-200 font-medium">
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                <span>{docente.especialidad || "Educación Secundaria y Bachillerato"}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-blue-800/60 shrink-0">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">
              Turno Asignado
            </span>
            <span className="mt-0.5 px-3 py-1 text-xs font-bold bg-yellow-400 text-blue-950 rounded-xl shadow-xs">
              {docente.turno || "MATUTINO"}
            </span>
          </div>
        </div>

        {/* Sección: Datos de Contacto y Laborales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Información de Contacto
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-mono">{docente.correo}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-mono font-semibold text-blue-700">{docente.telefono}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{docente.direccion || "Dirección no especificada"}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Cuenta del Sistema (RBAC)
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Usuario Vinculado:</span>
                {docente.usuarioId ? (
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    ID #{docente.usuarioId}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Sin vincular</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rol del Sistema:</span>
                <RoleBadge role="DOCENTE" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fecha de Ingreso:</span>
                <span className="font-medium text-slate-700">
                  {docente.fechaIngreso || "01/02/2021"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Asignaturas y Cargas Académicas */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Carga Académica Asignada
            </p>
            <span className="text-xs text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              {docente.materias?.length || 2} Materias
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Materias a Cargo:</p>
              <div className="flex flex-wrap gap-2">
                {(docente.materias || ["Matemáticas 7mo", "Álgebra 8vo"]).map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Grados y Secciones:</p>
              <div className="flex flex-wrap gap-2">
                {(docente.gradosAsignados || ["7mo Grado A", "8vo Grado B"]).map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-900 font-semibold text-xs border border-yellow-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {g}
                  </span>
                ))}
              </div>
            </div>
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
