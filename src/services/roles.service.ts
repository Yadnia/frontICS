import { apiClient, isMockModeActive } from "./api";
import { Role, RoleCreateDTO } from "@/types/api";
import { INITIAL_ROLES } from "./mockData";

let mockRoles = [...INITIAL_ROLES];

export const rolesService = {
  /**
   * GET /roles
   */
  async getAll(): Promise<Role[]> {
    if (isMockModeActive()) {
      return [...mockRoles];
    }
    const res = await apiClient<any>("/roles", { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /roles/{id}
   */
  async getById(id: number): Promise<Role> {
    if (isMockModeActive()) {
      const found = mockRoles.find((r) => r.id === id);
      if (!found) throw new Error("Rol no encontrado");
      return found;
    }
    return apiClient<Role>(`/roles/${id}`, { method: "GET" });
  },

  /**
   * POST /roles
   * { "nombre": "DOCENTE", "descripcion": "..." }
   */
  async create(data: RoleCreateDTO): Promise<Role> {
    if (isMockModeActive()) {
      const newRole: Role = {
        id: Math.max(0, ...mockRoles.map((r) => r.id)) + 1,
        nombre: data.nombre.toUpperCase(),
        descripcion: data.descripcion,
      };
      mockRoles.push(newRole);
      return newRole;
    }
    return apiClient<Role>("/roles", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        nombre: data.nombre.toUpperCase(),
      }),
    });
  },

  /**
   * PUT /roles/{id}
   */
  async update(id: number, data: Partial<RoleCreateDTO>): Promise<Role> {
    if (isMockModeActive()) {
      const idx = mockRoles.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Rol no encontrado");
      mockRoles[idx] = {
        ...mockRoles[idx],
        ...data,
        nombre: (data.nombre || mockRoles[idx].nombre).toUpperCase(),
      };
      return mockRoles[idx];
    }
    return apiClient<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /roles/{id}
   */
  async delete(id: number): Promise<void> {
    if (isMockModeActive()) {
      mockRoles = mockRoles.filter((r) => r.id !== id);
      return;
    }
    return apiClient<void>(`/roles/${id}`, { method: "DELETE" });
  },
};
