"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { tutoresService } from "@/services/tutores.service";
import { usuariosService } from "@/services/usuarios.service";
import { Tutor, TutorCreateDTO, Usuario } from "@/types/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PerfilTutorModal } from "@/components/perfiles/PerfilTutorModal";
import { getInitials } from "@/lib/utils";
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  validateNotEmpty,
  validateEmail,
  validatePhone,
  validateCedula,
} from "@/lib/validations";

export default function TutoresPage() {
  const { canAccess } = useAuth();
  const { success, error } = useToast();

  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleOpenPerfil = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsPerfilOpen(true);
  };

  // Filtrar usuarios disponibles para ser asignados como tutores
  const availableUsersForTutor = useMemo(() => {
    const assignedUserIds = new Set(
      tutores
        .map((t) => t.usuarioId || t.usuario?.id)
        .filter((id): id is string => Boolean(id))
    );
    return usuarios.filter((u) => !assignedUserIds.has(u.id));
  }, [usuarios, tutores]);

  // Form State
  const [formData, setFormData] = useState<TutorCreateDTO>({
    usuarioId: null,
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    ocupacion: "",
    correo: "",
    cedula: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tutData, userData] = await Promise.allSettled([
        tutoresService.getAll(),
        usuariosService.getAll(),
      ]);
      if (tutData.status === "fulfilled") setTutores(tutData.value);
      if (userData.status === "fulfilled") setUsuarios(userData.value);
    } catch (err: any) {
      error(err.message || "Error al cargar la lista de tutores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTutores = useMemo(() => {
    return tutores.filter((t) => {
      const term = searchTerm.toLowerCase();
      const n = (t.nombre || t.nombres || "").toLowerCase();
      const a = (t.apellido || t.apellidos || "").toLowerCase();
      const c = (t.cedula || "").toLowerCase();
      const em = (t.correo || t.usuario?.correo || "").toLowerCase();
      const tel = t.telefono || "";
      return (
        n.includes(term) ||
        a.includes(term) ||
        c.includes(term) ||
        em.includes(term) ||
        tel.includes(term)
      );
    });
  }, [tutores, searchTerm]);

  const handleOpenCreate = () => {
    setCreateErrors({});
    const initialUser = availableUsersForTutor.length > 0 ? availableUsersForTutor[0] : null;
    setFormData({
      usuarioId: initialUser ? initialUser.id : null,
      nombre: initialUser ? (initialUser.nombres || initialUser.nombre || "") : "",
      apellido: initialUser ? (initialUser.apellidos || initialUser.apellido || "") : "",
      telefono: "",
      direccion: "",
      ocupacion: "",
      correo: initialUser ? initialUser.correo : "",
      cedula: "",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (tutor: Tutor) => {
    setEditErrors({});
    setSelectedTutor(tutor);
    setFormData({
      usuarioId: tutor.usuarioId || tutor.usuario?.id || null,
      nombre: tutor.nombre || tutor.nombres || "",
      apellido: tutor.apellido || tutor.apellidos || "",
      cedula: tutor.cedula || "",
      telefono: tutor.telefono || "",
      direccion: tutor.direccion || "",
      ocupacion: tutor.ocupacion || "",
      correo: tutor.correo || tutor.usuario?.correo || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    const errs: Record<string, string> = {};
    const uErr = validateNotEmpty(formData.usuarioId, "Cuenta de Usuario Vinculada");
    if (uErr) errs.usuarioId = "Debes vincular una cuenta de usuario existente al tutor.";
    const nErr = validateNotEmpty(formData.nombre, "Nombre(s)");
    if (nErr) errs.nombre = nErr;
    const aErr = validateNotEmpty(formData.apellido, "Apellido(s)");
    if (aErr) errs.apellido = aErr;
    const cErr = validateCedula(formData.cedula);
    if (cErr) errs.cedula = cErr;
    const tErr = validatePhone(formData.telefono, true);
    if (tErr) errs.telefono = tErr;
    if (formData.correo && formData.correo.trim().length > 0) {
      const mErr = validateEmail(formData.correo);
      if (mErr) errs.correo = mErr;
    }

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      error("Por favor completa los campos obligatorios del tutor con datos válidos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await tutoresService.create(formData);
      success("Tutor registrado exitosamente");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al registrar tutor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;
    setEditErrors({});

    const errs: Record<string, string> = {};
    const uErr = validateNotEmpty(formData.usuarioId, "Cuenta de Usuario Vinculada");
    if (uErr) errs.usuarioId = "La cuenta de usuario vinculada es obligatoria.";
    const nErr = validateNotEmpty(formData.nombre, "Nombre(s)");
    if (nErr) errs.nombre = nErr;
    const aErr = validateNotEmpty(formData.apellido, "Apellido(s)");
    if (aErr) errs.apellido = aErr;
    const cErr = validateCedula(formData.cedula);
    if (cErr) errs.cedula = cErr;
    const tErr = validatePhone(formData.telefono, true);
    if (tErr) errs.telefono = tErr;
    if (formData.correo && formData.correo.trim().length > 0) {
      const mErr = validateEmail(formData.correo);
      if (mErr) errs.correo = mErr;
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      error("Por favor completa los campos obligatorios con valores correctos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await tutoresService.update(selectedTutor.id, formData);
      success("Tutor actualizado exitosamente");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Error al actualizar tutor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTutor) return;
    setIsSubmitting(true);
    try {
      await tutoresService.delete(selectedTutor.id);
      success("Tutor eliminado exitosamente");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "No se pudo eliminar el tutor. Comprueba que no tenga estudiantes asociados.");
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tutores y Padres</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {tutores.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de padres o tutores legales para vinculación con estudiantes (Endpoint: /tutores)
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 border border-yellow-400/30"
          >
            <Plus className="w-4 h-4 text-yellow-300" />
            Registrar Tutor
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar tutor por cédula, nombre, teléfono o correo..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tutor / Padre</th>
                <th className="py-3 px-4">Cédula</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Ocupación</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4 text-right">Perfil & Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Cargando tutores...
                    </div>
                  </td>
                </tr>
              ) : filteredTutores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron tutores registrados.
                  </td>
                </tr>
              ) : (
                filteredTutores.map((tut) => (
                  <tr key={tut.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleOpenPerfil(tut)}
                          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center font-bold text-xs text-blue-700 cursor-pointer overflow-hidden shrink-0 shadow-xs transition-all"
                          title="Clic para ver perfil del tutor"
                        >
                          {getInitials(tut.nombre, tut.apellido)}
                        </div>
                        <div>
                          <p
                            onClick={() => handleOpenPerfil(tut)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                            title="Clic para ver perfil del tutor"
                          >
                            {tut.nombre} {tut.apellido}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">ID #{tut.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-medium text-slate-700">
                      {tut.cedula}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tut.telefono}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {tut.correo ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span>{tut.correo}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {tut.ocupacion || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {tut.direccion || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPerfil(tut)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-yellow-50 hover:text-blue-900 rounded-lg border border-blue-200 hover:border-yellow-400 transition-all flex items-center gap-1 shadow-xs"
                          title="Ver Perfil Completo del Tutor"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>Perfil</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tut)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTutor(tut);
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
        title="Registrar Tutor"
        description="Ingresa los datos para registrar un tutor legal o padre de familia con cuenta vinculada"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuenta de Usuario Vinculada *
              </label>

              {availableUsersForTutor.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No hay cuentas de usuario disponibles</p>
                    <p className="text-amber-700 mt-0.5">
                      Todos los usuarios ya tienen un perfil asignado. Primero crea una cuenta de usuario en el módulo de Usuarios.
                    </p>
                  </div>
                </div>
              ) : (
                <select
                  value={formData.usuarioId || ""}
                  onChange={(e) => {
                    const uid = e.target.value || null;
                    const u = usuarios.find((usr) => usr.id === uid);
                    setFormData({
                      ...formData,
                      usuarioId: uid,
                      nombre: u ? (u.nombres || u.nombre || "") : formData.nombre,
                      apellido: u ? (u.apellidos || u.apellido || "") : formData.apellido,
                      correo: u ? u.correo : formData.correo,
                    });
                    if (createErrors.usuarioId) {
                      setCreateErrors((prev) => ({ ...prev, usuarioId: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                    createErrors.usuarioId
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:ring-blue-500"
                  }`}
                >
                  <option value="">-- Selecciona una cuenta de usuario para vincular --</option>
                  {availableUsersForTutor.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} — {u.nombres || u.nombre} {u.apellidos || u.apellido} ({u.correo})
                    </option>
                  ))}
                </select>
              )}

              {createErrors.usuarioId && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.usuarioId}</span>
                </p>
              )}

              {/* Previsualización del usuario seleccionado */}
              {formData.usuarioId && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {getInitials(formData.nombre, formData.apellido)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-950">
                        {formData.nombre} {formData.apellido}
                      </p>
                      <p className="text-[11px] text-blue-700/80 font-mono">{formData.correo}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Cuenta Vinculada
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
                  if (createErrors.nombre) setCreateErrors((prev) => ({ ...prev, nombre: "" }));
                }}
                placeholder="Carlos"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido(s) *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => {
                  setFormData({ ...formData, apellido: e.target.value });
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
                Cédula de Identidad * (min 5 car.)
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => {
                  setFormData({ ...formData, cedula: e.target.value });
                  if (createErrors.cedula) setCreateErrors((prev) => ({ ...prev, cedula: "" }));
                }}
                placeholder="001-150390-1000A"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  createErrors.cedula ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.cedula && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.cedula}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono * (min 8 dígitos)</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => {
                  setFormData({ ...formData, telefono: e.target.value });
                  if (createErrors.telefono) setCreateErrors((prev) => ({ ...prev, telefono: "" }));
                }}
                placeholder="8888-1234"
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  createErrors.telefono ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {createErrors.telefono && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{createErrors.telefono}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => {
                  setFormData({ ...formData, correo: e.target.value });
                  if (createErrors.correo) setCreateErrors((prev) => ({ ...prev, correo: "" }));
                }}
                placeholder="carlos.mendoza@example.com"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupación</label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                placeholder="Comerciante / Ingeniero"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              disabled={isSubmitting || availableUsersForTutor.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Tutor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Tutor"
        description="Actualizar información y datos de contacto del tutor"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuenta de Usuario Vinculada *
              </label>
              <select
                value={formData.usuarioId || ""}
                onChange={(e) => {
                  const uid = e.target.value || null;
                  const u = usuarios.find((usr) => usr.id === uid);
                  setFormData({
                    ...formData,
                    usuarioId: uid,
                    nombre: u ? (u.nombres || u.nombre || formData.nombre) : formData.nombre,
                    apellido: u ? (u.apellidos || u.apellido || formData.apellido) : formData.apellido,
                    correo: u ? u.correo : formData.correo,
                  });
                  if (editErrors.usuarioId) {
                    setEditErrors((prev) => ({ ...prev, usuarioId: "" }));
                  }
                }}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  editErrors.usuarioId
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              >
                <option value="">-- Selecciona cuenta de usuario --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} — {u.nombres || u.nombre} {u.apellidos || u.apellido} ({u.correo})
                  </option>
                ))}
              </select>
              {editErrors.usuarioId && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.usuarioId}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
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
                  setFormData({ ...formData, apellido: e.target.value });
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cédula *</label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => {
                  setFormData({ ...formData, cedula: e.target.value });
                  if (editErrors.cedula) setEditErrors((prev) => ({ ...prev, cedula: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                  editErrors.cedula ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {editErrors.cedula && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.cedula}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono *</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => {
                  setFormData({ ...formData, telefono: e.target.value });
                  if (editErrors.telefono) setEditErrors((prev) => ({ ...prev, telefono: "" }));
                }}
                required
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  editErrors.telefono ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              {editErrors.telefono && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editErrors.telefono}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => {
                  setFormData({ ...formData, correo: e.target.value });
                  if (editErrors.correo) setEditErrors((prev) => ({ ...prev, correo: "" }));
                }}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupación</label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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

      {/* Modal Perfil del Tutor */}
      <PerfilTutorModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
        tutor={selectedTutor}
        onEdit={handleOpenEdit}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Tutor"
        message={`¿Estás seguro de que deseas eliminar a "${selectedTutor?.nombre} ${selectedTutor?.apellido}"? Se ejecutará DELETE /tutores/${selectedTutor?.id}. Si tiene estudiantes vinculados en la base de datos, el backend devolverá 409 Conflict.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
