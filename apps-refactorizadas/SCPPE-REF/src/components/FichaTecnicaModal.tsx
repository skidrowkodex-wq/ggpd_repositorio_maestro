import React, { useState } from 'react';
import { ProyectoPRTSEN } from '../types';
import { updateProyectoPRTSEN } from '../services/supabaseService';
import {
  Printer,
  Edit3,
  CheckCircle2,
  X,
  Zap,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  Activity,
  ShieldCheck,
  FileText,
  Clock,
  Users,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface FichaTecnicaModalProps {
  proyecto: ProyectoPRTSEN;
  onClose: () => void;
  onUpdated: () => void;
}

export function FichaTecnicaModal({ proyecto, onClose, onUpdated }: FichaTecnicaModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const aniosDesembolso = ['2025', '2026', '2027', '2028', '2029', '2030', '2031'];

  // Inicializar desembolsos preexistentes o por defecto
  const initDesembolsos: Record<string, number> = {};
  aniosDesembolso.forEach(yr => {
    initDesembolsos[yr] = proyecto.desembolsos_plurianual?.[yr] ?? (yr === '2026' ? (proyecto.monto_usd || 0) : 0);
  });

  // Estados de Edición
  const [editData, setEditData] = useState({
    nombre: proyecto.nombre || '',
    situacion_actual: proyecto.situacion_actual || '',
    alcance: proyecto.alcance || '',
    impacto_sen: proyecto.impacto_sen || '',
    municipio: proyecto.municipio || '',
    direccion: proyecto.direccion || '',
    nivel_tension_kv: proyecto.nivel_tension_kv || '',
    tiempo_ejecucion_meses: proyecto.tiempo_ejecucion_meses || 6,
    capacidad_o_km: proyecto.capacidad_o_km || '',
    unidad_capacidad: proyecto.unidad_capacidad || 'KM',
    familias_beneficiadas: proyecto.familias_beneficiadas || '',
    observaciones: proyecto.observaciones || '',
    avance_fisico_pct: proyecto.avance_fisico_pct || 0,
    monto_usd: proyecto.monto_usd || 0,
    desembolsos: initDesembolsos,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDesembolsoChange = (yr: string, val: number) => {
    setEditData(prev => ({
      ...prev,
      desembolsos: {
        ...prev.desembolsos,
        [yr]: val
      }
    }));
  };

  const asignar100a2026 = () => {
    const total = Number(editData.monto_usd) || 0;
    const nuevo: Record<string, number> = {};
    aniosDesembolso.forEach(yr => {
      nuevo[yr] = yr === '2026' ? total : 0;
    });
    setEditData(prev => ({ ...prev, desembolsos: nuevo }));
  };

  const dividir5050 = () => {
    const total = Number(editData.monto_usd) || 0;
    const mitad = Math.round((total / 2) * 100) / 100;
    const nuevo: Record<string, number> = {};
    aniosDesembolso.forEach(yr => {
      if (yr === '2026') nuevo[yr] = mitad;
      else if (yr === '2027') nuevo[yr] = total - mitad;
      else nuevo[yr] = 0;
    });
    setEditData(prev => ({ ...prev, desembolsos: nuevo }));
  };

  const totalDesembolsosEdit = aniosDesembolso.reduce((acc, yr) => acc + (Number(editData.desembolsos[yr]) || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProyectoPRTSEN(proyecto.id, {
      nombre: editData.nombre,
      situacion_actual: editData.situacion_actual,
      alcance: editData.alcance,
      impacto_sen: editData.impacto_sen,
      municipio: editData.municipio,
      direccion: editData.direccion,
      nivel_tension_kv: editData.nivel_tension_kv,
      tiempo_ejecucion_meses: Number(editData.tiempo_ejecucion_meses),
      capacidad_o_km: editData.capacidad_o_km,
      unidad_capacidad: editData.unidad_capacidad,
      familias_beneficiadas: editData.familias_beneficiadas,
      observaciones: editData.observaciones,
      avance_fisico_pct: Number(editData.avance_fisico_pct),
      monto_usd: Number(editData.monto_usd),
      desembolsos_plurianual: editData.desembolsos,
    });

    if (res.success) {
      setIsEditing(false);
      onUpdated();
    } else {
      alert('Error guardando ficha técnica en InsForge: ' + (res.error || 'Error desconocido'));
    }
    setSaving(false);
  };

  const desembolsos = proyecto.desembolsos_plurianual || {};

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:z-0">
      {/* Contenedor de la Ficha Técnica */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[94vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none print:overflow-visible">
        
        {/* Barra Superior de Herramientas (Oculta en Impresión) */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-red-100 dark:bg-red-950/80 text-corpo-red dark:text-red-400 font-mono font-bold text-xs">
              {proyecto.codigo_rds}
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Ficha Técnica Oficial del Proyecto (PRTSEN SEN)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Imprimir o Exportar en PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Ficha & Cronograma</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancelar Edición
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FORMATO IMPRIMIBLE / VISOR DE FICHA TÉCNICA OFICIAL                       */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 dark:text-slate-200 print:text-black print:p-0">
          
          {/* Membrete Institucional Oficial CORPOELEC */}
          <div className="border-b-2 border-corpo-red pb-4 space-y-1 text-center">
            <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 print:text-slate-700">
              República Bolivariana de Venezuela · Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)
            </div>
            <div className="text-sm sm:text-base font-extrabold text-corpo-red print:text-black">
              CORPORACIÓN ELÉCTRICA NACIONAL (CORPOELEC)
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">
              Gerencia General de Planificación de Distribución (GGPD) — Plan PRTSEN 2026-2031
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 print:border-black">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CERTIFICACIÓN DE GRADO INDUSTRIAL SEN · ISO 55000 / ISO 8000 / ISO 27001</span>
            </div>
          </div>

          {/* Bloque de Identificación y Estatus */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Código RDS-PS</span>
              <span className="font-mono font-extrabold text-xs sm:text-sm text-corpo-red">
                {proyecto.codigo_rds}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Código SIPES</span>
              <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-400">
                {proyecto.codigo_sipes || 'SIPES-ACC-2026-04-PRTSEN'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Dimensión / Tipo</span>
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                {proyecto.dimension}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Estatus / Fase</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                proyecto.estatus === 'COMPLETADO'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : proyecto.estatus === 'EN_EJECUCION'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : proyecto.estatus === 'PARALIZADO'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {proyecto.estatus} ({proyecto.situacion_actual || 'EN PLANIFICACIÓN'})
              </span>
            </div>
          </div>

          {/* Nombre del Proyecto */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Nombre Oficial del Proyecto
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {proyecto.nombre}
            </h2>
          </div>

          {/* Datos de Localización Geográfica y Activo Eléctrico */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900/50 print:bg-white">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-corpo-red" />
              <span>Localización Geográfica & Activo Eléctrico Asociado</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Entidad Federal:</span>
                <strong className="text-slate-800 dark:text-slate-200">{proyecto.estado}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Municipio:</span>
                <strong className="text-slate-800 dark:text-slate-200">{proyecto.municipio || 'N/D'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Subestación Cabecera:</span>
                <strong className="text-slate-800 dark:text-slate-200">{proyecto.subestacion_asociada || 'N/D'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Circuito / Alimentador:</span>
                <strong className="text-slate-800 dark:text-slate-200">{proyecto.circuito_asociado || 'CABECERA S/E'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <span className="text-slate-500 block text-[10px]">Nivel de Tensión:</span>
                <strong className="text-purple-600 dark:text-purple-400 font-mono">
                  {proyecto.nivel_tension_kv ? `${proyecto.nivel_tension_kv} kV` : '13.8 kV'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Capacidad / Longitud:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {proyecto.capacidad_o_km || '—'} {proyecto.unidad_capacidad || ''}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Dirección / Ubicación Física:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate block" title={proyecto.direccion || ''}>
                  {proyecto.direccion || 'Instalaciones del Sistema Eléctrico'}
                </span>
              </div>
            </div>
          </div>

          {/* Alcance Técnico y Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alcance Técnico */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Alcance Técnico & Materiales Requeridos</span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {proyecto.alcance || 'Levantamiento de ingeniería de detalle y adecuación integral de redes de distribución.'}
              </p>
            </div>

            {/* Impacto en el SEN */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Impacto en el SEN & Beneficios</span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {proyecto.impacto_sen || 'Confiabilidad y estabilidad del suministro eléctrico en los circuitos troncales de distribución.'}
              </p>
              {proyecto.familias_beneficiadas && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Población / Familias Beneficiadas: <strong>{proyecto.familias_beneficiadas}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Inversión y Cronograma Plurianual de Desembolsos */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900/50 print:bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Presupuesto de Inversión & Cronograma Plurianual ($ USD)</span>
              </h3>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-500">Lapso: <strong>{proyecto.tiempo_ejecucion_meses || 6} Meses</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                  Total: ${(proyecto.monto_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Tabla de Desembolsos Plurianual */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase">
                  <tr>
                    {aniosDesembolso.map((yr) => (
                      <th key={yr} className="p-2 border border-slate-200 dark:border-slate-800">
                        {yr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {aniosDesembolso.map((yr) => {
                      const val = desembolsos[yr] ?? (yr === '2026' ? proyecto.monto_usd : 0);
                      return (
                        <td
                          key={yr}
                          className={`p-2 border border-slate-200 dark:border-slate-800 font-bold ${
                            val && val > 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-400'
                          }`}
                        >
                          {val && val > 0 ? `$${val.toLocaleString('en-US')}` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Avance Físico y Trazabilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                <span>Avance Físico Actual</span>
                <strong className="font-mono text-corpo-blue dark:text-blue-400">{proyecto.avance_fisico_pct || 0}%</strong>
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-corpo-blue to-purple-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, proyecto.avance_fisico_pct || 0)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div>Vinculación POA: <strong>{proyecto.accion_poa_codigo || 'ACC-2026-04-PRTSEN'}</strong></div>
              <div>Unidad Ejecutora: <strong>División de Formulación y Planificación SEN (GGPD)</strong></div>
            </div>
          </div>

          {/* Observaciones si existen */}
          {proyecto.observaciones && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 block text-[10px] uppercase">
                Observaciones Técnicas Adicionales
              </span>
              <p className="text-amber-800 dark:text-amber-200">{proyecto.observaciones}</p>
            </div>
          )}

          {/* Pie de Firma y Certificación */}
          <div className="pt-8 border-t border-slate-300 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs print:pt-12">
            <div className="space-y-1">
              <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto pb-8 print:pb-12"></div>
              <strong className="block text-slate-900 dark:text-slate-100">Ingeniero Responsable del Proyecto</strong>
              <span className="text-[10px] text-slate-500 block">Inspección y Ejecución Técnica SEN</span>
            </div>
            <div className="space-y-1">
              <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto pb-8 print:pb-12"></div>
              <strong className="block text-slate-900 dark:text-slate-100">Gerencia General de Planificación (GGPD)</strong>
              <span className="text-[10px] text-slate-500 block">Validación y Aprobación Institucional</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL DE EDICIÓN DE LA FICHA TÉCNICA (SOLO SI SE ACTIVA MODO EDITAR)       */}
        {/* ========================================================================= */}
        {isEditing && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2 mb-4 text-corpo-blue">
              <Edit3 className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Edición de Datos de la Ficha Técnica ({proyecto.codigo_rds})
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  value={editData.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Municipio</label>
                  <input
                    type="text"
                    value={editData.municipio}
                    onChange={(e) => setEditData({ ...editData, municipio: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Nivel Tensión</label>
                  <input
                    type="text"
                    placeholder="13.8, 34.5, 115..."
                    value={editData.nivel_tension_kv}
                    onChange={(e) => setEditData({ ...editData, nivel_tension_kv: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Tiempo Ejecución (Meses)</label>
                  <input
                    type="number"
                    value={editData.tiempo_ejecucion_meses}
                    onChange={(e) => setEditData({ ...editData, tiempo_ejecucion_meses: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">Alcance Técnico del Proyecto</label>
                <textarea
                  rows={3}
                  value={editData.alcance}
                  onChange={(e) => setEditData({ ...editData, alcance: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">Impacto para el SEN & Beneficios</label>
                <textarea
                  rows={2}
                  value={editData.impacto_sen}
                  onChange={(e) => setEditData({ ...editData, impacto_sen: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Avance Físico (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editData.avance_fisico_pct}
                    onChange={(e) => setEditData({ ...editData, avance_fisico_pct: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-mono text-purple-600 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Monto Inversión ($ USD)</label>
                  <input
                    type="number"
                    value={editData.monto_usd}
                    onChange={(e) => setEditData({ ...editData, monto_usd: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 font-mono text-emerald-600 font-bold"
                  />
                </div>
              </div>

              {/* Sección de Edición de Cronograma Plurianual */}
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <label className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Cronograma de Desembolsos Plurianuales ($ USD)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Ajusta los desembolsos anuales de 2025 a 2031</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={asignar100a2026}
                      className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800"
                    >
                      ⚡ Asignar 100% al 2026
                    </button>
                    <button
                      type="button"
                      onClick={dividir5050}
                      className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800"
                    >
                      📊 50% 2026 / 50% 2027
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {aniosDesembolso.map(yr => (
                    <div key={yr} className="space-y-1">
                      <span className="font-mono font-bold text-[11px] text-slate-600 dark:text-slate-400 block text-center">
                        {yr}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={editData.desembolsos[yr] || 0}
                        onChange={(e) => handleDesembolsoChange(yr, Number(e.target.value))}
                        className={`w-full text-center font-mono font-bold text-xs rounded border px-2 py-1.5 ${
                          (editData.desembolsos[yr] || 0) > 0
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">
                    Suma Desembolsos: <strong className="font-mono text-slate-800 dark:text-slate-200">${totalDesembolsosEdit.toLocaleString('en-US')} USD</strong>
                  </span>
                  {Math.abs(totalDesembolsosEdit - Number(editData.monto_usd)) > 1 && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Difiere del Monto Total (${(Number(editData.monto_usd) || 0).toLocaleString('en-US')})</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2 shadow-md"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Ficha en InsForge</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
