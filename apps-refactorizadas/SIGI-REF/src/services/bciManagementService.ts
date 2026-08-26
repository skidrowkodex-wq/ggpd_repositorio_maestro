/**
 * ⚡ CORPOELEC - GGPD | BCI MANAGEMENT SERVICE
 * Servicio para gestión de tokens, auditoría y telemetría de la Base de Conocimiento Inteligente.
 * BaaS: jd3uejbz.ap-southeast.database.insforge.app
 */

export interface BciTokenRecord {
  id: string;
  token_prefix: string;
  usuario_id: string;
  nombre_desarrollador: string;
  correo_institucional: string;
  gerencia_division: string;
  nivel_acceso: 'NIVEL_1_GENERAL' | 'NIVEL_2_TECNICO' | 'NIVEL_3_RESERVADO_DIRECTIVA';
  cuota_diaria_consultas: number;
  consultas_hoy: number;
  fecha_emision: string;
  fecha_expiracion: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'REVOCADO' | 'EXPIRADO';
  motivo_revocacion?: string;
  ultimo_acceso?: string;
  emitido_por: string;
}

export interface BciAuditRecord {
  id: string;
  usuario_id: string;
  nombre_desarrollador?: string;
  nivel_acceso?: string;
  tipo_consulta: string;
  termino_busqueda: string;
  chunks_retornados: number;
  latencia_ms: number;
  client_agent: string;
  created_at: string;
}

export interface BciStats {
  totalTokens: number;
  tokensActivos: number;
  consultasHoy: number;
  chunksTotales: number;
  latenciaPromedioMs: number;
  hechosL1Totales: number;
  decisionesL2Totales: number;
  appsL4Totales: number;
}

const BCI_STORAGE_KEY_TOKENS = 'corpoelec_bci_tokens_registry_v1';
const BCI_STORAGE_KEY_AUDIT = 'corpoelec_bci_audit_registry_v1';

// Catálogo Canónico Inicial Sincronizado con InsForge
const INITIAL_TOKENS: BciTokenRecord[] = [
  {
    id: '09313cd3-150a-42b4-8c58-8e5798087d48',
    token_prefix: 'bci_live_5c3b23',
    usuario_id: 'yvan.cipiran',
    nombre_desarrollador: 'Ing. Yván Cipirán',
    correo_institucional: 'y.cipiran@corpoelec.gob.ve',
    gerencia_division: 'Planificación de Distribución (GGPD)',
    nivel_acceso: 'NIVEL_3_RESERVADO_DIRECTIVA',
    cuota_diaria_consultas: 1000,
    consultas_hoy: 3,
    fecha_emision: '2026-08-26T13:48:33Z',
    fecha_expiracion: '2026-11-24T13:48:33Z',
    estado: 'ACTIVO',
    ultimo_acceso: '2026-08-26T13:51:18Z',
    emitido_por: 'admin.ggpd'
  },
  {
    id: '2061984a-61fd-46e4-b18d-2c7a04271f8a',
    token_prefix: 'bci_live_07da86',
    usuario_id: 'josue.pacheco',
    nombre_desarrollador: 'T.S.U. Josué Pacheco',
    correo_institucional: 'j.pacheco@corpoelec.gob.ve',
    gerencia_division: 'Planificación de Distribución (GGPD)',
    nivel_acceso: 'NIVEL_3_RESERVADO_DIRECTIVA',
    cuota_diaria_consultas: 1000,
    consultas_hoy: 0,
    fecha_emision: '2026-08-26T13:48:36Z',
    fecha_expiracion: '2026-11-24T13:48:36Z',
    estado: 'ACTIVO',
    ultimo_acceso: undefined,
    emitido_por: 'admin.ggpd'
  }
];

const INITIAL_AUDIT: BciAuditRecord[] = [
  {
    id: 'aud-001',
    usuario_id: 'yvan.cipiran',
    nombre_desarrollador: 'Ing. Yván Cipirán',
    nivel_acceso: 'NIVEL_3_RESERVADO_DIRECTIVA',
    tipo_consulta: 'FACT_LOOKUP',
    termino_busqueda: 'fact_ports',
    chunks_retornados: 1,
    latencia_ms: 28,
    client_agent: 'Python-SDK / Antigravity IDE',
    created_at: '2026-08-26T13:51:18Z'
  },
  {
    id: 'aud-002',
    usuario_id: 'yvan.cipiran',
    nombre_desarrollador: 'Ing. Yván Cipirán',
    nivel_acceso: 'NIVEL_3_RESERVADO_DIRECTIVA',
    tipo_consulta: 'RAG_SEARCH',
    termino_busqueda: 'Metas 2026 TTI FMI',
    chunks_retornados: 2,
    latencia_ms: 35,
    client_agent: 'Python-SDK / Antigravity IDE',
    created_at: '2026-08-26T13:51:14Z'
  },
  {
    id: 'aud-003',
    usuario_id: 'yvan.cipiran',
    nombre_desarrollador: 'Ing. Yván Cipirán',
    nivel_acceso: 'NIVEL_3_RESERVADO_DIRECTIVA',
    tipo_consulta: 'CLI_LOGIN',
    termino_busqueda: 'Verificación inicial SDK',
    chunks_retornados: 0,
    latencia_ms: 18,
    client_agent: 'BCI-SDK / CLI',
    created_at: '2026-08-26T13:51:09Z'
  }
];

