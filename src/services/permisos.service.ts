import { apiClient, isMockModeActive } from "./api";
import { Permiso } from "@/types/api";

export const permisosService = {
  /**
   * GET /api/permisos (solo ADMIN)
   */
  async getAll(): Promise<Permiso[]> {
    if (isMockModeActive()) {
      return [
        { id: "p1-00000000-0001", nombre: "USUARIOS_READ", descripcion: "Consultar lista y detalle de usuarios", modulo: "USUARIOS" },
        { id: "p1-00000000-0002", nombre: "USUARIOS_CREATE", descripcion: "Crear nuevos usuarios en el sistema", modulo: "USUARIOS" },
        { id: "p1-00000000-0003", nombre: "USUARIOS_UPDATE", descripcion: "Actualizar datos y roles de usuarios", modulo: "USUARIOS" },
        { id: "p1-00000000-0004", nombre: "ROLES_ADMIN", descripcion: "Crear y editar roles RBAC", modulo: "ROLES" },
        { id: "p1-00000000-0005", nombre: "TUTORES_ADMIN", descripcion: "Administración integral de tutores", modulo: "TUTORES" },
        { id: "p1-00000000-0006", nombre: "DOCENTES_ADMIN", descripcion: "Administración de planta docente", modulo: "DOCENTES" },
        { id: "p1-00000000-0007", nombre: "ESTUDIANTES_ADMIN", descripcion: "Matrícula y expediente de estudiantes", modulo: "ESTUDIANTES" },
      ];
    }
    const res = await apiClient<any>("/permisos", { method: "GET" });
    const raw = Array.isArray(res) ? res : res.content || [];
    return raw.map((p: any) => ({
      ...p,
      codigo: p.codigo || p.nombre || "",
      nombre: p.codigo || p.nombre || "",
      descripcion: p.descripcion || `Permiso del sistema: ${p.codigo || p.nombre}`,
    }));
  },
};
