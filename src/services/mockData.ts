import { Role, Usuario, Tutor, Docente, Estudiante } from "@/types/api";

// Datos ficticios iniciales tomados directamente de la sección 12 del contrato
export const INITIAL_ROLES: Role[] = [
  { id: 1, nombre: "ADMIN", descripcion: "Administrador general del sistema" },
  { id: 2, nombre: "DIRECCION", descripcion: "Dirección académica y ejecutiva" },
  { id: 3, nombre: "SECRETARIA", descripcion: "Personal de secretaría y registro" },
  { id: 4, nombre: "DOCENTE", descripcion: "Personal docente del centro educativo" },
  { id: 5, nombre: "TUTOR", descripcion: "Padres y tutores legales de estudiantes" },
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 1,
    username: "admin",
    correo: "admin@colegio.edu.ni",
    nombre: "Administrador",
    apellido: "General",
    estado: true,
    roles: ["ADMIN"],
    fechaCreacion: "2026-01-10",
  },
  {
    id: 2,
    username: "mlopez",
    correo: "mlopez@colegio.edu.ni",
    nombre: "María",
    apellido: "López",
    estado: true,
    roles: ["DOCENTE"],
    fechaCreacion: "2026-01-15",
  },
  {
    id: 3,
    username: "jmartinez",
    correo: "jmartinez@colegio.edu.ni",
    nombre: "José",
    apellido: "Martínez",
    estado: true,
    roles: ["SECRETARIA"],
    fechaCreacion: "2026-01-20",
  },
  {
    id: 4,
    username: "cmendoza",
    correo: "carlos.mendoza@example.com",
    nombre: "Carlos",
    apellido: "Mendoza",
    estado: true,
    roles: ["TUTOR"],
    fechaCreacion: "2026-02-01",
  },
];

export const INITIAL_TUTORES: Tutor[] = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Mendoza",
    cedula: "001-150390-1000A",
    telefono: "88881234",
    direccion: "Barrio Central, Matagalpa",
    ocupacion: "Comerciante",
    correo: "carlos.mendoza@example.com",
    estudiantesCount: 1,
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Gutiérrez",
    cedula: "001-200788-0002F",
    telefono: "84551122",
    direccion: "Colonia Las Palmeras, Matagalpa",
    ocupacion: "Ingeniera Agrónoma",
    correo: "ana.gutierrez@example.com",
    estudiantesCount: 2,
  },
];

export const INITIAL_DOCENTES: Docente[] = [
  {
    id: 1,
    nombre: "María",
    apellido: "López",
    cedula: "001-120585-2000B",
    telefono: "87776655",
    direccion: "Reparto Los Pinos, Matagalpa",
    correo: "mlopez@colegio.edu.ni",
    usuarioId: 2,
    estado: true,
  },
  {
    id: 2,
    nombre: "Roberto",
    apellido: "Salgado",
    cedula: "001-081079-0003K",
    telefono: "86334411",
    direccion: "Barrio San José, Matagalpa",
    correo: "rsalgado@colegio.edu.ni",
    usuarioId: null,
    estado: true,
  },
];

export const INITIAL_ESTUDIANTES: Estudiante[] = [
  {
    id: 1,
    codigoUnico: "EST-2026-0001",
    nombre: "José",
    apellido: "Mendoza",
    fechaNacimiento: "2012-04-18",
    sexo: "M",
    direccion: "Barrio Central, Matagalpa",
    estado: "ACTIVO",
    tutorId: 1,
    tutorNombre: "Carlos Mendoza",
  },
  {
    id: 2,
    codigoUnico: "EST-2026-0002",
    nombre: "Valeria",
    apellido: "Gutiérrez",
    fechaNacimiento: "2013-09-05",
    sexo: "F",
    direccion: "Colonia Las Palmeras, Matagalpa",
    estado: "ACTIVO",
    tutorId: 2,
    tutorNombre: "Ana Gutiérrez",
  },
];
