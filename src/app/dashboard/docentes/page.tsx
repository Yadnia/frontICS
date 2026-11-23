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
import { PerfilDocenteModal } from "@/components/perfiles/PerfilDocenteModal";
import { getInitials } from "@/lib/utils";
import { validateCedula, validatePhone, validateNotEmpty } from "@/lib/validations";
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
  FileText,
  AlertCircle,
  ShieldAlert,
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
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleOpenPerfil = (doc: Docente) => {
    setSelectedDocente(doc);
    setIsPerfilOpen(true);
  };

  // Cuentas de usuario disponibles (sin docente asignado)
  const availableUsersForDocente = useMemo(() => {
    const assignedUserIds = new Set(
      docentes.map((d) => d.usuarioId || d.usuario?.id).filter(Boolean)
    );
    return usuarios.filter((u) => {
      if (isEditOpen && selectedDocente && (selectedDocente.usuarioId === u.id || selectedDocente.usuario?.id === u.id)) {
        return true;
      }
      return !assignedUserIds.has(u.id);
    });
  }, [usuarios, docentes, isEditOpen, selectedDocente]);

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
      const n = (d.nombres || d.nombre || "").toLowerCase();
      const a = (d.apellidos || d.apellido || "").toLowerCase();
      const c = (d.cedula || "").toLowerCase();
      const em = (d.correo || d.usuario?.correo || "").toLowerCase();
      const tel = d.telefono || "";
      return (
        n.includes(term) ||
        a.includes(term) ||
        c.includes(term) ||
        em.includes(term) ||
        tel.includes(term)
      );
    });
  }, [docentes, searchTerm]);

  const handleOpenCreate = () => {
    setValidationErrors({});
    const initialUser = availableUsersForDocente.length > 0 ? availableUsersForDocente[0] : null;
    setFormData({
      nombre: initialUser ? (initialUser.nombres || initialUser.nombre || "") : "",
      apellido: initialUser ? (initialUser.apellidos || initialUser.apellido || "") : "",
      correo: initialUser ? initialUser.correo : "",
      cedula: "",
      telefono: "",
      direccion: "",
      usuarioId: initialUser ? initialUser.id : null,
      estado: true,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (doc: Docente) => {
    setValidationErrors({});
    setSelectedDocente(doc);
    setFormData({
      nombre: doc.nombre || doc.nombres || "",
      apellido: doc.apellido || doc.apellidos || "",
      cedula: doc.cedula,
      telefono: doc.telefono,
      direccion: doc.direccion || "",
      correo: doc.correo || doc.usuario?.correo || "",
      usuarioId: doc.usuarioId || doc.usuario?.id || null,
      estado: doc.estado,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validaciones estrictas de calidad de software
    const errs: Record<string, string> = {};
    if (!formData.usuarioId) {
      errs.usuarioId = "Es obligatorio vincular una cuenta de usuario al docente.";
    }
    const cedErr = validateCedula(formData.cedula);
    if (cedErr) errs.cedula = cedErr;
    const phoneErr = validatePhone(formData.telefono, true);
    if (phoneErr) errs.telefono = phoneErr;
    const dirErr = validateNotEmpty(formData.direccion, "Dirección");
    if (dirErr) errs.direccion = dirErr;

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      error("Por favor completa los campos requeridos correctamente.");
      return;
    }

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
    setValidationErrors({});

    const errs: Record<string, string> = {};
    if (!formData.usuarioId) {
      errs.usuarioId = "El docente debe mantener una cuenta de usuario vinculada.";
    }
    const cedErr = validateCedula(formData.cedula);
    if (cedErr) errs.cedula = cedErr;
    const phoneErr = validatePhone(formData.telefono, true);
    if (phoneErr) errs.telefono = phoneErr;
    const dirErr = validateNotEmpty(formData.direccion, "Dirección");
    if (dirErr) errs.direccion = dirErr;

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      error("Por favor completa los campos requeridos correctamente.");
      return;
    }

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
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleOpenPerfil(doc)}
                          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center font-bold text-xs text-blue-700 cursor-pointer overflow-hidden shrink-0 shadow-xs transition-all"
                          title="Clic para ver perfil completo del docente"
                        >
                          {doc.foto ? (
                            <img src={doc.foto} alt={doc.nombre} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(doc.nombre, doc.apellido)
                          )}
                        </div>
                        <div>
                          <p
                            onClick={() => handleOpenPerfil(doc)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {doc.nombre} {doc.apellido}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.correo}</p>
                        </div>
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
                          onClick={() => handleOpenPerfil(doc)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-yellow-50 hover:text-blue-900 rounded-lg border border-blue-200 hover:border-yellow-400 transition-all flex items-center gap-1 shadow-xs"
                          title="Ver Perfil Completo del Docente"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Perfil</span>
                        </button>
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
        description="Ingresa los datos para registrar un docente en el sistema institucional"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Advertencia si no hay usuarios disponibles */}
          {availableUsersForDocente.length === 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">No hay cuentas de usuario disponibles sin docente asignado</p>
                <p className="mt-0.5 text-amber-800">
                  Todo docente requiere una cuenta de usuario vinculada (relación 1:1 obligatoria). Ve al módulo de <strong>Usuarios</strong> para crear una cuenta previa.
                </p>
              </div>
            </div>
          )}

          {/* Selector de Usuario Obligatorio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cuenta de Usuario a Vincular * (Obligatoria)
            </label>
            <select
              value={formData.usuarioId || ""}
              onChange={(e) => {
                const uid = e.target.value || null;
                const sel = usuarios.find((u) => u.id === uid);
                setFormData({
                  ...formData,
                  usuarioId: uid,
                  nombre: sel ? (sel.nombres || sel.nombre || "") : "",
                  apellido: sel ? (sel.apellidos || sel.apellido || "") : "",
                  correo: sel ? sel.correo : "",
                });
                if (validationErrors.usuarioId) {
                  setValidationErrors((prev) => ({ ...prev, usuarioId: "" }));
                }
              }}
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                validationErrors.usuarioId
                  ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
            >
              <option value="">-- Selecciona la cuenta de usuario a vincular --</option>
              {availableUsersForDocente.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} — {u.nombres || u.nombre} {u.apellidos || u.apellido} ({u.correo})
                </option>
              ))}
            </select>
            {validationErrors.usuarioId && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationErrors.usuarioId}</span>
              </p>
            )}
          </div>

          {/* Previsualización del usuario seleccionado */}
          {formData.usuarioId && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-blue-950">
                    {formData.nombre} {formData.apellido}
                  </p>
                  <p className="text-[11px] text-blue-700">
                    Correo: {formData.correo || "Sin correo"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                Cuenta Vinculada
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula de Identidad * (Única, máx. 30 caracteres)
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => {
                  setFormData({ ...formData, cedula: e.target.value });
                  if (validationErrors.cedula) setValidationErrors((prev) => ({ ...prev, cedula: "" }));
                }}
                placeholder="001-120585-2000B"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  validationErrors.cedula
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {validationErrors.cedula && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{validationErrors.cedula}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto *
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => {
                  setFormData({ ...formData, telefono: e.target.value });
                  if (validationErrors.telefono) setValidationErrors((prev) => ({ ...prev, telefono: "" }));
                }}
                placeholder="8777-6655"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  validationErrors.telefono
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {validationErrors.telefono && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{validationErrors.telefono}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dirección de Domicilio *
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => {
                setFormData({ ...formData, direccion: e.target.value });
                if (validationErrors.direccion) setValidationErrors((prev) => ({ ...prev, direccion: "" }));
              }}
              placeholder="Reparto Los Pinos, Matagalpa"
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                validationErrors.direccion
                  ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
            />
            {validationErrors.direccion && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationErrors.direccion}</span>
              </p>
            )}
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
              disabled={isSubmitting || availableUsersForDocente.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
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
        description="Actualizar datos laborales y de contacto del docente"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cuenta de Usuario Vinculada *
            </label>
            <select
              value={formData.usuarioId || ""}
              onChange={(e) => {
                const uid = e.target.value || null;
                const sel = usuarios.find((u) => u.id === uid);
                setFormData({
                  ...formData,
                  usuarioId: uid,
                  nombre: sel ? (sel.nombres || sel.nombre || "") : formData.nombre,
                  apellido: sel ? (sel.apellidos || sel.apellido || "") : formData.apellido,
                  correo: sel ? sel.correo : formData.correo,
                });
                if (validationErrors.usuarioId) {
                  setValidationErrors((prev) => ({ ...prev, usuarioId: "" }));
                }
              }}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona cuenta de usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} — {u.nombres || u.nombre} {u.apellidos || u.apellido} ({u.correo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula de Identidad *
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => {
                  setFormData({ ...formData, cedula: e.target.value });
                  if (validationErrors.cedula) setValidationErrors((prev) => ({ ...prev, cedula: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  validationErrors.cedula
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {validationErrors.cedula && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{validationErrors.cedula}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto *
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => {
                  setFormData({ ...formData, telefono: e.target.value });
                  if (validationErrors.telefono) setValidationErrors((prev) => ({ ...prev, telefono: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  validationErrors.telefono
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {validationErrors.telefono && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{validationErrors.telefono}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dirección de Domicilio *
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => {
                setFormData({ ...formData, direccion: e.target.value });
                if (validationErrors.direccion) setValidationErrors((prev) => ({ ...prev, direccion: "" }));
              }}
              required
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                validationErrors.direccion
                  ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
            />
            {validationErrors.direccion && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationErrors.direccion}</span>
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
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Perfil Completo del Docente */}
      <PerfilDocenteModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
        docente={selectedDocente}
      />

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
