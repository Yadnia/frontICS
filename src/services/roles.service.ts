import { apiClient, isMockModeActive } from "./api";
import { Role, RoleCreateDTO } from "@/types/api";
import { INITIAL_ROLES } from "./mockData";

let mockRoles = [...INITIAL_ROLES];

export const rolesService = {
  /**
   * GET /api/roles
   * Retorna lista de roles (admite paginación Spring Data)
   */
  async getAll(params?: { page?: number; size?: number }): Promise<Role[]> {
    if (isMockModeActive()) {
      return [...mockRoles];
    }
    const query = params ? `?page=${params.page ?? 0}&size=${params.size ?? 100}` : "?size=100";
    const res = await apiClient<any>(`/roles${query}`, { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /api/roles/{id} (UUID)
   */
  async getById(id: string): Promise<Role> {
    if (isMockModeActive()) {
      const found = mockRoles.find((r) => String(r.id) === String(id));
      if (!found) throw new Error("Rol no encontrado");
      return found;
    }
    return apiClient<Role>(`/roles/${id}`, { method: "GET" });
  },

  /**
   * POST /api/roles
   * { "nombre": "DOCENTE", "descripcion": "..." }
   */
  async create(data: RoleCreateDTO): Promise<Role> {
    if (isMockModeActive()) {
      const newRole: Role = {
        id: `rol-${Date.now()}`,
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
   * PUT /api/roles/{id} (UUID)
   */
  async update(id: string, data: Partial<RoleCreateDTO>): Promise<Role> {
    if (isMockModeActive()) {
      const idx = mockRoles.findIndex((r) => String(r.id) === String(id));
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
   * DELETE /api/roles/{id} (UUID)
   */
  async delete(id: string): Promise<void> {
    if (isMockModeActive()) {
      mockRoles = mockRoles.filter((r) => String(r.id) !== String(id));
      return;
    }
    return apiClient<void>(`/roles/${id}`, { method: "DELETE" });
  },
};
