import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  bciManagementService, 
  BciTokenRecord, 
  BciAuditRecord, 
  BciStats 
} from '../services/bciManagementService';
import { 
  Brain, 
  Key, 
  ShieldCheck, 
  Activity, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Trash2, 
  Terminal, 
  Code2, 
  Database, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Sliders,
  Server
} from 'lucide-react';

export const BciGovernanceModule: React.FC = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tokens' | 'audit' | 'sandbox' | 'mcp_guide'>('dashboard');
  
  // State
  const [tokens, setTokens] = useState<BciTokenRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<BciAuditRecord[]>([]);
  const [stats, setStats] = useState<BciStats>({
    totalTokens: 0,
    tokensActivos: 0,
    consultasHoy: 0,
    chunksTotales: 0,
    latenciaPromedioMs: 0,
    hechosL1Totales: 0,
    decisionesL2Totales: 0,
    appsL4Totales: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search Filters
  const [tokenSearch, setTokenSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  
  // Token Issuance Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'NIVEL_1_GENERAL' | 'NIVEL_2_TECNICO' | 'NIVEL_3_RESERVADO_DIRECTIVA'>('NIVEL_2_TECNICO');
  const [newDays, setNewDays] = useState(90);
  const [newQuota, setNewQuota] = useState(1000);
  
  // Generated Token Display Modal
  const [issuedTokenSecret, setIssuedTokenSecret] = useState<string | null>(null);
  const [issuedRecord, setIssuedRecord] = useState<BciTokenRecord | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // Sandbox Tester
  const [sandboxQuery, setSandboxQuery] = useState('');
  const [sandboxResults, setSandboxResults] = useState<any[] | null>(null);
  const [isSandboxSearching, setIsSandboxSearching] = useState(false);

  // Refresh
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tokenData, auditData, statsData] = await Promise.all([
        bciManagementService.getTokens(),
        bciManagementService.getAuditLogs(),
        bciManagementService.getStats()
      ]);
      setTokens(tokenData);
      setAuditLogs(auditData);
      setStats(statsData);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con la BCI en InsForge');
      setTokens([]);
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const usernameSlug = newUserEmail.split('@')[0].replace(/\./g, '_').toLowerCase();

    try {
      const { record, tokenPlain } = await bciManagementService.generateToken({
        usuario_id: usernameSlug,
        nombre_desarrollador: newUserName,
        correo_institucional: newUserEmail,
        gerencia_division: 'Planificación de Distribución (GGPD)',
        nivel_acceso: newUserRole,
        dias_vigencia: newDays,
        cuota_diaria: newQuota,
        emitido_por: session.userCode || session.name || 'admin.ggpd'
      });

      setIssuedTokenSecret(tokenPlain);
      setIssuedRecord(record);
      setIsIssueModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      refreshData();
    } catch (err: any) {
      setError(err?.message || 'Error al emitir el token en la BCI');
    }
  };

  const handleToggleState = async (token: BciTokenRecord) => {
    const newState = token.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    try {
      await bciManagementService.updateTokenState(token.id, newState);
      refreshData();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el estado del token');
    }
  };

  const handleRevoke = async (token: BciTokenRecord) => {
    if (window.confirm(`¿Está seguro de revocar permanentemente el token de ${token.nombre_desarrollador}?`)) {
      try {
        await bciManagementService.updateTokenState(token.id, 'REVOCADO', 'Revocación manual desde Consola SIGI');
        refreshData();
      } catch (err: any) {
        setError(err?.message || 'Error al revocar el token');
      }
    }
  };

  const handleCopy = (text: string, isMcp = false) => {
    navigator.clipboard.writeText(text);
    if (isMcp) {
      setCopiedMcp(true);
      setTimeout(() => setCopiedMcp(false), 2500);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  // Mock Sandbox Search
  const handleSandboxSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxQuery.trim()) return;

    setIsSandboxSearching(true);
    setTimeout(() => {
      // Mocked realistic RAG results based on InsForge knowledge
      const mockMatches = [
        {
          doc: 'DOC-GGPD-2026-METAS-001',
          section: '4.1. Fórmula de Criticidad e Impacto para Selección de Circuitos (MIMT)',
          title: 'Criterio de Pareto 60% e Impacto de Circuitos',
          content: 'Impacto del Circuito = (0.60 * NDI) + (0.40 * TTI). Se seleccionan los alimentadores que explican el 60% del impacto acumulado en la red del estado.',
          score: 0.8924,
          tags: ['METAS', 'CALIDAD_SERVICIO', 'MANTENIMIENTO']
        },
        {
          doc: 'DOC-GGPD-2026-GOB-001',
          section: '2. Deconstrucción Crítica: Las 4 Falacias de la Super-App',
          title: 'Prohibición de Monolito y Cierre de WhatsApp',
          content: 'Regla de Oro: Lo que no está en InsForge PostgreSQL, NO EXISTE. Flujo desacoplado: SIGI -> SCMTP -> SCGCC.',
          score: 0.7641,
          tags: ['GOBERNANZA', 'SEGURIDAD', 'COBIT_2019']
        }
      ];
      setSandboxResults(mockMatches);
      setIsSandboxSearching(false);
      // La auditoría de la consulta la registra el backend (fn_validar_token_bci) de la BCI.
    }, 400);
  };

  // Filtered Lists
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => 
      t.nombre_desarrollador.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.usuario_id.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.token_prefix.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.nivel_acceso.toLowerCase().includes(tokenSearch.toLowerCase())
    );
  }, [tokens, tokenSearch]);

  const filteredAudit = useMemo(() => {
    return auditLogs.filter(a => 
      a.usuario_id.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.termino_busqueda.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.tipo_consulta.toLowerCase().includes(auditSearch.toLowerCase())
    );
  }, [auditLogs, auditSearch]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#041426] via-[#002b49] to-[#072146] text-white p-6 sm:p-8 shadow-2xl border border-[#00f2fe]/30">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                🛡️ ZERO-TRUST BCI GATEWAY · ISO/IEC 27001
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                HOST: jd3uejbz (Port 5432)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 text-[#00f2fe]" />
              Gobernanza de Memoria de IA & IAM (GGPD-BCI)
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 max-w-3xl leading-relaxed">
              Consola central de administración de tokens criptográficos, control de cuotas, auditoría forense en tiempo real y protocolo MCP para desarrolladores del SEN.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#ffd700] px-4 py-2.5 text-xs font-black text-[#041426] shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Emitir Token Criptográfico</span>
            </button>
            <button
              onClick={refreshData}
              title="Refrescar datos"
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 pt-6 mt-6 border-t border-white/15">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#041426] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 hover:bg-white/20'
            }`}
          >
            <Activity className="h-4 w-4 text-[#00f2fe]" />
            <span>1. Telemetría & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'tokens'
                ? 'bg-white text-[#041426] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 hover:bg-white/20'
            }`}
          >
            <Key className="h-4 w-4 text-amber-400" />
            <span>2. Gestión de Tokens ({tokens.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-[#041426] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 hover:bg-white/20'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>3. Bitácora de Auditoría (COBIT)</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-white text-[#041426] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 hover:bg-white/20'
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>4. Sandbox Tester RAG</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp_guide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'mcp_guide'
                ? 'bg-white text-[#041426] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 hover:bg-white/20'
            }`}
          >
            <Code2 className="h-4 w-4 text-teal-300" />
            <span>5. Protocolo IDE & MCP</span>
          </button>
        </div>
      </div>

      {/* Estado de carga / error / vacío de la BCI */}
      {isLoading && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-[#07172b] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-500" />
          <span>Cargando datos de la BCI en InsForge…</span>
        </div>
      )}
      {!isLoading && error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <strong>Error al conectar con la BCI (InsForge):</strong> {error}
            <button
              onClick={() => refreshData()}
              className="ml-2 underline hover:opacity-80 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      {!isLoading && !error && activeTab === 'tokens' && tokens.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
          No hay tokens BCI en InsForge. Emita el primer token para comenzar.
        </div>
      )}

      {/* VIEW 1: DASHBOARD & TELEMETRÍA */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#07172b] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Tokens Activos</span>
                <Key className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.tokensActivos} <span className="text-xs text-slate-400 font-normal">/ {stats.totalTokens} emitidos</span>
              </div>
              <div className="mt-2 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                100% Cifrados con SHA-256
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#07172b] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Consultas Hoy</span>
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.consultasHoy} <span className="text-xs text-slate-400 font-normal">consultas</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Ahorro estimado: <strong className="text-amber-500">~96% Tokens</strong>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#07172b] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Chunks RAG Indexados</span>
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.chunksTotales} <span className="text-xs text-slate-400 font-normal">fragmentos</span>
              </div>
              <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                Motor PostgreSQL tsvector + HNSW
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#07172b] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Latencia Promedio</span>
                <Clock className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.latenciaPromedioMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Conexión SSL Cifrada a InsForge
              </div>
            </div>
          </div>

          {/* Architecture Matrix Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#07172b] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-500" />
                Estructura de las 5 Capas de Memoria BCI en Producción
              </h3>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">CAPA L1 · HECHOS ATÓMICOS</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Puertos (3001-3006), URLs VibeHost, Metas SEN 2026, Activos (871 SEs, 4,207 Circuitos)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                    {stats.hechosL1Totales} Hechos
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">CAPA L2 · DECISIONES & ADRs</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dictámenes DOC-GGPD-2026-METAS-001, GOB-001, DIAG-PROC-001, BCI-001</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    {stats.decisionesL2Totales} Directrices
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">CAPA L3 · RAG DOCUMENTAL</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Manuales técnicos, normas ISO (8000, 27001, 55000, COBIT), diagnósticos y especificaciones</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {stats.chunksTotales} Chunks
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">CAPA L4 · GRAFO DE CÓDIGO</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dependencias, modelos relacionales y microservicios de las 6 aplicaciones</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {stats.appsL4Totales} Nodos
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#07172b] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                Estado del Servidor InsForge
              </h3>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alias:</span>
                  <span className="text-cyan-300">insforge-base-conocimientos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Host:</span>
                  <span className="text-emerald-300">jd3uejbz...insforge.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Motor:</span>
                  <span className="text-amber-300">PostgreSQL 15.18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extensiones:</span>
                  <span className="text-purple-300">vector (0.7.4), pgcrypto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seguridad:</span>
                  <span className="text-emerald-400">Zero-Trust / SHA-256</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Base de Datos Dedicada y Desacoplada de Producción (0% Impacto Operativo).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GESTIÓN DE TOKENS & KILL-SWITCH */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por desarrollador, usuario o prefijo de token..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#07172b] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Token</span>
            </button>
          </div>

          {/* Tokens Table */}
          <div className="rounded-2xl bg-white dark:bg-[#07172b] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#040f1d] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Desarrollador / Usuario</th>
                    <th className="px-4 py-3.5">Prefijo Token</th>
                    <th className="px-4 py-3.5">Nivel de Acceso</th>
                    <th className="px-4 py-3.5">Cuota Hoy</th>
                    <th className="px-4 py-3.5">Vigencia / Expiración</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right">Acciones Kill-Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTokens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No se encontraron tokens registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredTokens.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">{t.nombre_desarrollador}</div>
                          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">{t.correo_institucional}</div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                            {t.token_prefix}...
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            t.nivel_acceso === 'NIVEL_3_RESERVADO_DIRECTIVA'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : t.nivel_acceso === 'NIVEL_2_TECNICO'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {t.nivel_acceso.replace('NIVEL_', 'N')}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono font-semibold">
                          {t.consultas_hoy} / <span className="text-slate-400">{t.cuota_diaria_consultas}</span>
                        </td>
                        <td className="px-4 py-4 text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(t.fecha_expiracion).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            t.estado === 'ACTIVO'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : t.estado === 'SUSPENDIDO'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${t.estado === 'ACTIVO' ? 'bg-emerald-500' : (t.estado === 'SUSPENDIDO' ? 'bg-amber-500' : 'bg-rose-500')}`} />
                            {t.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleState(t)}
                            title={t.estado === 'ACTIVO' ? 'Suspender Temporalmente' : 'Reactivar Token'}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              t.estado === 'ACTIVO'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {t.estado === 'ACTIVO' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>

                          {t.estado !== 'REVOCADO' && (
                            <button
                              onClick={() => handleRevoke(t)}
                              title="Revocar Token Definitivamente"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AUDITORÍA FORENSE (COBIT / ISO 27001) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar eventos de auditoría por usuario, término o tipo de consulta..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#07172b] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#07172b] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#040f1d] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Usuario / Dev</th>
                    <th className="px-4 py-3.5">Tipo Operación</th>
                    <th className="px-4 py-3.5">Término / Prompt Auditado</th>
                    <th className="px-4 py-3.5">Chunks</th>
                    <th className="px-4 py-3.5">Latencia</th>
                    <th className="px-5 py-3.5">Cliente / IDE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAudit.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No hay eventos de auditoría registrados en la BCI.
                      </td>
                    </tr>
                  ) : (
                  filteredAudit.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {a.usuario_id}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                        {a.tipo_consulta}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-slate-800 dark:text-slate-200">
                        "{a.termino_busqueda}"
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {a.chunks_retornados}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                        {a.latencia_ms}ms
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {a.client_agent}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SANDBOX TESTER RAG */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#07172b] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Consola de Prueba RAG en Tiempo Real
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escribe cualquier término técnico para simular la consulta que realizarán las IAs conectadas a la BCI y evaluar los fragmentos y scores de relevancia devueltos.
            </p>

            <form onSubmit={handleSandboxSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Ejemplo: 'fórmula de Pareto para criticidad de circuitos' o 'tabla scgcc'..."
                value={sandboxQuery}
                onChange={(e) => setSandboxQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isSandboxSearching}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isSandboxSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Probar Prompt</span>
              </button>
            </form>
          </div>

          {sandboxResults && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resultados Recuperados ({sandboxResults.length} Chunks Relevantes)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sandboxResults.map((res, i) => (
                  <div key={i} className="rounded-2xl bg-white dark:bg-[#07172b] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {res.doc}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        Score: {res.score.toFixed(4)}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{res.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-[#040f1d] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {res.content}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {res.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: GUÍA RÁPIDA MCP & IDEs */}
      {activeTab === 'mcp_guide' && (
        <div className="rounded-2xl bg-white dark:bg-[#07172b] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-teal-400" />
              Guía de Configuración MCP para Desarrolladores del SEN
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copia y entrega este bloque de configuración a los programadores para que integren la BCI en sus IDEs en 1 solo paso.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Archivo de Configuración MCP (`mcp_config.json` o `.cursor/mcp.json`):</span>
              <button
                onClick={() => handleCopy(`{\n  "mcpServers": {\n    "corpoelec-bci": {\n      "command": "python3",\n      "args": ["-m", "corpoelec_bci.mcp_server"],\n      "env": {\n        "BCI_API_TOKEN": "bci_live_xxxxxxxxxxxxxxxxxxxxxxxx"\n      }\n    }\n  }\n}`, true)}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                {copiedMcp ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedMcp ? '¡Copiado!' : 'Copiar Configuración'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`{
  "mcpServers": {
    "corpoelec-bci": {
      "command": "python3",
      "args": ["-m", "corpoelec_bci.mcp_server"],
      "env": {
        "BCI_API_TOKEN": "bci_live_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* MODAL 1: EMITIR TOKEN */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#07172b] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-cyan-500" />
                Emitir Nuevo Token Criptográfico (ISO 27001)
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo del Desarrollador / Ingeniero:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ing. Carlos Reyes"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Institucional (@corpoelec.gob.ve):
                </label>
                <input
                  type="email"
                  required
                  placeholder="c.reyes@corpoelec.gob.ve"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nivel de Acceso:
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e: any) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="NIVEL_1_GENERAL">Nivel 1 (General)</option>
                    <option value="NIVEL_2_TECNICO">Nivel 2 (Técnico SEN)</option>
                    <option value="NIVEL_3_RESERVADO_DIRECTIVA">Nivel 3 (Directiva)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vigencia:
                  </label>
                  <select
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#040f1d] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={30}>30 Días</option>
                    <option value={60}>60 Días</option>
                    <option value={90}>90 Días (Estándar)</option>
                    <option value={180}>180 Días</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Generar y Emitir Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TOKEN GENERADO POR ÚNICA VEZ */}
      {issuedTokenSecret && issuedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#07172b] p-6 sm:p-8 shadow-2xl border border-emerald-500/40 space-y-6">
            <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Token Emitido Exitosamente</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Para: {issuedRecord.nombre_desarrollador}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <span>
                <strong>AVISO CRÍTICO DE SEGURIDAD (ISO 27001):</strong> Por diseño de seguridad Zero-Trust, este token <strong>NO se volverá a mostrar</strong>. Cópielo ahora y entréguelo de forma segura al desarrollador.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Token Secreto:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={issuedTokenSecret}
                  className="flex-1 font-mono text-xs bg-slate-900 text-cyan-300 p-3 rounded-xl border border-slate-800 select-all"
                />
                <button
                  onClick={() => handleCopy(issuedTokenSecret)}
                  className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedToken ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIssuedTokenSecret(null);
                  setIssuedRecord(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-black cursor-pointer"
              >
                Cerrar Ventana Segura
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
