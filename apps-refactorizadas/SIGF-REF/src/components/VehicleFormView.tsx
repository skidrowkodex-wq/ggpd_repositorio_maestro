import React, { useState, useEffect, useMemo } from 'react';
import { VehicleRecord, MasterCatalogsState, ComponentStatus } from '../types/fleet';
import { COMPONENT_FIELDS, validateSingleVehicle, OFFICIAL_BRANDS } from '../services/validationService';
import { FLEET_COLUMNS } from '../data/schemaDefinition';
import { VENEZUELA_REGIONS, VENEZUELA_STATES } from '../data/venezuelaRegions';
import { 
  adaptCorpoelecRegion, 
  adaptVenezuelanState,
  getRegionForState, 
  getStatesForRegion, 
  getCentrosForState,
  getCentrosForStateAndRegion,
  validateForeignKeyRelations,
  adaptVehicleLocation 
} from '../services/regionAdapter';
import { generateAutoCorrelativo, getStateCode, getTypeCode } from '../services/correlativoService';
import { getUserProfile } from '../data/defaultUsers';
import { 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Car, 
  Wrench, 
  BatteryCharging, 
  FileText, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Hash,
  Link2,
  ShieldCheck,
  Lock,
  Globe
} from 'lucide-react';

interface VehicleFormViewProps {
  initialVehicle?: VehicleRecord | null;
  catalogs: MasterCatalogsState;
  existingVehicles: VehicleRecord[];
  onSaveVehicle: (vehicle: VehicleRecord) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
  currentUserEmail?: string;
}