class BciManagementService {
  private getStoredTokens(): BciTokenRecord[] {
    try {
      const data = localStorage.getItem(BCI_STORAGE_KEY_TOKENS);
      return data ? JSON.parse(data) : INITIAL_TOKENS;
    } catch {
      return INITIAL_TOKENS;
    }
  }

  private setStoredTokens(tokens: BciTokenRecord[]): void {
    try {
      localStorage.setItem(BCI_STORAGE_KEY_TOKENS, JSON.stringify(tokens));
    } catch (e) {
      console.warn('Error saving BCI tokens:', e);
    }
  }

  private getStoredAudit(): BciAuditRecord[] {
    try {
      const data = localStorage.getItem(BCI_STORAGE_KEY_AUDIT);
      return data ? JSON.parse(data) : INITIAL_AUDIT;
    } catch {
      return INITIAL_AUDIT;
    }
  }

  private setStoredAudit(audit: BciAuditRecord[]): void {
    try {
      localStorage.setItem(BCI_STORAGE_KEY_AUDIT, JSON.stringify(audit));
    } catch (e) {
      console.warn('Error saving BCI audit:', e);
    }
  }

  public getTokens(): BciTokenRecord[] {
    return this.getStoredTokens();
  }

  public getAuditLogs(): BciAuditRecord[] {
    return this.getStoredAudit();
  }

  public getStats(): BciStats {
    const tokens = this.getStoredTokens();
    const audit = this.getStoredAudit();
    const activeTokens = tokens.filter(t => t.estado === 'ACTIVO');
    const totalConsultas = tokens.reduce((acc, t) => acc + t.consultas_hoy, 0);
    const avgLatency = audit.length > 0
      ? Math.round(audit.reduce((acc, a) => acc + a.latencia_ms, 0) / audit.length)
      : 32;

    return {
      totalTokens: tokens.length,
      tokensActivos: activeTokens.length,
      consultasHoy: totalConsultas,
      chunksTotales: 519,
      latenciaPromedioMs: avgLatency,
      hechosL1Totales: 14,
      decisionesL2Totales: 6,
      appsL4Totales: 14
    };
  }

  public generateToken(params: {
    usuario_id: string;
    nombre_desarrollador: string;
    correo_institucional: string;
    gerencia_division: string;
    nivel_acceso: 'NIVEL_1_GENERAL' | 'NIVEL_2_TECNICO' | 'NIVEL_3_RESERVADO_DIRECTIVA';
    dias_vigencia: number;
    cuota_diaria: number;
    emitido_por: string;
  }): { record: BciTokenRecord; tokenPlain: string } {
    // Generar entropía criptográfica pseudo-random en navegador
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const tokenPlain = `bci_live_${randomHex}`;
    const tokenPrefix = tokenPlain.substring(0, 15);
    
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + params.dias_vigencia);

    const newRecord: BciTokenRecord = {
      id: crypto.randomUUID(),
      token_prefix: tokenPrefix,
      usuario_id: params.usuario_id,
      nombre_desarrollador: params.nombre_desarrollador,
      correo_institucional: params.correo_institucional,
      gerencia_division: params.gerencia_division || 'Planificación de Distribución (GGPD)',
      nivel_acceso: params.nivel_acceso,
      cuota_diaria_consultas: params.cuota_diaria,
      consultas_hoy: 0,
      fecha_emision: new Date().toISOString(),
      fecha_expiracion: expDate.toISOString(),
      estado: 'ACTIVO',
      emitido_por: params.emitido_por
    };

    const tokens = [newRecord, ...this.getStoredTokens()];
    this.setStoredTokens(tokens);

    return { record: newRecord, tokenPlain };
  }

  public updateTokenState(tokenId: string, nuevoEstado: 'ACTIVO' | 'SUSPENDIDO' | 'REVOCADO', motivo?: string): boolean {
    const tokens = this.getStoredTokens();
    const index = tokens.findIndex(t => t.id === tokenId);
    if (index === -1) return false;

    tokens[index].estado = nuevoEstado;
    if (motivo) tokens[index].motivo_revocacion = motivo;
    this.setStoredTokens(tokens);
    return true;
  }

  public logAudit(entry: Omit<BciAuditRecord, 'id' | 'created_at'>): void {
    const newEntry: BciAuditRecord = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    const audit = [newEntry, ...this.getStoredAudit()].slice(0, 100);
    this.setStoredAudit(audit);
  }
}

export const bciManagementService = new BciManagementService();
