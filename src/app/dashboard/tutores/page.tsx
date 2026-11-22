"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { tutoresService } from "@/services/tutores.service";
import { Tutor, TutorCreateDTO } from "@/types/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
} from "lucide-react";

export default function TutoresPage() {
  const { canAccess } = useAuth();
  const { success, error } = useToast();

  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TutorCreateDTO>({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    direccion: "",
    ocupacion: "",
    correo: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await tutoresService.getAll();
      setTutores(data);
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
      return (
        t.nombre.toLowerCase().includes(term) ||
        t.apellido.toLowerCase().includes(term) ||
        t.cedula.toLowerCase().includes(term) ||
        (t.correo && t.correo.toLowerCase().includes(term)) ||
        t.telefono.includes(term)
      );
    });
  }, [tutores, searchTerm]);

  const handleOpenCreate = () => {
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "001-150390-1000A",
      telefono: "88881234",
      direccion: "Barrio Central, Matagalpa",
      ocupacion: "Comerciante",
      correo: "carlos.mendoza@example.com",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      cedula: tutor.cedula,
      telefono: tutor.telefono,
      direccion: tutor.direccion || "",
      ocupacion: tutor.ocupacion || "",
      correo: tutor.correo || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
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
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
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
                      <p className="font-semibold text-slate-900">
                        {tut.nombre} {tut.apellido}
                      </p>
                      <p className="text-[11px] text-slate-400">ID #{tut.id}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-medium text-slate-700">
                      {tut.cedula}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tut.telefono}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {tut.correo ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
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
                          onClick={() => handleOpenEdit(tut)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
        description="Propuesta de contrato: POST /tutores"
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
                placeholder="Carlos"
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
                placeholder="Mendoza"
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
                placeholder="001-150390-1000A"
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
                placeholder="88881234"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="carlos.mendoza@example.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupación</label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                placeholder="Comerciante"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        description="Actualizar información del tutor (PUT /tutores/{id})"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupación</label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
        title="Eliminar Tutor"
        message={`¿Estás seguro de que deseas eliminar a "${selectedTutor?.nombre} ${selectedTutor?.apellido}"? Se ejecutará DELETE /tutores/${selectedTutor?.id}. Si tiene estudiantes vinculados en la base de datos, el backend devolverá 409 Conflict.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
