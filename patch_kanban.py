import re

with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/MinutarioSection.tsx", "r") as f:
    content = f.read()

new_kanban = """        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column 1 */}
          <div className="bg-slate-50 dark:bg-[#0a1526] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-inner">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Por Iniciar</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">4</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between"><span>Planificación</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Inventario Poda (Zulia)</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>QA / Auditoría</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Emisión de Normativa ISO 8000</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex justify-between"><span>Mantenimiento</span><span className="text-[8px] text-slate-400">DCA-003</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión T1 y T2 Subestaciones Blindadas</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-[#00f2fe] mb-1 flex justify-between"><span>Operaciones</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Corte Programado y Reemplazo SF6</p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-inner">
            <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>En Progreso</span>
              <span className="bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">5</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-blue-500">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex justify-between"><span>Desarrollo</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Integración de Mapas Leaflet GIS</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: J. Pacheco</span><span className="text-blue-500">75%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between"><span>Auditoría</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Control de Accesos SSO</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: QA Team</span><span className="text-amber-500">40%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-purple-500">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1 flex justify-between"><span>Ingesta</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cruce de BD Activos de Red</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: Data Eng.</span><span className="text-purple-500">90%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>Sensores</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Despliegue sensor inteligente CT Maracaibo</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>Gobernanza</span><span className="text-[8px] text-slate-400">DCA-003</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Digitalización firmas Minutas 69kV</p>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 shadow-inner">
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Validación QA</span>
              <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">3</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500">
                <div className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1 flex justify-between uppercase tracking-wide"><span>Urgente</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Despliegue Portal Unificado GGPD</p>
                <div className="mt-2 flex items-center justify-center space-x-1 text-[9px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 p-1 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Esperando 15 de Agosto</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between uppercase tracking-wide"><span>Revisión</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Matriz Contingencia Zulia/Falcón</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between uppercase tracking-wide"><span>Revisión</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Reporte Nube SIGI Automatizado</p>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Completado</span>
              <span className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">5</span>
            </h4>
            <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Prohibición de reportes WhatsApp</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">NAC-001</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Sincronización Inventario SCTIS</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">NAC-001</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Creación de Esquema BD (samc.activos_red)</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Módulo de Autenticación SSO</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Trazabilidad y Origen de Datos</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
            </div>
          </div>
        </div>"""

content = re.sub(r'        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">.*?        </div>\n      </div>', new_kanban + '\n      </div>', content, flags=re.DOTALL)

with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/MinutarioSection.tsx", "w") as f:
    f.write(content)

print("Kanban updated successfully!")
