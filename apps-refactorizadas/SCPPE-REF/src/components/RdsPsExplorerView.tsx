import { useEffect, useState } from 'react';
import { SubestacionRDS, CircuitoRDS } from '../types';
import { getSubestacionesRDS, getCircuitosRDS } from '../services/supabaseService';
import { Cpu, Search, RefreshCw, Info } from 'lucide-react';

export function RdsPsExplorerView() {
  const [subestaciones, setSubestaciones] = useState<SubestacionRDS[]>([]);
  const [circuitos, setCircuitos] = useState<CircuitoRDS[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);
  const [activeTab, setActiveTab] = useState<'subestaciones' | 'circuitos'>('subestaciones');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [subRes, ctRes] = await Promise.all([getSubestacionesRDS(), getCircuitosRDS()]);
    setSubestaciones(subRes.data);
    setCircuitos(ctRes.data);
    setIsFromSupabase(subRes.isFromSupabase || ctRes.isFromSupabase);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubestaciones = subestaciones.filter(
    (se) =>
      se.codigo_rds.toLowerCase().includes(searchTerm.toLowerCase()) ||
      se.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      se.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCircuitos = circuitos.filter(
    (ct) =>
      ct.codigo_rds.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ct.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ct.subestacion_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Codificación RDS-PS (Norma IEC 81346-10)
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo Supabase' : 'Vista Conectada'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Estandarización jerárquica de Subestaciones y Circuitos de Distribución CORPOELEC.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors self-start md:self-auto flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar desde Supabase</span>
        </button>
      </div>

      {/* Regla de Formato IEC 81346 */}
      <div className="p-4 industrial-card space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-red-700 dark:text-corpo-blue text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          Estructura de la Codificación Aprobada
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
            <span className="text-slate-600 dark:text-slate-400 block text-[10px] mb-1 font-bold">FORMATO SUBESTACIONES:</span>
            <span className="text-amber-800 dark:text-corpo-accent font-bold">=VE+&lt;ESTADO&gt;-&lt;NOMBRE&gt;</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mt-1">
              Ejemplo: <code className="text-red-700 dark:text-indigo-300 font-bold">=VE+TACHIRA-LA PEDRERA</code>
            </p>
          </div>
          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
            <span className="text-slate-600 dark:text-slate-400 block text-[10px] mb-1 font-bold">FORMATO CIRCUITOS:</span>
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">=VE+&lt;ESTADO&gt;-&lt;SUBESTACION&gt;:&lt;CIRCUITO&gt;</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mt-1">
              Ejemplo: <code className="text-emerald-700 dark:text-emerald-300 font-bold">=VE+MERIDA-VIGIA I:D-105 CANO TIGRE</code>
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Alternancia */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('subestaciones')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === 'subestaciones'
              ? 'bg-corpo-red dark:bg-corpo-blue text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Subestaciones ({subestaciones.length})
        </button>
        <button
          onClick={() => setActiveTab('circuitos')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === 'circuitos'
              ? 'bg-corpo-red dark:bg-corpo-blue text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Circuitos CT ({circuitos.length})
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código RDS-PS, subestación o circuito..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium shadow-sm"
        />
      </div>

      {/* Tabla de Resultados */}
      {activeTab === 'subestaciones' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3">Código RDS-PS</th>
                <th className="p-3">Nombre Subestación</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Origen Catastral</th>
                <th className="p-3">Circuitos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSubestaciones.map((se) => (
                <tr key={se.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-red-700 dark:text-corpo-blue text-xs">{se.codigo_rds}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{se.nombre}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{se.estado}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {se.origen}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{se.circuitos_count} ctos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3">Código RDS-PS Completo</th>
                <th className="p-3">Designador</th>
                <th className="p-3">Nombre Circuito</th>
                <th className="p-3">Subestación Padre</th>
                <th className="p-3">Nivel Voltaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCircuitos.map((ct) => (
                <tr key={ct.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">{ct.codigo_rds}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 dark:bg-indigo-950 text-red-700 dark:text-indigo-300 border border-red-200 dark:border-indigo-800">
                      {ct.designador}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{ct.nombre}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{ct.subestacion_nombre}</td>
                  <td className="p-3 font-mono font-bold text-amber-700 dark:text-corpo-accent">{ct.voltaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