export const VehicleFormView: React.FC<VehicleFormViewProps> = ({
  initialVehicle,
  catalogs,
  existingVehicles,
  onSaveVehicle,
  onCancel,
  isDarkMode,
  currentUserEmail
}) => {
  const userProfile = useMemo(() => {
    return getUserProfile(currentUserEmail || 'bk.ggpd.corpoelec@gmail.com');
  }, [currentUserEmail]);

  const isStateRestricted = userProfile.role === 'estado' && Boolean(userProfile.estadoAsignado);
  const assignedState = userProfile.estadoAsignado || '';
  const assignedRegion = useMemo(() => {
    if (assignedState) {
      return getRegionForState(assignedState)?.nombre || 'GUAYANA';
    }
    return VENEZUELA_REGIONS[0]?.nombre || 'CAPITAL';
  }, [assignedState]);

  const [useAutoCorrelativo, setUseAutoCorrelativo] = useState<boolean>(!initialVehicle);

  const [formData, setFormData] = useState<Partial<VehicleRecord>>(() => {
    if (initialVehicle) return { ...initialVehicle };

    const initialRegion = isStateRestricted 
      ? assignedRegion 
      : (VENEZUELA_REGIONS[0]?.nombre || 'CAPITAL');
    const initialState = isStateRestricted 
      ? assignedState 
      : (getStatesForRegion(initialRegion)[0]?.nombre || 'Distrito Capital');
    const defaultTipo = catalogs.tipos_vehiculo[0]?.nombre || 'CAMIONETA';
    const autoCode = generateAutoCorrelativo(initialState, defaultTipo, existingVehicles);

    const initialCentros = getCentrosForState(initialState, catalogs.centros_servicios);
    const initialCs = initialCentros[0]?.nombre || '';

    // Default empty vehicle record
    const emptyRec: any = {
      id: `veh-${Date.now()}`,
      region: initialRegion,
      estado_venezuela: initialState,
      correlativo_carga: autoCode,
      numero_vehiculo: autoCode,
      estado: '',
      marca_vehiculo: '',
      tipo_vehiculo: '',
      unidad_asignada: '',
      centro_servicios: initialCs,
      condicion_actual: '',
      mantenimiento_preventivo: '',

      // 21 Components default to BUENO
      pastillas: 'BUENO',
      bandas: 'BUENO',
      bomba_freno: 'BUENO',
      disco: 'BUENO',
      plato: 'BUENO',
      collarin: 'BUENO',
      bombin_superior: 'BUENO',
      bombin_inferior: 'BUENO',
      bateria: 'BUENO',
      bobina: 'BUENO',
      bujias: 'BUENO',
      cauchos: 'BUENO',
      correas_motor: 'BUENO',
      luces_delanteras: 'BUENO',
      parabrisas: 'BUENO',
      tren_delantero: 'BUENO',
      ballesta: 'BUENO',
      crucetas: 'BUENO',
      amortiguadores: 'BUENO',
      radiador: 'BUENO',
      motor: 'BUENO',

      cant_total_reparaciones: 0,
      cant_cauchos: 0,
      medidas_caucho: catalogs.medidas_cauchos[0]?.nombre || '265/70R16',
      cantidad_baterias: 1,
      caracteristicas_bateria: catalogs.caracteristicas_baterias[0]?.nombre || '1100 AMP / 12V (Grupo 34MR)',

      vehiculo_recuperado: 'NO',
      fecha_recuperacion: '',
      gerencia_origen: catalogs.gerencias[0]?.nombre || '',
      vehiculo_otra_gerencia_devuelto: 'NO',
      fecha_entrega_gerencia_origen: '',

      observacion: '',
      certificar_tipo_vehiculo: '',
      modelo_vehiculo: '',
      prioridad_recuperacion: 'MEDIA',

      nombre_personal_responsable: '',
      cedula_personal_responsable: '',
      telefono_personal_responsable: ''
    };

    return emptyRec;
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  // Sincronización inmediata al cambiar de usuario o iniciar sesión para usuarios de estado
  useEffect(() => {
    if (!initialVehicle) {
      if (isStateRestricted && assignedState) {
        const validCentros = getCentrosForState(assignedState, catalogs.centros_servicios);
        setFormData(prev => {
          const autoCode = generateAutoCorrelativo(assignedState, prev.tipo_vehiculo || 'CAMIONETA', existingVehicles);
          return {
            ...prev,
            region: assignedRegion,
            estado_venezuela: assignedState,
            centro_servicios: validCentros[0]?.nombre || '',
            correlativo_carga: autoCode,
            numero_vehiculo: useAutoCorrelativo ? autoCode : (prev.numero_vehiculo || autoCode)
          };
        });
      }
    }
  }, [currentUserEmail, assignedState, assignedRegion, isStateRestricted, initialVehicle]);


  const [isOtherModel, setIsOtherModel] = useState<boolean>(() => {
    if (!initialVehicle?.modelo_vehiculo) return false;
    const clean = initialVehicle.modelo_vehiculo.trim().toUpperCase();
    const brand = (initialVehicle.marca_vehiculo || 'TOYOTA').trim().toUpperCase();
    const brandModels = (catalogs.modelos || []).filter(m => (m.marca || '').toUpperCase() === brand || brand === 'OTRO' || m.marca === 'OTRO');
    return clean.includes('ESPECIFIQUE') || clean === 'OTRO' || !brandModels.some((m: { nombre: string }) => m.nombre.toUpperCase() === clean);
  });
  const [customModelName, setCustomModelName] = useState<string>(() => {
    if (initialVehicle?.modelo_vehiculo) {
      const clean = initialVehicle.modelo_vehiculo.trim().toUpperCase();
      if (clean.includes('ESPECIFIQUE') || clean === 'OTRO') {
        return initialVehicle.modelo_vehiculo;
      }
    }
    return '';
  });

  const currentBrand = formData.marca_vehiculo || 'TOYOTA';
  
  const availableModels = useMemo(() => {
    const brandUpper = currentBrand.toUpperCase();
    const models = (catalogs.modelos || []).filter(m => {
      const mBrand = (m.marca || '').toUpperCase();
      return mBrand === brandUpper || brandUpper === 'OTRO' || mBrand === 'OTRO';
    });
    return models;
  }, [catalogs.modelos, currentBrand]);

  const selectedModelItem = useMemo(() => {
    return (catalogs.modelos || []).find(m => m.nombre === formData.modelo_vehiculo) || availableModels[0];
  }, [catalogs.modelos, formData.modelo_vehiculo, availableModels]);

  // Auto-calculate suggested repairs count based on bad/regular components
  const calculatedRepairs = useMemo(() => {
    let count = 0;
    for (const field of COMPONENT_FIELDS) {
      const val = (formData[field] as string || '').toUpperCase();
      if (val === 'MALO' || val === 'REGULAR') count++;
    }
    return count;
  }, [formData]);

  // Validation errors
  const validationErrors = useMemo(() => {
    return validateSingleVehicle(formData, existingVehicles, Boolean(initialVehicle));
  }, [formData, existingVehicles, initialVehicle]);

  const hardErrors = validationErrors.filter(e => e.tipo === 'error');
  const warnings = validationErrors.filter(e => e.tipo === 'advertencia');

  const availableCentrosForCurrentState = useMemo(() => {
    return getCentrosForState(
      formData.estado_venezuela, 
      catalogs.centros_servicios
    );
  }, [formData.estado_venezuela, catalogs.centros_servicios]);

  const handleRegionChange = (newRegionName: string) => {
    if (isStateRestricted) return; // Bloqueo de seguridad: No se permite cambiar de región a usuarios restringidos
    const statesInRegion = getStatesForRegion(newRegionName);
    const currentIsInside = statesInRegion.some(s => s.nombre === formData.estado_venezuela);
    const targetState = currentIsInside 
      ? (formData.estado_venezuela || statesInRegion[0]?.nombre || 'Guayana Esequiba')
      : (statesInRegion[0]?.nombre || 'Guayana Esequiba');

    // Cascada de Llave Foránea: EL ESTADO DETERMINA ESTRICTAMENTE LOS CENTROS DE SERVICIOS
    const validCentros = getCentrosForState(targetState, catalogs.centros_servicios);
    const currentCsValid = validCentros.some(cs => cs.nombre === formData.centro_servicios);
    const targetCs = currentCsValid 
      ? (formData.centro_servicios || validCentros[0]?.nombre || '') 
      : (validCentros[0]?.nombre || '');

    const newCode = useAutoCorrelativo 
      ? generateAutoCorrelativo(targetState, formData.tipo_vehiculo || 'CAMIONETA', existingVehicles)
      : (formData.correlativo_carga || '');

    setFormData(prev => ({
      ...prev,
      region: newRegionName,
      estado_venezuela: targetState,
      centro_servicios: targetCs,
      correlativo_carga: newCode,
      numero_vehiculo: useAutoCorrelativo ? newCode : prev.numero_vehiculo
    }));
  };

  const handleStateChange = (newState: string) => {
    if (isStateRestricted) return; // Bloqueo de seguridad: No se permite cambiar de estado a usuarios restringidos
    // Verificar que el estado pertenezca a la región seleccionada (garantía de Llave Foránea)
    const statesInRegion = getStatesForRegion(formData.region);
    const belongsToCurrentRegion = statesInRegion.some(s => s.nombre === newState);
    const newRegion = belongsToCurrentRegion 
      ? (formData.region || 'GUAYANA') 
      : getRegionForState(newState).nombre;

    // Cascada de Llave Foránea: EL ESTADO DETERMINA ESTRICTAMENTE LOS CENTROS DE SERVICIOS
    const validCentros = getCentrosForState(newState, catalogs.centros_servicios);
    const currentCsValid = validCentros.some(cs => cs.nombre === formData.centro_servicios);
    const targetCs = currentCsValid 
      ? (formData.centro_servicios || validCentros[0]?.nombre || '') 
      : (validCentros[0]?.nombre || '');

    const newCode = useAutoCorrelativo 
      ? generateAutoCorrelativo(newState, formData.tipo_vehiculo || 'CAMIONETA', existingVehicles)
      : (formData.correlativo_carga || '');

    setFormData(prev => ({
      ...prev,
      region: newRegion,
      estado_venezuela: newState,
      centro_servicios: targetCs,
      correlativo_carga: newCode,
      numero_vehiculo: useAutoCorrelativo ? newCode : prev.numero_vehiculo
    }));
  };

  const handleTipoChange = (newTipo: string) => {
    const currentState = formData.estado_venezuela || 'Guayana Esequiba';
    const newCode = useAutoCorrelativo
      ? generateAutoCorrelativo(currentState, newTipo, existingVehicles)
      : (formData.correlativo_carga || '');

    setFormData(prev => ({
      ...prev,
      tipo_vehiculo: newTipo,
      correlativo_carga: newCode,
      numero_vehiculo: useAutoCorrelativo ? newCode : prev.numero_vehiculo
    }));
  };

  const handleRegenerateCorrelativo = () => {
    const currentState = formData.estado_venezuela || 'Guayana Esequiba';
    const currentTipo = formData.tipo_vehiculo || 'CAMIONETA';
    const newCode = generateAutoCorrelativo(currentState, currentTipo, existingVehicles);

    setFormData(prev => ({
      ...prev,
      correlativo_carga: newCode,
      numero_vehiculo: useAutoCorrelativo ? newCode : prev.numero_vehiculo
    }));
  };

  const handleChange = (field: keyof VehicleRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandSelectChange = (val: string) => {
    const newBrand = val.toUpperCase();
    const brandModels = (catalogs.modelos || []).filter(m => (m.marca || '').toUpperCase() === newBrand || m.marca === 'OTRO');
    const defaultModel = brandModels[0]?.nombre || '';
    setIsOtherModel(false);
    setCustomModelName('');

    setFormData(prev => ({
      ...prev,
      marca_vehiculo: newBrand,
      modelo_vehiculo: defaultModel
    }));
  };


  const handleModelSelectChange = (val: string) => {
    if (val === 'OTRO / ESPECIFICAR' || val === 'OTRO') {
      setIsOtherModel(true);
      setFormData(prev => ({ ...prev, modelo_vehiculo: customModelName || 'OTRO / ESPECIFICAR' }));
    } else {
      setIsOtherModel(false);
      setFormData(prev => ({ ...prev, modelo_vehiculo: val }));
    }
  };

  const handleCustomModelChange = (rawInput: string) => {
    const upper = rawInput.toUpperCase();
    setCustomModelName(upper);
    setFormData(prev => ({ ...prev, modelo_vehiculo: upper }));
  };

  const handleComponentBulkSet = (status: ComponentStatus) => {
    const patch: Partial<VehicleRecord> = {};
    COMPONENT_FIELDS.forEach(f => {
      (patch as any)[f] = status;
    });
    setFormData(prev => ({
      ...prev,
      ...patch,
      cant_total_reparaciones: status === 'MALO' || status === 'REGULAR' ? 21 : 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (isOtherModel && (!customModelName || customModelName.trim() === '')) {
      setFormSubmitError('Debe especificar el modelo personalizado en el campo habilitado.');
      setActiveStep(1);
      return;
    }

    const photosCount = (formData.fotos_vehiculo || []).filter(Boolean).length;
    if (photosCount < 3) {
      setFormSubmitError('Debe registrar al menos 3 fotografías del vehículo en la sección 5.');
      setActiveStep(5);
      return;
    }

    // Restricción de seguridad RBAC Territorial: Los usuarios con rol 'estado' solo pueden registrar en su entidad asignada
    if (isStateRestricted && assignedState) {
      if ((formData.estado_venezuela || '').toUpperCase() !== assignedState.toUpperCase()) {
        setFormSubmitError(`Restricción de Seguridad SEN: Su usuario (${userProfile.nombre}) está asignado exclusivamente al Estado ${assignedState}. No tiene autorización para registrar ni modificar vehículos en otra entidad territorial.`);
        setActiveStep(1);
        return;
      }
    }

    setFormSubmitError(null);

    const resolvedBrand = (formData.marca_vehiculo || 'TOYOTA').trim().toUpperCase();
    const resolvedModel = isOtherModel 
      ? (customModelName.trim().toUpperCase() || 'OTRO / ESPECIFICAR')
      : (formData.modelo_vehiculo || '').trim().toUpperCase();

    const fullRecord: VehicleRecord = {
      ...(formData as VehicleRecord),
      id: formData.id || `veh-${Date.now()}`,
      numero_vehiculo: (formData.numero_vehiculo || '').trim().toUpperCase(),
      marca_vehiculo: resolvedBrand,
      modelo_vehiculo: resolvedModel,
      ultima_actualizacion: new Date().toISOString().split('T')[0]
    };

    onSaveVehicle(fullRecord);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#0b3d2e] rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b3d2e] uppercase tracking-wider mb-1">
              <Car className="w-4 h-4 text-[#c9a227]" />
              <span>{initialVehicle ? 'Edición de Registro Oficial' : 'Formulario de Captura Estandarizado SEN'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {initialVehicle ? `Actualizar Ficha: ${initialVehicle.numero_vehiculo}` : 'Registro de Unidad de Flota Vehicular'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial text-center justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[40px] flex items-center"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm whitespace-nowrap cursor-pointer hover:brightness-110 min-h-[40px]"
              style={{
                background: 'linear-gradient(135deg, #0b3d2e 0%, #1a5f47 100%)',
                border: '1px solid #c9a227'
              }}
            >
              <Save className="w-4 h-4 text-[#c9a227]" />
              <span>Guardar Ficha</span>
            </button>
          </div>
        </div>

        {/* Step Tabs: Horizontal scrollable on phones, grid on tablet/desktop */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-slate-100 flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
          {[
            { step: 1, label: '1. Ficha General', shortLabel: '1. General', icon: Car },
            { step: 2, label: '2. Componentes', shortLabel: '2. Mecánica', icon: Wrench },
            { step: 3, label: '3. Insumos y Cauchos', shortLabel: '3. Insumos', icon: BatteryCharging },
            { step: 4, label: '4. Recuperación', shortLabel: '4. Origen', icon: FileText },
            { step: 5, label: '5. Custodio', shortLabel: '5. Custodio', icon: UserCheck }
          ].map(s => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 py-2 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[42px] sm:min-h-0 ${
                  isCurrent
                    ? 'bg-[#0b3d2e] text-white border border-[#c9a227] shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[#c9a227]' : ''}`} />
                <span className="hidden sm:inline truncate">{s.label}</span>
                <span className="sm:hidden">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>



      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: General & Location */}
        {activeStep === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b3d2e] uppercase tracking-wider mb-1">
                <Car className="w-4 h-4 text-[#c9a227]" />
                <span>Ubicación Territorial e Identificación de Flota</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Ficha General del Activo Vehicular
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete la información de ubicación y características del vehículo en flujo continuo.
              </p>
            </div>

            {/* Banner de Ámbito y Seguridad Territorial SEN */}
            {isStateRestricted ? (
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Ámbito Territorial Restringido:</span> Conectado como{' '}
                    <strong>{userProfile.nombre}</strong>. El formulario se ha pre-posicionado automáticamente en el{' '}
                    <strong className="underline decoration-emerald-500">Estado {assignedState}</strong> ({assignedRegion}).
                    <span className="block text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      🔒 Por política de seguridad SEN, únicamente tiene permisos para registrar y gestionar unidades de esta entidad.
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded font-bold uppercase shrink-0 border border-emerald-300">
                  ESTADO: {assignedState.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Acceso de Ámbito Nacional / Administrador:</span> Conectado como{' '}
                    <strong>{userProfile.nombre}</strong> ({userProfile.cargo}).
                    <span className="block text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                      🌐 Posee permisos irrestrictos para seleccionar libremente cualquier Región y Estado de Venezuela.
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline font-mono text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-bold uppercase shrink-0 border border-blue-200">
                  ACCESO TOTAL
                </span>
              </div>
            )}

            {/* Ubicación Territorial y Organizacional */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Región CORPOELEC */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900">
                    Región CORPOELEC
                  </label>
                  {isStateRestricted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Fijada</span>
                    </span>
                  )}
                </div>
                <select
                  value={formData.region || 'Región Guayana'}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  disabled={isStateRestricted}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none font-medium uppercase ${
                    isStateRestricted
                      ? 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-[#1a5f47] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-90'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-emerald-600'
                  }`}
                  required
                >
                  {isStateRestricted ? (
                    <option value={assignedRegion} className="bg-white text-slate-900 uppercase">
                      {assignedRegion.toUpperCase()}
                    </option>
                  ) : (
                    VENEZUELA_REGIONS.map(reg => (
                      <option key={reg.id} value={reg.nombre} className="bg-white text-slate-900 uppercase">
                        {reg.nombre.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block flex items-center gap-1">
                  {isStateRestricted ? (
                    <>
                      <Lock className="w-3 h-3 text-[#c9a227]" />
                      <span>Región oficial SEN asignada ({assignedRegion})</span>
                    </>
                  ) : (
                    <span>División SEN asignada</span>
                  )}
                </span>
              </div>

              {/* Estado Asociado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900">
                    Estado Asociado
                  </label>
                  {isStateRestricted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>
                <select
                  value={formData.estado_venezuela || ''}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={isStateRestricted}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none font-medium uppercase ${
                    isStateRestricted
                      ? 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-[#1a5f47] text-slate-900 dark:text-white font-bold cursor-not-allowed opacity-95'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-blue-700'
                  }`}
                  required
                >
                  {isStateRestricted ? (
                    <option value={assignedState} className="bg-white text-slate-900 font-bold uppercase">
                      {assignedState.toUpperCase()}
                    </option>
                  ) : (
                    <>
                      <option value="">-- SELECCIONE ESTADO --</option>
                      {getStatesForRegion(formData.region).map(st => (
                        <option key={st.id} value={st.nombre} className="bg-white text-slate-900 uppercase">
                          {st.nombre.toUpperCase()}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block flex items-center gap-1">
                  {isStateRestricted ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Entidad federal asignada ({assignedState})
                      </span>
                    </>
                  ) : (
                    <span>Entidad federal correspondiente</span>
                  )}
                </span>
              </div>

              {/* Centro de Servicio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900">
                    Centro de Servicio
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                    {availableCentrosForCurrentState.length} sedes
                  </span>
                </div>
                <select
                  value={formData.centro_servicios || ''}
                  onChange={(e) => handleChange('centro_servicios', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONAR CENTRO DE SERVICIO --</option>
                  {availableCentrosForCurrentState.map(cs => (
                    <option key={cs.id} value={cs.nombre} className="bg-white text-slate-900 uppercase">
                      {cs.nombre.toUpperCase()} {cs.tipo ? `· ${cs.tipo.toUpperCase()}` : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Base operativa filtrada por estado
                </span>
              </div>

              {/* Unidad Asignada */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900">
                    Unidad Asignada
                  </label>
                </div>
                <select
                  value={formData.unidad_asignada || ''}
                  onChange={(e) => handleChange('unidad_asignada', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE UNIDAD --</option>
                  {catalogs.unidades_asignadas.map(u => (
                    <option key={u.id} value={u.nombre} className="bg-white text-slate-900 uppercase">
                      {u.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Gerencia u área operativa
                </span>
              </div>
            </div>

            {/* Información del Vehículo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Tipo de Vehículo */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Tipo de Vehículo
                </label>
                <select
                  value={formData.tipo_vehiculo || ''}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE TIPO DE VEHÍCULO --</option>
                  {catalogs.tipos_vehiculo.map(tv => (
                    <option key={tv.id} value={tv.nombre} className="bg-white text-slate-900 uppercase">
                      {tv.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Clasificación del automotor
                </span>
              </div>

              {/* Placa del Vehículo */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Placa del Vehículo (Identificador Único)
                </label>
                <input
                  type="text"
                  value={formData.placa || ''}
                  onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                  placeholder="EJ. AB123CD"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 text-slate-900 uppercase"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Placa oficial única (no repetible)
                </span>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Marca
                </label>
                <select
                  value={formData.marca_vehiculo || ''}
                  onChange={(e) => handleBrandSelectChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE MARCA --</option>
                  {catalogs.marcas.map(m => (
                    <option key={m.id} value={m.nombre} className="bg-white text-slate-900 uppercase">{m.nombre.toUpperCase()}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Fabricante del automotor
                </span>
              </div>

              {/* Modelo del Vehículo */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Modelo del Vehículo
                </label>
                <select
                  value={isOtherModel ? 'OTRO / ESPECIFICAR' : (formData.modelo_vehiculo || '')}
                  onChange={(e) => handleModelSelectChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE MODELO --</option>
                  {availableModels.map(m => (
                    <option key={m.id} value={m.nombre} className="bg-white text-slate-900 uppercase">
                      {m.nombre.toUpperCase()}
                    </option>
                  ))}
                  {!availableModels.some(m => m.nombre === 'OTRO / ESPECIFICAR') && (
                    <option value="OTRO / ESPECIFICAR" className="bg-white text-slate-900 uppercase">
                      OTRO / ESPECIFICAR
                    </option>
                  )}
                </select>

                {isOtherModel && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="text"
                      value={customModelName}
                      onChange={(e) => handleCustomModelChange(e.target.value)}
                      placeholder="ESPECIFIQUE MODELO..."
                      className="w-full px-2 py-1 text-xs font-bold uppercase bg-white border border-blue-400 rounded focus:outline-none text-slate-900"
                      required={isOtherModel}
                      autoFocus
                    />
                  </div>
                )}


                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Modelo oficial homologado para Corpoelec
                </span>
              </div>
            </div>

            {/* Estatus, Condición y Mantenimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Estatus General */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Estatus General
                </label>
                <select
                  value={formData.estado || ''}
                  onChange={(e) => handleChange('estado', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE ESTATUS --</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              {/* Condición Operativa */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Condición Operativa Actual
                </label>
                <select
                  value={formData.condicion_actual || ''}
                  onChange={(e) => handleChange('condicion_actual', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE CONDICIÓN --</option>
                  <option value="EXCELENTE / OPTIMO">EXCELENTE / OPTIMO</option>
                  <option value="BUENO">BUENO</option>
                  <option value="REGULAR">REGULAR</option>
                  <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                  <option value="DESINCORPORAR">DESINCORPORAR</option>
                </select>
              </div>

              {/* Tipo de Mantenimiento */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Tipo de Mantenimiento Preventivo
                </label>
                <select
                  value={formData.mantenimiento_preventivo || ''}
                  onChange={(e) => handleChange('mantenimiento_preventivo', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 font-medium uppercase"
                  required
                >
                  <option value="">-- SELECCIONE MANTENIMIENTO --</option>
                  <option value="AL DIA">AL DIA</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="NO APLICA">NO APLICA</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <span>Siguiente: Componentes Mecánicos</span>
                <ArrowRight className="w-4 h-4 text-[#c9a227]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 21 Mechanical & Electrical Components */}
        {activeStep === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">2. Diagnóstico Técnico de los 21 Componentes</h2>
              </div>

              {/* Fast Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Atajos:</span>
                <button
                  type="button"
                  onClick={() => handleComponentBulkSet('BUENO')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                >
                  Todo BUENO
                </button>
                <button
                  type="button"
                  onClick={() => handleComponentBulkSet('REGULAR')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                >
                  Todo REGULAR
                </button>
                <button
                  type="button"
                  onClick={() => handleComponentBulkSet('N/A')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                >
                  Todo N/A
                </button>
              </div>
            </div>

            {/* Diagnostic helper badge */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600">
                Componentes con observaciones (REGULAR / MALO): <strong className="text-slate-900 font-mono">{calculatedRepairs}</strong> de 21
              </span>
              <span className="text-slate-500 text-[11px]">
                Valores autorizados: BUENO · REGULAR · MALO · N/A
              </span>
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COMPONENT_FIELDS.map((compField) => {
                const colDef = FLEET_COLUMNS.find(c => c.campo === compField)!;
                const currentValue = (formData[compField] as ComponentStatus) || 'BUENO';

                return (
                  <div key={compField} className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-xs text-slate-900">{colDef.titulo}</span>
                    </div>

                    {/* Segmented Selector with Mobile Touch Targets */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-xs sm:text-[10px] font-semibold">
                      {(['BUENO', 'REGULAR', 'MALO', 'N/A'] as ComponentStatus[]).map(st => {
                        const isSelected = currentValue === st;
                        let activeClasses = 'bg-white text-slate-900 shadow-xs';
                        if (isSelected) {
                          if (st === 'BUENO') activeClasses = 'bg-emerald-600 text-white shadow-xs font-bold';
                          if (st === 'REGULAR') activeClasses = 'bg-amber-500 text-white shadow-xs font-bold';
                          if (st === 'MALO') activeClasses = 'bg-red-600 text-white shadow-xs font-bold';
                          if (st === 'N/A') activeClasses = 'bg-slate-700 text-white shadow-xs font-bold';
                        }
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleChange(compField, st)}
                            className={`py-2 sm:py-1 min-h-[38px] sm:min-h-0 text-center rounded transition-colors cursor-pointer ${
                              isSelected ? activeClasses : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior: Ficha General</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <span>Siguiente: Insumos</span>
                <ArrowRight className="w-4 h-4 text-[#c9a227]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Supplies, Tires, Batteries & Repairs */}
        {activeStep === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">3. Insumos, Repuestos y Requerimientos</h2>
            </div>

            {/* Calculations auto-fill button */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>
                  Basado en la inspección de los 21 componentes, se sugieren <strong>{calculatedRepairs}</strong> reparaciones.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('cant_total_reparaciones', calculatedRepairs)}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
              >
                Sincronizar a {calculatedRepairs}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Col AD: Cant. Total Reparaciones */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Cant. Total de Reparaciones
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cant_total_reparaciones ?? 0}
                  onChange={(e) => handleChange('cant_total_reparaciones', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Col AE: Cant. de Cauchos */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Cant. de Cauchos Requeridos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cant_cauchos ?? 0}
                  onChange={(e) => handleChange('cant_cauchos', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Col AF: Medidas del Caucho (Catálogo) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Medidas del Caucho <span className="text-slate-500 text-[10px]">[Catálogo]</span>
                </label>
                <select
                  value={formData.medidas_caucho || ''}
                  onChange={(e) => handleChange('medidas_caucho', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                >
                  <option value="">-- Seleccionar Medida --</option>
                  {catalogs.medidas_cauchos.map(mc => (
                    <option key={mc.id} value={mc.nombre}>{mc.nombre} ({mc.adicional || ''})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cantidad Baterías */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Cantidad de Baterías
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cantidad_baterias ?? 1}
                  onChange={(e) => handleChange('cantidad_baterias', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Características Batería (Catálogo) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Características de Batería <span className="text-slate-500 text-[10px]">[Catálogo]</span>
                </label>
                <select
                  value={formData.caracteristicas_bateria || ''}
                  onChange={(e) => handleChange('caracteristicas_bateria', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                >
                  <option value="">-- Seleccionar Especificación --</option>
                  {catalogs.caracteristicas_baterias.map(cb => (
                    <option key={cb.id} value={cb.nombre}>{cb.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Prioridad de Recuperación */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Prioridad de Recuperación
                </label>
                <select
                  value={formData.prioridad_recuperacion || 'MEDIA'}
                  onChange={(e) => handleChange('prioridad_recuperacion', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                >
                  <option value="ALTA">ALTA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="BAJA">BAJA</option>
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Observaciones Generales
              </label>
              <textarea
                rows={3}
                value={formData.observacion || ''}
                onChange={(e) => handleChange('observacion', e.target.value)}
                placeholder="Detalles sobre averías mecánicas, faltantes, estado de carrocería, etc."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior: 21 Componentes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <span>Siguiente: Recuperación</span>
                <ArrowRight className="w-4 h-4 text-[#c9a227]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Traceability & Inter-management Transfers */}
        {activeStep === 4 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">4. Trazabilidad de Recuperación y Traspaso de Gerencias</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Recuperación */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Módulo de Recuperación</h3>
                
                {/* Vehículo Recuperado */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Vehículo Recuperado
                  </label>
                  <select
                    value={formData.vehiculo_recuperado || 'NO'}
                    onChange={(e) => handleChange('vehiculo_recuperado', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  >
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </div>

                {/* Fecha de Recuperación */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fecha de Recuperación
                  </label>
                  <input
                    type="text"
                    value={formData.fecha_recuperacion || ''}
                    disabled={formData.vehiculo_recuperado !== 'SI'}
                    onChange={(e) => handleChange('fecha_recuperacion', e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-400">
                    {formData.vehiculo_recuperado === 'SI' ? 'Requerido en formato DD/MM/AAAA' : 'Solo aplica si fue recuperado.'}
                  </span>
                </div>
              </div>

              {/* Box 2: Gerencia Origen y Devolución */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Gerencia de Origen y Devolución</h3>

                {/* Gerencia Origen (Catálogo) */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gerencia de Origen <span className="text-slate-500 text-[10px]">[Catálogo]</span>
                  </label>
                  <select
                    value={formData.gerencia_origen || ''}
                    onChange={(e) => handleChange('gerencia_origen', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  >
                    <option value="">-- Seleccionar Gerencia --</option>
                    {catalogs.gerencias.map(g => (
                      <option key={g.id} value={g.nombre}>{g.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Devuelto */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ¿Vehículo Devuelto a Gerencia Origen?
                  </label>
                  <select
                    value={formData.vehiculo_otra_gerencia_devuelto || 'NO'}
                    onChange={(e) => handleChange('vehiculo_otra_gerencia_devuelto', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  >
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </div>

                {/* Fecha Entrega */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fecha de Entrega a Gerencia de Origen
                  </label>
                  <input
                    type="text"
                    value={formData.fecha_entrega_gerencia_origen || ''}
                    disabled={formData.vehiculo_otra_gerencia_devuelto !== 'SI'}
                    onChange={(e) => handleChange('fecha_entrega_gerencia_origen', e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-400">
                    {formData.vehiculo_otra_gerencia_devuelto === 'SI' ? 'Fecha formal de acta de entrega' : 'Solo aplica si fue devuelto.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior: Insumos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <span>Siguiente: Personal Asignado</span>
                <ArrowRight className="w-4 h-4 text-[#c9a227]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Responsible Custodian & Final Correlative */}
        {activeStep === 5 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">5. Custodia y Personal Asignado Responsable</h2>
              <p className="text-xs text-slate-500">Última sección: Verificación de correlativo y datos del custodio antes de finalizar</p>
            </div>

            {/* Internal Correlative & Placa Verification Box */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 uppercase tracking-wide">
                  Identificador y Correlativo de Consolidado (Generado por el Sistema)
                </span>
                <span className="font-mono text-xs font-black bg-amber-200/60 px-2 py-0.5 rounded text-amber-900">
                  CLAVE ÚNICA GGDT
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Número de Vehículo (Correlativo Sistema)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.numero_vehiculo || ''}
                      onChange={(e) => {
                        setUseAutoCorrelativo(false);
                        handleChange('numero_vehiculo', e.target.value.toUpperCase());
                      }}
                      className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 text-slate-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateCorrelativo}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Recalcular correlativo automático"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Placa Registrada
                  </label>
                  <input
                    type="text"
                    value={formData.placa || ''}
                    disabled
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-lg text-slate-700 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nombre del Personal Responsable
                </label>
                <input
                  type="text"
                  value={formData.nombre_personal_responsable || ''}
                  onChange={(e) => handleChange('nombre_personal_responsable', e.target.value)}
                  placeholder="Ej. José Ramón Escalona"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  N° de C.I. del Personal Responsable
                </label>
                <input
                  type="text"
                  value={formData.cedula_personal_responsable || ''}
                  onChange={(e) => handleChange('cedula_personal_responsable', e.target.value.toUpperCase())}
                  placeholder="Ej. V-14892301"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={formData.telefono_personal_responsable || ''}
                  onChange={(e) => handleChange('telefono_personal_responsable', e.target.value)}
                  placeholder="Ej. 0414-2394851"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>
            </div>

            {/* Registro Fotográfico (al menos 3 fotos) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Registro Fotográfico del Vehículo (Mínimo 3 Fotos Requeridas)</h3>
                  <p className="text-[11px] text-slate-500">Adjunte o cargue al menos 3 imágenes de evidencia (Ej. Frente, Costado/Placa, Interior/Motor)</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {((formData.fotos_vehiculo || []).filter(Boolean).length)} / 3 Fotos registradas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const fotos = formData.fotos_vehiculo || ['', '', ''];
                  const currentPhoto = fotos[idx] || '';
                  return (
                    <div key={idx} className="relative p-3 bg-white border border-slate-300 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Foto N° {idx + 1} {idx === 0 ? '(Frontal)' : idx === 1 ? '(Lateral / Placa)' : '(Posterior / Motor)'}</span>
                        {currentPhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...fotos];
                              updated[idx] = '';
                              handleChange('fotos_vehiculo', updated);
                            }}
                            className="text-red-600 hover:text-red-800 text-[11px]"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      {currentPhoto ? (
                        <div className="relative h-28 bg-slate-100 rounded overflow-hidden border border-slate-200">
                          <img src={currentPhoto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center h-28 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-2 text-center hover:bg-slate-100 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  const result = uploadEvent.target?.result as string;
                                  const updated = [...(formData.fotos_vehiculo || ['', '', ''])];
                                  updated[idx] = result;
                                  handleChange('fotos_vehiculo', updated);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute opacity-0 w-full h-full cursor-pointer inset-0 z-10"
                            title="Seleccionar foto"
                          />
                          <Sparkles className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-[10px] font-medium text-slate-600">Click para adjuntar foto</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Resumen de Validación de la Ficha:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  LISTO PARA GUARDAR
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>Placa: <strong className="font-mono text-slate-900">{formData.placa || '(Sin placa)'}</strong></span>
                <span>·</span>
                <span>Marca: <strong>{formData.marca_vehiculo}</strong></span>
                <span>·</span>
                <span>Estado: <strong>{formData.estado}</strong></span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior: Recuperación</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-lg transition-all shadow-md cursor-pointer hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #0b3d2e 0%, #1a5f47 100%)',
                  border: '1px solid #c9a227'
                }}
              >
                <Save className="w-4 h-4 text-[#c9a227]" />
                <span>Finalizar y Guardar Ficha</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Barra Flotante de Acciones Rápidas para Móviles */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-white/95 dark:bg-[#071b14]/95 border-t border-slate-200 dark:border-[#1a5f47] backdrop-blur-md shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() => setActiveStep(prev => prev - 1)}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center font-bold text-xs"
              title="Paso Anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 px-1.5">
            Paso {activeStep}/5
          </span>
          {activeStep < 5 && (
            <button
              type="button"
              onClick={() => setActiveStep(prev => prev + 1)}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center font-bold text-xs"
              title="Siguiente Paso"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-lg min-h-[40px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0b3d2e] text-white border border-[#c9a227] rounded-lg text-xs font-bold shadow-xs min-h-[40px] cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#c9a227]" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
