import React, { useState } from 'react';
import { 
  FolderPlus, 
  Layers, 
  FolderTree, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  Cloud,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { ProcessDefinition, ProcessCategory, ProcessFrequency, ColumnDefinition } from '../../types/ingestion';
import { 
  getStoredProcesses, 
  saveProcessDefinition, 
  deleteProcessDefinition,
  exportOfficialTemplateExcel,
  triggerGoogleDriveProvisioning,
  buildVirtualDataLakeTree
} from '../../services/dataIngestionService';
import { useAuth } from '../../context/AuthContext';

export const ProcessDirectoryManager: React.FC = () => {
  const { session } = useAuth();
  const [processes, setProcesses] = useState<ProcessDefinition[]>(getStoredProcesses());
  const [activeTab, setActiveTab] = useState<'catalog' | 'tree' | 'new_process'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  
  // Árbol virtual de Google Drive
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    '/GGPD_DATA_LAKE_OFICIAL': true,
    '/GGPD_DATA_LAKE_OFICIAL/01_DCA_DISTRITO_CAPITAL': true
  });
  const dataLakeTree = buildVirtualDataLakeTree();

  // Formulario de Nuevo Proceso Dinámico
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ProcessCategory>('MANTENIMIENTO_CONTROL');
  const [newFrequency, setNewFrequency] = useState<ProcessFrequency>('SEMANAL');
  const [newColumns, setNewColumns] = useState<ColumnDefinition[]>([
    { name: 'COD_ESTADO', type: 'string', description: 'Código de Estado', required: true, sampleValue: 'DCA' },
    { name: 'UBICACION', type: 'string', description: 'Subestación o Circuito', required: true, sampleValue: 'S/E CHACAO' },
    { name: 'CANTIDAD_EJECUTADA', type: 'number', description: 'Métrica o volumen ejecutado', required: true, sampleValue: '10' },
    { name: 'FECHA_REGISTRO', type: 'string', description: 'Fecha del trabajo (YYYY-MM-DD)', required: true, sampleValue: '2026-08-14' }
  ]);

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleAddColumn = () => {
    setNewColumns(prev => [
      ...prev,
      { name: `CAMPO_${prev.length + 1}`, type: 'string', description: 'Descripción del campo', required: true, sampleValue: 'VALOR' }
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setNewColumns(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateColumn = (index: number, field: keyof ColumnDefinition, value: any) => {
    setNewColumns(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newShortName) {
      alert('Por favor complete los campos obligatorios del proceso.');
      return;
    }

    const cleanCode = newCode.toUpperCase().startsWith('0') ? newCode.toUpperCase() : `0${processes.length + 1}_${newCode.toUpperCase().replace(/\s+/g, '_')}`;
    const cleanPrefix = cleanCode.split('_')[1] || cleanCode;

    const newProc: ProcessDefinition = {
      id: cleanPrefix.toLowerCase(),
      code: cleanCode,
      name: newName,
      shortName: newShortName,
      description: newDescription || `Proceso de ${newName} para la red de distribución.`,
      category: newCategory,
      targetApp: 'Módulo Dinámico SIGI',
      frequency: newFrequency,
      namingPattern: `${cleanPrefix}_[ESTADO]_[YYYYMMDD]_V01.xlsx`,
      icon: 'Layers',
      color: '#00f2fe',
      createdAt: new Date().toISOString(),
      isDynamic: true,
      provisionedStatesCount: 25,
      requiredColumns: newColumns
    };

    saveProcessDefinition(newProc);
    setProcesses(getStoredProcesses());
    
    // Disparar aprovisionamiento en Google Drive
    setIsProvisioning(true);
    const res = await triggerGoogleDriveProvisioning('PROVISION_NEW_PROCESS', { code: newProc.code, name: newProc.shortName.toUpperCase().replace(/\s+/g, '_') });
    setIsProvisioning(false);

    setProvisionResult({
      status: 'success',
      message: `¡Proceso '${newProc.name}' registrado exitosamente! Se han aprovisionado carpetas en los 25 Estados en Google Drive.`
    });

    // Reset form
    setNewCode('');
    setNewName('');
    setNewShortName('');
    setNewDescription('');
    setActiveTab('catalog');
  };

  const handleGlobalProvision = async () => {
    if (!confirm('¿Desea sincronizar y aprovisionar la estructura completa de carpetas del Data Lake (25 estados x todos los procesos) en Google Drive?')) return;
    
    setIsProvisioning(true);
    setProvisionResult({ status: 'idle', message: '' });
    const res = await triggerGoogleDriveProvisioning('PROVISION_DATA_LAKE');
    setIsProvisioning(false);
    
    setProvisionResult({
      status: 'success',
      message: 'Estructura oficial del Data Lake GGPD 2026 sincronizada exitosamente con Google Drive.'
    });
  };

  const filteredProcesses = processes.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          p.shortName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Institucional del Módulo */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#002b49] via-[#072146] to-[#0a3560] p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-400/30">
                GOBERNANZA ISO 8000
              </span>
              <span className="text-xs text-slate-300 font-medium">Google Drive Data Lake SEN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
              <FolderTree className="h-6 w-6 text-[#00f2fe]" />
              Catálogo de Procesos & Aprovisionamiento Nube
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              Gestione los macro-procesos operativos, defina reglas de calidad sintáctica y aprovisione dinámicamente el árbol de directorios para los 25 Estados de Venezuela.
            </p>
          </div>

          {/* Botón de Sincronización Global */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGlobalProvision}
              disabled={isProvisioning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] text-[#060d1a] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isProvisioning ? 'animate-spin' : ''}`} />
              <span>{isProvisioning ? 'Aprovisionando...' : 'Sincronizar Data Lake'}</span>
            </button>
            <a
              href="https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
              title="Abrir carpeta raíz en Google Drive"
            >
              <Cloud className="h-4 w-4 text-cyan-300" />
              <span className="hidden sm:inline">Ver en Drive</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Feedback Alert */}
        {provisionResult.status === 'success' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{provisionResult.message}</span>
          </div>
        )}
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Procesos Activos ({processes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tree'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Árbol de Directorios Google Drive (25 Estados)</span>
        </button>

        <button
          onClick={() => setActiveTab('new_process')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'new_process'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nuevo Proceso</span>
        </button>
      </div>

      {/* VISTA 1: CATÁLOGO DE PROCESOS */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filtros de Búsqueda y Categoría */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Filtrar:</span>
              {(['ALL', 'CORE_ESTRATEGICO', 'MANTENIMIENTO_CONTROL', 'ACTIVOS_RED'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-100 text-blue-800 dark:bg-cyan-950 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'Todos' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar proceso..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#002b49] dark:focus:border-[#00f2fe]"
              />
            </div>
          </div>

          {/* Cuadrícula de Tarjetas de Proceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProcesses.map(proc => (
              <div 
                key={proc.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-cyan-950/80 dark:text-cyan-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-cyan-500/30">
                        {proc.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        proc.frequency === 'SEMANAL' 
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                      }`}>
                        {proc.frequency}
                      </span>
                    </div>

                    {proc.isDynamic && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Desea eliminar el proceso dinámico '${proc.name}'?`)) {
                            deleteProcessDefinition(proc.id);
                            setProcesses(getStoredProcesses());
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Eliminar proceso"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2 group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors">
                    {proc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {proc.description}
                  </p>

                  {/* Detalle de Nomenclatura y Columnas */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Nomenclatura:</span>
                      <span className="font-mono text-[9.5px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[170px]" title={proc.namingPattern}>
                        {proc.namingPattern}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Destino:</span>
                      <span className="font-medium">{proc.targetApp}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Esquema Exigido:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{proc.requiredColumns.length} Columnas ISO</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Estados Habilitados:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-cyan-300">25 / 25 Entidades</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => exportOfficialTemplateExcel(proc)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Descargar Plantilla Oficial Excel"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Descargar Plantilla</span>
                  </button>
                  <a
                    href="https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Ver carpeta en Google Drive"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* VISTA 2: ÁRBOL DE DIRECTORIOS GOOGLE DRIVE */}
      {activeTab === 'tree' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-[#00f2fe]" />
                Explorador de Arquitectura de Directorios (Data Lake SEN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estructura normalizada en tiempo real para las 25 entidades federales y consolidados nacionales.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>25 Estados Aprovisionados</span>
              </span>
            </div>
          </div>

          {/* Navegador del Árbol */}
          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 space-y-1 bg-slate-50 dark:bg-[#060e1d] p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[500px] overflow-y-auto">
            
            {/* Raíz */}
            <div className="flex items-center space-x-2 font-bold text-blue-800 dark:text-cyan-300 cursor-pointer select-none" onClick={() => toggleNode(dataLakeTree.path)}>
              {expandedNodes[dataLakeTree.path] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>📁 {dataLakeTree.name}</span>
            </div>

            {expandedNodes[dataLakeTree.path] && dataLakeTree.children && (
              <div className="pl-5 space-y-1.5 border-l border-slate-300 dark:border-slate-700 ml-2 mt-1">
                {dataLakeTree.children.map(stateNode => (
                  <div key={stateNode.path} className="space-y-1">
                    <div 
                      className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 px-2 py-1 rounded cursor-pointer select-none"
                      onClick={() => toggleNode(stateNode.path)}
                    >
                      <div className="flex items-center space-x-1.5">
                        {expandedNodes[stateNode.path] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        <span>📁 {stateNode.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">{stateNode.children?.length || 0} Procesos</span>
                    </div>

                    {/* Subcarpetas de Procesos por Estado */}
                    {expandedNodes[stateNode.path] && stateNode.children && (
                      <div className="pl-5 space-y-1 border-l border-slate-300 dark:border-slate-700 ml-3">
                        {stateNode.children.map(procNode => (
                          <div 
                            key={procNode.path}
                            className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 px-2 py-0.5 rounded"
                          >
                            <span className="truncate">📂 {procNode.name}/2026/08_AGOSTO/</span>
                            <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400">Normalizado ISO</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* VISTA 3: REGISTRO DE NUEVO PROCESO DINÁMICO */}
      {activeTab === 'new_process' && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-[#00f2fe]" />
              Formulario de Aprovisionamiento Dinámico de Nuevo Proceso
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina el código, nombre y esquema de columnas requeridas. El sistema creará automáticamente las carpetas en Google Drive en los 25 Estados y aplicará validación sintáctica en caliente.
            </p>
          </div>

          <form onSubmit={handleCreateProcess} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código de Proceso (ej. 05_SCPYP, 06_SCDES) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. 08_SCTER"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Oficial del Proceso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Seguimiento y Control de Termografía en S/E"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Corto / Etiqueta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. SC Termografía"
                  value={newShortName}
                  onChange={e => setNewShortName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría Operativa
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as ProcessCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="MANTENIMIENTO_CONTROL">Mantenimiento y Control</option>
                  <option value="ACTIVOS_RED">Activos de Red</option>
                  <option value="CORE_ESTRATEGICO">Core Estratégico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Frecuencia de Carga y Corte
                </label>
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value as ProcessFrequency)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="SEMANAL">Semanal (Miércoles a Jueves)</option>
                  <option value="MENSUAL">Mensual (3er Día Hábil posterior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Operativa
                </label>
                <input
                  type="text"
                  placeholder="Objetivo y alcance del proceso..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Constructor de Columnas Requeridas */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Esquema de Columnas Requeridas ({newColumns.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Defina los campos que el archivo Excel debe contener obligatoriamente para ser considerado conforme.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-cyan-950 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Campo</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {newColumns.map((col, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <input
                      type="text"
                      placeholder="NOMBRE_COLUMNA"
                      value={col.name}
                      onChange={e => handleUpdateColumn(idx, 'name', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                      className="w-full sm:w-1/4 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                    />

                    <select
                      value={col.type}
                      onChange={e => handleUpdateColumn(idx, 'type', e.target.value)}
                      className="w-full sm:w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="string">Texto</option>
                      <option value="number">Numérico</option>
                      <option value="date">Fecha</option>
                      <option value="boolean">Booleano</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Descripción del dato..."
                      value={col.description}
                      onChange={e => handleUpdateColumn(idx, 'description', e.target.value)}
                      className="w-full sm:flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                    />

                    <input
                      type="text"
                      placeholder="Valor Ejemplo"
                      value={col.sampleValue || ''}
                      onChange={e => handleUpdateColumn(idx, 'sampleValue', e.target.value)}
                      className="w-full sm:w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      disabled={newColumns.length <= 1}
                      className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      title="Eliminar campo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isProvisioning}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#072146] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FolderPlus className="h-4 w-4" />
                <span>{isProvisioning ? 'Creando en Google Drive...' : 'Registrar & Aprovisionar en 25 Estados'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
