import { apiClient, isMockModeActive } from "./api";
import { Docente, DocenteCreateDTO, DocenteEstadoDTO } from "@/types/api";
import { INITIAL_DOCENTES } from "./mockData";

let mockDocentes = [...INITIAL_DOCENTES];

export const docentesService = {
  /**
   * GET /api/docentes
   * Retorna lista de docentes (admite paginación Spring Data)
   */
  async getAll(params?: { page?: number; size?: number }): Promise<Docente[]> {
    if (isMockModeActive()) {
      return [...mockDocentes];
    }
    const query = params ? `?page=${params.page ?? 0}&size=${params.size ?? 100}` : "?size=100";
    const res = await apiClient<any>(`/docentes${query}`, { method: "GET" });
    const rawList = Array.isArray(res) ? res : res.content || [];
    return rawList.map((d: any) => ({
      ...d,
      nombres: d.usuario?.nombres || d.nombres || d.nombre || "",
      apellidos: d.usuario?.apellidos || d.apellidos || d.apellido || "",
      nombre: d.usuario?.nombres || d.nombre || d.nombres || "",
      apellido: d.usuario?.apellidos || d.apellido || d.apellidos || "",
      correo: d.usuario?.correo || d.correo || "",
      cedula: d.cedula || "",
      telefono: d.telefono || "",
      direccion: d.direccion || "",
      usuarioId: d.usuario?.id || d.usuarioId || null,
      activo: d.usuario?.activo !== undefined ? d.usuario.activo : (d.estado !== undefined ? d.estado : true),
      estado: d.usuario?.activo !== undefined ? d.usuario.activo : (d.estado !== undefined ? d.estado : true),
    }));
  },

  /**
   * GET /api/docentes/{id} (UUID)
   */
  async getById(id: string): Promise<Docente> {
    if (isMockModeActive()) {
      const found = mockDocentes.find((d) => String(d.id) === String(id));
      if (!found) throw new Error("Docente no encontrado");
      return found;
    }
    const d = await apiClient<any>(`/docentes/${id}`, { method: "GET" });
    return {
      ...d,
      nombres: d.usuario?.nombres || d.nombres || d.nombre || "",
      apellidos: d.usuario?.apellidos || d.apellidos || d.apellido || "",
      nombre: d.usuario?.nombres || d.nombre || d.nombres || "",
      apellido: d.usuario?.apellidos || d.apellido || d.apellidos || "",
      correo: d.usuario?.correo || d.correo || "",
      cedula: d.cedula || "",
      telefono: d.telefono || "",
      direccion: d.direccion || "",
      usuarioId: d.usuario?.id || d.usuarioId || null,
      activo: d.usuario?.activo !== undefined ? d.usuario.activo : (d.estado !== undefined ? d.estado : true),
      estado: d.usuario?.activo !== undefined ? d.usuario.activo : (d.estado !== undefined ? d.estado : true),
    };
  },

  /**
   * POST /api/docentes
   */
  async create(data: DocenteCreateDTO): Promise<Docente> {
    const payload = {
      ...data,
      usuarioId: data.usuarioId ? String(data.usuarioId) : null,
      usuario: data.usuarioId ? { id: String(data.usuarioId) } : undefined,
      cedula: data.cedula,
      telefono: data.telefono,
      direccion: data.direccion || "",
      nombres: data.nombres || data.nombre,
      apellidos: data.apellidos || data.apellido,
    };

    if (isMockModeActive()) {
      if (mockDocentes.some((d) => d.cedula.trim() === data.cedula.trim())) {
        throw new Error("Ya existe un docente con este número de cédula.");
      }
      const newId = `doc-${Date.now()}`;
      const nuevo: Docente = {
        id: newId,
        nombre: payload.nombre || "Docente",
        apellido: payload.apellido || "General",
        cedula: data.cedula,
        telefono: data.telefono,
        direccion: data.direccion,
        correo: data.correo,
        usuarioId: payload.usuarioId,
        estado: data.estado !== undefined ? data.estado : true,
        especialidad: data.especialidad,
        materias: data.materias,
        gradosAsignados: data.gradosAsignados,
        turno: data.turno,
      };
      mockDocentes.push(nuevo);
      return nuevo;
    }

    return apiClient<Docente>("/docentes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/docentes/{id} (UUID)
   */
  async update(id: string, data: Partial<DocenteCreateDTO>): Promise<Docente> {
    const payload = {
      ...data,
      nombres: data.nombres || data.nombre,
      nombre: data.nombre || data.nombres,
      apellidos: data.apellidos || data.apellido,
      apellido: data.apellido || data.apellidos,
      usuarioId: data.usuarioId !== undefined ? (data.usuarioId ? String(data.usuarioId) : null) : undefined,
    };

    if (isMockModeActive()) {
      const idx = mockDocentes.findIndex((d) => String(d.id) === String(id));
      if (idx === -1) throw new Error("Docente no encontrado");
      mockDocentes[idx] = {
        ...mockDocentes[idx],
        ...payload,
        nombre: payload.nombre || mockDocentes[idx].nombre,
        apellido: payload.apellido || mockDocentes[idx].apellido,
      };
      return mockDocentes[idx];
    }
    return apiClient<Docente>(`/docentes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /api/docentes/{id}/estado (o PUT /api/docentes/{id})
   */
  async updateEstado(id: string, data: DocenteEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const d = mockDocentes.find((doc) => String(doc.id) === String(id));
      if (d) {
        d.estado = data.estado;
      }
      return;
    }
    try {
      await apiClient<void>(`/docentes/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch {
      await apiClient<void>(`/docentes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }
  },

  /**
   * DELETE /api/docentes/{id} (UUID)
   */
  async delete(id: string): Promise<void> {
    if (isMockModeActive()) {
      mockDocentes = mockDocentes.filter((d) => String(d.id) !== String(id));
      return;
    }
    return apiClient<void>(`/docentes/${id}`, { method: "DELETE" });
  },
};
