import { apiClient, isMockModeActive } from "./api";
import { Tutor, TutorCreateDTO } from "@/types/api";
import { INITIAL_TUTORES } from "./mockData";

let mockTutores = [...INITIAL_TUTORES];

export const tutoresService = {
  /**
   * GET /tutores
   */
  async getAll(): Promise<Tutor[]> {
    if (isMockModeActive()) {
      return [...mockTutores];
    }
    const res = await apiClient<any>("/tutores", { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /tutores/{id}
   */
  async getById(id: number): Promise<Tutor> {
    if (isMockModeActive()) {
      const found = mockTutores.find((t) => t.id === id);
      if (!found) throw new Error("Tutor no encontrado");
      return found;
    }
    return apiClient<Tutor>(`/tutores/${id}`, { method: "GET" });
  },

  /**
   * POST /tutores
   * { "nombre": "Carlos", "apellido": "Mendoza", "cedula": "001-150390-1000A", ... }
   */
  async create(data: TutorCreateDTO): Promise<Tutor> {
    if (isMockModeActive()) {
      if (mockTutores.some((t) => t.cedula.trim() === data.cedula.trim())) {
        throw new Error("Ya existe un tutor registrado con este número de cédula.");
      }
      const newId = Math.max(0, ...mockTutores.map((t) => t.id)) + 1;
      const nuevo: Tutor = {
        id: newId,
        ...data,
        estudiantesCount: 0,
      };
      mockTutores.push(nuevo);
      return nuevo;
    }
    return apiClient<Tutor>("/tutores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /tutores/{id}
   */
  async update(id: number, data: Partial<TutorCreateDTO>): Promise<Tutor> {
    if (isMockModeActive()) {
      const idx = mockTutores.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Tutor no encontrado");
      mockTutores[idx] = {
        ...mockTutores[idx],
        ...data,
      };
      return mockTutores[idx];
    }
    return apiClient<Tutor>(`/tutores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /tutores/{id}
   */
  async delete(id: number): Promise<void> {
    if (isMockModeActive()) {
      mockTutores = mockTutores.filter((t) => t.id !== id);
      return;
    }
    return apiClient<void>(`/tutores/${id}`, { method: "DELETE" });
  },
};
