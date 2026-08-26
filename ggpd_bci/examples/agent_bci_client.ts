/**
 * ⚡ CORPOELEC - GGPD | BCI CLIENT SDK (TYPESCRIPT)
 * Módulo TypeScript/Node.js para conectar aplicaciones y asistentes a la
 * Base de Conocimiento Inteligente (BCI) en InsForge PostgreSQL.
 */

export interface BciFact {
  id: string;
  categoria: string;
  clave: string;
  valor_texto?: string;
  valor_json?: any;
  descripcion: string;
}

export interface BciDecision {
  codigo_documento: string;
  titulo: string;
  escenario: string;
  decision: string;
  justificacion_normativa: string;
  impacto_sistemas: string[];
  fecha_decision: string;
}

export interface BciRagChunk {
  id: string;
  documento_origen: string;
  seccion: string;
  titulo: string;
  contenido: string;
  resumen: string;
  tags: string[];
  rank?: number;
}

export const BCI_CONFIG = {
  alias: "insforge-base-conocimientos-automatizacion",
  host: "jd3uejbz.ap-southeast.database.insforge.app",
  apiEndpoint: "https://jd3uejbz.ap-southeast.insforge.app",
  database: "insforge"
};
