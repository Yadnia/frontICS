// ==========================================
// TIPOS Y DTOs SEGÚN CONTRATO REST (UUID & ISO-8601)
// ==========================================

export type RoleType = "ADMIN" | "DIRECCION" | "SECRETARIA" | "DOCENTE" | "TUTOR" | string;

export interface Role {
  id: string;
  nombre: RoleType;
  descripcion?: string;
}

export interface RoleCreateDTO {
  nombre: string;
  descripcion?: string;
}

export interface Permiso {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  modulo?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  nombre: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  correo?: string;
  roles: RoleType[];
  cargo?: string;
  telefono?: string;
  ultimoAcceso?: string;
  fechaCreacion?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  usuario: UserSummary;
}

export interface LoginDTO {
  username: string;
  password?: string;
}

export interface Usuario {
  id: string;
  username: string;
  correo: string;
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  activo?: boolean;
  estado?: boolean;
  roles: RoleType[] | string[] | any[];
  fechaCreacion?: string;
  ultimoAcceso?: string;
  telefono?: string;
  cargo?: string;
  foto?: string;
}

export interface UsuarioCreateDTO {
  username: string;
  correo: string;
  password?: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  activo?: boolean;
  estado?: boolean;
  roles: string[]; // UUIDs obtenidos de /api/roles
  telefono?: string;
  cargo?: string;
}

export interface UsuarioUpdateDTO {
  username?: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  cargo?: string;
}

export interface UsuarioEstadoDTO {
  activo?: boolean;
  estado?: boolean;
}

export interface UsuarioRolesDTO {
  roles: string[];
}

export interface Tutor {
  id: string;
  usuario?: Usuario;
  usuarioId?: string | null;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  // Campos derivados para conveniencia en vistas
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  cedula?: string;
  correo?: string;
  estudiantesCount?: number;
}

export interface TutorCreateDTO {
  usuarioId?: string | null;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  correo?: string;
}

export interface TutorRegistroDTO {
  username: string;
  correo: string;
  password?: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  cedula?: string;
}

export interface Docente {
  id: string;
  usuario?: Usuario;
  usuarioId?: string | null;
  cedula: string;
  telefono: string;
  direccion?: string;
  // Campos derivados para conveniencia en vistas
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  correo?: string;
  estado?: boolean;
  activo?: boolean;
  foto?: string;
  especialidad?: string;
  materias?: string[];
  gradosAsignados?: string[];
  turno?: "MATUTINO" | "VESPERTINO" | "COMPLETO";
  fechaIngreso?: string;
}

export interface DocenteCreateDTO {
  usuarioId?: string | null;
  cedula: string;
  telefono: string;
  direccion?: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  estado?: boolean;
  activo?: boolean;
  especialidad?: string;
  materias?: string[];
  gradosAsignados?: string[];
  turno?: "MATUTINO" | "VESPERTINO" | "COMPLETO";
}

export interface DocenteEstadoDTO {
  estado: boolean;
}

export type EstadoEstudiante = "ACTIVO" | "INACTIVO" | "RETIRADO" | "GRADUADO";

// Sub-estructuras académicas para el Perfil Estudiantil
export interface CalificacionMateria {
  id: string;
  materia: string;
  docente: string;
  corte1: number;
  corte2: number;
  corte3: number;
  corte4?: number;
  promedio: number;
  estado: "APROBADO" | "REPROBADO";
}

export interface LlamadoAtencion {
  id: string;
  fecha: string;
  motivo: string;
  gravedad: "LEVE" | "MODERADA" | "GRAVE";
  docente: string;
  descripcion?: string;
}

export interface AsistenciaEstudiante {
  porcentaje: number;
  totalClases: number;
  presentes: number;
  ausencias: number;
  justificadas: number;
}

export interface Estudiante {
  id: string;
  codigo?: string;
  codigoUnico: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento: string; // ISO-8601 (YYYY-MM-DD)
  direccion?: string;
  activo?: boolean;
  estado?: EstadoEstudiante;
  tutor?: Tutor;
  tutorId: string; // UUID obtenido de /api/tutores
  tutorNombre?: string;
  tutorTelefono?: string;
  tutorParentesco?: string;
  sexo?: "M" | "F";
  // Campos de Perfil Completo
  foto?: string;
  grado?: string;
  seccion?: string;
  asistencia?: AsistenciaEstudiante;
  notas?: CalificacionMateria[];
  llamadosAtencion?: LlamadoAtencion[];
}

export interface EstudianteCreateDTO {
  codigo?: string;
  codigoUnico: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento: string; // ISO-8601 ej: "2010-03-10"
  direccion?: string;
  activo?: boolean;
  estado?: EstadoEstudiante;
  tutorId: string; // UUID obtenido de /api/tutores
  sexo?: "M" | "F";
  grado?: string;
  seccion?: string;
  foto?: string;
}

export interface EstudianteEstadoDTO {
  estado: EstadoEstudiante;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// Estructura de Páginas de Spring Data (content, totalElements, totalPages)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
}
