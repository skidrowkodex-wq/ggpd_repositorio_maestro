import React, { useState } from 'react';
import { CorrespondenciaRecord, OficioRespuesta, EstadoFirma } from '../types';
import { useAuth } from '../lib/authContext';
import { 
  FileCheck2, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Printer, 
  Truck, 
  Download,
  Building, 
  User, 
  Calendar,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface SignatureDispatchHubProps {
  records: CorrespondenciaRecord[];
  onOpenDraftModal: (record: CorrespondenciaRecord) => void;
  onUpdateOficioState: (recordId: string, newState: EstadoFirma, metadata?: { nroGuia?: string; receptor?: string; obs?: string }) => void;
  onSelectRecordForBriefing: (record: CorrespondenciaRecord) => void;
}

export const SignatureDispatchHub: React.FC<SignatureDispatchHubProps> = ({
  records,
  onOpenDraftModal,
  onUpdateOficioState,
  onSelectRecordForBriefing
}) => {
  const { user } = useAuth();
  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state for dispatch confirmation
  const [dispatchTarget, setDispatchTarget] = useState<CorrespondenciaRecord | null>(null);
  const [nroGuia, setNroGuia] = useState('');
  const [receptor, setReceptor] = useState('');
  const [observacionesDespacho, setObservacionesDespacho] = useState('');

  // Modal state for revision comments
  const [reviewTarget, setReviewTarget] = useState<CorrespondenciaRecord | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  // Filter records that have an oficio draft or require response
  const responseRecords = records.filter(r => r.oficioRespuestaDetalle || r.requiereRespuesta);

  const filteredRecords = responseRecords.filter(r => {
    const oficio = r.oficioRespuestaDetalle;
    const currentState = oficio?.estadoFirma || (r.requiereRespuesta && !oficio ? 'BORRADOR_REVISION' : 'ALL');

    if (filterState !== 'ALL') {
      if (filterState === 'SIN_BORRADOR' && oficio) return false;
      if (filterState === 'SIN_BORRADOR' && !oficio) return true;
      if (oficio?.estadoFirma !== filterState) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCorrelativo = r.correlativo.toLowerCase().includes(q);
      const matchOficio = oficio?.numeroOficio.toLowerCase().includes(q);
      const matchDestinatario = (oficio?.destinatarioInstitucion || r.remitenteInstitucion).toLowerCase().includes(q);
      const matchAsunto = r.asunto.toLowerCase().includes(q);
      return matchCorrelativo || matchOficio || matchDestinatario || matchAsunto;
    }

    return true;
  });

  // KPI Calculations
  const countPendienteFirma = records.filter(r => r.oficioRespuestaDetalle?.estadoFirma === 'PENDIENTE_FIRMA').length;
  const countFirmados = records.filter(r => r.oficioRespuestaDetalle?.estadoFirma === 'FIRMADO_FISICO').length;
  const countDespachados = records.filter(r => r.oficioRespuestaDetalle?.estadoFirma === 'DESPACHADO_CON_ACUSE').length;
  const countBorradores = records.filter(r => !r.oficioRespuestaDetalle || r.oficioRespuestaDetalle.estadoFirma === 'BORRADOR_REVISION').length;

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTarget) return;
    onUpdateOficioState(dispatchTarget.id, 'DESPACHADO_CON_ACUSE', {
      nroGuia: nroGuia || `GUIA-DESP-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      receptor: receptor || 'Despacho Receptor',
      obs: observacionesDespacho
    });
    setDispatchTarget(null);
    setNroGuia('');
    setReceptor('');
    setObservacionesDespacho('');
  };

  const handleSendCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    onUpdateOficioState(reviewTarget.id, 'EN_CORRECCION', {
      obs: reviewComments
    });
    setReviewTarget(null);
    setReviewComments('');
  };

  const getStatusBadge = (estado?: EstadoFirma) => {
    switch (estado) {
      case 'PENDIENTE_FIRMA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
            <Clock className="w-3 h-3" />
            Pendiente Firma Gerencial
          </span>
        );
      case 'FIRMADO_FISICO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            <FileCheck2 className="w-3 h-3" />
            Firmado • Listo p/ Despacho
          </span>
        );
      case 'DESPACHADO_CON_ACUSE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Despachado con Acuse
          </span>
        );
      case 'EN_CORRECCION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-700">
            <RotateCcw className="w-3 h-3" />
            En Corrección / Observado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3 h-3" />
            Borrador en Elaboración
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-2xl p-6 text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200 uppercase tracking-wider">
                Fase 2 • Despacho Gerencial GGPD
              </span>
              <span className="text-xs text-purple-300 font-medium">
                ISO 15489 • ISO 27001 • COBIT 2019
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              Bandeja de Firmas & Control de Despacho
            </h1>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl">
              Circuito de revisión, suscripción oficial por el Gerente General (<strong>Ing. Adrián Correa</strong>) y registro inmutable de acuses de recibo en el Data Lake.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-purple-950/80 p-2.5 rounded-xl border border-purple-700/50 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Firma Digital & Física Validada</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterState('PENDIENTE_FIRMA')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterState === 'PENDIENTE_FIRMA'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-white dark:bg-[#072146] border-slate-200 dark:border-purple-950/60 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
            <span>Pendientes de Firma</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-2">
            {countPendienteFirma}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            En despacho del Gerente General
          </p>
        </div>

        <div 
          onClick={() => setFilterState('FIRMADO_FISICO')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterState === 'FIRMADO_FISICO'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-md'
              : 'bg-white dark:bg-[#072146] border-slate-200 dark:border-purple-950/60 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
            <span>Listos p/ Despacho</span>
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-2">
            {countFirmados}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Firmados esperando envío / mensajería
          </p>
        </div>

        <div 
          onClick={() => setFilterState('DESPACHADO_CON_ACUSE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterState === 'DESPACHADO_CON_ACUSE'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-white dark:bg-[#072146] border-slate-200 dark:border-purple-950/60 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>Despachados con Acuse</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-2">
            {countDespachados}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Con acuse oficial y cierre de SLA
          </p>
        </div>

        <div 
          onClick={() => setFilterState('BORRADOR_REVISION')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterState === 'BORRADOR_REVISION'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 shadow-md'
              : 'bg-white dark:bg-[#072146] border-slate-200 dark:border-purple-950/60 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Borradores en Curso</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {countBorradores}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            En redacción técnica por analistas
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#072146] p-4 rounded-xl shadow-md border border-slate-200 dark:border-purple-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por N° oficio, remitente o asunto..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* State Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'PENDIENTE_FIRMA', label: 'Pendiente Firma' },
            { id: 'FIRMADO_FISICO', label: 'Firmados' },
            { id: 'DESPACHADO_CON_ACUSE', label: 'Despachados' },
            { id: 'BORRADOR_REVISION', label: 'Borradores' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterState(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterState === st.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-950'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards of Responses / Dispatch */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-[#072146] p-12 rounded-2xl border border-slate-200 dark:border-purple-950/60 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No se encontraron oficios con los filtros seleccionados
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Seleccione otro filtro o redacte una nueva respuesta desde el Libro de Radicación.
            </p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const oficio = r.oficioRespuestaDetalle;

            return (
              <div 
                key={r.id}
                className="bg-white dark:bg-[#072146] rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-purple-950/60 hover:border-purple-400 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-900/40 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 rounded border border-purple-300 dark:border-purple-800">
                      {r.correlativo}
                    </span>
                    {oficio && (
                      <span className="font-mono text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-800">
                        {oficio.numeroOficio}
                      </span>
                    )}
                    {getStatusBadge(oficio?.estadoFirma)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectRecordForBriefing(r)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ficha 360°</span>
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Entrada Origen */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      1. Documento Entrada
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {r.numeroDocumentoOrigen}
                    </div>
                    <div className="text-slate-500 truncate">
                      {r.remitenteInstitucion}
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 italic pt-1">
                      "{r.asunto}"
                    </div>
                  </div>

                  {/* Col 2: Oficio Respuesta Salida */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      2. Oficio de Salida Formal
                    </div>
                    {oficio ? (
                      <>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {oficio.numeroOficio}
                        </div>
                        <div className="text-slate-500">
                          Destino: {oficio.destinatarioNombre} ({oficio.destinatarioInstitucion})
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Firmante: <strong>{oficio.firmanteNombre}</strong>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic py-2">
                        Borrador pendiente de redacción técnica.
                      </div>
                    )}
                  </div>

                  {/* Col 3: Despacho & Acuse */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      3. Trazabilidad de Despacho
                    </div>
                    {oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE' ? (
                      <>
                        <div className="font-bold text-emerald-700 dark:text-emerald-300">
                          N° Guía: {oficio.nroGuiaAcuse || 'N/A'}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          Receptor: {oficio.receptorAcuseNombre || 'Despacho'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Fecha Despacho: {oficio.fechaDespacho || r.updatedAt.split('T')[0]}
                        </div>
                      </>
                    ) : oficio?.estadoFirma === 'FIRMADO_FISICO' ? (
                      <div className="text-purple-700 dark:text-purple-300 font-semibold py-2">
                        ✓ Documento firmado por {oficio.firmanteNombre}. Listo para entregar.
                      </div>
                    ) : (
                      <div className="text-slate-400 italic py-2">
                        En espera de firma y emisión de acuse.
                      </div>
                    )}
                  </div>
                </div>

                {/* Revision Comments Alert if present */}
                {oficio?.observacionesRevision && oficio.estadoFirma === 'EN_CORRECCION' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Observaciones del Gerente:</strong> {oficio.observacionesRevision}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {oficio ? `Redactado por: ${oficio.redactadoPor}` : 'Requiere elaboración'}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Redactar / Editar */}
                    <button
                      onClick={() => onOpenDraftModal(r)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{oficio ? 'Editar Oficio' : 'Redactar Respuesta'}</span>
                    </button>

                    {/* Acciones de Firma Gerencial */}
                    {oficio && oficio.estadoFirma === 'PENDIENTE_FIRMA' && (
                      <>
                        <button
                          onClick={() => {
                            setReviewTarget(r);
                            setReviewComments('');
                          }}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold transition-all"
                        >
                          Devolver con Observación
                        </button>

                        <button
                          onClick={() => onUpdateOficioState(r.id, 'FIRMADO_FISICO')}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Aprobar & Firmar Oficialmente</span>
                        </button>
                      </>
                    )}

                    {/* Acción de Registro de Despacho */}
                    {oficio && oficio.estadoFirma === 'FIRMADO_FISICO' && (
                      <button
                        onClick={() => {
                          setDispatchTarget(r);
                          setNroGuia(`GUIA-DESP-2026-${Math.floor(Math.random() * 9000 + 1000)}`);
                          setReceptor(oficio.destinatarioNombre);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Registrar Despacho & Acuse</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Confirmar Despacho y Acuse */}
      {dispatchTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#072146] w-full max-w-lg rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <h3 className="text-sm font-bold">Registrar Despacho Oficial & Acuse de Recibo</h3>
              </div>
              <button onClick={() => setDispatchTarget(null)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <strong>Oficio Salida:</strong> {dispatchTarget.oficioRespuestaDetalle?.numeroOficio}
                <br />
                <strong>Destinatario:</strong> {dispatchTarget.oficioRespuestaDetalle?.destinatarioInstitucion}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Número de Guía / Correlativo de Entrega
                </label>
                <input
                  type="text"
                  required
                  value={nroGuia}
                  onChange={(e) => setNroGuia(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  placeholder="GUIA-DESP-2026-XXXX"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Funcionario / Unidad que Recibe (Sello de Acuse)
                </label>
                <input
                  type="text"
                  required
                  value={receptor}
                  onChange={(e) => setReceptor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  placeholder="Nombre de la persona o receptoría que firma y sella"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Observaciones de Entrega
                </label>
                <textarea
                  rows={2}
                  value={observacionesDespacho}
                  onChange={(e) => setObservacionesDespacho(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  placeholder="Entregado en físico con copia sellada / remitido por valija oficial"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchTarget(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirmar Despacho & Cerrar SLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Observaciones de Devolución */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#072146] w-full max-w-lg rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/60 overflow-hidden">
            <div className="bg-gradient-to-r from-red-700 to-rose-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold">Devolver Oficio con Observaciones</h3>
              </div>
              <button onClick={() => setReviewTarget(null)} className="text-red-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCorrection} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Indique los ajustes o precisiones técnicas que el analista debe realizar en el borrador antes de su firma oficial.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Observaciones / Correcciones Requeridas
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  placeholder="Ej: Ajustar el segundo párrafo para precisar la capacidad del transformador y añadir la fecha del dictamen de planta..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-600/20"
                >
                  Enviar a Corrección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
