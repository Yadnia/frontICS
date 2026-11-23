"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Estudiante, CalificacionMateria, LlamadoAtencion } from "@/types/api";
import { formatDate, getInitials } from "@/lib/utils";
import {
  GraduationCap,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  FileText,
  ShieldAlert,
  Percent,
  Plus,
  Camera,
} from "lucide-react";

interface PerfilEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
  onUpdateEstudiante?: (updated: Estudiante) => void;
}

export function PerfilEstudianteModal({
  isOpen,
  onClose,
  estudiante,
  onUpdateEstudiante,
}: PerfilEstudianteModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "notas" | "asistencia" | "disciplina">("general");

  // State para nuevo llamado de atención
  const [showAddLlamado, setShowAddLlamado] = useState(false);
  const [nuevoLlamado, setNuevoLlamado] = useState({
    motivo: "",
    gravedad: "LEVE" as "LEVE" | "MODERADA" | "GRAVE",
    docente: "Prof. En Turno",
    descripcion: "",
  });

  if (!estudiante) return null;

  // Calcular edad aproximada
  const birthYear = estudiante.fechaNacimiento ? parseInt(estudiante.fechaNacimiento.split("-")[0]) : null;
  const currentYear = new Date().getFullYear();
  const edad = birthYear ? currentYear - birthYear : null;

  // Calcular promedio general de notas
  const notas = estudiante.notas || [];
  const promedioGeneral =
    notas.length > 0
      ? (notas.reduce((acc, n) => acc + n.promedio, 0) / notas.length).toFixed(1)
      : null;

  const asistencia = estudiante.asistencia || {
    porcentaje: 95.0,
    totalClases: 100,
    presentes: 95,
    ausencias: 3,
    justificadas: 2,
  };

  const llamados = estudiante.llamadosAtencion || [];

  const handleGuardarLlamado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoLlamado.motivo.trim()) return;

    const creado: LlamadoAtencion = {
      id: `ll-${Date.now()}`,
      fecha: new Date().toISOString().split("T")[0],
      motivo: nuevoLlamado.motivo,
      gravedad: nuevoLlamado.gravedad,
      docente: nuevoLlamado.docente,
      descripcion: nuevoLlamado.descripcion,
    };

    const updated: Estudiante = {
      ...estudiante,
      llamadosAtencion: [creado, ...llamados],
    };

    if (onUpdateEstudiante) {
      onUpdateEstudiante(updated);
    }

    setShowAddLlamado(false);
    setNuevoLlamado({
      motivo: "",
      gravedad: "LEVE",
      docente: "Prof. En Turno",
      descripcion: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil Integral del Estudiante"
      description={`Expediente académico y disciplinario de ${estudiante.nombre} ${estudiante.apellido}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Cabecera / Tarjeta de Identificación: Azul, Amarillo y Blanco */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a8a] to-[#1d4ed8] text-white flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xl border border-blue-900/60">
          {/* Espacio para la foto */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white text-blue-950 border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg">
              {estudiante.foto ? (
                <img
                  src={estudiante.foto}
                  alt={estudiante.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-blue-900">
                  <User className="w-10 h-10 text-blue-700" />
                  <span className="text-[11px] uppercase font-mono font-bold mt-0.5 text-blue-950">
                    {getInitials(estudiante.nombre, estudiante.apellido)}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-blue-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-yellow-300" />
            </div>
          </div>

          {/* Información principal */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold">
                {estudiante.codigoUnico}
              </span>
              <Badge variant={estudiante.estado === "ACTIVO" ? "success" : "neutral"}>
                {estudiante.estado}
              </Badge>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 font-semibold">
                {estudiante.grado || "7mo Grado"} {estudiante.seccion ? `"${estudiante.seccion}"` : ""}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {estudiante.nombre} {estudiante.apellido}
            </h2>

            <p className="text-xs text-blue-100 flex flex-wrap items-center justify-center sm:justify-start gap-3 font-medium">
              <span>{estudiante.sexo === "M" ? "Masculino" : "Femenino"}</span>
              <span>•</span>
              <span>{edad ? `${edad} años` : "Edad N/D"}</span>
              <span>•</span>
              <span className="text-yellow-300">Tutor: {estudiante.tutorNombre || `ID #${estudiante.tutorId}`}</span>
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 gap-1 text-xs font-semibold overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "general"
                ? "border-blue-600 text-blue-700 bg-blue-50/70 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            Perfil General
          </button>
          <button
            onClick={() => setActiveTab("notas")}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "notas"
                ? "border-blue-600 text-blue-700 bg-blue-50/70 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Notas & Calificaciones
            {notas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-yellow-100 text-yellow-800 font-bold text-[10px] border border-yellow-300">
                {notas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("asistencia")}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "asistencia"
                ? "border-blue-600 text-blue-700 bg-blue-50/70 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-blue-600" />
            Asistencia ({asistencia.porcentaje}%)
          </button>
          <button
            onClick={() => setActiveTab("disciplina")}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "disciplina"
                ? "border-blue-600 text-blue-700 bg-blue-50/70 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-600" />
            Llamados de Atención
            {llamados.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-yellow-400 text-blue-950 font-bold text-[10px]">
                {llamados.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                  Datos Personales
                </p>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Fecha de Nacimiento:</span>
                    <span className="font-semibold text-slate-700">
                      {formatDate(estudiante.fechaNacimiento)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Edad Actual:</span>
                    <span className="font-semibold text-slate-700">{edad} años cumplidos</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Sexo / Género:</span>
                    <span className="font-semibold text-slate-700">
                      {estudiante.sexo === "M" ? "Masculino" : "Femenino"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Grado Escolar:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {estudiante.grado || "7mo Grado"} Sección {estudiante.seccion || "A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                  Tutor Legal Asignado
                </p>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nombre del Tutor:</span>
                    <span className="font-bold text-slate-800">
                      {estudiante.tutorNombre || `Tutor #${estudiante.tutorId}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Parentesco:</span>
                    <span className="font-semibold text-blue-800 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                      {estudiante.tutorParentesco || "Padre / Tutor"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Teléfono Contacto:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {estudiante.tutorTelefono || "8888-1234"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Código Tutor:</span>
                    <span className="font-mono text-slate-600 font-medium">ID #{estudiante.tutorId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Dirección Domiciliar
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{estudiante.direccion || "Dirección no registrada"}</span>
              </p>
            </div>
          </div>
        )}

        {/* Pestaña: Notas & Calificaciones */}
        {activeTab === "notas" && (
          <div className="space-y-4">
            {promedioGeneral && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-yellow-300 shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-950">Promedio General Ponderado</p>
                    <p className="text-[11px] text-blue-700">Rendimiento escolar actual en curso</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-900">{promedioGeneral}</span>
                  <span className="text-xs text-blue-600 font-bold ml-1">/ 100</span>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Asignatura</th>
                    <th className="py-2.5 px-3">Docente a Cargo</th>
                    <th className="py-2.5 px-2 text-center">Corte 1</th>
                    <th className="py-2.5 px-2 text-center">Corte 2</th>
                    <th className="py-2.5 px-2 text-center">Corte 3</th>
                    <th className="py-2.5 px-3 text-center">Promedio</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No hay calificaciones registradas para este periodo.
                      </td>
                    </tr>
                  ) : (
                    notas.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{n.materia}</td>
                        <td className="py-2.5 px-3 text-slate-500">{n.docente}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{n.corte1}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{n.corte2}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{n.corte3}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono text-blue-700">
                          {n.promedio.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              n.promedio >= 60
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {n.promedio >= 60 ? "APROBADO" : "REPROBADO"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pestaña: Asistencia */}
        {activeTab === "asistencia" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Índice de Asistencia Global
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-950">
                    {asistencia.porcentaje}%
                  </span>
                  <Badge variant={asistencia.porcentaje >= 85 ? "success" : "warning"}>
                    {asistencia.porcentaje >= 85 ? "Asistencia Regular" : "En Riesgo"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Total acumulado durante el ciclo escolar lectivo vigente
                </p>
              </div>

              {/* Progress bar container */}
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      asistencia.porcentaje >= 85 ? "bg-blue-600" : "bg-yellow-500"
                    }`}
                    style={{ width: `${Math.min(100, asistencia.porcentaje)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Mínimo requerido: 85%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-500">Total Clases</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{asistencia.totalClases}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[11px] font-semibold text-blue-700">Presentes</p>
                <p className="text-lg font-bold text-blue-900 mt-0.5">{asistencia.presentes}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-[11px] font-semibold text-rose-600">Inasistencias</p>
                <p className="text-lg font-bold text-rose-800 mt-0.5">{asistencia.ausencias}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-yellow-50 border border-yellow-300">
                <p className="text-[11px] font-semibold text-yellow-800">Justificadas</p>
                <p className="text-lg font-bold text-yellow-950 mt-0.5">{asistencia.justificadas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Llamados de Atención / Disciplina */}
        {activeTab === "disciplina" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-950">Historial Disciplinario</p>
                <p className="text-[11px] text-slate-500">
                  {llamados.length} llamado(s) de atención registrado(s)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddLlamado(!showAddLlamado)}
                className="px-3.5 py-1.5 text-xs font-bold bg-yellow-400 hover:bg-yellow-500 text-blue-950 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddLlamado ? "Cancelar" : "Registrar Llamado"}
              </button>
            </div>

            {/* Formulario para registrar nuevo llamado */}
            {showAddLlamado && (
              <form
                onSubmit={handleGuardarLlamado}
                className="p-4 rounded-xl bg-yellow-50/70 border border-yellow-300 space-y-3"
              >
                <p className="text-xs font-bold text-yellow-950">Nuevo Llamado de Atención</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Motivo / Infracción *
                    </label>
                    <input
                      type="text"
                      value={nuevoLlamado.motivo}
                      onChange={(e) =>
                        setNuevoLlamado({ ...nuevoLlamado, motivo: e.target.value })
                      }
                      placeholder="Ej: Uso indebido de celular en clase"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Gravedad *
                    </label>
                    <select
                      value={nuevoLlamado.gravedad}
                      onChange={(e) =>
                        setNuevoLlamado({
                          ...nuevoLlamado,
                          gravedad: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="LEVE">Leve</option>
                      <option value="MODERADA">Moderada</option>
                      <option value="GRAVE">Grave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Descripción / Observaciones
                  </label>
                  <textarea
                    value={nuevoLlamado.descripcion}
                    onChange={(e) =>
                      setNuevoLlamado({ ...nuevoLlamado, descripcion: e.target.value })
                    }
                    placeholder="Detalles sobre la conducta observada..."
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    Guardar en Expediente
                  </button>
                </div>
              </form>
            )}

            {/* Listado de llamados */}
            <div className="space-y-2.5">
              {llamados.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                  El estudiante cuenta con expediente disciplinario limpio sin llamados de atención.
                </div>
              ) : (
                llamados.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.gravedad === "GRAVE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : item.gravedad === "MODERADA"
                              ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          FALTA {item.gravedad}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.motivo}</span>
                      </div>
                      {item.descripcion && (
                        <p className="text-xs text-slate-600 leading-relaxed">{item.descripcion}</p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        Reportado por: <span className="font-medium text-slate-600">{item.docente}</span> • {formatDate(item.fecha)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
