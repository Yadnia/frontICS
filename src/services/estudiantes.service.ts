import { apiClient, isMockModeActive } from "./api";
import { Estudiante, EstudianteCreateDTO, EstudianteEstadoDTO } from "@/types/api";
import { INITIAL_ESTUDIANTES, INITIAL_TUTORES } from "./mockData";

let mockEstudiantes = [...INITIAL_ESTUDIANTES];

export const estudiantesService = {
  /**
   * GET /api/estudiantes
   * Retorna lista de estudiantes (admite paginación Spring Data)
   */
  async getAll(params?: { page?: number; size?: number }): Promise<Estudiante[]> {
    if (isMockModeActive()) {
      return [...mockEstudiantes];
    }
    const query = params ? `?page=${params.page ?? 0}&size=${params.size ?? 100}` : "?size=100";
    const res = await apiClient<any>(`/estudiantes${query}`, { method: "GET" });
    const rawList = Array.isArray(res) ? res : res.content || [];
    return rawList.map((st: any) => ({
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
      tutorNombre: st.tutor?.usuario
        ? `${st.tutor.usuario.nombres} ${st.tutor.usuario.apellidos}`
        : st.tutor?.nombres
        ? `${st.tutor.nombres} ${st.tutor.apellidos}`
        : st.tutorNombre || "",
      tutorTelefono: st.tutor?.telefono || st.tutorTelefono || "",
    }));
  },

  /**
   * GET /api/estudiantes/{id} (UUID)
   */
  async getById(id: string): Promise<Estudiante> {
    if (isMockModeActive()) {
      const found = mockEstudiantes.find((e) => String(e.id) === String(id));
      if (!found) throw new Error("Estudiante no encontrado");
      return found;
    }
    const st = await apiClient<any>(`/estudiantes/${id}`, { method: "GET" });
    return {
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
      tutorNombre: st.tutor?.usuario
        ? `${st.tutor.usuario.nombres} ${st.tutor.usuario.apellidos}`
        : st.tutor?.nombres
        ? `${st.tutor.nombres} ${st.tutor.apellidos}`
        : st.tutorNombre || "",
      tutorTelefono: st.tutor?.telefono || st.tutorTelefono || "",
    };
  },

  /**
   * POST /api/estudiantes
   * Requiere tutorId obtenido de /api/tutores y fechaNacimiento en ISO-8601
   */
  async create(data: EstudianteCreateDTO): Promise<Estudiante> {
    const codigoVal = data.codigo || data.codigoUnico || `EST-${Date.now()}`;
    const nombresVal = data.nombres || data.nombre || "";
    const apellidosVal = data.apellidos || data.apellido || "";
    const activoVal = data.activo !== undefined ? data.activo : data.estado !== "INACTIVO";

    const payload = {
      ...data,
      codigo: codigoVal,
      codigoUnico: codigoVal,
      nombres: nombresVal,
      nombre: nombresVal,
      apellidos: apellidosVal,
      apellido: apellidosVal,
      fechaNacimiento: data.fechaNacimiento,
      direccion: data.direccion || "",
      activo: activoVal,
      tutorId: String(data.tutorId),
      tutor: { id: String(data.tutorId) },
    };

    if (isMockModeActive()) {
      if (mockEstudiantes.some((e) => (e.codigo || e.codigoUnico || "").trim() === (codigoVal || "").trim())) {
        throw new Error("Ya existe un estudiante con el código indicado.");
      }
      const newId = `est-${Date.now()}`;
      const tutor = INITIAL_TUTORES.find((t) => String(t.id) === String(data.tutorId));
      const nuevo: Estudiante = {
        id: newId,
        codigo: codigoVal,
        codigoUnico: codigoVal,
        nombres: nombresVal,
        apellidos: apellidosVal,
        nombre: nombresVal,
        apellido: apellidosVal,
        fechaNacimiento: data.fechaNacimiento,
        sexo: data.sexo || "M",
        direccion: data.direccion || "",
        activo: activoVal,
        estado: activoVal ? "ACTIVO" : "INACTIVO",
        tutorId: String(data.tutorId),
        tutorNombre: tutor ? `${tutor.nombre} ${tutor.apellido}` : `Tutor #${data.tutorId}`,
        tutorTelefono: tutor ? tutor.telefono : "8888-0000",
        tutorParentesco: "Tutor Legal",
        grado: data.grado || "7mo Grado",
        seccion: data.seccion || "A",
        asistencia: {
          porcentaje: 98.0,
          totalClases: 100,
          presentes: 98,
          ausencias: 1,
          justificadas: 1,
        },
        notas: [],
        llamadosAtencion: [],
      };
      mockEstudiantes.push(nuevo);
      return nuevo;
    }

    return apiClient<Estudiante>("/estudiantes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/estudiantes/{id} (UUID)
   */
  async update(id: string, data: Partial<EstudianteCreateDTO>): Promise<Estudiante> {
    const payload: any = { ...data };
    if (data.codigo || data.codigoUnico) {
      payload.codigo = data.codigo || data.codigoUnico;
      payload.codigoUnico = data.codigo || data.codigoUnico;
    }
    if (data.nombres || data.nombre) {
      payload.nombres = data.nombres || data.nombre;
      payload.nombre = data.nombres || data.nombre;
    }
    if (data.apellidos || data.apellido) {
      payload.apellidos = data.apellidos || data.apellido;
      payload.apellido = data.apellidos || data.apellido;
    }
    if (data.tutorId) {
      payload.tutorId = String(data.tutorId);
      payload.tutor = { id: String(data.tutorId) };
    }
    if (data.activo !== undefined || data.estado !== undefined) {
      payload.activo = data.activo !== undefined ? data.activo : data.estado !== "INACTIVO";
    }

    if (isMockModeActive()) {
      const idx = mockEstudiantes.findIndex((e) => String(e.id) === String(id));
      if (idx === -1) throw new Error("Estudiante no encontrado");
      mockEstudiantes[idx] = {
        ...mockEstudiantes[idx],
        ...payload,
        tutorId: payload.tutorId || mockEstudiantes[idx].tutorId,
        nombre: payload.nombre || mockEstudiantes[idx].nombre,
        apellido: payload.apellido || mockEstudiantes[idx].apellido,
        nombres: payload.nombres || mockEstudiantes[idx].nombres,
        apellidos: payload.apellidos || mockEstudiantes[idx].apellidos,
      };
      return mockEstudiantes[idx];
    }
    return apiClient<Estudiante>(`/estudiantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Actualizar Perfil Completo del Estudiante en memoria
   */
  updateLocalPerfil(estudiante: Estudiante) {
    const idx = mockEstudiantes.findIndex((e) => String(e.id) === String(estudiante.id));
    if (idx !== -1) {
      mockEstudiantes[idx] = { ...estudiante };
    }
  },

  updateLocalFicha(estudiante: Estudiante) {
    this.updateLocalPerfil(estudiante);
  },

  /**
   * PATCH /api/estudiantes/{id}/estado (o PUT /api/estudiantes/{id})
   */
  async updateEstado(id: string, data: EstudianteEstadoDTO): Promise<void> {
    if (isMockModeActive()) {
      const est = mockEstudiantes.find((e) => String(e.id) === String(id));
      if (est) {
        est.estado = data.estado;
      }
      return;
    }
    try {
      await apiClient<void>(`/estudiantes/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch {
      await apiClient<void>(`/estudiantes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }
  },

  /**
   * DELETE /api/estudiantes/{id} (UUID)
   */
  async delete(id: string): Promise<void> {
    if (isMockModeActive()) {
      mockEstudiantes = mockEstudiantes.filter((e) => String(e.id) !== String(id));
      return;
    }
    return apiClient<void>(`/estudiantes/${id}`, { method: "DELETE" });
  },
};
