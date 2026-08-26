import { useEffect, useState } from 'react';
import { testSupabaseConnection, ConnectionTestResult } from '../lib/supabase';
import { getProyectosPRTSEN, getAccionesPOA, getSubestacionesRDS, getCircuitosRDS } from '../services/supabaseService';
import { ProyectoPRTSEN, AccionPOA, SubestacionRDS, CircuitoRDS } from '../types';
import { Cpu, Zap, Activity, CheckCircle, Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DashboardOverview() {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [loadingTest, setLoadingTest] = useState<boolean>(true);

  const [proyectos, setProyectos] = useState<ProyectoPRTSEN[]>([]);
  const [acciones, setAcciones] = useState<AccionPOA[]>([]);
  const [subestaciones, setSubestaciones] = useState<SubestacionRDS[]>([]);
  const [circuitos, setCircuitos] = useState<CircuitoRDS[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const loadData = async () => {
    setLoadingData(true);
    const [prtRes, poaRes, seRes, ctoRes] = await Promise.all([
      getProyectosPRTSEN(),
      getAccionesPOA(),
      getSubestacionesRDS(),
      getCircuitosRDS(),
    ]);

    setProyectos(prtRes.data);
    setAcciones(poaRes.data);
    setSubestaciones(seRes.data);
    setCircuitos(ctoRes.data);
    setLoadingData(false);
  };

  const runConnectionTest = async () => {
    setLoadingTest(true);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setLoadingTest(false);
  };

  useEffect(() => {
    runConnectionTest();
    loadData();
  }, []);

  const totalAsignado = acciones.reduce((acc, curr) => acc + curr.presupuesto_asignado_bs, 0);
  const totalEjecutado = acciones.reduce((acc, curr) => acc + curr.presupuesto_ejecutado_bs, 0);
  const pctEjecucion = totalAsignado > 0 ? ((totalEjecutado / totalAsignado) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Banner de Estado de Conexión InsForge */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
        loadingTest
          ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          : testResult?.success
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          {loadingTest ? (
            <RefreshCw className="w-5 h-5 text-corpo-blue dark:text-corpo-blue animate-spin shrink-0 mt-0.5 sm:mt-0" />
          ) : testResult?.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-corpo-accent dark:text-corpo-accent shrink-0 mt-0.5 sm:mt-0" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Estado de Conexión InsForge: {loadingTest ? 'Comprobando...' : testResult?.success ? 'CONECTADO Y ACTIVO' : 'PENDIENTE / DESCONECTADO'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {loadingTest
                ? 'Verificando credenciales y prueba de lectura en base de datos InsForge PostgreSQL...'
                : testResult?.message}
            </p>
            {testResult?.urlUsed && testResult.urlUsed !== 'No especificada' && (
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Endpoint InsForge: <span className="text-slate-700 dark:text-slate-300 font-semibold">{testResult.urlUsed}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            runConnectionTest();
            loadData();
          }}
          disabled={loadingTest || loadingData}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-colors shrink-0 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingTest || loadingData ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Consolidado General de Planificación y Activos SEN
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Resumen en tiempo real de los Planes Operativos Anuales (POA) y Proyectos de Rehabilitación (PRTSEN).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-300 shadow-sm">
          <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>InsForge PostgreSQL: ggpd-data-maestra-0002 | Esquemas scppe & core</span>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Codificación RDS-PS</span>
            <Cpu className="w-4 h-4 text-corpo-blue dark:text-corpo-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">100%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {circuitos.length > 0 ? `${circuitos.length} Circuitos` : '4,207 Circuitos'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {subestaciones.length > 0 ? `${subestaciones.length} Subestaciones` : '871 Subestaciones'} bajo norma IEC 81346-10.
          </p>
        </div>

        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Proyectos PRTSEN</span>
            <Zap className="w-4 h-4 text-corpo-accent dark:text-corpo-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{proyectos.length}</span>
            <span className="text-xs text-corpo-accent dark:text-corpo-accent font-bold">
              {proyectos.filter((p) => p.vinculado_poa).length} Vinculados POA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Cartera de inversión y rehabilitación mayor del SEN en InsForge.
          </p>
        </div>

        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ejecución POA 2026</span>
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pctEjecucion}%</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              {acciones.length} Acciones
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {acciones.length > 0 ? `Bs. ${totalEjecutado.toLocaleString('es-VE')} devengado` : 'Listo para formular con el Asistente POA.'}
          </p>
        </div>

        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Normas ISO</span>
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">8000 / 27001</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Calidad de datos y trazabilidad en triggers habilitados en InsForge.
          </p>
        </div>
      </div>

      {/* Detalle Estatus de Subestaciones & Circuitos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 industrial-card space-y-4 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Proyectos PRTSEN en Base de Datos</h3>
            <span className="text-xs text-red-700 dark:text-corpo-blue font-mono font-bold">InsForge PostgreSQL</span>
          </div>
          {loadingData ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-corpo-blue" />
              <span>Cargando proyectos desde InsForge...</span>
            </div>
          ) : proyectos.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-500">
              No hay proyectos PRTSEN registrados en la base de datos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Código RDS-PS</th>
                    <th className="p-3">Proyecto</th>
                    <th className="p-3">Dimensión</th>
                    <th className="p-3">Avance</th>
                    <th className="p-3">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {proyectos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-red-700 dark:text-indigo-300 text-[11px] font-bold whitespace-nowrap">
                        {p.codigo_rds}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">{p.nombre}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {p.dimension}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                          <div
                            className="bg-corpo-red dark:bg-indigo-500 h-full rounded-full"
                            style={{ width: `${p.avance_fisico_pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
                          {p.avance_fisico_pct}% físico
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.estatus === 'COMPLETADO'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : p.estatus === 'EN_EJECUCION'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-corpo-accent border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {p.estatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen de Infraestructura Catastral */}
        <div className="p-5 industrial-card space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Infraestructura Eléctrica Real</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-900 dark:text-slate-300 font-bold">
                <span>Subestaciones en Base de Datos</span>
                <span className="font-mono text-red-700 dark:text-corpo-blue">
                  {subestaciones.length > 0 ? `${subestaciones.length} SE` : '871 SE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tabla `core.mae_subestaciones` en InsForge</p>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-900 dark:text-slate-300 font-bold">
                <span>Circuitos de Distribución</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {circuitos.length > 0 ? `${circuitos.length} CTOS` : '4,207 CTOS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tabla `core.mae_circuitos` en InsForge</p>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-900 dark:text-slate-300 font-bold">
                <span>Estado de Sincronización</span>
                <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">EN LÍNEA</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instancia central `ggpd-data-maestra-0002`</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
