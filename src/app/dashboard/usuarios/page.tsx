"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { usuariosService } from "@/services/usuarios.service";
import { rolesService } from "@/services/roles.service";
import { Usuario, UsuarioCreateDTO, RoleType, Role } from "@/types/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Shield,
  KeyRound,
  CheckCircle,
  XCircle,
  Mail,
  User,
} from "lucide-react";

export default function UsuariosPage() {
  const { user: currentUser, canAccess } = useAuth();
  const { success, error, info } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<UsuarioCreateDTO>({
    username: "",
    correo: "",
    password: "Temporal#2026",
    nombre: "",
    apellido: "",
    estado: true,
    roles: ["DOCENTE"],
  });

  const [editForm, setEditForm] = useState({
    username: "",
    correo: "",
    nombre: "",
    apellido: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uList, rList] = await Promise.allSettled([
        usuariosService.getAll(),
        rolesService.getAll(),
      ]);
      if (uList.status === "fulfilled") setUsuarios(uList.value);
      if (rList.status === "fulfilled") setAvailableRoles(rList.value);
    } catch (err: any) {
      error(err.message || "Error al cargar la lista de usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        u.username.toLowerCase().includes(term) ||
        u.nombre.toLowerCase().includes(term) ||
        u.apellido.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "ALL" ||
        u.roles.some((r) => r.toUpperCase() === roleFilter.toUpperCase());

      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setCreateForm({
      username: "mlopez2",
      correo: "mlopez2@colegio.edu.ni",
      password: "Temporal#2026",
      nombre: "María",
      apellido: "López",
      estado: true,
      roles: ["DOCENTE"],
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditForm({
      username: usuario.username,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    });
    setIsEditOpen(true);
  };

  const handleOpenRoles = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setSelectedRoles([...usuario.roles]);
    setIsRolesOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usuariosService.create(createForm);
      success("Usuario creado exitosamente");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    setIsSubmitting(true);
    try {
      await usuariosService.update(selectedUsuario.id, editForm);
      success("Usuario actualizado exitosamente");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRolesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    setIsSubmitting(true);
    try {
      await usuariosService.updateRoles(selectedUsuario.id, { roles: selectedRoles });
      success("Roles de usuario actualizados correctamente (PUT /usuarios/{id}/roles)");
      setIsRolesOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar roles");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEstado = async (u: Usuario) => {
    try {
      await usuariosService.updateEstado(u.id, { estado: !u.estado });
      success(`Estado actualizado a ${!u.estado ? "Activo" : "Inactivo"} (PATCH /usuarios/{id}/estado)`);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;
    setIsSubmitting(true);
    try {
      await usuariosService.delete(selectedUsuario.id);
      success("Usuario eliminado exitosamente (DELETE /usuarios/{id})");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "No se pudo eliminar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRoleSelection = (roleName: string) => {
    const norm = roleName.toUpperCase();
    if (selectedRoles.includes(norm)) {
      if (selectedRoles.length === 1) {
        info("El usuario debe tener asignado al menos un rol.");
        return;
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== norm));
    } else {
      setSelectedRoles([...selectedRoles, norm]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Usuarios</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {usuarios.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de cuentas de acceso, roles asignados y activación (Endpoint: /usuarios)
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
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por username, nombre o correo..."
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Filtrar por Rol:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DIRECCION">DIRECCION</option>
            <option value="SECRETARIA">SECRETARIA</option>
            <option value="DOCENTE">DOCENTE</option>
            <option value="TUTOR">TUTOR</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Institucional</th>
                <th className="py-3 px-4">Roles Asignados</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Cargando usuarios...
                    </div>
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-900">
                            {u.username}
                          </p>
                          <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {u.correo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEstado(u)}
                        title="Clic para cambiar estado (PATCH /usuarios/{id}/estado)"
                        className="group flex items-center"
                      >
                        <Badge variant={u.estado ? "success" : "danger"}>
                          {u.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenRoles(u)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Gestionar Roles (PUT /usuarios/{id}/roles)"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar Datos Básicos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUsuario(u);
                            setIsDeleteOpen(true);
                          }}
                          disabled={u.id === currentUser?.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={
                            u.id === currentUser?.id
                              ? "No puedes eliminar tu propia cuenta"
                              : "Eliminar Usuario"
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
        title="Crear Usuario"
        description="Propuesta de contrato: POST /usuarios con roles y contraseña temporal cifrada por BCrypt"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="mlopez"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={createForm.correo}
                onChange={(e) => setCreateForm({ ...createForm, correo: e.target.value })}
                placeholder="mlopez@colegio.edu.ni"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña Inicial *
              </label>
              <input
                type="text"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Temporal#2026"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                placeholder="María"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={createForm.apellido}
                onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                placeholder="López"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rol Asignado *</label>
              <select
                value={createForm.roles[0] || "DOCENTE"}
                onChange={(e) => setCreateForm({ ...createForm, roles: [e.target.value] })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DOCENTE">DOCENTE</option>
                <option value="SECRETARIA">SECRETARIA</option>
                <option value="DIRECCION">DIRECCION</option>
                <option value="TUTOR">TUTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
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
              {isSubmitting ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Datos Básicos */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Actualizar Datos del Usuario"
        description="Propuesta: PUT /usuarios/{id}"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
            <input
              type="email"
              value={editForm.correo}
              onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
            <input
              type="text"
              value={editForm.apellido}
              onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
              required
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

      {/* Modal Roles */}
      <Modal
        isOpen={isRolesOpen}
        onClose={() => setIsRolesOpen(false)}
        title="Asignación de Roles"
        description={`Modificar roles asignados al usuario @${selectedUsuario?.username} (PUT /usuarios/${selectedUsuario?.id}/roles)`}
        maxWidth="md"
      >
        <form onSubmit={handleRolesSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Selecciona los roles que tendrá este usuario. Los permisos del sistema se aplicarán de inmediato.
          </p>

          <div className="space-y-2">
            {["ADMIN", "DIRECCION", "SECRETARIA", "DOCENTE", "TUTOR"].map((roleName) => {
              const isSelected = selectedRoles.includes(roleName);
              return (
                <div
                  key={roleName}
                  onClick={() => toggleRoleSelection(roleName)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-300 text-indigo-900"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      className={`w-4 h-4 ${
                        isSelected ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <span className="text-xs font-semibold">{roleName}</span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRolesOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Roles"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Cuenta de Usuario"
        message={`¿Estás seguro de que deseas eliminar la cuenta de usuario "${selectedUsuario?.username}"? Se ejecutará DELETE /usuarios/${selectedUsuario?.id}.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
