# 🎓 Sistema de Gestión Estudiantil ICS - Frontend

Frontend moderno y robusto desarrollado con **Next.js 14**, **React 18**, **TypeScript** y **Tailwind CSS**, diseñado específicamente para integrarse con la propuesta de contrato REST de la API en Spring Boot y PostgreSQL 18.

---

## 🌟 Características Principales

1. **Autenticación con JWT (Bearer Token):**
   - Inicio de sesión (`POST /auth/login`) compatible con formatos de respuesta estándar y DTOs flexibles (`accessToken`, `token`, etc.).
   - Consulta de perfil e identidad activa (`GET /auth/me`).
   - Cierre de sesión y revocación (`POST /auth/logout`).
   - Almacenamiento seguro del token en `localStorage` con inyección automática en las cabeceras `Authorization: Bearer <token>`.

2. **Control de Acceso Basado en Roles (RBAC):**
   - **ADMIN:** Acceso total, gestión de usuarios, roles, tutores, docentes, estudiantes y suite de diagnóstico.
   - **DIRECCION & SECRETARIA:** Gestión operativa de estudiantes, docentes y tutores.
   - **DOCENTE:** Consulta y gestión autorizada de estudiantes.
   - **TUTOR:** Consulta limitada.

3. **Módulos Prioritarios Implementados (CRUD Completo):**
   - 🛡️ **Roles (`/roles`):** Listar, consultar, crear rol en mayúsculas (`DOCENTE`, `DIRECCION`, etc.), actualizar descripción y eliminar con control de asignación.
   - 👥 **Usuarios (`/usuarios`):** Listar con filtros y búsqueda, crear usuarios con contraseña cifrada (BCrypt), actualizar datos básicos, activar/desactivar estado (`PATCH /usuarios/{id}/estado`), y reasignar roles (`PUT /usuarios/{id}/roles`).
   - 👨‍👩‍👧 **Tutores / Padres (`/tutores`):** Gestión de nombre, apellido, cédula nicaragüense, teléfono, dirección, ocupación y correo.
   - 👨‍🏫 **Docentes (`/docentes`):** Gestión del perfil profesional, vinculación opcional con cuenta de usuario del sistema (`usuarioId`), control de estado activo/inactivo.
   - 🎓 **Estudiantes (`/estudiantes`):** Registro de código único (`EST-2026-0001`), datos biográficos, sexo, dirección, tutor principal responsable (`tutorId`) y cambio de estado académico (`ACTIVO`, `INACTIVO`, `RETIRADO`, `GRADUADO`).

4. **Modo Mock / Offline Integrado:**
   - Permite probar el 100% de la interfaz gráfica y los flujos de trabajo sin necesidad de encender el backend Spring Boot.
   - Pre-cargado con los datos ficticios consolidados de la **Sección 12** del documento (Admin inicial, María López `mlopez`, Carlos Mendoza, José Mendoza).
   - Botón toggle instantáneo en la barra de navegación para alternar entre "Modo Mock" y "Modo API Real".

5. **Suite de Diagnóstico y Pruebas REST (Tipo Postman):**
   - Interfaz interactiva para verificar los casos de seguridad de la **Sección 10**:
     - Solicitud sin token (`401 Unauthorized`)
     - Token inválido (`401 Unauthorized`)
     - Contraseña incorrecta en login (`401`)
     - Verificación de identidad (`/auth/me`)
     - Ping de conectividad al servidor Spring Boot
     - Explorador dinámico para probar cualquier endpoint con verbos `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

---

## 🚀 Puesta en Marcha

### Prerrequisitos
- **Node.js** v18 o superior (v20+ recomendado)
- **npm** o **pnpm**

### 1. Clonar o ingresar al directorio
```bash
cd frontICS
```

### 2. Configurar variables de entorno
El archivo `.env.local` ya se encuentra preconfigurado con la ruta de la API propuesta:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_APP_NAME="ICS - Gestión Estudiantil"
```
> *Nota: También puedes cambiar la URL en caliente desde el icono de configuración ⚙️ en la barra superior de la aplicación sin reiniciar el servidor.*

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔑 Credenciales de Prueba Ficticias (Sección 12)

| Rol | Usuario / Correo | Contraseña de Prueba |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `CambiarEstaClave123!` |
| **Docente** | `mlopez` (`mlopez@colegio.edu.ni`) | `Temporal#2026` |

En la pantalla de Login (`/login`) encontrarás botones de auto-llenado con 1 clic para cargar estas credenciales rápidamente.

---

## 📂 Estructura del Proyecto

```
frontICS/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── diagnostico/page.tsx   # Suite de pruebas Postman integrada
│   │   │   ├── docentes/page.tsx      # CRUD de docentes
│   │   │   ├── estudiantes/page.tsx   # CRUD de estudiantes
│   │   │   ├── roles/page.tsx         # CRUD de roles
│   │   │   ├── tutores/page.tsx       # CRUD de tutores
│   │   │   ├── usuarios/page.tsx      # CRUD de usuarios y roles
│   │   │   ├── layout.tsx             # Shell con Sidebar y Navbar protegida
│   │   │   └── page.tsx               # Panel principal con KPIs y accesos
│   │   ├── login/page.tsx             # Pantalla de acceso
│   │   ├── globals.css                # Estilos globales y Tailwind
│   │   ├── layout.tsx                 # Root layout con proveedores
│   │   └── page.tsx                   # Redirección automática
│   ├── components/
│   │   ├── layout/                    # Sidebar y Navbar
│   │   └── ui/                        # Modal, ConfirmDialog, Badge, StatCard, SearchInput
│   ├── context/
│   │   ├── AuthContext.tsx            # Contexto global de autenticación y RBAC
│   │   └── ToastContext.tsx           # Notificaciones tipo toast
│   ├── services/
│   │   ├── api.ts                     # Cliente fetch con interceptor Bearer y adaptador
│   │   ├── auth.service.ts            # Métodos /auth/*
│   │   ├── docentes.service.ts        # Métodos /docentes/*
│   │   ├── estudiantes.service.ts     # Métodos /estudiantes/*
│   │   ├── mockData.ts                # Datos ficticios de prueba (Sección 12)
│   │   ├── roles.service.ts           # Métodos /roles/*
│   │   ├── tutores.service.ts         # Métodos /tutores/*
│   │   └── usuarios.service.ts        # Métodos /usuarios/*
│   └── types/
│       └── api.ts                     # Interfaces TypeScript según contrato REST
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Conexión con Spring Boot (Sección 13)

Para conectar con tu backend Spring Boot real:
1. Asegúrate de habilitar CORS en los controladores de Spring Boot:
   ```java
   @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {
       RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
       RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS
   })
   ```
2. Asegúrate de que las rutas coincidan con `@RequestMapping("/api/v1/...")`.
3. El frontend enviará en cada petición protegida:
   ```http
   Authorization: Bearer <tu_jwt_aqui>
   Content-Type: application/json
   ```
