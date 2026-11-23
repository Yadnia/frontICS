"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserSummary, LoginDTO, RoleType } from "@/types/api";
import { authService } from "@/services/auth.service";
import {
  getStoredToken,
  setStoredToken,
  isMockModeActive,
  setMockModeActive,
  getApiBaseUrl,
  setApiBaseUrl,
} from "@/services/api";

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  apiUrl: string;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  toggleMockMode: (val?: boolean) => void;
  updateApiUrl: (url: string) => void;
  hasRole: (...roles: RoleType[]) => boolean;
  canAccess: (module: "usuarios" | "roles" | "tutores" | "docentes" | "estudiantes" | "diagnostico") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockModeState] = useState<boolean>(false);
  const [apiUrl, setApiUrlState] = useState<string>("http://localhost:5000/api");

  // Cargar estado inicial desde localStorage al montar en cliente
  useEffect(() => {
    const storedToken = getStoredToken();
    const mockActive = isMockModeActive();
    const currentBaseUrl = getApiBaseUrl();

    setIsMockModeState(mockActive);
    setApiUrlState(currentBaseUrl);

    if (storedToken) {
      setTokenState(storedToken);
      // Intentar validar la sesión con /auth/me
      authService
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token inválido o expirado
          setStoredToken(null);
          setTokenState(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginDTO) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setTokenState(response.accessToken);
      setUser(response.usuario);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setTokenState(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const toggleMockMode = (forceVal?: boolean) => {
    const nextVal = forceVal !== undefined ? forceVal : !isMockMode;
    setMockModeActive(nextVal);
    setIsMockModeState(nextVal);
  };

  const updateApiUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiUrlState(url);
  };

  const hasRole = useCallback(
    (...requiredRoles: RoleType[]): boolean => {
      if (!user || !user.roles) return false;
      const userRoles = user.roles.map((r) => r.toUpperCase());
      // Si el usuario es ADMIN, generalmente tiene acceso administrativo total
      if (userRoles.includes("ADMIN")) return true;
      return requiredRoles.some((r) => userRoles.includes(r.toUpperCase()));
    },
    [user]
  );

  /**
   * Valida acceso según la matriz de permisos de la especificación:
   * - /roles: ADMIN
   * - /usuarios: ADMIN
   * - /tutores: ADMIN, DIRECCION, SECRETARIA
   * - /docentes: ADMIN, DIRECCION, SECRETARIA
   * - /estudiantes: ADMIN, DIRECCION, SECRETARIA, DOCENTE
   * - /diagnostico: ADMIN, DIRECCION
   */
  const canAccess = useCallback(
    (module: "usuarios" | "roles" | "tutores" | "docentes" | "estudiantes" | "diagnostico"): boolean => {
      if (!user) return false;
      switch (module) {
        case "roles":
        case "usuarios":
          return hasRole("ADMIN");
        case "tutores":
        case "docentes":
          return hasRole("ADMIN", "DIRECCION", "SECRETARIA");
        case "estudiantes":
          return hasRole("ADMIN", "DIRECCION", "SECRETARIA", "DOCENTE");
        case "diagnostico":
          return hasRole("ADMIN", "DIRECCION");
        default:
          return false;
      }
    },
    [user, hasRole]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isMockMode,
        apiUrl,
        login,
        logout,
        toggleMockMode,
        updateApiUrl,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
