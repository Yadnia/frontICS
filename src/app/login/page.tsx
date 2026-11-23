"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  Database,
  Sparkles,
  Server,
  AlertCircle,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  MapPin,
  CheckCircle2,
  UserPlus,
  LogIn,
  Check,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import {
  validatePassword,
  validateEmail,
  validatePhone,
  validateCedula,
  validateUsername,
  validateNotEmpty,
} from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isMockMode, toggleMockMode, apiUrl } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registro de tutor
  const [regData, setRegData] = useState({
    username: "",
    correo: "",
    password: "",
    nombres: "",
    apellidos: "",
    cedula: "",
    telefono: "",
    direccion: "",
    ocupacion: "",
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      await login({ username, password });
      success("Sesión iniciada correctamente");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Error al autenticar. Verifica las credenciales.";
      setAuthError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegErrors({});

    const errs: Record<string, string> = {};
    const nErr = validateNotEmpty(regData.nombres, "Nombres");
    if (nErr) errs.nombres = nErr;
    const aErr = validateNotEmpty(regData.apellidos, "Apellidos");
    if (aErr) errs.apellidos = aErr;
    const uErr = validateUsername(regData.username);
    if (uErr) errs.username = uErr;
    const pValidation = validatePassword(regData.password);
    if (!pValidation.isValid) errs.password = pValidation.message || "Contraseña no válida";
    const cErr = validateEmail(regData.correo);
    if (cErr) errs.correo = cErr;
    const cedErr = validateCedula(regData.cedula);
    if (cedErr) errs.cedula = cedErr;
    const telErr = validatePhone(regData.telefono, true);
    if (telErr) errs.telefono = telErr;

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      setAuthError("Por favor corrige los campos con errores antes de continuar.");
      error("Por favor completa el formulario con datos válidos.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.registroTutor(regData);
      success("¡Tutor registrado con éxito! Ya puedes iniciar sesión.");
      setUsername(regData.username);
      setPassword(regData.password);
      setActiveTab("login");
    } catch (err: any) {
      const msg = err.message || "Error al registrar el tutor.";
      setAuthError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const autofillCredentials = (role: "admin" | "docente") => {
    if (role === "admin") {
      setUsername("admin");
      setPassword("Admin1234#");
    } else {
      setUsername("mlopez");
      setPassword("Temporal#2026");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Left panel - Decorative & Information */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 border border-yellow-400/30 flex items-center justify-center text-yellow-300 shadow-lg shadow-blue-900/40">
              <GraduationCap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">IPSFAS</h2>
              <p className="text-xs text-blue-200">Control Escolar y Académico</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-yellow-400/30 text-yellow-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Año Lectivo 2026
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Instituto Politécnico San Francisco de Asís
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Portal institucional para la gestión integral de estudiantes, expedientes académicos, control docente y comunicación con tutores.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="font-semibold text-slate-200">Servidor Central</p>
              <p className="font-mono text-[11px] text-blue-400 truncate mt-0.5">{apiUrl}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="font-semibold text-slate-200">Acceso Seguro</p>
              <p className="font-mono text-[11px] text-emerald-400 mt-0.5">Sesión Encriptada</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Instituto Politécnico San Francisco de Asís (IPSFAS)
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 border border-yellow-400/40 flex items-center justify-center text-yellow-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">ICS Gestión</h2>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeTab === "login" ? "Acceso al Sistema" : "Registro de Tutor"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === "login"
                ? "Ingresa tus credenciales para acceder al panel de control"
                : "Crea una cuenta de tutor vinculada al backend"}
            </p>
          </div>

          {/* Selector de Pestañas: Login vs Registro */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-blue-600 text-white shadow-md border border-yellow-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-blue-600 text-white shadow-md border border-yellow-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrar Tutor</span>
            </button>
          </div>

          {/* Toggle Estado de Conexión */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isMockMode ? "Modo Demostración (Local)" : "Servidor Central Conectado"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isMockMode
                    ? "Navegación de prueba sin conexión de red"
                    : "Sincronización en vivo con la base de datos"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleMockMode()}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                isMockMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
              }`}
            >
              {isMockMode ? "Modo Local" : "En Línea"}
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Error de autenticación</p>
                <p className="mt-0.5 text-rose-400 leading-normal">{authError}</p>
              </div>
            </div>
          )}

          {/* Formulario de Login */}
          {activeTab === "login" && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Usuario o Correo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin o mlopez"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 border border-yellow-400/30"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Credential Autofill Buttons */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Acceso Rápido:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => autofillCredentials("admin")}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-200">Administrador</p>
                    <p className="text-[10px] text-slate-500 font-mono">admin / Admin1234#</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillCredentials("docente")}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-200">Docente María</p>
                    <p className="text-[10px] text-slate-500 font-mono">mlopez / Temporal#...</p>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Formulario de Registro de Tutor */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterTutor} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.nombres}
                    onChange={(e) => {
                      setRegData({ ...regData, nombres: e.target.value });
                      if (regErrors.nombres) setRegErrors((prev) => ({ ...prev, nombres: "" }));
                    }}
                    placeholder="Carlos"
                    className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs focus:ring-2 ${
                      regErrors.nombres ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                    }`}
                  />
                  {regErrors.nombres && (
                    <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{regErrors.nombres}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.apellidos}
                    onChange={(e) => {
                      setRegData({ ...regData, apellidos: e.target.value });
                      if (regErrors.apellidos) setRegErrors((prev) => ({ ...prev, apellidos: "" }));
                    }}
                    placeholder="Pérez"
                    className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs focus:ring-2 ${
                      regErrors.apellidos ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                    }`}
                  />
                  {regErrors.apellidos && (
                    <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{regErrors.apellidos}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Nombre de Usuario * (3 - 40 car.)
                </label>
                <input
                  type="text"
                  required
                  value={regData.username}
                  onChange={(e) => {
                    setRegData({ ...regData, username: e.target.value });
                    if (regErrors.username) setRegErrors((prev) => ({ ...prev, username: "" }));
                  }}
                  placeholder="cperez"
                  className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs font-mono focus:ring-2 ${
                    regErrors.username ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                  }`}
                />
                {regErrors.username && (
                  <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{regErrors.username}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Contraseña Segura *
                </label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => {
                    setRegData({ ...regData, password: e.target.value });
                    if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Clave123#"
                  className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs font-mono focus:ring-2 ${
                    regErrors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                  }`}
                />

                {/* Checklist interactivo de contraseña */}
                {(() => {
                  const pCheck = validatePassword(regData.password);
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
                      <p className="font-semibold text-slate-300">Requisitos de seguridad:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                        <div className={`flex items-center gap-1.5 ${pCheck.hasMinLength ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          <Check className={`w-3 h-3 ${pCheck.hasMinLength ? "opacity-100" : "opacity-30"}`} />
                          <span>8+ caracteres</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pCheck.hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          <Check className={`w-3 h-3 ${pCheck.hasNumber ? "opacity-100" : "opacity-30"}`} />
                          <span>Al menos 1 dígito (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pCheck.hasUpper ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          <Check className={`w-3 h-3 ${pCheck.hasUpper ? "opacity-100" : "opacity-30"}`} />
                          <span>Al menos 1 mayúscula (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pCheck.hasLower ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          <Check className={`w-3 h-3 ${pCheck.hasLower ? "opacity-100" : "opacity-30"}`} />
                          <span>Al menos 1 minúscula (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 sm:col-span-2 ${pCheck.hasSpecial ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          <Check className={`w-3 h-3 ${pCheck.hasSpecial ? "opacity-100" : "opacity-30"}`} />
                          <span>Al menos 1 carácter especial (@, #, $, etc.)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {regErrors.password && (
                  <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{regErrors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={regData.correo}
                  onChange={(e) => {
                    setRegData({ ...regData, correo: e.target.value });
                    if (regErrors.correo) setRegErrors((prev) => ({ ...prev, correo: "" }));
                  }}
                  placeholder="carlos.perez@example.com"
                  className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs focus:ring-2 ${
                    regErrors.correo ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                  }`}
                />
                {regErrors.correo && (
                  <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{regErrors.correo}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Cédula * (min 5 car.)
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.cedula}
                    onChange={(e) => {
                      setRegData({ ...regData, cedula: e.target.value });
                      if (regErrors.cedula) setRegErrors((prev) => ({ ...prev, cedula: "" }));
                    }}
                    placeholder="001-010190-0001A"
                    className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs font-mono focus:ring-2 ${
                      regErrors.cedula ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                    }`}
                  />
                  {regErrors.cedula && (
                    <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{regErrors.cedula}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Teléfono * (min 8 dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.telefono}
                    onChange={(e) => {
                      setRegData({ ...regData, telefono: e.target.value });
                      if (regErrors.telefono) setRegErrors((prev) => ({ ...prev, telefono: "" }));
                    }}
                    placeholder="8888-7777"
                    className={`w-full px-3 py-2 bg-slate-900 border text-white rounded-xl text-xs focus:ring-2 ${
                      regErrors.telefono ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500"
                    }`}
                  />
                  {regErrors.telefono && (
                    <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{regErrors.telefono}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    value={regData.ocupacion}
                    onChange={(e) => setRegData({ ...regData, ocupacion: e.target.value })}
                    placeholder="Docente / Ingeniero"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={regData.direccion}
                    onChange={(e) => setRegData({ ...regData, direccion: e.target.value })}
                    placeholder="Ciudad, Barrio"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 border border-yellow-400/30"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                    <span>Registrar Cuenta de Tutor</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

