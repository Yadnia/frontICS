// ==========================================
// TIPOS Y DTOs SEGÚN CONTRATO REST PROPUESTO
// ==========================================

export type RoleType = "ADMIN" | "DIRECCION" | "SECRETARIA" | "DOCENTE" | "TUTOR" | string;

export interface Role {
  id: number;
  nombre: RoleType;
  descripcion?: string;
}

export interface RoleCreateDTO {
  nombre: string;
  descripcion?: string;
}

export interface UserSummary {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  roles: RoleType[];
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
  id: number;
  username: string;
  correo: string;
  nombre: string;
  apellido: string;
  estado: boolean;
  roles: RoleType[];
  fechaCreacion?: string;
}

export interface UsuarioCreateDTO {
  username: string;
  correo: string;
  password?: string;
  nombre: string;
  apellido: string;
  estado?: boolean;
  roles: RoleType[];
}

export interface UsuarioUpdateDTO {
  username?: string;
  correo?: string;
  nombre?: string;
  apellido?: string;
}

export interface UsuarioEstadoDTO {
  estado: boolean;
}

export interface UsuarioRolesDTO {
  roles: RoleType[];
}

export interface Tutor {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  correo?: string;
  estudiantesCount?: number;
}

export interface TutorCreateDTO {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  correo?: string;
}

export interface Docente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion?: string;
  correo: string;
  usuarioId?: number | null;
  estado: boolean;
}

export interface DocenteCreateDTO {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion?: string;
  correo: string;
  usuarioId?: number | null;
  estado?: boolean;
}

export interface DocenteEstadoDTO {
  estado: boolean;
}

export type EstadoEstudiante = "ACTIVO" | "INACTIVO" | "RETIRADO" | "GRADUADO";

export interface Estudiante {
  id: number;
  codigoUnico: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: "M" | "F";
  direccion?: string;
  estado: EstadoEstudiante;
  tutorId: number;
  tutorNombre?: string;
}

export interface EstudianteCreateDTO {
  codigoUnico: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: "M" | "F";
  direccion?: string;
  estado?: EstadoEstudiante;
  tutorId: number;
}

export interface EstudianteEstadoDTO {
  estado: EstadoEstudiante;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  last?: boolean;
  first?: boolean;
}
