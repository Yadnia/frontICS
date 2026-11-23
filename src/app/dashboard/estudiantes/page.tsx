"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { estudiantesService } from "@/services/estudiantes.service";
import { tutoresService } from "@/services/tutores.service";
import { Estudiante, EstudianteCreateDTO, EstadoEstudiante, Tutor } from "@/types/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PerfilEstudianteModal } from "@/components/perfiles/PerfilEstudianteModal";
import { formatDate, getInitials } from "@/lib/utils";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Award,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import {
  validateNotEmpty,
  validateCodigoEstudiante,
  validateDateOfBirth,
} from "@/lib/validations";

export default function EstudiantesPage() {
  const { canAccess } = useAuth();
  const { success, error, info } = useToast();

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<EstudianteCreateDTO>({
    codigo: "",
    codigoUnico: "",
    nombres: "",
    apellidos: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "2010-03-10",
    sexo: "M",
    direccion: "",
    estado: "ACTIVO",
    tutorId: "",
    grado: "7mo Grado",
    seccion: "A",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [estList, tutList] = await Promise.all([
        estudiantesService.getAll(),
        tutoresService.getAll(),
      ]);
      setEstudiantes(estList);
      setTutores(tutList);
      if (tutList.length > 0 && !formData.tutorId) {
        setFormData((prev) => ({ ...prev, tutorId: tutList[0].id }));
      }
    } catch (err: any) {
      error(err.message || "Error al cargar los estudiantes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEstudiantes = useMemo(() => {
    return estudiantes.filter((st) => {
      const term = searchTerm.toLowerCase();
      const n = (st.nombres || st.nombre || "").toLowerCase();
      const a = (st.apellidos || st.apellido || "").toLowerCase();
      const c = (st.codigo || st.codigoUnico || "").toLowerCase();
      const matchesSearch =
        n.includes(term) ||
        a.includes(term) ||
        c.includes(term) ||
        (st.grado && st.grado.toLowerCase().includes(term)) ||
        (st.tutorNombre && st.tutorNombre.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "ALL" || st.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [estudiantes, searchTerm, statusFilter]);

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleOpenPerfil = (est: Estudiante) => {
    setSelectedEstudiante(est);
    setIsPerfilOpen(true);
  };

  const handleUpdatePerfilEstudiante = (updated: Estudiante) => {
    estudiantesService.updateLocalPerfil(updated);
    setSelectedEstudiante(updated);
    setEstudiantes((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    success("Expediente escolar actualizado con éxito");
  };

  const handleOpenCreate = () => {
    setCreateErrors({});
    const randomCode = `EST-2026-${String(estudiantes.length + 1).padStart(4, "0")}`;
    setFormData({
      codigo: randomCode,
      codigoUnico: randomCode,
      nombres: "",
      apellidos: "",
      nombre: "",
      apellido: "",
      fechaNacimiento: "2012-01-01",
      sexo: "M",
      direccion: "",
      estado: "ACTIVO",
      tutorId: tutores.length > 0 ? String(tutores[0].id) : "",
      grado: "7mo Grado",
      seccion: "A",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (est: Estudiante) => {
    setEditErrors({});
    setSelectedEstudiante(est);
    setFormData({
      codigo: est.codigo || est.codigoUnico,
      codigoUnico: est.codigo || est.codigoUnico,
      nombres: est.nombres || est.nombre,
      apellidos: est.apellidos || est.apellido,
      nombre: est.nombres || est.nombre,
      apellido: est.apellidos || est.apellido,
      fechaNacimiento: est.fechaNacimiento,
      sexo: est.sexo || "M",
      direccion: est.direccion || "",
      estado: est.estado || (est.activo === false ? "INACTIVO" : "ACTIVO"),
      tutorId: est.tutorId,
      grado: est.grado || "7mo Grado",
      seccion: est.seccion || "A",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    const errs: Record<string, string> = {};
    const cod = formData.codigo || formData.codigoUnico;
    const cErr = validateCodigoEstudiante(cod);
    if (cErr) errs.codigo = cErr;

    const nom = formData.nombres || formData.nombre;
    const nErr = validateNotEmpty(nom, "Nombre(s)");
    if (nErr) errs.nombre = nErr;

    const ape = formData.apellidos || formData.apellido;
    const aErr = validateNotEmpty(ape, "Apellido(s)");
    if (aErr) errs.apellido = aErr;

    const fErr = validateDateOfBirth(formData.fechaNacimiento);
    if (fErr) errs.fechaNacimiento = fErr;

    const tErr = validateNotEmpty(formData.tutorId, "Tutor Legal");
    if (tErr) errs.tutorId = "Debes seleccionar un tutor legal registrado para el estudiante.";

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      error("Por favor completa los campos del estudiante con información válida.");
      return;
    }

    setIsSubmitting(true);
    try {
      await estudiantesService.create(formData);
      success("Estudiante registrado exitosamente");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al registrar estudiante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstudiante) return;
    setEditErrors({});

    const errs: Record<string, string> = {};
    const cod = formData.codigo || formData.codigoUnico;
    const cErr = validateCodigoEstudiante(cod);
    if (cErr) errs.codigo = cErr;

    const nom = formData.nombres || formData.nombre;
    const nErr = validateNotEmpty(nom, "Nombre(s)");
    if (nErr) errs.nombre = nErr;

    const ape = formData.apellidos || formData.apellido;
    const aErr = validateNotEmpty(ape, "Apellido(s)");
    if (aErr) errs.apellido = aErr;

    const fErr = validateDateOfBirth(formData.fechaNacimiento);
    if (fErr) errs.fechaNacimiento = fErr;

    const tErr = validateNotEmpty(formData.tutorId, "Tutor Legal");
    if (tErr) errs.tutorId = "Debes seleccionar un tutor legal registrado para el estudiante.";

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      error("Por favor completa los campos del estudiante con información válida.");
      return;
    }

    setIsSubmitting(true);
    try {
      await estudiantesService.update(selectedEstudiante.id, formData);
      success("Estudiante actualizado correctamente");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar estudiante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEstado = async (est: Estudiante) => {
    const nuevoEstado: EstadoEstudiante = est.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      await estudiantesService.updateEstado(est.id, { estado: nuevoEstado });
      success(`Estado actualizado a ${nuevoEstado}`);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async () => {
    if (!selectedEstudiante) return;
    setIsSubmitting(true);
    try {
      await estudiantesService.delete(selectedEstudiante.id);
      success("Estudiante eliminado correctamente");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "No se pudo eliminar el estudiante");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estudiantes</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {estudiantes.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de matrícula, perfiles integrales (asistencia, calificaciones, disciplina) y tutor asignado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrar Estudiante
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por código, nombre, grado o tutor..."
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="RETIRADO">Retirado</option>
            <option value="GRADUADO">Graduado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Estudiante / Código</th>
                <th className="py-3 px-4">Grado y Sección</th>
                <th className="py-3 px-4">Asistencia</th>
                <th className="py-3 px-4">Llamados</th>
                <th className="py-3 px-4">Tutor Asignado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Perfil & Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Cargando estudiantes...
                    </div>
                  </td>
                </tr>
              ) : filteredEstudiantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron estudiantes con los criterios indicados.
                  </td>
                </tr>
              ) : (
                filteredEstudiantes.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Estudiante y Foto */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleOpenPerfil(st)}
                          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center font-bold text-xs text-blue-700 cursor-pointer overflow-hidden shrink-0 shadow-xs transition-all"
                          title="Clic para abrir perfil completo"
                        >
                          {st.foto ? (
                            <img src={st.foto} alt={st.nombre} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(st.nombre, st.apellido)
                          )}
                        </div>
                        <div>
                          <p
                            onClick={() => handleOpenPerfil(st)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {st.nombre} {st.apellido}
                          </p>
                          <p className="font-mono text-[11px] font-bold text-blue-700">
                            {st.codigoUnico}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Grado */}
                    <td className="py-3 px-4 text-xs">
                      <span className="font-medium text-slate-800">
                        {st.grado || "7mo Grado"}
                      </span>
                      {st.seccion && (
                        <span className="ml-1 text-slate-400 font-bold">"{st.seccion}"</span>
                      )}
                    </td>

                    {/* Asistencia */}
                    <td className="py-3 px-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            (st.asistencia?.porcentaje || 95) >= 85
                              ? "text-blue-700"
                              : "text-yellow-600"
                          }`}
                        >
                          {st.asistencia?.porcentaje || 95.8}%
                        </span>
                      </div>
                    </td>

                    {/* Llamados de Atención */}
                    <td className="py-3 px-4 text-xs">
                      {(st.llamadosAtencion?.length || 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-bold text-[11px] border border-yellow-300">
                          {st.llamadosAtencion?.length} llamados
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0 alertas</span>
                      )}
                    </td>

                    {/* Tutor */}
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {st.tutorNombre || (
                        <span className="text-slate-400">ID Tutor: {st.tutorId}</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEstado(st)}
                        title="Clic para cambiar estado"
                        className="group flex items-center"
                      >
                        <Badge
                          variant={
                            st.estado === "ACTIVO"
                              ? "success"
                              : st.estado === "INACTIVO"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {st.estado}
                        </Badge>
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPerfil(st)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-yellow-50 hover:text-blue-900 rounded-lg border border-blue-200 hover:border-yellow-400 transition-all flex items-center gap-1 shadow-xs"
                          title="Ver Perfil Completo del Estudiante"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Perfil</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEstudiante(st);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Perfil Completo del Estudiante */}
      <PerfilEstudianteModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
        estudiante={selectedEstudiante}
        onUpdateEstudiante={handleUpdatePerfilEstudiante}
      />

      {/* Modal Crear */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Estudiante"
        description="Ingresa los datos escolares del estudiante para su expediente institucional"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código del Estudiante * (3 - 30 car.)
              </label>
              <input
                type="text"
                value={formData.codigoUnico}
                onChange={(e) => {
                  setFormData({ ...formData, codigoUnico: e.target.value, codigo: e.target.value });
                  if (createErrors.codigo) setCreateErrors((prev) => ({ ...prev, codigo: "" }));
                }}
                placeholder="EST-2026-0001"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  createErrors.codigo ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.codigo && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.codigo}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Principal Responsable *
              </label>

              {tutores.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No hay tutores registrados</p>
                    <p className="text-amber-700 mt-0.5">
                      Debes registrar primero un tutor en el módulo de Tutores para poder vincular al estudiante.
                    </p>
                  </div>
                </div>
              ) : (
                <select
                  value={formData.tutorId}
                  onChange={(e) => {
                    setFormData({ ...formData, tutorId: e.target.value });
                    if (createErrors.tutorId) setCreateErrors((prev) => ({ ...prev, tutorId: "" }));
                  }}
                  required
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                    createErrors.tutorId ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                  }`}
                >
                  <option value="">-- Seleccionar Tutor Legal --</option>
                  {tutores.map((tut) => (
                    <option key={tut.id} value={tut.id}>
                      {tut.nombres || tut.nombre} {tut.apellidos || tut.apellido} {tut.telefono ? `(Tel: ${tut.telefono})` : ""}
                    </option>
                  ))}
                </select>
              )}

              {createErrors.tutorId && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.tutorId}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre(s) *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value, nombres: e.target.value });
                  if (createErrors.nombre) setCreateErrors((prev) => ({ ...prev, nombre: "" }));
                }}
                placeholder="José"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  createErrors.nombre ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.nombre && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.nombre}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido(s) *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => {
                  setFormData({ ...formData, apellido: e.target.value, apellidos: e.target.value });
                  if (createErrors.apellido) setCreateErrors((prev) => ({ ...prev, apellido: "" }));
                }}
                placeholder="Mendoza"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  createErrors.apellido ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.apellido && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.apellido}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grado Escolar *
              </label>
              <select
                value={formData.grado}
                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1er Grado">1er Grado</option>
                <option value="2do Grado">2do Grado</option>
                <option value="3er Grado">3er Grado</option>
                <option value="4to Grado">4to Grado</option>
                <option value="5to Grado">5to Grado</option>
                <option value="6to Grado">6to Grado</option>
                <option value="7mo Grado">7mo Grado</option>
                <option value="8vo Grado">8vo Grado</option>
                <option value="9no Grado">9no Grado</option>
                <option value="10mo Grado">10mo Grado</option>
                <option value="11mo Grado">11mo Grado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sección *</label>
              <select
                value={formData.seccion}
                onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Sección A</option>
                <option value="B">Sección B</option>
                <option value="C">Sección C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => {
                  setFormData({ ...formData, fechaNacimiento: e.target.value });
                  if (createErrors.fechaNacimiento) setCreateErrors((prev) => ({ ...prev, fechaNacimiento: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  createErrors.fechaNacimiento ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.fechaNacimiento && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.fechaNacimiento}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value as "M" | "F" })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Barrio Central, Matagalpa"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || tutores.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Estudiante"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Estudiante"
        description="Actualizar información básica y tutor asignado"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código del Estudiante *
              </label>
              <input
                type="text"
                value={formData.codigoUnico}
                onChange={(e) => {
                  setFormData({ ...formData, codigoUnico: e.target.value, codigo: e.target.value });
                  if (editErrors.codigo) setEditErrors((prev) => ({ ...prev, codigo: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  editErrors.codigo ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {editErrors.codigo && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.codigo}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Responsable *
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => {
                  setFormData({ ...formData, tutorId: e.target.value });
                  if (editErrors.tutorId) setEditErrors((prev) => ({ ...prev, tutorId: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  editErrors.tutorId ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              >
                <option value="">-- Seleccionar Tutor Legal --</option>
                {tutores.map((tut) => (
                  <option key={tut.id} value={tut.id}>
                    {tut.nombres || tut.nombre} {tut.apellidos || tut.apellido} {tut.telefono ? `(Tel: ${tut.telefono})` : ""}
                  </option>
                ))}
              </select>
              {editErrors.tutorId && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.tutorId}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value, nombres: e.target.value });
                  if (editErrors.nombre) setEditErrors((prev) => ({ ...prev, nombre: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  editErrors.nombre ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {editErrors.nombre && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.nombre}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido(s) *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => {
                  setFormData({ ...formData, apellido: e.target.value, apellidos: e.target.value });
                  if (editErrors.apellido) setEditErrors((prev) => ({ ...prev, apellido: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  editErrors.apellido ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {editErrors.apellido && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.apellido}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grado *</label>
              <select
                value={formData.grado}
                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="6to Grado">6to Grado</option>
                <option value="7mo Grado">7mo Grado</option>
                <option value="8vo Grado">8vo Grado</option>
                <option value="9no Grado">9no Grado</option>
                <option value="10mo Grado">10mo Grado</option>
                <option value="11mo Grado">11mo Grado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sección *</label>
              <select
                value={formData.seccion}
                onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Sección A</option>
                <option value="B">Sección B</option>
                <option value="C">Sección C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => {
                setFormData({ ...formData, fechaNacimiento: e.target.value });
                if (editErrors.fechaNacimiento) setEditErrors((prev) => ({ ...prev, fechaNacimiento: "" }));
              }}
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                editErrors.fechaNacimiento ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
              }`}
            />
            {editErrors.fechaNacimiento && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{editErrors.fechaNacimiento}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que deseas eliminar al estudiante "${selectedEstudiante?.nombre} ${selectedEstudiante?.apellido}" (${selectedEstudiante?.codigoUnico})? Esta acción ejecutará DELETE /estudiantes/${selectedEstudiante?.id}.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
