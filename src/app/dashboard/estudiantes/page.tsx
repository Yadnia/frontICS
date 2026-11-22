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
import { formatDate } from "@/lib/utils";
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
} from "lucide-react";

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
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<EstudianteCreateDTO>({
    codigoUnico: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "2012-04-18",
    sexo: "M",
    direccion: "",
    estado: "ACTIVO",
    tutorId: 1,
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
      const matchesSearch =
        st.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.codigoUnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (st.tutorNombre && st.tutorNombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || st.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [estudiantes, searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    const randomCode = `EST-2026-${String(estudiantes.length + 1).padStart(4, "0")}`;
    setFormData({
      codigoUnico: randomCode,
      nombre: "",
      apellido: "",
      fechaNacimiento: "2012-04-18",
      sexo: "M",
      direccion: "Barrio Central, Matagalpa",
      estado: "ACTIVO",
      tutorId: tutores.length > 0 ? tutores[0].id : 1,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (est: Estudiante) => {
    setSelectedEstudiante(est);
    setFormData({
      codigoUnico: est.codigoUnico,
      nombre: est.nombre,
      apellido: est.apellido,
      fechaNacimiento: est.fechaNacimiento,
      sexo: est.sexo,
      direccion: est.direccion || "",
      estado: est.estado,
      tutorId: est.tutorId,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            Gestión de matrícula, tutor principal asignado y estado académico (Endpoint: /estudiantes)
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
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
          placeholder="Buscar por código, nombre o tutor..."
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <th className="py-3 px-4">Código Único</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Nacimiento</th>
                <th className="py-3 px-4">Sexo</th>
                <th className="py-3 px-4">Tutor Asignado</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Cargando estudiantes...
                    </div>
                  </td>
                </tr>
              ) : filteredEstudiantes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron estudiantes con los criterios indicados.
                  </td>
                </tr>
              ) : (
                filteredEstudiantes.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">
                      {st.codigoUnico}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {st.nombre} {st.apellido}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDate(st.fechaNacimiento)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          st.sexo === "M"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {st.sexo === "M" ? "Masculino" : "Femenino"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {st.tutorNombre || (
                        <span className="text-slate-400">ID Tutor: {st.tutorId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[180px]">
                      {st.direccion || "—"}
                    </td>
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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

      {/* Modal Crear */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Estudiante"
        description="Propuesta de contrato: POST /estudiantes con tutorId referenciado"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Único *
              </label>
              <input
                type="text"
                value={formData.codigoUnico}
                onChange={(e) => setFormData({ ...formData, codigoUnico: e.target.value })}
                placeholder="EST-2026-0001"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Principal Responsable *
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData({ ...formData, tutorId: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {tutores.map((tut) => (
                  <option key={tut.id} value={tut.id}>
                    {tut.nombre} {tut.apellido} (Cédula: {tut.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre(s) *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="José"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido(s) *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Mendoza"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value as "M" | "F" })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
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
        description="Actualizar información básica y tutor asignado (PUT /estudiantes/{id})"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Único
              </label>
              <input
                type="text"
                value={formData.codigoUnico}
                onChange={(e) => setFormData({ ...formData, codigoUnico: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Responsable
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData({ ...formData, tutorId: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {tutores.map((tut) => (
                  <option key={tut.id} value={tut.id}>
                    {tut.nombre} {tut.apellido} (Cédula: {tut.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value as "M" | "F" })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
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
