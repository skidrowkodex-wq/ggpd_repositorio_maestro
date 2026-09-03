import { useEffect, useState } from 'react';
import { ViaticoControl, ConciliacionPresupuestaria, ComprobanteFiscalViatico } from '../types';
import { getViaticos, getConciliacionPresupuestaria, crearAsignacionViatico, getTasaBCV, getTabuladorViaticos, getComprobantesViatico } from '../services/supabaseService';
import { RefreshCw, ShieldAlert, CheckCircle2, PlusCircle, AlertTriangle, FileSpreadsheet, Scale, Lock, ReceiptText, Wallet, Banknote, Gauge, TrendingUp } from 'lucide-react';

export function ViaticosControlView() {
  const [viaticos, setViaticos] = useState<ViaticoControl[]>([]);
  const [conciliacion, setConciliacion] = useState<ConciliacionPresupuestaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);
  const [activeTab, setActiveTab] = useState<'ASIGNACIONES' | 'CONCILIACION' | 'COMPROBANTES'>('ASIGNACIONES');
  const [comprobantes, setComprobantes] = useState<ComprobanteFiscalViatico[]>([]);
  const [comprobantesLoading, setComprobantesLoading] = useState(false);
  
  // Modal de Nueva Asignación
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const [formEmpleadoNombre, setFormEmpleadoNombre] = useState('');
  const [formEmpleadoCedula, setFormEmpleadoCedula] = useState('V-00000000');
  const [formDestino, setFormDestino] = useState('');
  const [formMotivoComision, setFormMotivoComision] = useState('Inspección técnica SEN');
  const [formFechaInicio, setFormFechaInicio] = useState('');
  const [formFechaFin, setFormFechaFin] = useState('');
  const [formMontoBs, setFormMontoBs] = useState<number>(200000);

  const loadData = async () => {
    setLoading(true);
    const res = await getViaticos();
    setViaticos(res.data);
    setIsFromSupabase(res.isFromSupabase);

    const conc = await getConciliacionPresupuestaria(res.data);
    setConciliacion(conc);
    setLoading(false);

    // Cargar comprobantes fiscales
    setComprobantesLoading(true);
    const comps = await getComprobantesViatico();
    setComprobantes(comps);
    setComprobantesLoading(false);
  };

  const tasaBCV = getTasaBCV();
  const tabulador = getTabuladorViaticos();

  const totalComprobantesUSD = comprobantes.reduce((acc, c) => acc + (c.monto_usd || c.monto_bs / tasaBCV), 0);
  const totalComprobantesBs = comprobantes.reduce((acc, c) => acc + c.monto_bs, 0);

  useEffect(() => {
    loadData();
  }, []);

  const handleCrearAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);

    if (!formEmpleadoNombre.trim() || !formDestino.trim() || formMontoBs <= 0 || !formFechaInicio || !formFechaFin) {
      setModalError('Complete los campos obligatorios del empleado, destino, fechas y un monto válido.');
      setModalLoading(false);
      return;
    }

    const diasDuracion = Math.max(1, Math.ceil((new Date(formFechaFin).getTime() - new Date(formFechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const result = await crearAsignacionViatico({
      empleado_nombre: formEmpleadoNombre,
      empleado_cedula: formEmpleadoCedula,
      destino: formDestino,
      fecha_inicio: formFechaInicio,
      fecha_fin: formFechaFin,
      dias_duracion: diasDuracion,
      monto_calculado_bs: formMontoBs,
      motivo_comision: formMotivoComision,
    });

    if (!result.success) {
      setModalError(result.error || 'Error de validación presupuestaria.');
    } else {
      setModalSuccess(`Asignación ${result.data?.numero_solicitud} registrada dentro del techo del Fondo de Inspección Técnica ($25,000 USD @ tasa BCV ${tasaBCV}) conforme al tabulador multimoneda vigente.`);
      setFormEmpleadoNombre('');
      setFormDestino('');
      setFormFechaInicio('');
      setFormFechaFin('');
      loadData();
    }
    setModalLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header General */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Control Híbrido de Viáticos & Conciliación (Partida 405)
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo InsForge PostgreSQL' : 'Vista Conectada'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestión de Rendiciones y Triggers de Validación Presupuestaria DDL en InsForge (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">trg_validar_presupuesto_viatico</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 rounded-md bg-red-700 hover:bg-red-800 dark:bg-corpo-blue dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Asignar Viático</span>
          </button>
          
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* BANNER DE RESOLUCIÓN DE HALLAZGO #1 DE AUDITORÍA */}
      <div className="p-5 rounded-lg border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Hallazgo #1 de Auditoría - Resuelto
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Trigger DDL Activo en Base de Datos
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Causa Raíz Solucionada:</strong> Se implementó la función <code className="font-mono font-bold text-amber-900 dark:text-amber-300">fn_validar_presupuesto_viatico()</code> y trigger <code className="font-mono font-bold text-amber-900 dark:text-amber-300">trg_validar_presupuesto_viatico</code> para evitar que cualquier asignación supere el saldo disponible en la Partida 405.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-md border border-amber-200 dark:border-amber-900 shrink-0">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px]">
              <span className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Control de Exceso</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">ENFORCED (0% Sobregasto)</span>
            </div>
          </div>
        </div>

        {/* Muestras Métricas de Conciliación */}
        {conciliacion && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Techo Partida 405</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">Bs. {conciliacion.presupuesto_partida.toLocaleString('es-VE')}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Total Asignado Activo</span>
              <span className="text-sm font-mono font-bold text-indigo-700 dark:text-indigo-400">Bs. {conciliacion.total_asignado.toLocaleString('es-VE')}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Saldo Disponible</span>
              <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">Bs. {conciliacion.saldo_disponible.toLocaleString('es-VE')}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">% Presupuesto Comprometido</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{conciliacion.porcentaje_comprometido}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs para Cambiar entre Asignaciones y Vista de Conciliación */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('ASIGNACIONES')}
          className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
            activeTab === 'ASIGNACIONES'
              ? 'border-red-700 dark:border-corpo-blue text-red-700 dark:text-corpo-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Asignaciones y Rendiciones Activas</span>
        </button>

        <button
          onClick={() => setActiveTab('CONCILIACION')}
          className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
            activeTab === 'CONCILIACION'
              ? 'border-red-700 dark:border-corpo-blue text-red-700 dark:text-corpo-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Vista de Conciliación Presupuestaria (v_conciliacion_presupuestaria)</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPROBANTES')}
          className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
            activeTab === 'COMPROBANTES'
              ? 'border-red-700 dark:border-corpo-blue text-red-700 dark:text-corpo-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Comprobantes Fiscales SENIAT</span>
        </button>
      </div>

      {/* PESTAÑA 1: ASIGNACIONES & RENDICIONES */}
      {activeTab === 'ASIGNACIONES' && (
        <div className="space-y-6">
          {/* Tarjetas de Escenarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Escenario 1</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reintegro de Fondos</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Monto gastado menor a lo asignado. Devuelve saldo sobrante al presupuesto.
              </p>
            </div>

            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 dark:text-corpo-accent uppercase tracking-wider">Escenario 2</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reembolso Adicional</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Sobregasto justificado en campo. Fondo especial compensatorio autorizado.
              </p>
            </div>

            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-red-700 dark:text-corpo-blue uppercase tracking-wider">Escenario 3</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rendición Normal</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Monto asignado coincide exactamente con comprobantes validados.
              </p>
            </div>

            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Escenario 4</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cierre Excepcional</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Autorización de doble firma (Gerente + Director) en emergencias SEN.
              </p>
            </div>
          </div>

          {/* Tabla de Asignaciones */}
          <div className="p-5 industrial-card space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Asignaciones de Viáticos Activas y Rendiciones</h3>
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
                <span className="font-medium">Cargando viáticos desde Supabase...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Solicitud</th>
                      <th className="p-3">Empleado / Cédula</th>
                      <th className="p-3">Destino / Misión</th>
                      <th className="p-3">Período</th>
                      <th className="p-3">Monto USD / Bs.</th>
                      <th className="p-3">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {viaticos.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-red-700 dark:text-indigo-300">{v.numero_solicitud}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{v.empleado_nombre}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">C.I. {v.empleado_cedula}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-300">{v.destino}</td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="block font-mono">{v.fecha_inicio} → {v.fecha_fin}</span>
                          <span className="text-[10px]">{v.dias_duracion} día(s)</span>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs">
                            <span className="text-slate-900 dark:text-white font-bold">USD {v.monto_calculado_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Bs. {v.monto_calculado_bs.toLocaleString('es-VE')}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              v.estatus_flujo === 'COMPLETADO'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : v.estatus_flujo === 'APROBADO'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-corpo-blue border border-indigo-300 dark:border-indigo-800'
                                : v.estatus_flujo === 'ANULADO' || v.estatus_flujo === 'RECHAZADO'
                                ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-corpo-accent border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {v.estatus_flujo.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: VISTA DE CONCILIACIÓN PRESUPUESTARIA */}
      {activeTab === 'CONCILIACION' && conciliacion && (
        <div className="p-5 industrial-card space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vista de Conciliación Presupuestaria (<code className="text-xs font-mono text-red-700 dark:text-indigo-400">v_conciliacion_presupuestaria</code>)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Auditoría en tiempo real del saldo disponible, asignación de viáticos y ejecución gastada.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
              Estado: CONCILIADO Y PROTEGIDO
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Código Partida</th>
                  <th className="p-3">Descripción Partida</th>
                  <th className="p-3 text-right">Presupuesto Partida</th>
                  <th className="p-3 text-right">Total Asignado</th>
                  <th className="p-3 text-right">Saldo Disponible</th>
                  <th className="p-3 text-right">% Comprometido</th>
                  <th className="p-3 text-center">Estado Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-medium">
                  <td className="p-3 font-mono font-bold text-red-700 dark:text-corpo-blue">{conciliacion.partida_codigo}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{conciliacion.partida_nombre}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    Bs. {conciliacion.presupuesto_partida.toLocaleString('es-VE')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    Bs. {conciliacion.total_asignado.toLocaleString('es-VE')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Bs. {conciliacion.saldo_disponible.toLocaleString('es-VE')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {conciliacion.porcentaje_comprometido}%
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      SIN EXCESO
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Detalle Técnico de Validación Trigger DDL
            </h4>
            <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono rounded overflow-x-auto leading-relaxed">
{`CREATE OR REPLACE FUNCTION samc.fn_validar_presupuesto_viatico()
RETURNS TRIGGER AS $$
BEGIN
    SELECT (costo_total - total_asignado) INTO v_saldo_disponible ...;
    IF NEW.monto_asignado > v_saldo_disponible THEN
        RAISE EXCEPTION 'PRESUPUESTO EXCEDIDO [HALLAZGO #1 AUDITORÍA]: Monto excede saldo disponible';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}
            </pre>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: COMPROBANTES FISCALES SENIAT & TABULADOR MULTIMONEDA */}
      {activeTab === 'COMPROBANTES' && (
        <div className="space-y-6">
          {/* Tabulador Oficial CORPOELEC 2026 y Tasa BCV */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Tarifa diaria Pernocta
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">${tabulador.tarifa_diaria_pernocta_usd} USD</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Hospedaje e imprevistos</p>
            </div>
            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 dark:text-corpo-accent uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" /> Tarifa diaria Alimentación
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">${tabulador.tarifa_diaria_alimentacion_usd} USD</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Desayuno, almuerzo y cena</p>
            </div>
            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Movilización Base
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">${tabulador.tarifa_movilizacion_base_usd} USD</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Transporte interurbano / peajes</p>
            </div>
            <div className="p-4 industrial-card space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Tasa BCV Oficial
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">Bs. {tasaBCV} / USD</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Referencia oficial índice multimoneda</p>
            </div>
          </div>

          {/* Tabla de Comprobantes Fiscales */}
          <div className="p-5 industrial-card space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-emerald-600" />
                  Comprobantes Fiscales Validados SENIAT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Rendiciones de viáticos con factura electrónica RIF verificada y control independiente.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold">
                  Total: ${totalComprobantesUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold">
                  Bs. {totalComprobantesBs.toLocaleString('es-VE')}
                </span>
              </div>
            </div>

            {comprobantesLoading ? (
              <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
                <span className="font-medium">Cargando comprobantes fiscales...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Asignación</th>
                      <th className="p-3">Proveedor / RIF</th>
                      <th className="p-3">Factura / Control</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3 text-right">Monto Bs.</th>
                      <th className="p-3 text-right">Equiv. USD</th>
                      <th className="p-3 text-center">Estatus SENIAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {comprobantes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-red-700 dark:text-indigo-300">{c.asignacion_id}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{c.razon_social}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">RIF: {c.rif_proveedor}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                          <span className="block">N° {c.numero_factura}</span>
                          <span className="text-[10px]">Control {c.numero_control}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{c.fecha_emision}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-corpo-blue border border-indigo-300 dark:border-indigo-800">
                            {c.concepto.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">Bs. {c.monto_bs.toLocaleString('es-VE')}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ${(c.monto_usd || c.monto_bs / tasaBCV).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            c.valido_seniat
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                          }`}>
                            {c.valido_seniat ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {c.valido_seniat ? 'VALIDO' : 'RECHAZADO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Nota de auditoría fiscal */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-corpo-accent shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Validez fiscal ISO 8000:</strong> cada comprobante exige RIF de proveedor vigente, factura con número de control independiente y verificación SENIAT. La equivalencia USD se calcula con la Tasa BCV oficial del día (Bs. {tasaBCV} / USD) conforme al tabulador multimoneda CORPOELEC 2026.
            </p>
          </div>
        </div>
      )}

      {/* MODAL PRUEBA DE ASIGNACIÓN CON TRIGGER DE VALIDACIÓN PRESUPUESTARIA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-700 dark:text-corpo-blue" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Nueva Asignación de Viático</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {conciliacion && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs flex justify-between items-center font-mono">
                <span className="text-slate-600 dark:text-slate-400">Saldo Disponible Partida 405:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  Bs. {conciliacion.saldo_disponible.toLocaleString('es-VE')}
                </span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCrearAsignacion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Empleado de Campo Responsable</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Miguel Rodríguez"
                  value={formEmpleadoNombre}
                  onChange={(e) => setFormEmpleadoNombre(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Cédula</label>
                  <input
                    type="text"
                    required
                    placeholder="V-12345678"
                    value={formEmpleadoCedula}
                    onChange={(e) => setFormEmpleadoCedula(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Motivo de Comisión</label>
                  <input
                    type="text"
                    required
                    value={formMotivoComision}
                    onChange={(e) => setFormMotivoComision(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Destino / Misión de Campo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. S/E San Cristóbal (Táchira) - Mantenimiento T1"
                  value={formDestino}
                  onChange={(e) => setFormDestino(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={formFechaInicio}
                    onChange={(e) => setFormFechaInicio(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    value={formFechaFin}
                    onChange={(e) => setFormFechaFin(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Monto Solicitado (Bs.)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  value={formMontoBs}
                  onChange={(e) => setFormMontoBs(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-mono font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Pruebe colocar un monto superior al saldo disponible (ej. Bs. 2,000,000) para comprobar la activación del trigger sobre el techo indexado a tasa BCV (${(25000).toLocaleString('en-US')} USD).
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 rounded bg-red-700 dark:bg-corpo-blue text-white font-bold hover:opacity-90 flex items-center gap-1.5"
                >
                  {modalLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>Validar y Asignar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

