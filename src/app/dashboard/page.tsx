"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { estudiantesService } from "@/services/estudiantes.service";
import { docentesService } from "@/services/docentes.service";
import { tutoresService } from "@/services/tutores.service";
import { usuariosService } from "@/services/usuarios.service";
import { Estudiante } from "@/types/api";
import { PerfilEstudianteModal } from "@/components/perfiles/PerfilEstudianteModal";
import {
  GraduationCap,
  Briefcase,
  Users2,
  UserCog,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Server,
  Terminal,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isMockMode, apiUrl, canAccess } = useAuth();

  const [stats, setStats] = useState({
    estudiantes: 0,
    docentes: 0,
    tutores: 0,
    usuarios: 0,
  });
  const [recentStudents, setRecentStudents] = useState<Estudiante[]>([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [est, doc, tut, usu] = await Promise.allSettled([
          estudiantesService.getAll(),
          docentesService.getAll(),
          tutoresService.getAll(),
          usuariosService.getAll(),
        ]);

        const estList = est.status === "fulfilled" ? est.value : [];
        const docList = doc.status === "fulfilled" ? doc.value : [];
        const tutList = tut.status === "fulfilled" ? tut.value : [];
        const usuList = usu.status === "fulfilled" ? usu.value : [];

        setStats({
          estudiantes: estList.length,
          docentes: docList.length,
          tutores: tutList.length,
          usuarios: usuList.length,
        });

        setRecentStudents(estList.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              Panel de Control Principal
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-indigo-200">
              {isMockMode ? "Modo Demostración Activo" : "Conectado al Servidor"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Bienvenido, {user?.nombre || user?.username}
          </h1>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Portal oficial de control académico y seguimiento escolar del Instituto Politécnico San Francisco de Asís (IPSFAS).
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-medium border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Roles activos:</span>
              {user?.roles?.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-mono border border-white/10 text-indigo-200">
              <Server className="w-3.5 h-3.5 text-indigo-300" />
              <span>{apiUrl}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Estudiantes Matriculados"
          value={isLoading ? "..." : stats.estudiantes}
          description="Alumnos registrados en sistema"
          icon={GraduationCap}
          trend="+Activos"
          color="indigo"
        />
        <StatCard
          title="Planta Docente"
          value={isLoading ? "..." : stats.docentes}
          description="Profesores registrados"
          icon={Briefcase}
          trend="Docencia"
          color="emerald"
        />
        <StatCard
          title="Tutores y Padres"
          value={isLoading ? "..." : stats.tutores}
          description="Padres o tutores legales"
          icon={Users2}
          trend="Familiares"
          color="purple"
        />
        <StatCard
          title="Usuarios del Sistema"
          value={isLoading ? "..." : stats.usuarios}
          description="Cuentas con credenciales"
          icon={UserCog}
          trend="Accesos"
          color="sky"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Students Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estudiantes Recientes</h2>
              <p className="text-xs text-slate-500">Últimos registros en el sistema académico</p>
            </div>
            {canAccess("estudiantes") && (
              <Link
                href="/dashboard/estudiantes"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 rounded-lg border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Estudiante</th>
                  <th className="py-2.5 px-3">Sexo</th>
                  <th className="py-2.5 px-3">Tutor Vinculado</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No hay estudiantes registrados aún.
                    </td>
                  </tr>
                ) : (
                  recentStudents.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => {
                        setSelectedEstudiante(st);
                        setIsPerfilOpen(true);
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      title="Clic para ver perfil completo"
                    >
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-blue-600 group-hover:underline">
                        {st.codigoUnico}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 group-hover:text-blue-600">
                        {st.nombre} {st.apellido}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">{st.sexo === "M" ? "Masc" : "Fem"}</td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        {st.tutorNombre || `Tutor #${st.tutorId}`}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={st.estado === "ACTIVO" ? "success" : "neutral"}>
                          {st.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Verification Checklist (1 col) */}
        <div className="space-y-6">
          {/* Quick Actions Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              {canAccess("estudiantes") && (
                <Link
                  href="/dashboard/estudiantes"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Registrar Nuevo Estudiante
                  </span>
                  <PlusCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Link>
              )}
              {canAccess("tutores") && (
                <Link
                  href="/dashboard/tutores"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Users2 className="w-4 h-4 text-emerald-600" />
                    Registrar Nuevo Tutor
                  </span>
                  <PlusCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Link>
              )}
              {canAccess("docentes") && (
                <Link
                  href="/dashboard/docentes"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    Registrar Nuevo Docente
                  </span>
                  <PlusCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Link>
              )}
              {canAccess("diagnostico") && (
                <Link
                  href="/dashboard/diagnostico"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    Estado y Conectividad del Sistema
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Link>
              )}
            </div>
          </div>

          {/* Institutional Information */}
          <div className="bg-[#0f223f] border border-[#1e3b68] rounded-2xl p-6 text-white shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
              Información del Ciclo Escolar
            </h3>
            <p className="text-[11px] text-blue-200/80 mb-4 leading-relaxed">
              Ciclo lectivo activo para el Instituto Politécnico San Francisco de Asís (IPSFAS):
            </p>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Año Lectivo:</span>
                <span className="font-bold text-white">2026</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Modalidad:</span>
                <span className="font-bold text-white">Regular y Técnica</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Estado de Matrícula:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Activa</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-blue-300">Turnos:</span>
                <span className="font-medium text-slate-300">Matutino / Vespertino</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Perfil Completo del Estudiante */}
      <PerfilEstudianteModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
        estudiante={selectedEstudiante}
        onUpdateEstudiante={(updated) => {
          setSelectedEstudiante(updated);
          setRecentStudents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        }}
      />
    </div>
  );
}
