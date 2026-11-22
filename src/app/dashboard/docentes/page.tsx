"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { docentesService } from "@/services/docentes.service";
import { usuariosService } from "@/services/usuarios.service";
import { Docente, DocenteCreateDTO, Usuario } from "@/types/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  UserCheck,
  Check,
  X,
} from "lucide-react";

export default function DocentesPage() {
  const { canAccess } = useAuth();
  const { success, error } = useToast();

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<DocenteCreateDTO>({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    direccion: "",
    correo: "",
    usuarioId: null,
    estado: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docList, userList] = await Promise.allSettled([
        docentesService.getAll(),
        usuariosService.getAll(),
      ]);
      if (docList.status === "fulfilled") setDocentes(docList.value);
      if (userList.status === "fulfilled") setUsuarios(userList.value);
    } catch (err: any) {
      error(err.message || "Error al cargar la lista de docentes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocentes = useMemo(() => {
    return docentes.filter((d) => {
      const term = searchTerm.toLowerCase();
      return (
        d.nombre.toLowerCase().includes(term) ||
        d.apellido.toLowerCase().includes(term) ||
        d.cedula.toLowerCase().includes(term) ||
        d.correo.toLowerCase().includes(term) ||
        d.telefono.includes(term)
      );
    });
  }, [docentes, searchTerm]);

  const handleOpenCreate = () => {
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "001-120585-2000B",
      telefono: "87776655",
      direccion: "Reparto Los Pinos, Matagalpa",
      correo: "mlopez@colegio.edu.ni",
      usuarioId: usuarios.length > 0 ? usuarios[0].id : null,
      estado: true,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (doc: Docente) => {
    setSelectedDocente(doc);
    setFormData({
      nombre: doc.nombre,
      apellido: doc.apellido,
      cedula: doc.cedula,
      telefono: doc.telefono,
      direccion: doc.direccion || "",
      correo: doc.correo,
      usuarioId: doc.usuarioId || null,
      estado: doc.estado,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await docentesService.create(formData);
      success("Docente registrado exitosamente");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al registrar docente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocente) return;
    setIsSubmitting(true);
    try {
      await docentesService.update(selectedDocente.id, formData);
      success("Docente actualizado exitosamente");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar docente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEstado = async (doc: Docente) => {
    try {
      await docentesService.updateEstado(doc.id, { estado: !doc.estado });
      success(`Estado actualizado a ${!doc.estado ? "Activo" : "Inactivo"}`);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async () => {
    if (!selectedDocente) return;
    setIsSubmitting(true);
    try {
      await docentesService.delete(selectedDocente.id);
      success("Docente eliminado exitosamente");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "No se pudo eliminar el docente");
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Docentes</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {docentes.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de profesores, vinculación con usuario del sistema y estado (Endpoint: /docentes)
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
            Registrar Docente
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar docente por cédula, nombre, correo o teléfono..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Docente</th>
                <th className="py-3 px-4">Cédula</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Usuario Sistema</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Cargando docentes...
                    </div>
                  </td>
                </tr>
              ) : filteredDocentes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron docentes registrados.
                  </td>
                </tr>
              ) : (
                filteredDocentes.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {doc.nombre} {doc.apellido}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.correo}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-medium text-slate-700">
                      {doc.cedula}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.telefono}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {doc.direccion || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {doc.usuarioId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-medium border border-indigo-100">
                          <UserCheck className="w-3 h-3 text-indigo-600" />
                          ID: {doc.usuarioId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sin cuenta</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEstado(doc)}
                        title="Clic para cambiar estado (PATCH /docentes/{id}/estado)"
                        className="group flex items-center"
                      >
                        <Badge variant={doc.estado ? "success" : "danger"}>
                          {doc.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocente(doc);
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
        title="Registrar Docente"
        description="Propuesta de contrato: POST /docentes"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="María"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="López"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula de Identidad *
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="001-120585-2000B"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono *</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="87776655"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="mlopez@colegio.edu.ni"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuenta de Usuario Asociada (usuarioId)
              </label>
              <select
                value={formData.usuarioId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usuarioId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Sin Vincular --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.nombre} {u.apellido})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Reparto Los Pinos, Matagalpa"
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
              {isSubmitting ? "Guardando..." : "Guardar Docente"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Docente"
        description="Actualizar información del profesor (PUT /docentes/{id})"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cédula</label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuario Asociado
              </label>
              <select
                value={formData.usuarioId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usuarioId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Sin Vincular --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.nombre} {u.apellido})
                  </option>
                ))}
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
        title="Eliminar Docente"
        message={`¿Estás seguro de que deseas eliminar a "${selectedDocente?.nombre} ${selectedDocente?.apellido}"? Se ejecutará DELETE /docentes/${selectedDocente?.id}. Recuerda que según las reglas de negocio, fallará con 409 Conflict si tiene asignaciones o dependencias activas.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
