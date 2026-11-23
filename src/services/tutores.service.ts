import { apiClient, isMockModeActive } from "./api";
import { Tutor, TutorCreateDTO, TutorRegistroDTO, Estudiante } from "@/types/api";
import { INITIAL_TUTORES, INITIAL_ESTUDIANTES } from "./mockData";

let mockTutores = [...INITIAL_TUTORES];

export const tutoresService = {
  /**
   * GET /api/tutores
   * Retorna lista de tutores (admite paginación de Spring Data)
   */
  async getAll(params?: { page?: number; size?: number }): Promise<Tutor[]> {
    if (isMockModeActive()) {
      return [...mockTutores];
    }
    const query = params ? `?page=${params.page ?? 0}&size=${params.size ?? 100}` : "?size=100";
    const res = await apiClient<any>(`/tutores${query}`, { method: "GET" });
    const rawList = Array.isArray(res) ? res : res.content || [];
    return rawList.map((t: any) => ({
      ...t,
      nombres: t.usuario?.nombres || t.nombres || t.nombre || "",
      apellidos: t.usuario?.apellidos || t.apellidos || t.apellido || "",
      nombre: t.usuario?.nombres || t.nombre || t.nombres || "",
      apellido: t.usuario?.apellidos || t.apellido || t.apellidos || "",
      correo: t.usuario?.correo || t.correo || "",
      usuarioId: t.usuario?.id || t.usuarioId || null,
      telefono: t.telefono || "",
      direccion: t.direccion || "",
      ocupacion: t.ocupacion || "",
    }));
  },

  /**
   * GET /api/tutores/{id} (UUID)
   */
  async getById(id: string): Promise<Tutor> {
    if (isMockModeActive()) {
      const found = mockTutores.find((t) => String(t.id) === String(id));
      if (!found) throw new Error("Tutor no encontrado");
      return found;
    }
    const t = await apiClient<any>(`/tutores/${id}`, { method: "GET" });
    return {
      ...t,
      nombres: t.usuario?.nombres || t.nombres || t.nombre || "",
      apellidos: t.usuario?.apellidos || t.apellidos || t.apellido || "",
      nombre: t.usuario?.nombres || t.nombre || t.nombres || "",
      apellido: t.usuario?.apellidos || t.apellido || t.apellidos || "",
      correo: t.usuario?.correo || t.correo || "",
      usuarioId: t.usuario?.id || t.usuarioId || null,
      telefono: t.telefono || "",
      direccion: t.direccion || "",
      ocupacion: t.ocupacion || "",
    };
  },

  /**
   * GET /api/tutores/me (solo TUTOR)
   * Devuelve el perfil del tutor autenticado
   */
  async getMe(): Promise<Tutor> {
    if (isMockModeActive()) {
      return mockTutores[0];
    }
    const t = await apiClient<any>("/tutores/me", { method: "GET" });
    return {
      ...t,
      nombres: t.usuario?.nombres || t.nombres || t.nombre || "",
      apellidos: t.usuario?.apellidos || t.apellidos || t.apellido || "",
      nombre: t.usuario?.nombres || t.nombre || t.nombres || "",
      apellido: t.usuario?.apellidos || t.apellido || t.apellidos || "",
      correo: t.usuario?.correo || t.correo || "",
      usuarioId: t.usuario?.id || t.usuarioId || null,
      telefono: t.telefono || "",
      direccion: t.direccion || "",
      ocupacion: t.ocupacion || "",
    };
  },

  /**
   * GET /api/tutores/me/estudiantes (solo TUTOR)
   * Devuelve los estudiantes a cargo del tutor autenticado
   */
  async getMeEstudiantes(): Promise<Estudiante[]> {
    if (isMockModeActive()) {
      const tutor = mockTutores[0];
      return INITIAL_ESTUDIANTES.filter((e) => String(e.tutorId) === String(tutor.id));
    }
    const res = await apiClient<any>("/tutores/me/estudiantes", { method: "GET" });
    const raw = Array.isArray(res) ? res : res.content || [];
    return raw.map((st: any) => ({
      ...st,
      codigo: st.codigo || st.codigoUnico || "",
      codigoUnico: st.codigo || st.codigoUnico || "",
      nombres: st.nombres || st.nombre || "",
      apellidos: st.apellidos || st.apellido || "",
      nombre: st.nombres || st.nombre || "",
      apellido: st.apellidos || st.apellido || "",
      fechaNacimiento: st.fechaNacimiento || "2010-01-01",
      direccion: st.direccion || "",
      activo: st.activo !== undefined ? st.activo : st.estado !== "INACTIVO",
      estado: st.estado || (st.activo === false ? "INACTIVO" : "ACTIVO"),
      tutorId: st.tutor?.id || st.tutorId || "",
    }));
  },

  /**
   * POST /api/auth/registro-tutor
   * Auto-registro público de tutores
   */
  async registroTutor(data: TutorRegistroDTO): Promise<any> {
    if (isMockModeActive()) {
      const newId = `tut-${Date.now()}`;
      const nuevo: Tutor = {
        id: newId,
        nombre: data.nombres,
        apellido: data.apellidos,
        nombres: data.nombres,
        apellidos: data.apellidos,
        cedula: data.cedula || "",
        telefono: data.telefono,
        direccion: data.direccion,
        ocupacion: data.ocupacion,
        correo: data.correo,
        estudiantesCount: 0,
      };
      mockTutores.push(nuevo);
      return { message: "Tutor registrado exitosamente", tutor: nuevo };
    }
    return apiClient<any>("/auth/registro-tutor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /api/tutores
   * Envía nombres, apellidos, teléfono, dirección, ocupacion, usuarioId
   */
  async create(data: TutorCreateDTO): Promise<Tutor> {
    const payload = {
      ...data,
      usuarioId: data.usuarioId ? String(data.usuarioId) : null,
      usuario: data.usuarioId ? { id: String(data.usuarioId) } : undefined,
      telefono: data.telefono,
      direccion: data.direccion || "",
      ocupacion: data.ocupacion || "",
      nombres: data.nombres || data.nombre,
      apellidos: data.apellidos || data.apellido,
    };

    if (isMockModeActive()) {
      if (data.cedula && mockTutores.some((t) => t.cedula && t.cedula.trim() === data.cedula?.trim())) {
        throw new Error("Ya existe un tutor registrado con este número de cédula.");
      }
      const newId = `tut-${Date.now()}`;
      const nuevo: Tutor = {
        id: newId,
        nombre: payload.nombre || "Tutor",
        apellido: payload.apellido || "General",
        cedula: data.cedula,
        telefono: data.telefono,
        direccion: data.direccion,
        ocupacion: data.ocupacion,
        correo: data.correo,
        estudiantesCount: 0,
      };
      mockTutores.push(nuevo);
      return nuevo;
    }

    return apiClient<Tutor>("/tutores", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/tutores/{id} (UUID)
   */
  async update(id: string, data: Partial<TutorCreateDTO>): Promise<Tutor> {
    const payload = {
      ...data,
      nombres: data.nombres || data.nombre,
      nombre: data.nombre || data.nombres,
      apellidos: data.apellidos || data.apellido,
      apellido: data.apellido || data.apellidos,
    };

    if (isMockModeActive()) {
      const idx = mockTutores.findIndex((t) => String(t.id) === String(id));
      if (idx === -1) throw new Error("Tutor no encontrado");
      mockTutores[idx] = {
        ...mockTutores[idx],
        ...payload,
        nombre: payload.nombre || mockTutores[idx].nombre,
        apellido: payload.apellido || mockTutores[idx].apellido,
      };
      return mockTutores[idx];
    }
    return apiClient<Tutor>(`/tutores/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * DELETE /api/tutores/{id} (UUID)
   */
  async delete(id: string): Promise<void> {
    if (isMockModeActive()) {
      mockTutores = mockTutores.filter((t) => String(t.id) !== String(id));
      return;
    }
    return apiClient<void>(`/tutores/${id}`, { method: "DELETE" });
  },
};
