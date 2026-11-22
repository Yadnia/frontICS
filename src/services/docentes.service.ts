import { apiClient, isMockModeActive } from "./api";
import { Docente, DocenteCreateDTO, DocenteEstadoDTO } from "@/types/api";
import { INITIAL_DOCENTES } from "./mockData";

let mockDocentes = [...INITIAL_DOCENTES];

export const docentesService = {
  /**
   * GET /docentes
   */
  async getAll(): Promise<Docente[]> {
    if (isMockModeActive()) {
      return [...mockDocentes];
    }
    const res = await apiClient<any>("/docentes", { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /docentes/{id}
   */
  async getById(id: number): Promise<Docente> {
    if (isMockModeActive()) {
      const found = mockDocentes.find((d) => d.id === id);
      if (!found) throw new Error("Docente no encontrado");
      return found;
    }
    return apiClient<Docente>(`/docentes/${id}`, { method: "GET" });
  },

  /**
   * POST /docentes
   * { "nombre": "María", "apellido": "López", "cedula": "001-120585-2000B", "telefono": "87776655", ... }
   */
  async create(data: DocenteCreateDTO): Promise<Docente> {
    if (isMockModeActive()) {
      if (mockDocentes.some((d) => d.cedula.trim() === data.cedula.trim())) {
        throw new Error("Ya existe un docente con este número de cédula.");
      }
      const newId = Math.max(0, ...mockDocentes.map((d) => d.id)) + 1;
      const nuevo: Docente = {
        id: newId,
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula,
        telefono: data.telefono,
        direccion: data.direccion,
        correo: data.correo,
        usuarioId: data.usuarioId !== undefined ? data.usuarioId : null,
        estado: data.estado !== undefined ? data.estado : true,
      };
      mockDocentes.push(nuevo);
      return nuevo;
    }
    return apiClient<Docente>("/docentes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /docentes/{id}
   */
  async update(id: number, data: Partial<DocenteCreateDTO>): Promise<Docente> {
    if (isMockModeActive()) {
      const idx = mockDocentes.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error("Docente no encontrado");
      mockDocentes[idx] = {
        ...mockDocentes[idx],
        ...data,
      };
      return mockDocentes[idx];
    }
    return apiClient<Docente>(`/docentes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /docentes/{id}/estado
   * { "estado": false }
   */
  async updateEstado(id: number, data: DocenteEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const d = mockDocentes.find((doc) => doc.id === id);
      if (d) {
        d.estado = data.estado;
      }
      return;
    }
    return apiClient<void>(`/docentes/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /docentes/{id}
   */
  async delete(id: number): Promise<void> {
    if (isMockModeActive()) {
      mockDocentes = mockDocentes.filter((d) => d.id !== id);
      return;
    }
    return apiClient<void>(`/docentes/${id}`, { method: "DELETE" });
  },
};
