import React, { useState } from 'react';
import { EquipmentRecord } from '../../types';
import { 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Type, 
  Zap, 
  Layers
} from 'lucide-react';

interface RemediationTabProps {
  records: EquipmentRecord[];
  onRemediationDone: () => void;
}

export const RemediationTab: React.FC<RemediationTabProps> = ({ records, onRemediationDone }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [resultMsg, setResultMsg] = useState<string>('');

  // Count non-standard entries preview
  const nonStandardCaseCount = records.filter(
    r => r.equipment_nomenclator !== (r.equipment_nomenclator || '').toUpperCase().trim()
  ).length;

  const handleRunRemediation = async () => {
    setIsRunning(true);
    setResultMsg('');

    try {
      const res = await fetch('/api/equipment/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        setResultMsg(`¡Remediación exitosa! Se normalizaron ${data.fixed_count} registros bajo las reglas ISO 8000-61/110.`);
        onRemediationDone();
      } else {
        alert('Error ejecutando remediación: ' + data.error);
      }
    } catch (err: any) {
      alert('Error de conexión al ejecutar remediación.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Wrench className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          <span>Motor de Remediación Automática (ISO 8000-61 / 110)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Limpieza y estandarización automatizada en lote de inconsistencias sintácticas y formateo en la base de datos CORPOELEC.
        </p>
      </div>

      {/* Rules Grid Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-sm">
            <Type className="w-4 h-4" />
            <span>1. Normalización Mayúsculas</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Convierte automáticamente todas las nomenclaturas y identificadores de equipos a mayúsculas sostenidas estandarizadas.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>2. Depuración Espacios</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Elimina espacios dobles, tabulaciones y espacios accidentales al inicio o final de las cadenas de texto.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>3. Estandarización Tensión (kV)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Estandariza nomenclaturas numéricas de niveles de tensión del Sistema Eléctrico Nacional (765kV, 400kV, 230kV, 115kV, etc.).
          </p>
        </div>
      </div>

      {/* Remediation Action Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Ejecución del Algoritmo de Calidad</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Auditoría previa de {records.length} registros en base de datos</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-bold text-sky-700 dark:text-cyan-300">{nonStandardCaseCount}</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Registros con mejoras posibles</p>
          </div>
        </div>

        {resultMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{resultMsg}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-200">Nota de Garantía de Datos:</p>
          <p className="text-slate-600 dark:text-slate-400">
            La ejecución de esta acción actualizará directamente los registros en Supabase (esquema <span className="font-mono text-sky-700 dark:text-cyan-300 font-bold">scei</span>) y registrará cada evento en el Log de Auditoría bajo normativa ISO 27001.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRunRemediation}
            disabled={isRunning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ejecutando Remediación en Lote...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ejecutar Remediación Automática (ISO 8000-61/110)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
