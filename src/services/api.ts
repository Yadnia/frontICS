import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/**
 * Cliente HTTP basado en Axios para interactuar con la API Spring Boot (http://localhost:5000/api).
 * Incluye interceptores para:
 * 1. Inyectar automáticamente el Bearer Token JWT en Authorization.
 * 2. Normalizar respuestas y capturar errores HTTP (401, 403, 404, 409, 500).
 * 3. Compatibilidad flexible para endpoints con o sin prefijo '/api'.
 */

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("ics_api_url");
    // Migrar automáticamente si tenía la URL anterior con puerto 8080
    if (customUrl) {
      if (customUrl.includes("8080")) {
        localStorage.setItem("ics_api_url", DEFAULT_API_URL);
        return DEFAULT_API_URL;
      }
      return customUrl;
    }
  }
  return DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string) {
  if (typeof window !== "undefined") {
    let normalized = url.trim();
    // Asegurar que si solo pusieron localhost:5000 sin /api, mantenga compatibilidad
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    localStorage.setItem("ics_api_url", normalized);
    api.defaults.baseURL = normalized;
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
      message = `No se pudo conectar con el backend en ${getApiBaseUrl()}. Verifica que Spring Boot esté activo en el puerto 5000 y tenga CORS habilitado.`;
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
 * Función puente compatible para invocar endpoints con Axios de forma genérica.
 * Si el endpoint viene con '/api/...' y la baseURL ya incluye '/api', se desduplica automáticamente.
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

  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = getApiBaseUrl();

  // Si la baseURL termina en /api y el endpoint inicia con /api/, evitar duplicación /api/api/...
  if (baseUrl.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  let parsedData: any = undefined;
  if (body) {
    try {
      parsedData = JSON.parse(body);
    } catch {
      parsedData = body;
    }
  }

  const response = await api.request<T>({
    url: cleanEndpoint,
    method,
    data: parsedData,
    headers,
    timeout: timeoutMs,
  });

  return response.data;
}

export default api;
