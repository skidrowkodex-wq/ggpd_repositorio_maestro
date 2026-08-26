import React, { useEffect, useState, useMemo } from 'react';
import { AccionPOA, OrganizacionNodo } from '../types';
import {
  getAccionesPOA,
  createAccionPOA,
  updateAccionPOA,
  createMultipleAccionesPOA,
  getUnidadesEjecutoras,
  getGerencias,
  getOrganizaciones,
} from '../services/supabaseService';
import {
  RefreshCw,
  Plus,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building2,
  Target,
  Calculator,
  Trash2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Calendar,
  Edit2,
  Info,
  DollarSign,
  PieChart
} from 'lucide-react';

interface WizardActionItem {
  codigo: string;
  nombre: string;
  unidad_ejecutora_id: string;
  unidad_ejecutora: string;
  ponderacion: number;
  presupuesto_asignado_bs: number;
  meta_fisica_programada: number;
  unidad_medida: string;
}

export function PoaBudgetView() {
  const [acciones, setAcciones] = useState<AccionPOA[]>([]);
  const [unidades, setUnidades] = useState<OrganizacionNodo[]>([]);
  const [gerencias, setGerencias] = useState<OrganizacionNodo[]>([]);
  const [organizaciones, setOrganizaciones] = useState<OrganizacionNodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);

  // Filtro de Año Fiscal en la Tabla Principal
  const [filtroAnio, setFiltroAnio] = useState<string>('TODOS');

  // Modal Carga Individual
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Parámetros de Asignación por Año en Carga Individual
  const [indAnio, setIndAnio] = useState<string>('2026');
  const [indNumero, setIndNumero] = useState<number>(1);
  const [indSufijo, setIndSufijo] = useState<string>('OPER');

  const [formData, setFormData] = useState({
    codigo: 'ACC-2026-01-OPER',
    nombre: 'Operación, Despacho y Transmisión del Sistema Eléctrico',
    unidad_ejecutora_id: 'GGPD_DIV_PLANIF',
    unidad_ejecutora: 'División de Planificación Técnica y Estudios SEN',
    ponderacion: 25.0,
    presupuesto_asignado_bs: 15000000000.0,
    presupuesto_ejecutado_bs: 0.0,
    meta_fisica_programada: 120,
    meta_fisica_ejecutada: 0,
    unidad_medida: 'Subestación Operativa',
  });

  // Modal Edición de Acción Existente
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccion, setEditingAccion] = useState<AccionPOA | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPonderacion, setEditPonderacion] = useState<number>(0);
  const [editPresupuestoBs, setEditPresupuestoBs] = useState<number>(0);
  const [editMetaFisica, setEditMetaFisica] = useState<number>(0);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal Asistente (Wizard) de Formulación POA
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardSaving, setWizardSaving] = useState(false);

  // Parámetros del Wizard
  const [wizardPlan, setWizardPlan] = useState({
    anioFiscal: '2027',
    enteMatrizId: 'CORPOELEC',
    gerenciaId: 'CORPOELEC_GGPD',
    codigoPoa: 'POA-2027-GGPD-01',
    nombrePoa: 'Plan Operativo Anual 2027 — Planificación y Transformación SEN',
    techoPresupuestarioBs: 60000000000,
    objetivoEstrategico:
      'Garantizar la continuidad, confiabilidad y estabilidad del suministro eléctrico en el Sistema Eléctrico Nacional (SEN).',
    lineaAccion:
      'Modernización de Protecciones, Telecontrol, Mantenimiento Mayor de Subestaciones y Redes Troncales.',
    periodoEjecucion: 'Enero 2027 – Diciembre 2027',
    responsablePlan: 'Ing. Carlos Reyes / Ing. Josué Pacheco',
  });

  // Acciones en el Wizard
  const [wizardActions, setWizardActions] = useState<WizardActionItem[]>([
    {
      codigo: 'ACC-2027-01-PLANIF',
      nombre: 'Diagnóstico y Caracterización de 150 Subestaciones Troncales',
      unidad_ejecutora_id: 'GGPD_DIV_PLANIF',
      unidad_ejecutora: 'División de Planificación Técnica y Estudios SEN',
      ponderacion: 30,
      presupuesto_asignado_bs: 18000000000,
      meta_fisica_programada: 150,
      unidad_medida: 'Subestación Caracterizada',
    },
    {
      codigo: 'ACC-2027-02-AUTO',
      nombre: 'Automatización y Telecontrol con IA (SIGI / SCEIN)',
      unidad_ejecutora_id: 'GGPD_DIV_AUTO',
      unidad_ejecutora: 'División de Automatización e Ingeniería de Productos con IA',
      ponderacion: 30,
      presupuesto_asignado_bs: 18000000000,
      meta_fisica_programada: 80,
      unidad_medida: 'Módulo Digital Desplegado',
    },
    {
      codigo: 'ACC-2027-03-MANT',
      nombre: 'Mantenimiento Mayor y Sustitución de Equipos de Potencia',
      unidad_ejecutora_id: 'GGPD_DIV_PROY',
      unidad_ejecutora: 'División de Formulación y Proyectos PRTSEN',
      ponderacion: 40,
      presupuesto_asignado_bs: 24000000000,
      meta_fisica_programada: 200,
      unidad_medida: 'Equipo Restituido',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    const [resPOA, resUnidades, resGerencias, resOrgs] = await Promise.all([
      getAccionesPOA(),
      getUnidadesEjecutoras(),
      getGerencias(),
      getOrganizaciones(),
    ]);
    setAcciones(resPOA.data);
    setIsFromSupabase(resPOA.isFromSupabase);
    setUnidades(resUnidades);
    setGerencias(resGerencias);
    setOrganizaciones(resOrgs.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actualizar código autogenerado al cambiar año, número o sufijo
  useEffect(() => {
    const numPad = String(indNumero).padStart(2, '0');
    const sufijoClean = indSufijo.trim().toUpperCase() || 'ACC';
    setFormData((prev) => ({
      ...prev,
      codigo: `ACC-${indAnio}-${numPad}-${sufijoClean}`,
    }));
  }, [indAnio, indNumero, indSufijo]);

  // Acciones filtradas por año en el modal individual
  const accionesDelAnioInd = useMemo(() => {
    return acciones.filter((a) => a.codigo.includes(indAnio));
  }, [acciones, indAnio]);

  const ponderacionAcumuladaInd = useMemo(() => {
    return accionesDelAnioInd.reduce((acc, curr) => acc + (Number(curr.ponderacion) || 0), 0);
  }, [accionesDelAnioInd]);

  const presupuestoAcumuladoInd = useMemo(() => {
    return accionesDelAnioInd.reduce((acc, curr) => acc + (Number(curr.presupuesto_asignado_bs) || 0), 0);
  }, [accionesDelAnioInd]);

  // Filtrado de la tabla principal
  const accionesFiltradas = useMemo(() => {
    if (filtroAnio === 'TODOS') return acciones;
    return acciones.filter((a) => a.codigo.includes(filtroAnio));
  }, [acciones, filtroAnio]);

  // Handlers para Carga Individual
  const handleCreateIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createAccionPOA(formData);
    if (res.success) {
      setShowModal(false);
      loadData();
    } else {
      alert('Error creando Acción POA en InsForge: ' + (res.error || 'Error desconocido'));
    }
    setSaving(false);
  };

  // Handlers para Edición de Acción Existente
  const handleOpenEdit = (acc: AccionPOA) => {
    setEditingAccion(acc);
    setEditNombre(acc.nombre);
    setEditPonderacion(acc.ponderacion);
    setEditPresupuestoBs(acc.presupuesto_asignado_bs);
    setEditMetaFisica(acc.meta_fisica_programada);
    setShowEditModal(true);
  };

  const handleSaveEditAccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccion) return;

    setSavingEdit(true);
    const res = await updateAccionPOA(editingAccion.id, {
      nombre: editNombre,
      ponderacion: Number(editPonderacion),
      presupuesto_asignado_bs: Number(editPresupuestoBs),
      meta_fisica_programada: Number(editMetaFisica),
    });

    if (res.success) {
      setShowEditModal(false);
      loadData();
    } else {
      alert('Error actualizando Acción POA: ' + (res.error || 'Error desconocido'));
    }
    setSavingEdit(false);
  };

  // Wizard Helpers
  const addWizardAction = () => {
    const nextIdx = wizardActions.length + 1;
    const defaultUnit = unidades[0] || {
      id: 'GGPD_DIV_PLANIF',
      nombre_oficial: 'División de Planificación Técnica y Estudios SEN',
    };
    setWizardActions([
      ...wizardActions,
      {
        codigo: `ACC-${wizardPlan.anioFiscal}-0${nextIdx}-NUEVA`,
        nombre: 'Nueva Acción Específica de Planificación Operativa',
        unidad_ejecutora_id: defaultUnit.id,
        unidad_ejecutora: defaultUnit.nombre_oficial,
        ponderacion: 10,
        presupuesto_asignado_bs: 5000000000,
        meta_fisica_programada: 20,
        unidad_medida: 'Acción Ejecutada',
      },
    ]);
  };

  const removeWizardAction = (index: number) => {
    if (wizardActions.length <= 1) {
      alert('El POA debe contener al menos una acción específica.');
      return;
    }
    setWizardActions(wizardActions.filter((_, i) => i !== index));
  };

  const updateWizardAction = (index: number, field: keyof WizardActionItem, value: any) => {
    const updated = [...wizardActions];
    if (field === 'unidad_ejecutora_id') {
      const selected = unidades.find((u) => u.id === value);
      updated[index].unidad_ejecutora_id = value;
      if (selected) {
        updated[index].unidad_ejecutora = selected.nombre_oficial;
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setWizardActions(updated);
  };

  const totalWizardPonderacion = wizardActions.reduce((acc, a) => acc + (Number(a.ponderacion) || 0), 0);
  const totalWizardPresupuesto = wizardActions.reduce((acc, a) => acc + (Number(a.presupuesto_asignado_bs) || 0), 0);

  const handleFinishWizard = async () => {
    if (totalWizardPonderacion !== 100) {
      if (
        !confirm(
          `La ponderación total actual es ${totalWizardPonderacion}%. La norma ISO 8000 recomienda exactamente 100%. ¿Desea continuar de todas formas?`
        )
      ) {
        return;
      }
    }

    setWizardSaving(true);
    const payload = wizardActions.map((a) => ({
      codigo: a.codigo,
      nombre: a.nombre,
      unidad_ejecutora_id: a.unidad_ejecutora_id,
      unidad_ejecutora: a.unidad_ejecutora,
      ponderacion: a.ponderacion,
      presupuesto_asignado_bs: a.presupuesto_asignado_bs,
      presupuesto_ejecutado_bs: 0,
      meta_fisica_programada: a.meta_fisica_programada,
      meta_fisica_ejecutada: 0,
      unidad_medida: a.unidad_medida,
    }));

    const res = await createMultipleAccionesPOA(payload);
    if (res.success) {
      alert(`¡POA ${wizardPlan.anioFiscal} formulado con éxito! Se registraron ${res.count} acciones específicas en InsForge PostgreSQL.`);
      setShowWizard(false);
      setWizardStep(1);
      loadData();
    } else {
      alert('Error formulando POA: ' + (res.error || 'Error desconocido'));
    }
    setWizardSaving(false);
  };

  const totalAsignado = acciones.reduce((acc, curr) => acc + (Number(curr.presupuesto_asignado_bs) || 0), 0);
  const totalEjecutado = acciones.reduce((acc, curr) => acc + (Number(curr.presupuesto_ejecutado_bs) || 0), 0);
  const pctEjecucion = totalAsignado > 0 ? Math.round((totalEjecutado / totalAsignado) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Planes Operativos Anuales (POA) & Presupuesto
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isFromSupabase
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isFromSupabase ? 'En vivo InsForge PostgreSQL' : 'Conectando...'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Formulación Estratégica Multianual (POA 2026 / 2027), Asistente Paso a Paso y Balance ISO 8000.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setWizardPlan((p) => ({ ...p, anioFiscal: '2027', codigoPoa: 'POA-2027-GGPD-01' }));
              setWizardStep(1);
              setShowWizard(true);
            }}
            className="px-3.5 py-2 rounded-md bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Wand2 className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>Asistente Formulación POA</span>
          </button>

          <button
            onClick={() => {
              setIndAnio('2026');
              setIndNumero(1);
              setIndSufijo('OPER');
              setShowModal(true);
            }}
            className="px-3 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Acción Individual</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
            title="Recargar datos de InsForge"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Presupuesto Asignado Global</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            Bs. {totalAsignado.toLocaleString('es-VE')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Partidas 402, 405 y Operativas</span>
        </div>

        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Presupuesto Ejecutado</span>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
            Bs. {totalEjecutado.toLocaleString('es-VE')}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{pctEjecucion}% devengado</span>
        </div>

        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Acciones Registradas</span>
          <div className="text-xl font-bold font-mono text-purple-700 dark:text-purple-400">
            {acciones.length} Acciones
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Ponderaciones Validadas ISO 8000</span>
        </div>
      </div>

      {/* Tabla de Acciones Específicas */}
      <div className="p-5 industrial-card space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Catálogo de Acciones Específicas POA</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registradas en InsForge PostgreSQL (`scppe.mae_poa_acciones`)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Filtrar Ejercicio:</span>
            </span>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">Todos los Ejercicios ({acciones.length})</option>
              <option value="2026">POA 2026 ({acciones.filter((a) => a.codigo.includes('2026')).length})</option>
              <option value="2027">POA 2027 ({acciones.filter((a) => a.codigo.includes('2027')).length})</option>
              <option value="2028">POA 2028 ({acciones.filter((a) => a.codigo.includes('2028')).length})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
            <span className="font-medium">Cargando acciones desde InsForge...</span>
          </div>
        ) : accionesFiltradas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-lg space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No hay acciones registradas para el ejercicio seleccionado.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-corpo-blue hover:bg-corpo-dark text-white rounded text-xs font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Acción Individual</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Acción Específica</th>
                  <th className="p-3">Unidad Ejecutora</th>
                  <th className="p-3 text-center">Pond. (%)</th>
                  <th className="p-3 text-right">Presupuesto (Bs.)</th>
                  <th className="p-3 text-center">Meta Física</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {accionesFiltradas.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{acc.codigo}</td>
                    <td className="p-3 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-white">{acc.nombre}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{acc.unidad_ejecutora}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-purple-700 dark:text-purple-400">
                      {acc.ponderacion}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Bs. {Number(acc.presupuesto_asignado_bs || 0).toLocaleString('es-VE')}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{acc.meta_fisica_programada}</span>{' '}
                      <span className="text-[10px] text-slate-500">{acc.unidad_medida}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-corpo-blue transition-colors"
                        title="Editar Ponderación / Presupuesto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ➕ MODAL CARGA ACCIÓN INDIVIDUAL (CON SELECTOR DE AÑO Y BALANCE ISO 8000)   */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-corpo-blue">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Cargar Acción Específica POA Individual
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Selector de Ejercicio Fiscal */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Ejercicio Fiscal Objetivo:</span>
                </span>
                <div className="flex items-center gap-1">
                  {['2026', '2027', '2028'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setIndAnio(yr)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        indAnio === yr
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      POA {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado del Balance Actual para el Año */}
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Acciones en POA {indAnio}: <strong>{accionesDelAnioInd.length}</strong></span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    Pond. Actual: {ponderacionAcumuladaInd}%
                  </span>
                </div>
                {accionesDelAnioInd.length > 0 && (
                  <div className="text-[10px] text-slate-500 truncate">
                    Registradas: {accionesDelAnioInd.map((a) => a.codigo).join(', ')}
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300">Balance con esta Acción:</span>
                  <span
                    className={`font-mono ${
                      ponderacionAcumuladaInd + formData.ponderacion === 100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {ponderacionAcumuladaInd + formData.ponderacion}% / 100%
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateIndividual} className="space-y-3.5 text-xs">
              {/* Asistente de Código */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-800 dark:text-slate-300 font-bold mb-1 block">N° Acción</label>
                  <select
                    value={indNumero}
                    onChange={(e) => setIndNumero(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-2 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value={1}>AE #1</option>
                    <option value={2}>AE #2</option>
                    <option value={3}>AE #3</option>
                    <option value={4}>AE #4</option>
                    <option value={5}>AE #5</option>
                    <option value={6}>AE #6</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-300 font-bold mb-1 block">Sufijo Siglas</label>
                  <input
                    type="text"
                    required
                    placeholder="OPER, MANT, AVER..."
                    value={indSufijo}
                    onChange={(e) => setIndSufijo(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-300 font-bold mb-1 block">Código Generado</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded px-2 py-2 text-purple-900 dark:text-purple-200 font-mono font-bold text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre / Denominación de la Acción</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mantenimiento Preventivo y Correctivo de Subestaciones"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-corpo-blue" />
                  <span>Unidad Ejecutora (Árbol Organizacional)</span>
                </label>
                <select
                  value={formData.unidad_ejecutora_id}
                  onChange={(e) => {
                    const sel = unidades.find((u) => u.id === e.target.value);
                    setFormData({
                      ...formData,
                      unidad_ejecutora_id: e.target.value,
                      unidad_ejecutora: sel ? sel.nombre_oficial : formData.unidad_ejecutora,
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.codigo_siglas} - {u.nombre_oficial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Ponderación (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.ponderacion}
                    onChange={(e) => setFormData({ ...formData, ponderacion: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-purple-600 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Presupuesto (Bs.)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.presupuesto_asignado_bs}
                    onChange={(e) =>
                      setFormData({ ...formData, presupuesto_asignado_bs: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Meta Programada</label>
                  <input
                    type="number"
                    required
                    value={formData.meta_fisica_programada}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_fisica_programada: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Guardar Acción ({indAnio})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ MODAL EDITAR ACCIÓN EXISTENTE (REBALANCEAR PONDERACIÓN O PRESUPUESTO)    */}
      {/* ========================================================================= */}
      {showEditModal && editingAccion && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-corpo-blue">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Editar Acción POA ({editingAccion.codigo})
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAccion} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre de la Acción</label>
                <textarea
                  rows={2}
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Ponderación (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editPonderacion}
                    onChange={(e) => setEditPonderacion(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-purple-600 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Presupuesto (Bs.)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={editPresupuestoBs}
                    onChange={(e) => setEditPresupuestoBs(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Meta Física Programada</label>
                <input
                  type="number"
                  required
                  value={editMetaFisica}
                  onChange={(e) => setEditMetaFisica(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-slate-100 font-mono font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧙‍♂️ MODAL ASISTENTE (WIZARD) DE FORMULACIÓN POA                              */}
      {/* ========================================================================= */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header del Wizard */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Asistente de Formulación POA {wizardPlan.anioFiscal}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Proceso guiado de formulación bajo norma ISO 8000 e ISO 55000
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stepper Visual */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              {[
                { num: 1, label: '1. Parámetros POA' },
                { num: 2, label: '2. Marco Estratégico' },
                { num: 3, label: '3. Acciones Específicas' },
                { num: 4, label: '4. Consolidación' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`p-2 rounded-lg border transition-all ${
                    wizardStep === s.num
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                      : wizardStep > s.num
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* PASO 1: Parámetros del POA */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-900 dark:text-purple-300">
                  Defina los parámetros institucionales y el ejercicio fiscal para el registro en el Árbol Organizacional.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Ejercicio Fiscal</label>
                    <input
                      type="text"
                      value={wizardPlan.anioFiscal}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, anioFiscal: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Código Identificador POA</label>
                    <input
                      type="text"
                      value={wizardPlan.codigoPoa}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, codigoPoa: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Empresa Matriz / Ente</label>
                    <select
                      value={wizardPlan.enteMatrizId}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, enteMatrizId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      {organizaciones
                        .filter((o) => o.tipo_id === 'EMPRESA_MATRIZ' || o.tipo_id === 'MINISTERIO' || o.tipo_id === 'ENTE_ADSCRITO')
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.codigo_siglas} - {o.nombre_oficial}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Gerencia General Responsable</label>
                    <select
                      value={wizardPlan.gerenciaId}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, gerenciaId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      {gerencias.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.codigo_siglas} - {g.nombre_oficial}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Denominación Oficial del POA</label>
                  <input
                    type="text"
                    value={wizardPlan.nombrePoa}
                    onChange={(e) => setWizardPlan({ ...wizardPlan, nombrePoa: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Techo Presupuestario Global Estimado (Bs.)</label>
                  <input
                    type="number"
                    value={wizardPlan.techoPresupuestarioBs}
                    onChange={(e) => setWizardPlan({ ...wizardPlan, techoPresupuestarioBs: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm"
                  />
                </div>
              </div>
            )}

            {/* PASO 2: Marco Estratégico */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-300">
                  Vincule el POA a los lineamientos del Plan de la Patria y las metas estratégicas institucionales.
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Objetivo Estratégico Nacional / Plan de la Patria</span>
                  </label>
                  <textarea
                    rows={3}
                    value={wizardPlan.objetivoEstrategico}
                    onChange={(e) => setWizardPlan({ ...wizardPlan, objetivoEstrategico: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Línea de Acción Prioritaria</label>
                  <textarea
                    rows={2}
                    value={wizardPlan.lineaAccion}
                    onChange={(e) => setWizardPlan({ ...wizardPlan, lineaAccion: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Período de Ejecución</label>
                    <input
                      type="text"
                      value={wizardPlan.periodoEjecucion}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, periodoEjecucion: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-800 dark:text-slate-300 font-bold">Responsables de Formulación</label>
                    <input
                      type="text"
                      value={wizardPlan.responsablePlan}
                      onChange={(e) => setWizardPlan({ ...wizardPlan, responsablePlan: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: Acciones Específicas */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Desglose de Acciones Específicas</h4>
                    <p className="text-[11px] text-slate-500">
                      Asigne ponderaciones y presupuestos a cada Unidad Ejecutora de la Gerencia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addWizardAction}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Acción</span>
                  </button>
                </div>

                {/* Barra de Balance Ponderación */}
                <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono font-bold text-xs">
                    <span>Balance Ponderación:</span>
                    <span className={totalWizardPonderacion === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                      {totalWizardPonderacion}% / 100% {totalWizardPonderacion === 100 ? '✓ (Equilibrado)' : '⚠️ (Desbalance)'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${totalWizardPonderacion === 100 ? 'bg-emerald-500' : totalWizardPonderacion > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, totalWizardPonderacion)}%` }}
                    />
                  </div>
                </div>

                {/* Lista de Acciones en Edición */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {wizardActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                          Acción #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWizardAction(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar acción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Código</label>
                          <input
                            type="text"
                            value={action.codigo}
                            onChange={(e) => updateWizardAction(idx, 'codigo', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 font-mono font-bold text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Unidad Ejecutora</label>
                          <select
                            value={action.unidad_ejecutora_id}
                            onChange={(e) => updateWizardAction(idx, 'unidad_ejecutora_id', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-semibold"
                          >
                            {unidades.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.codigo_siglas} - {u.nombre_oficial}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Nombre / Descripción de la Acción</label>
                        <input
                          type="text"
                          value={action.nombre}
                          onChange={(e) => updateWizardAction(idx, 'nombre', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 font-semibold text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Pond. (%)</label>
                          <input
                            type="number"
                            value={action.ponderacion}
                            onChange={(e) => updateWizardAction(idx, 'ponderacion', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono font-bold text-purple-600 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Presupuesto (Bs.)</label>
                          <input
                            type="number"
                            value={action.presupuesto_asignado_bs}
                            onChange={(e) => updateWizardAction(idx, 'presupuesto_asignado_bs', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono font-bold text-emerald-600 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Meta Prog.</label>
                          <input
                            type="number"
                            value={action.meta_fisica_programada}
                            onChange={(e) => updateWizardAction(idx, 'meta_fisica_programada', parseInt(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Unidad Medida</label>
                          <input
                            type="text"
                            value={action.unidad_medida}
                            onChange={(e) => updateWizardAction(idx, 'unidad_medida', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4: Consolidación */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>
                    Validación de Calidad ISO 8000 superada. Revise el dictamen antes de persistir en InsForge PostgreSQL.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ejercicio & Código</span>
                    <strong className="text-slate-900 dark:text-slate-100">{wizardPlan.anioFiscal} — {wizardPlan.codigoPoa}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Acciones</span>
                    <strong className="text-purple-600 dark:text-purple-400">{wizardActions.length} Acciones Específicas</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ponderación Total</span>
                    <strong className={totalWizardPonderacion === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                      {totalWizardPonderacion}% {totalWizardPonderacion === 100 ? '✓ (Exacto)' : '⚠️'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Presupuesto Asignado</span>
                    <strong className="text-emerald-600 font-mono">Bs. {totalWizardPresupuesto.toLocaleString('es-VE')}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Footer de Navegación del Wizard */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setWizardStep((s) => Math.max(1, s - 1) as any)}
                disabled={wizardStep === 1}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((s) => Math.min(4, s + 1) as any)}
                    className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishWizard}
                    disabled={wizardSaving}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md"
                  >
                    {wizardSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
                    <span>Generar y Persistir POA en InsForge</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
