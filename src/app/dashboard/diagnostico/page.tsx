"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Stethoscope,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  KeyRound,
  ShieldAlert,
  Send,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface TestCase {
  id: string;
  name: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: any;
  customHeaders?: Record<string, string>;
  expectedStatus: number;
  expectedStatusAlt?: number;
  category: "seguridad" | "auth" | "crud";
}

interface TestResult {
  testId: string;
  status: number;
  ok: boolean;
  timeMs: number;
  data: any;
  error?: string;
}

export default function DiagnosticoPage() {
  const { apiUrl, token, isMockMode } = useAuth();
  const { info, success } = useToast();

  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Custom runner state
  const [customMethod, setCustomMethod] = useState<string>("GET");
  const [customEndpoint, setCustomEndpoint] = useState<string>("/roles");
  const [customBody, setCustomBody] = useState<string>("");
  const [customWithToken, setCustomWithToken] = useState<boolean>(true);
  const [customLoading, setCustomLoading] = useState<boolean>(false);
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const testCases: TestCase[] = [
    {
      id: "no-token",
      name: "Solicitud sin Token",
      description: "Intento de listar usuarios sin cabecera Authorization",
      method: "GET",
      endpoint: "/usuarios",
      customHeaders: {},
      expectedStatus: 401,
      category: "seguridad",
    },
    {
      id: "invalid-token",
      name: "Token JWT Inválido o Falsificado",
      description: "Intento de acceso con firma o payload JWT incorrecto",
      method: "GET",
      endpoint: "/usuarios",
      customHeaders: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalido" },
      expectedStatus: 401,
      category: "seguridad",
    },
    {
      id: "wrong-password",
      name: "Contraseña Incorrecta en Login",
      description: "Verifica que el endpoint rechace credenciales erróneas sin exponer trazas",
      method: "POST",
      endpoint: "/auth/login",
      body: { username: "admin", password: "PasswordCompletamenteErronea!99" },
      expectedStatus: 401,
      category: "auth",
    },
    {
      id: "valid-me",
      name: "Identidad del Token (/auth/me)",
      description: "Consulta el usuario actual autenticado con el Bearer Token activo",
      method: "GET",
      endpoint: "/auth/me",
      expectedStatus: 200,
      category: "auth",
    },
    {
      id: "list-roles",
      name: "Listar Roles (/roles)",
      description: "Verifica que los roles base (ADMIN, DOCENTE, etc.) sean consultables",
      method: "GET",
      endpoint: "/roles",
      expectedStatus: 200,
      category: "crud",
    },
    {
      id: "list-tutores",
      name: "Listar Tutores (/tutores)",
      description: "Consulta el listado de tutores registrados en base de datos",
      method: "GET",
      endpoint: "/tutores",
      expectedStatus: 200,
      category: "crud",
    },
    {
      id: "list-estudiantes",
      name: "Listar Estudiantes (/estudiantes)",
      description: "Consulta el listado de estudiantes y sus tutores asignados",
      method: "GET",
      endpoint: "/estudiantes",
      expectedStatus: 200,
      category: "crud",
    },
  ];

  const executeTest = async (test: TestCase): Promise<TestResult> => {
    const fullUrl = `${apiUrl}${test.endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...test.customHeaders,
    };

    // Si el test no especifica customHeaders y requiere token por defecto, usar el actual
    if (!test.customHeaders && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const start = performance.now();
    try {
      const response = await fetch(fullUrl, {
        method: test.method,
        headers,
        body: test.body ? JSON.stringify(test.body) : undefined,
      });
      const timeMs = Math.round(performance.now() - start);

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = { text: "No JSON body returned" };
      }

      const passed =
        response.status === test.expectedStatus ||
        (test.expectedStatusAlt !== undefined && response.status === test.expectedStatusAlt);

      return {
        testId: test.id,
        status: response.status,
        ok: passed,
        timeMs,
        data,
      };
    } catch (err: any) {
      const timeMs = Math.round(performance.now() - start);
      return {
        testId: test.id,
        status: 0,
        ok: false,
        timeMs,
        data: null,
        error:
          err.message ||
          "No se pudo conectar con el servidor. ¿Spring Boot está encendido en el puerto 8080?",
      };
    }
  };

  const runSingleTest = async (test: TestCase) => {
    setRunningTestId(test.id);
    const res = await executeTest(test);
    setResults((prev) => ({ ...prev, [test.id]: res }));
    setRunningTestId(null);
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    const newResults: Record<string, TestResult> = {};
    for (const test of testCases) {
      setRunningTestId(test.id);
      const res = await executeTest(test);
      newResults[test.id] = res;
    }
    setResults(newResults);
    setRunningTestId(null);
    setIsRunningAll(false);
    success("Ejecución de suite completada");
  };

  const handleRunCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLoading(true);
    setCustomResponse(null);

    const endpoint = customEndpoint.startsWith("/") ? customEndpoint : `/${customEndpoint}`;
    const fullUrl = `${apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (customWithToken && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const start = performance.now();
    try {
      const res = await fetch(fullUrl, {
        method: customMethod,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(customMethod) && customBody.trim() ? customBody : undefined,
      });
      const timeMs = Math.round(performance.now() - start);

      let bodyData: any = null;
      try {
        bodyData = await res.json();
      } catch {
        bodyData = await res.text();
      }

      setCustomResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs,
        headers: Object.fromEntries(res.headers.entries()),
        data: bodyData,
      });
    } catch (err: any) {
      setCustomResponse({
        status: 0,
        error: err.message || "Error al conectar con el backend",
      });
    } finally {
      setCustomLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Diagnóstico y Casos de Prueba REST
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              Postman Tester
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprobación automatizada de los casos de seguridad y contratos de la Sección 10 del documento
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunningAll}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isRunningAll ? "animate-spin" : ""}`} />
          {isRunningAll ? "Ejecutando suite..." : "Ejecutar Todos los Casos"}
        </button>
      </div>

      {/* Target status card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Objetivo de Pruebas (Base URL)</p>
            <p className="font-mono text-xs text-indigo-600 font-bold mt-0.5">{apiUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Estado del Token:</span>
          {token ? (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bearer Presente ({token.substring(0, 10)}...)
            </span>
          ) : (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Sin Token Activo
            </span>
          )}
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Casos de Seguridad Estandarizados (Sección 10)
          </h2>
          <span className="text-xs text-slate-400">Total: {testCases.length} escenarios</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Escenario</th>
                <th className="py-3 px-4">Método / Ruta</th>
                <th className="py-3 px-4">Esperado</th>
                <th className="py-3 px-4">Resultado Obtenido</th>
                <th className="py-3 px-4">Tiempo</th>
                <th className="py-3 px-4 text-right">Ejecutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {testCases.map((test) => {
                const result = results[test.id];
                const isRunning = runningTestId === test.id;

                return (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 text-xs">{test.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{test.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                          test.method === "GET"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {test.method}
                      </span>
                      <span className="text-slate-600">{test.endpoint}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                      HTTP {test.expectedStatus}
                    </td>
                    <td className="py-3.5 px-4">
                      {isRunning ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Probando...
                        </span>
                      ) : !result ? (
                        <span className="text-xs text-slate-400">Pendiente</span>
                      ) : result.status === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <XCircle className="w-4 h-4 text-rose-500" />
                          Sin Conexión
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                            result.ok
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {result.ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          HTTP {result.status} {result.ok ? "PASS" : "FAIL"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                      {result ? `${result.timeMs}ms` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => runSingleTest(test)}
                        disabled={isRunning}
                        className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors disabled:opacity-50"
                      >
                        {isRunning ? "..." : "Probar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Custom API Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Explorador de Endpoints Personalizado (Tipo Postman)
            </h2>
            <p className="text-xs text-slate-500">
              Envía solicitudes directas con o sin token para inspeccionar respuestas y encabezados reales
            </p>
          </div>
        </div>

        <form onSubmit={handleRunCustomRequest} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">
                {apiUrl}
              </span>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="/roles o /usuarios"
                className="w-full pl-52 pr-4 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={customLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${customLoading ? "animate-spin" : ""}`} />
              Enviar
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customWithToken}
                onChange={(e) => setCustomWithToken(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Incluir encabezado Authorization: Bearer &lt;token&gt;</span>
            </label>
          </div>

          {["POST", "PUT", "PATCH"].includes(customMethod) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuerpo JSON (Request Body)
              </label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                rows={4}
                placeholder='{\n  "nombre": "DOCENTE",\n  "descripcion": "..."\n}'
                className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </form>

        {/* Custom Response Output */}
        {customResponse && (
          <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    customResponse.status >= 200 && customResponse.status < 300
                      ? "bg-emerald-500/20 text-emerald-400"
                      : customResponse.status === 401 || customResponse.status === 403
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  Status: {customResponse.status || "ERR"} {customResponse.statusText}
                </span>
                {customResponse.timeMs !== undefined && (
                  <span className="text-slate-400">{customResponse.timeMs}ms</span>
                )}
              </div>

              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(customResponse.data, null, 2))
                }
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado" : "Copiar JSON"}
              </button>
            </div>

            <pre className="max-h-72 overflow-y-auto overflow-x-auto text-slate-300">
              {JSON.stringify(customResponse.data || customResponse.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
