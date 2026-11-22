"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rolesService } from "@/services/roles.service";
import { Role, RoleCreateDTO } from "@/types/api";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RoleBadge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Lock,
  Info,
} from "lucide-react";

export default function RolesPage() {
  const { canAccess } = useAuth();
  const { success, error, info } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<RoleCreateDTO>({
    nombre: "",
    descripcion: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await rolesService.getAll();
      setRoles(data);
    } catch (err: any) {
      error(err.message || "Error al cargar la lista de roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rolesService.create(formData);
      success("Rol creado exitosamente (POST /roles)");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al crear rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await rolesService.update(selectedRole.id, formData);
      success("Rol actualizado exitosamente (PUT /roles/{id})");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await rolesService.delete(selectedRole.id);
      success("Rol eliminado exitosamente");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "No se pudo eliminar el rol. Comprueba que no esté asignado a ningún usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProtectedRole = (roleName: string) => {
    return ["ADMIN", "DIRECCION", "SECRETARIA", "DOCENTE", "TUTOR"].includes(
      roleName.toUpperCase()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles del Sistema</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {roles.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Definición de roles para control de acceso basado en roles (RBAC) (Endpoint: /roles)
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
            Crear Rol
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold">Roles Estándar Sugeridos por el Documento: </span>
          ADMIN, DIRECCION, SECRETARIA, DOCENTE y TUTOR. Evitar duplicados y proteger la
          administración exclusivamente para usuarios con permiso ADMIN.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Identificador</th>
                <th className="py-3 px-4">Nombre del Rol</th>
                <th className="py-3 px-4">Descripción del Alcance</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Cargando roles...
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                    No hay roles registrados.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">#{r.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={r.nombre} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {r.descripcion || "Sin descripción asignada"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRole(r);
                            setIsDeleteOpen(true);
                          }}
                          disabled={isProtectedRole(r.nombre)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={
                            isProtectedRole(r.nombre)
                              ? "Rol base del sistema protegido contra eliminación accidental"
                              : "Eliminar Rol"
                          }
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
        title="Crear Rol"
        description="Propuesta de contrato: POST /roles"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Rol (Ej: DOCENTE) *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
              placeholder="DOCENTE"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción del Rol
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Personal docente del centro educativo"
              rows={3}
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
              {isSubmitting ? "Creando..." : "Crear Rol"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Rol"
        description="Propuesta de contrato: PUT /roles/{id}"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
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
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${selectedRole?.nombre}"? Se ejecutará DELETE /roles/${selectedRole?.id}. Según las especificaciones, fallará si está asignado a usuarios.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
