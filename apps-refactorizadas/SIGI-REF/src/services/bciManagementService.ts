/**
 * ⚡ CORPOELEC - GGPD | BCI MANAGEMENT SERVICE
 * Servicio para gestión de tokens, auditoría y telemetría de la Base de Conocimiento Inteligente (BCI).
 * La BCI vive en una instancia InsForge SEPARADA de SIGI-REF.
 * BaaS (BCI): jd3uejbz.ap-southeast.insforge.app
 *
 * Fuente de datos REAL: todos los métodos son asíncronos y consultan la instancia InsForge de la BCI.
 * Ya NO se usa localStorage ni catálogos mock de negocio (INITIAL_TOKENS / INITIAL_AUDIT).
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

const BCI_URL = import.meta.env.VITE_BCI_URL || 'https://jd3uejbz.ap-southeast.insforge.app';
const BCI_API_KEY = import.meta.env.VITE_BCI_API_KEY || '';

const HEADERS = {
  apikey: BCI_API_KEY,
  Authorization: `Bearer ${BCI_API_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...HEADERS,
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`BCI API error (${res.status}): ${body || res.statusText}`);
  }

  return (await res.json()) as T;
}

/** Normaliza la respuesta de InsForge (que puede venir como {data: []} o como array plano) a un array. */
function toArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && Array.isArray(payload.data)) return payload.data as T[];
  if (payload && Array.isArray(payload.records)) return payload.records as T[];
  return [];
}

class BciManagementService {
  public async getTokens(): Promise<BciTokenRecord[]> {
    const payload = await fetchJson<any>(
      `${BCI_URL}/api/database/records/v_knowledge_tokens_activos?limit=500`
    );
    return toArray<BciTokenRecord>(payload);
  }

  public async getAuditLogs(): Promise<BciAuditRecord[]> {
    const payload = await fetchJson<any>(
      `${BCI_URL}/api/database/rpc/fn_listar_auditoria_bci`,
      {
        method: 'POST',
        body: JSON.stringify({ p_limit: 100 })
      }
    );
    return toArray<BciAuditRecord>(payload);
  }

  public async getStats(): Promise<BciStats> {
    const [tokens, audit] = await Promise.all([this.getTokens(), this.getAuditLogs()]);

    const activeTokens = tokens.filter(t => t.estado === 'ACTIVO');
    const consultasHoy = tokens.reduce((acc, t) => acc + (Number(t.consultas_hoy) || 0), 0);
    const latenciaPromedioMs = audit.length > 0
      ? Math.round(audit.reduce((acc, a) => acc + (Number(a.latencia_ms) || 0), 0) / audit.length)
      : 0;

    return {
      totalTokens: tokens.length,
      tokensActivos: activeTokens.length,
      consultasHoy,
      // Sin endpoint para contar chunks / capas de conocimiento: no se inventan números.
      chunksTotales: 0,
      latenciaPromedioMs,
      hechosL1Totales: 0,
      decisionesL2Totales: 0,
      appsL4Totales: 0
    };
  }

  public async generateToken(params: {
    usuario_id: string;
    nombre_desarrollador: string;
    correo_institucional: string;
    gerencia_division: string;
    nivel_acceso: 'NIVEL_1_GENERAL' | 'NIVEL_2_TECNICO' | 'NIVEL_3_RESERVADO_DIRECTIVA';
    dias_vigencia: number;
    cuota_diaria: number;
    emitido_por: string;
  }): Promise<{ record: BciTokenRecord; tokenPlain: string }> {
    const payload = await fetchJson<any>(
      `${BCI_URL}/api/database/rpc/fn_emitir_token_bci`,
      {
        method: 'POST',
        body: JSON.stringify({
          p_usuario_id: params.usuario_id,
          p_nombre_desarrollador: params.nombre_desarrollador,
          p_correo_institucional: params.correo_institucional,
          p_gerencia_division: params.gerencia_division,
          p_nivel_acceso: params.nivel_acceso,
          p_cuota_diaria: params.cuota_diaria,
          p_dias_vigencia: params.dias_vigencia,
          p_emitido_por: params.emitido_por
        })
      }
    );

    const tokenPlain = payload.token_plain || '';
    const record: BciTokenRecord = {
      id: payload.token_id || '',
      token_prefix: payload.token_prefix || (tokenPlain ? tokenPlain.substring(0, 15) : ''),
      usuario_id: params.usuario_id,
      nombre_desarrollador: params.nombre_desarrollador,
      correo_institucional: params.correo_institucional,
      gerencia_division: params.gerencia_division,
      nivel_acceso: params.nivel_acceso,
      cuota_diaria_consultas: params.cuota_diaria,
      consultas_hoy: 0,
      fecha_emision: new Date().toISOString(),
      fecha_expiracion: payload.fecha_expiracion || '',
      estado: 'ACTIVO',
      emitido_por: params.emitido_por
    };

    return { record, tokenPlain };
  }

  public async updateTokenState(
    tokenId: string,
    nuevoEstado: 'ACTIVO' | 'SUSPENDIDO' | 'REVOCADO',
    motivo?: string
  ): Promise<void> {
    await fetchJson<any>(
      `${BCI_URL}/api/database/rpc/fn_actualizar_estado_token_bci`,
      {
        method: 'POST',
        body: JSON.stringify({
          p_token_id: tokenId,
          p_nuevo_estado: nuevoEstado,
          p_motivo: motivo || null
        })
      }
    );
  }

  /**
   * La auditoría de consultas la registra el backend (fn_validar_token_bci) cuando un usuario
   * usa el token. No hay endpoint de escritura expuesto desde la consola, por lo que este método
   * es un no-op seguro que conserva la firma por compatibilidad.
   */
  public async logAudit(_entry: Omit<BciAuditRecord, 'id' | 'created_at'>): Promise<void> {
    // No-op: la auditoría la persiste el backend de la BCI.
    return Promise.resolve();
  }
}

export const bciManagementService = new BciManagementService();