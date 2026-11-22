import { apiClient, isMockModeActive, setStoredToken } from "./api";
import { AuthResponse, LoginDTO, UserSummary } from "@/types/api";
import { INITIAL_USUARIOS } from "./mockData";

export const authService = {
  /**
   * POST /auth/login
   * Recibe username y password, devuelve token y datos de usuario
   */
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    if (isMockModeActive()) {
      // Simulación local para pruebas directas en frontend
      const username = credentials.username.toLowerCase();
      const mockUser = INITIAL_USUARIOS.find(
        (u) =>
          u.username.toLowerCase() === username ||
          u.correo.toLowerCase() === username
      );

      if (!mockUser) {
        throw new Error("Credenciales inválidas (usuario no encontrado en modo mock)");
      }

      if (!mockUser.estado) {
        throw new Error("El usuario se encuentra inactivo");
      }

      const response: AuthResponse = {
        accessToken: `mock-jwt-token-for-${mockUser.username}-${Date.now()}`,
        tokenType: "Bearer",
        expiresIn: 3600,
        usuario: {
          id: mockUser.id,
          username: mockUser.username,
          nombre: `${mockUser.nombre} ${mockUser.apellido}`,
          apellido: mockUser.apellido,
          correo: mockUser.correo,
          roles: mockUser.roles,
        },
      };

      setStoredToken(response.accessToken);
      return response;
    }

    // Solicitud real al backend Spring Boot
    const response = await apiClient<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Adaptador flexible: el backend puede devolver 'accessToken' o 'token', o el objeto usuario anidado
    const token = response.accessToken || response.token || response.jwt;
    const tokenType = response.tokenType || "Bearer";
    const expiresIn = response.expiresIn || 3600;

    let usuario: UserSummary = response.usuario || response.user;
    if (!usuario) {
      // Construir usuario básico si el backend sólo devolvió el token y claims
      usuario = {
        id: response.id || 1,
        username: response.username || credentials.username,
        nombre: response.nombre || credentials.username,
        roles: response.roles || ["ADMIN"],
      };
    }

    // Normalizar roles en caso de que vengan como objetos [{ authority: "ROLE_ADMIN" }] o ["ROLE_ADMIN"]
    if (Array.isArray(usuario.roles)) {
      usuario.roles = usuario.roles.map((r: any) => {
        if (typeof r === "string") return r.replace(/^ROLE_/, "");
        if (r && typeof r === "object") return (r.authority || r.nombre || r.name || "").replace(/^ROLE_/, "");
        return String(r);
      });
    }

    setStoredToken(token);
    return {
      accessToken: token,
      tokenType,
      expiresIn,
      usuario,
    };
  },

  /**
   * GET /auth/me
   * Consulta el usuario autenticado según el token actual
   */
  async getMe(): Promise<UserSummary> {
    if (isMockModeActive()) {
      return {
        id: 1,
        username: "admin",
        nombre: "Administrador del Sistema",
        correo: "admin@colegio.edu.ni",
        roles: ["ADMIN"],
      };
    }

    const res = await apiClient<any>("/auth/me", { method: "GET" });
    const user = res.usuario || res.user || res;

    // Normalizar roles
    if (Array.isArray(user.roles)) {
      user.roles = user.roles.map((r: any) => {
        if (typeof r === "string") return r.replace(/^ROLE_/, "");
        if (r && typeof r === "object") return (r.authority || r.nombre || r.name || "").replace(/^ROLE_/, "");
        return String(r);
      });
    }

    return user as UserSummary;
  },

  /**
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    if (!isMockModeActive()) {
      try {
        await apiClient("/auth/logout", { method: "POST" });
      } catch {
        // Ignorar si el endpoint logout no está implementado en backend
      }
    }
    setStoredToken(null);
  },
};
