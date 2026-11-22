import { apiClient, isMockModeActive } from "./api";
import { Estudiante, EstudianteCreateDTO, EstudianteEstadoDTO } from "@/types/api";
import { INITIAL_ESTUDIANTES, INITIAL_TUTORES } from "./mockData";

let mockEstudiantes = [...INITIAL_ESTUDIANTES];

export const estudiantesService = {
  /**
   * GET /estudiantes
   */
  async getAll(): Promise<Estudiante[]> {
    if (isMockModeActive()) {
      return [...mockEstudiantes];
    }
    const res = await apiClient<any>("/estudiantes", { method: "GET" });
    return Array.isArray(res) ? res : res.content || [];
  },

  /**
   * GET /estudiantes/{id}
   */
  async getById(id: number): Promise<Estudiante> {
    if (isMockModeActive()) {
      const found = mockEstudiantes.find((e) => e.id === id);
      if (!found) throw new Error("Estudiante no encontrado");
      return found;
    }
    return apiClient<Estudiante>(`/estudiantes/${id}`, { method: "GET" });
  },

  /**
   * POST /estudiantes
   * { "codigoUnico": "EST-2026-0001", "nombre": "José", "apellido": "Mendoza", ... "tutorId": 1 }
   */
  async create(data: EstudianteCreateDTO): Promise<Estudiante> {
    if (isMockModeActive()) {
      if (mockEstudiantes.some((e) => e.codigoUnico.trim() === data.codigoUnico.trim())) {
        throw new Error("Ya existe un estudiante con el código único indicado.");
      }
      const newId = Math.max(0, ...mockEstudiantes.map((e) => e.id)) + 1;
      const tutor = INITIAL_TUTORES.find((t) => t.id === Number(data.tutorId));
      const nuevo: Estudiante = {
        id: newId,
        codigoUnico: data.codigoUnico,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.fechaNacimiento,
        sexo: data.sexo,
        direccion: data.direccion,
        estado: data.estado || "ACTIVO",
        tutorId: Number(data.tutorId),
        tutorNombre: tutor ? `${tutor.nombre} ${tutor.apellido}` : undefined,
      };
      mockEstudiantes.push(nuevo);
      return nuevo;
    }
    return apiClient<Estudiante>("/estudiantes", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        tutorId: Number(data.tutorId),
      }),
    });
  },

  /**
   * PUT /estudiantes/{id}
   */
  async update(id: number, data: Partial<EstudianteCreateDTO>): Promise<Estudiante> {
    if (isMockModeActive()) {
      const idx = mockEstudiantes.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Estudiante no encontrado");
      const updated = {
        ...mockEstudiantes[idx],
        ...data,
      };
      if (data.tutorId) {
        const tutor = INITIAL_TUTORES.find((t) => t.id === Number(data.tutorId));
        if (tutor) updated.tutorNombre = `${tutor.nombre} ${tutor.apellido}`;
      }
      mockEstudiantes[idx] = updated;
      return updated;
    }
    return apiClient<Estudiante>(`/estudiantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /estudiantes/{id}/estado
   * { "estado": "ACTIVO" }
   */
  async updateEstado(id: number, data: EstudianteEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const est = mockEstudiantes.find((e) => e.id === id);
      if (est) {
        est.estado = data.estado;
      }
      return;
    }
    return apiClient<void>(`/estudiantes/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /estudiantes/{id}
   */
  async delete(id: number): Promise<void> {
    if (isMockModeActive()) {
      mockEstudiantes = mockEstudiantes.filter((e) => e.id !== id);
      return;
    }
    return apiClient<void>(`/estudiantes/${id}`, { method: "DELETE" });
  },
};
