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
   * GET /usuarios
   */
  async getAll(): Promise<Usuario[]> {
    if (isMockModeActive()) {
      return [...mockUsuarios];
    }
    const res = await apiClient<any>("/usuarios", { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /usuarios/{id}
   */
  async getById(id: number): Promise<Usuario> {
    if (isMockModeActive()) {
      const found = mockUsuarios.find((u) => u.id === id);
      if (!found) throw new Error("Usuario no encontrado");
      return found;
    }
    return apiClient<Usuario>(`/usuarios/${id}`, { method: "GET" });
  },

  /**
   * POST /usuarios
   * { "username": "mlopez", "correo": "mlopez@...", "password": "...", "nombre": "...", "apellido": "...", "estado": true, "roles": ["DOCENTE"] }
   */
  async create(data: UsuarioCreateDTO): Promise<Usuario> {
    if (isMockModeActive()) {
      if (mockUsuarios.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
        throw new Error("El nombre de usuario ya está registrado.");
      }
      if (mockUsuarios.some((u) => u.correo.toLowerCase() === data.correo.toLowerCase())) {
        throw new Error("El correo electrónico ya está registrado.");
      }

      const newId = Math.max(0, ...mockUsuarios.map((u) => u.id)) + 1;
      const nuevo: Usuario = {
        id: newId,
        username: data.username,
        correo: data.correo,
        nombre: data.nombre,
        apellido: data.apellido,
        estado: data.estado !== undefined ? data.estado : true,
        roles: data.roles || ["DOCENTE"],
        fechaCreacion: new Date().toISOString().split("T")[0],
      };
      mockUsuarios.push(nuevo);
      return nuevo;
    }

    return apiClient<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /usuarios/{id}
   */
  async update(id: number, data: UsuarioUpdateDTO): Promise<Usuario> {
    if (isMockModeActive()) {
      const idx = mockUsuarios.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error("Usuario no encontrado");
      mockUsuarios[idx] = {
        ...mockUsuarios[idx],
        ...data,
      };
      return mockUsuarios[idx];
    }
    return apiClient<Usuario>(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /usuarios/{id}/estado
   * { "estado": false }
   */
  async updateEstado(id: number, data: UsuarioEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const user = mockUsuarios.find((u) => u.id === id);
      if (user) {
        user.estado = data.estado;
      }
      return;
    }
    return apiClient<void>(`/usuarios/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /usuarios/{id}/roles
   * { "roles": ["DOCENTE"] }
   */
  async updateRoles(id: number, data: UsuarioRolesDTO): Promise<void> {
    if (isMockModeActive()) {
      const user = mockUsuarios.find((u) => u.id === id);
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
   * DELETE /usuarios/{id}
   */
  async delete(id: number): Promise<void> {
    if (isMockModeActive()) {
      mockUsuarios = mockUsuarios.filter((u) => u.id !== id);
      return;
    }
    return apiClient<void>(`/usuarios/${id}`, { method: "DELETE" });
  },
};
