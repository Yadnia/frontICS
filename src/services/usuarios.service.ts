import { apiClient, isMockModeActive } from "./api";
import {
  Usuario,
  UsuarioCreateDTO,
  UsuarioUpdateDTO,
  UsuarioEstadoDTO,
  UsuarioRolesDTO,
} from "@/types/api";
import { INITIAL_USUARIOS } from "./mockData";

let mockUsuarios = [...INITIAL_USUARIOS];

export const usuariosService = {
  /**
   * GET /api/usuarios
   * Retorna lista de usuarios (admite paginación Spring Data)
   */
  async getAll(params?: { page?: number; size?: number }): Promise<Usuario[]> {
    if (isMockModeActive()) {
      return [...mockUsuarios];
    }
    const query = params ? `?page=${params.page ?? 0}&size=${params.size ?? 100}` : "?size=100";
    const res = await apiClient<any>(`/usuarios${query}`, { method: "GET" });
    const rawList = Array.isArray(res) ? res : res.content || [];
    return rawList.map((u: any) => ({
      ...u,
      nombres: u.nombres || u.nombre || "",
      apellidos: u.apellidos || u.apellido || "",
      nombre: u.nombres || u.nombre || "",
      apellido: u.apellidos || u.apellido || "",
      activo: u.activo !== undefined ? u.activo : (u.estado !== undefined ? u.estado : true),
      estado: u.activo !== undefined ? u.activo : (u.estado !== undefined ? u.estado : true),
      roles: Array.isArray(u.roles)
        ? u.roles.map((r: any) => (typeof r === "object" ? r.nombre || r.authority || r.name : r))
        : [],
    }));
  },

  /**
   * GET /api/usuarios/{id} (UUID)
   */
  async getById(id: string): Promise<Usuario> {
    if (isMockModeActive()) {
      const found = mockUsuarios.find((u) => String(u.id) === String(id));
      if (!found) throw new Error("Usuario no encontrado");
      return found;
    }
    const u = await apiClient<any>(`/usuarios/${id}`, { method: "GET" });
    return {
      ...u,
      nombres: u.nombres || u.nombre || "",
      apellidos: u.apellidos || u.apellido || "",
      nombre: u.nombres || u.nombre || "",
      apellido: u.apellidos || u.apellido || "",
      activo: u.activo !== undefined ? u.activo : (u.estado !== undefined ? u.estado : true),
      estado: u.activo !== undefined ? u.activo : (u.estado !== undefined ? u.estado : true),
      roles: Array.isArray(u.roles)
        ? u.roles.map((r: any) => (typeof r === "object" ? r.nombre || r.authority || r.name : r))
        : [],
    };
  },

  /**
   * POST /api/usuarios
   * { "username": "...", "correo": "...", "nombres": "...", "apellidos": "...", "password": "...", "roles": ["UUID"] }
   */
  async create(data: UsuarioCreateDTO): Promise<Usuario> {
    const payload = {
      username: data.username,
      correo: data.correo,
      nombres: data.nombres || data.nombre || "",
      nombre: data.nombre || data.nombres || "",
      apellidos: data.apellidos || data.apellido || "",
      apellido: data.apellido || data.apellidos || "",
      password: data.password || "Temporal#2026",
      roles: data.roles || [], // Array de UUIDs de roles
      activo: data.activo !== undefined ? data.activo : (data.estado !== undefined ? data.estado : true),
      estado: data.estado !== undefined ? data.estado : true,
    };

    if (isMockModeActive()) {
      if (mockUsuarios.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
        throw new Error("El nombre de usuario ya está registrado.");
      }
      if (mockUsuarios.some((u) => u.correo.toLowerCase() === data.correo.toLowerCase())) {
        throw new Error("El correo electrónico ya está registrado.");
      }

      const newId = `usr-${Date.now()}`;
      const nuevo: Usuario = {
        id: newId,
        username: data.username,
        correo: data.correo,
        nombre: payload.nombre,
        apellido: payload.apellido,
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        estado: payload.estado,
        activo: payload.activo,
        roles: data.roles || ["DOCENTE"],
        fechaCreacion: new Date().toISOString().split("T")[0],
      };
      mockUsuarios.push(nuevo);
      return nuevo;
    }

    return apiClient<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/usuarios/{id} (UUID)
   */
  async update(id: string, data: UsuarioUpdateDTO): Promise<Usuario> {
    const payload = {
      ...data,
      nombres: data.nombres || data.nombre,
      nombre: data.nombre || data.nombres,
      apellidos: data.apellidos || data.apellido,
      apellido: data.apellido || data.apellidos,
    };

    if (isMockModeActive()) {
      const idx = mockUsuarios.findIndex((e) => String(e.id) === String(id));
      if (idx === -1) throw new Error("Usuario no encontrado");
      mockUsuarios[idx] = {
        ...mockUsuarios[idx],
        ...payload,
        nombre: payload.nombre || mockUsuarios[idx].nombre,
        apellido: payload.apellido || mockUsuarios[idx].apellido,
        nombres: payload.nombres || mockUsuarios[idx].nombres,
        apellidos: payload.apellidos || mockUsuarios[idx].apellidos,
      };
      return mockUsuarios[idx];
    }
    return apiClient<Usuario>(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /api/usuarios/{id}/estado (o PUT /api/usuarios/{id})
   */
  async updateEstado(id: string, data: UsuarioEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const user = mockUsuarios.find((u) => String(u.id) === String(id));
      if (user) {
        user.estado = data.estado;
      }
      return;
    }
    try {
      await apiClient<void>(`/usuarios/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback a PUT si el backend no expuso PATCH específico
      await apiClient<void>(`/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }
  },

  /**
   * PUT /api/usuarios/{id}/roles
   */
  async updateRoles(id: string, data: UsuarioRolesDTO): Promise<void> {
    if (isMockModeActive()) {
      const user = mockUsuarios.find((u) => String(u.id) === String(id));
      if (user) {
        user.roles = data.roles;
      }
      return;
    }
    return apiClient<void>(`/usuarios/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/usuarios/{id} (UUID)
   */
  async delete(id: string): Promise<void> {
    if (isMockModeActive()) {
      mockUsuarios = mockUsuarios.filter((u) => String(u.id) !== String(id));
      return;
    }
    return apiClient<void>(`/usuarios/${id}`, { method: "DELETE" });
  },
};
