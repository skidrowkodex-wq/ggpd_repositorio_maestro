import re

with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/MinutarioSection.tsx", "r") as f:
    content = f.read()

# 1. Update Imports
content = content.replace("Eye, Lock, X } from 'lucide-react';", "Eye, Lock, X, Activity } from 'lucide-react';")

# 2. Insert Active Minutas KPI
kpi_block = """
      {/* KPI Minutas Activas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INITIAL_MINUTAS.slice(0, 4).map(min => (
          <div key={min.id} className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe]">{min.code}</span>
                <span className="flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  <Calendar className="h-3 w-3 mr-1" />
                  {min.date}
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">{min.title}</h4>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Tareas / Acuerdos:</span>
              <span className="text-xs font-black text-[#002b49] dark:text-[#00f2fe] bg-blue-50 dark:bg-[#00f2fe]/10 px-2 py-0.5 rounded-full">
                {(min.keyAgreements || min.agreements || []).length} items
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}"""

content = content.replace("      {/* Search & Filter Bar */}", kpi_block)


# 3. Insert Kanban Board
kanban_block = """      </div>

      {/* Kanban de Procesos (Lectura) */}
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Tablero Kanban de Flujo de Procesos</h3>
              <p className="text-xs text-slate-500 font-medium">Visualización de lectura sobre el estado de las tareas derivadas de minutas.</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Modo Lectura</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column 1 */}
          <div className="bg-slate-50 dark:bg-[#0a1526] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-inner">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Por Iniciar</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">2</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Planificación</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Inventario Poda (Zulia)</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">QA / Auditoría</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Emisión de Normativa ISO 8000</p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-inner">
            <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>En Progreso</span>
              <span className="bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">3</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-blue-500">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">Desarrollo</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Integración de Mapas Leaflet GIS</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: J. Pacheco</span><span className="text-blue-500">75%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Auditoría</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Control de Accesos SSO</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-purple-500">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Ingesta</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cruce de BD Activos de Red</p>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 shadow-inner">
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Validación QA</span>
              <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">1</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500">
                <div className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Urgente</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Despliegue Portal Unificado GGPD</p>
                <div className="mt-2 flex items-center justify-center space-x-1 text-[9px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 p-1 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Esperando 15 de Agosto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Completado</span>
              <span className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">3</span>
            </h4>
            <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Creación de Esquema BD (samc.activos_red)</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Módulo de Autenticación SSO</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Trazabilidad y Origen de Datos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minuta Detail Modal */}"""

content = content.replace("      </div>\n\n      {/* Minuta Detail Modal */}", kanban_block)


with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/MinutarioSection.tsx", "w") as f:
    f.write(content)

print("File successfully patched!")
