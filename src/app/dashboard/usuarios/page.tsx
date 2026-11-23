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
import { PerfilUsuarioModal } from "@/components/perfiles/PerfilUsuarioModal";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateNotEmpty,
} from "@/lib/validations";
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
  FileText,
  AlertCircle,
  Check,
  X,
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
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleOpenPerfil = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsPerfilOpen(true);
  };

  // Form states
  const [createForm, setCreateForm] = useState<UsuarioCreateDTO>({
    username: "",
    correo: "",
    password: "",
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
      const n = (u.nombres || u.nombre || "").toLowerCase();
      const a = (u.apellidos || u.apellido || "").toLowerCase();
      const matchesSearch =
        u.username.toLowerCase().includes(term) ||
        n.includes(term) ||
        a.includes(term) ||
        u.correo.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "ALL" ||
        u.roles.some((r: any) => String(r).toUpperCase() === roleFilter.toUpperCase());

      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setCreateErrors({});
    const defaultRoleId = availableRoles.length > 0 ? availableRoles[0].id : "DOCENTE";
    setCreateForm({
      username: "",
      correo: "",
      password: "",
      nombre: "",
      apellido: "",
      nombres: "",
      apellidos: "",
      estado: true,
      roles: [defaultRoleId],
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setEditErrors({});
    setSelectedUsuario(usuario);
    setEditForm({
      username: usuario.username,
      correo: usuario.correo,
      nombre: usuario.nombre || usuario.nombres || "",
      apellido: usuario.apellido || usuario.apellidos || "",
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
    setCreateErrors({});

    const errs: Record<string, string> = {};
    const uErr = validateUsername(createForm.username);
    if (uErr) errs.username = uErr;
    const cErr = validateEmail(createForm.correo);
    if (cErr) errs.correo = cErr;
    const nErr = validateNotEmpty(createForm.nombre, "Nombre(s)");
    if (nErr) errs.nombre = nErr;
    const aErr = validateNotEmpty(createForm.apellido, "Apellido(s)");
    if (aErr) errs.apellido = aErr;
    const pRes = validatePassword(createForm.password);
    if (!pRes.isValid && pRes.message) {
      errs.password = pRes.message;
    }
    if (!createForm.roles || createForm.roles.length === 0) {
      errs.roles = "Debes seleccionar al menos un rol para el usuario.";
    }

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      error("Por favor corrige los errores del formulario antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const roleIdOrName = createForm.roles[0];
      const matchedRole = availableRoles.find(
        (r) => r.id === roleIdOrName || r.nombre.toUpperCase() === String(roleIdOrName).toUpperCase()
      );
      const roleUuid = matchedRole ? matchedRole.id : roleIdOrName;

      const payload: UsuarioCreateDTO = {
        username: createForm.username.trim(),
        correo: createForm.correo.trim(),
        nombres: (createForm.nombre || "").trim(),
        nombre: (createForm.nombre || "").trim(),
        apellidos: (createForm.apellido || "").trim(),
        apellido: (createForm.apellido || "").trim(),
        password: createForm.password,
        roles: [roleUuid],
        estado: createForm.estado,
      };

      const created = await usuariosService.create(payload);
      success(`Usuario "${created.username}" creado exitosamente.`);
      setIsCreateOpen(false);
      loadData();

      const rolNombre = (matchedRole?.nombre || "").toUpperCase();
      if (rolNombre === "DOCENTE") {
        info("Recuerda crear el perfil en el módulo 'Docentes' vinculando esta cuenta.");
      } else if (rolNombre === "TUTOR") {
        info("Recuerda registrar los datos del tutor en el módulo 'Tutores'.");
      }
    } catch (err: any) {
      error(err.message || "Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    setEditErrors({});

    const errs: Record<string, string> = {};
    const uErr = validateUsername(editForm.username);
    if (uErr) errs.username = uErr;
    const cErr = validateEmail(editForm.correo);
    if (cErr) errs.correo = cErr;
    const nErr = validateNotEmpty(editForm.nombre, "Nombre(s)");
    if (nErr) errs.nombre = nErr;
    const aErr = validateNotEmpty(editForm.apellido, "Apellido(s)");
    if (aErr) errs.apellido = aErr;

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      error("Por favor completa los campos obligatorios correctamente.");
      return;
    }

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
                        <div
                          onClick={() => handleOpenPerfil(u)}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs uppercase cursor-pointer hover:bg-yellow-100 hover:text-blue-900 transition-colors border border-blue-200"
                          title="Clic para ver perfil del usuario"
                        >
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <p
                            onClick={() => handleOpenPerfil(u)}
                            className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                          >
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
                          onClick={() => handleOpenPerfil(u)}
                          className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-yellow-50 hover:text-blue-900 rounded-lg border border-blue-200 hover:border-yellow-400 transition-all flex items-center gap-1 shadow-xs"
                          title="Ver Perfil de Usuario"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Perfil</span>
                        </button>
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
        description="Ingresa los datos personales y asigna el rol correspondiente a la cuenta"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de Usuario * (3 - 40 car.)
              </label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => {
                  setCreateForm({ ...createForm, username: e.target.value });
                  if (createErrors.username) setCreateErrors((prev) => ({ ...prev, username: "" }));
                }}
                placeholder="carlos_m"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  createErrors.username ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.username && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.username}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={createForm.correo}
                onChange={(e) => {
                  setCreateForm({ ...createForm, correo: e.target.value });
                  if (createErrors.correo) setCreateErrors((prev) => ({ ...prev, correo: "" }));
                }}
                placeholder="usuario@ipsfas.edu"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  createErrors.correo ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.correo && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.correo}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre(s) *
              </label>
              <input
                type="text"
                value={createForm.nombre}
                onChange={(e) => {
                  setCreateForm({ ...createForm, nombre: e.target.value });
                  if (createErrors.nombre) setCreateErrors((prev) => ({ ...prev, nombre: "" }));
                }}
                placeholder="María"
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
                value={createForm.apellido}
                onChange={(e) => {
                  setCreateForm({ ...createForm, apellido: e.target.value });
                  if (createErrors.apellido) setCreateErrors((prev) => ({ ...prev, apellido: "" }));
                }}
                placeholder="López"
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rol Asignado *
              </label>
              <select
                value={createForm.roles[0] || (availableRoles[0]?.id || "DOCENTE")}
                onChange={(e) => setCreateForm({ ...createForm, roles: [e.target.value] })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} {r.descripcion ? `— ${r.descripcion}` : ""}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="DOCENTE">DOCENTE</option>
                    <option value="SECRETARIA">SECRETARIA</option>
                    <option value="DIRECCION">DIRECCION</option>
                    <option value="TUTOR">TUTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </>
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña Inicial Segura *
              </label>
              <input
                type="text"
                value={createForm.password}
                onChange={(e) => {
                  setCreateForm({ ...createForm, password: e.target.value });
                  if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="Ejemplo: Segura#2026"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  createErrors.password ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />

              {/* Indicador visual de seguridad de contraseña */}
              {(() => {
                const p = validatePassword(createForm.password);
                return (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-600">Requisitos de contraseña:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                      <span className={`flex items-center gap-1 ${p.hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                        {p.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        8+ caracteres
                      </span>
                      <span className={`flex items-center gap-1 ${p.hasNumber ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                        {p.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        Al menos 1 dígito (0-9)
                      </span>
                      <span className={`flex items-center gap-1 ${p.hasUpper ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                        {p.hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        1 mayúscula
                      </span>
                      <span className={`flex items-center gap-1 ${p.hasLower ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                        {p.hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        1 minúscula
                      </span>
                      <span className={`flex items-center gap-1 ${p.hasSpecial ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                        {p.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        1 carácter especial (@#$)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {createErrors.password && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.password}</span>
                </p>
              )}
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
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
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
        description="Modifica los datos personales y de acceso del usuario"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => {
                setEditForm({ ...editForm, username: e.target.value });
                if (editErrors.username) setEditErrors((prev) => ({ ...prev, username: "" }));
              }}
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                editErrors.username ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
              }`}
            />
            {editErrors.username && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{editErrors.username}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              value={editForm.correo}
              onChange={(e) => {
                setEditForm({ ...editForm, correo: e.target.value });
                if (editErrors.correo) setEditErrors((prev) => ({ ...prev, correo: "" }));
              }}
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                editErrors.correo ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
              }`}
            />
            {editErrors.correo && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{editErrors.correo}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) *</label>
            <input
              type="text"
              value={editForm.nombre}
              onChange={(e) => {
                setEditForm({ ...editForm, nombre: e.target.value });
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
              value={editForm.apellido}
              onChange={(e) => {
                setEditForm({ ...editForm, apellido: e.target.value });
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

      {/* Modal Perfil de Usuario */}
      <PerfilUsuarioModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
        usuario={selectedUsuario}
      />

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
