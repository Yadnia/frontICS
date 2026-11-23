"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Tutor, Estudiante } from "@/types/api";
import { getInitials } from "@/lib/utils";
import { estudiantesService } from "@/services/estudiantes.service";
import {
  Users2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  IdCard,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface PerfilTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onEdit?: (tutor: Tutor) => void;
}

export function PerfilTutorModal({
  isOpen,
  onClose,
  tutor,
  onEdit,
}: PerfilTutorModalProps) {
  const { info } = useToast();
  const [estudiantesACargo, setEstudiantesACargo] = useState<Estudiante[]>([]);
  const [isLoadingEstudiantes, setIsLoadingEstudiantes] = useState(false);

  useEffect(() => {
    if (isOpen && tutor) {
      setIsLoadingEstudiantes(true);
      estudiantesService
        .getAll()
        .then((all) => {
          const vinculados = all.filter(
            (e) =>
              e.tutorId === tutor.id ||
              (e.tutorNombre &&
                tutor.nombre &&
                e.tutorNombre.toLowerCase().includes(tutor.nombre.toLowerCase()))
          );
          setEstudiantesACargo(vinculados);
        })
        .catch(() => setEstudiantesACargo([]))
        .finally(() => setIsLoadingEstudiantes(false));
    }
  }, [isOpen, tutor]);

  if (!tutor) return null;

  const handleCopyPhone = () => {
    if (tutor.telefono) {
      navigator.clipboard?.writeText(tutor.telefono);
      info("Teléfono copiado al portapapeles");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil del Tutor / Padre de Familia"
      description={`Información general, contacto y estudiantes vinculados de ${tutor.nombre} ${tutor.apellido}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Cabecera / Identificación: Paleta Azul, Amarillo y Blanco */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#1d4ed8] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-blue-900/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-blue-950 font-bold text-xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white/60">
              {getInitials(tutor.nombre, tutor.apellido)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
                  Cédula: {tutor.cedula}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  ID #{tutor.id}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                {tutor.nombre} {tutor.apellido}
              </h3>

              <div className="flex items-center gap-2 text-xs text-blue-100 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-yellow-300" />
                <span>{tutor.ocupacion || "Tutor Legal / Responsable"}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-blue-800/60 shrink-0">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">
              Rol Familiar
            </span>
            <span className="mt-0.5 px-3 py-1 text-xs font-bold bg-yellow-400 text-blue-950 rounded-xl shadow-xs">
              Tutor Legal
            </span>
          </div>
        </div>

        {/* Sección: Datos de Contacto y Ubicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Datos de Contacto
              </p>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                <Copy className="w-3 h-3" />
                Copiar
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Teléfono Móvil:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {tutor.telefono || "No registrado"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Correo Electrónico:</span>
                <span className="font-mono text-slate-800 font-medium truncate max-w-[170px]" title={tutor.correo}>
                  {tutor.correo || "No registrado"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ocupación / Oficio:</span>
                <span className="text-slate-800 font-semibold">{tutor.ocupacion || "No especificada"}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Dirección Residencial
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {tutor.direccion || "Dirección no registrada en el expediente escolar."}
              </p>

              <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                <span>Estado de Vinculación:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Activo para Notificaciones
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Estudiantes a su cargo */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Estudiantes Asignados a su Cargo
              </p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {estudiantesACargo.length} {estudiantesACargo.length === 1 ? "Estudiante" : "Estudiantes"}
            </span>
          </div>

          {isLoadingEstudiantes ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Consultando estudiantes vinculados...
            </div>
          ) : estudiantesACargo.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              No hay estudiantes vinculados directamente a este tutor en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {estudiantesACargo.map((est) => (
                <div
                  key={est.id}
                  className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 hover:border-yellow-400 hover:bg-yellow-50/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-yellow-400/40">
                      {getInitials(est.nombre, est.apellido)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {est.nombre} {est.apellido}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-blue-700 font-semibold">
                          {est.codigoUnico}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {est.grado || "7mo Grado"} - {est.seccion || "A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      est.estado === "ACTIVO"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {est.estado || "ACTIVO"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 font-mono">
            Expediente Tutor ID #{tutor.id} • Colegio ICS
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(tutor);
                }}
                className="px-4 py-2 text-xs font-bold text-blue-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-all shadow-xs"
              >
                Editar Tutor
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cerrar Perfil
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
