import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/**
 * Cliente HTTP basado en Axios para interactuar con la API Spring Boot (http://localhost:8080/api/v1).
 * Incluye interceptores para:
 * 1. Inyectar automáticamente el Bearer Token JWT en Authorization.
 * 2. Normalizar respuestas y capturar errores HTTP (401, 403, 404, 409, 500).
 */

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("ics_api_url");
    if (customUrl) return customUrl;
  }
  return DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ics_api_url", url.trim());
    api.defaults.baseURL = url.trim();
  }
}

export function isMockModeActive(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ics_mock_mode") === "true";
  }
  return false;
}

export function setMockModeActive(active: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ics_mock_mode", active ? "true" : "false");
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ics_token");
  }
  return null;
}

export function setStoredToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("ics_token", token);
    } else {
      localStorage.removeItem("ics_token");
    }
  }
}

// Instancia configurada de Axios
export const api: AxiosInstance = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Solicitud (Request): inyecta dinámicamente la URL base y el token JWT
api.interceptors.request.use(
  (config) => {
    // Asegurar baseURL actualizada en cliente
    config.baseURL = getApiBaseUrl();

    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta (Response): normaliza y traduce mensajes de error HTTP según el contrato
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    let message = "Error de conexión con el servidor";
    const status = error.response?.status;
    const responseData = error.response?.data;

    if (responseData && typeof responseData === "object") {
      message = responseData.message || responseData.error || responseData.detail || message;
    }

    if (status === 401) {
      message = "No autorizado: credenciales inválidas o token expirado (401).";
    } else if (status === 403) {
      message = "Acceso denegado: no cuentas con los permisos requeridos para esta acción (403).";
    } else if (status === 404) {
      message = "El recurso solicitado no fue encontrado en el servidor (404).";
    } else if (status === 409) {
      message = message !== "Error de conexión con el servidor" ? message : "Conflicto: el registro ya existe o tiene relaciones activas (409).";
    } else if (!status) {
      message = `No se pudo conectar con el backend en ${getApiBaseUrl()}. Verifica que Spring Boot esté activo y tenga CORS habilitado.`;
    }

    // Enriquecer el objeto de error para los componentes
    const enrichedError = new Error(message);
    (enrichedError as any).status = status;
    (enrichedError as any).data = responseData;
    (enrichedError as any).originalError = error;

    return Promise.reject(enrichedError);
  }
);

/**
 * Función puente compatible para invocar endpoints con Axios de forma genérica
 */
export async function apiClient<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = "GET", body, headers, timeoutMs } = options;

  let parsedData: any = undefined;
  if (body) {
    try {
      parsedData = JSON.parse(body);
    } catch {
      parsedData = body;
    }
  }

  const response = await api.request<T>({
    url: endpoint,
    method,
    data: parsedData,
    headers,
    timeout: timeoutMs,
  });

  return response.data;
}

export default api;
