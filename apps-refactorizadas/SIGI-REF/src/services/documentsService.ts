import { insforge, isInsforgeConfigured } from './insforgeClient';
import { DocumentItem, UserRole, StateCode } from '../types/sigi';

/**
 * ==============================================================================
 * SERVICIO DE DOCUMENTOS INSTITUCIONALES - SIGI
 * Fuente: InsForge (esquema public) - tablas institutional_documents y technical_documents.
 * ==============================================================================
 */

export interface InsForgeDocumentRecord {
  id: string;
  title: string;
  category?: string | null;
  substation_name?: string | null;
  file_url: string;
  file_name?: string | null;
  file_size_bytes?: number | null;
  uploaded_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_ROLES: UserRole[] = ['OPERADOR', 'ANALISTA', 'GERENCIA', 'ADMINISTRADOR'];

function inferFileType(fileUrl: string, fileName?: string | null): DocumentItem['fileType'] {
  const ref = `${fileName || ''} ${fileUrl || ''}`.toLowerCase();
  if (ref.includes('xls') || ref.includes('sheet') || ref.includes('.csv')) return 'spreadsheet';
  if (ref.includes('.doc') || ref.includes('.docx')) return 'doc';
  return 'pdf';
}

function toStateCode(value?: string | null): StateCode {
  if (!value) return 'NAC';
  const code = value.trim().toUpperCase();
  // Los códigos válidos de Estado en el catálogo SIGI (incluye NAC y los estadales).
  if (/^(NAC|ZUL|DCA|CAR|MIR|LAR|ARA|BOL|ANZ|BAR|FAL|MER|TAC|TRU|POR|COJ|GUA|SUC|MON|APU|NES|DEL|AMA|LGU|YAR|GEQ)$/.test(code)) {
    return code as StateCode;
  }
  return 'NAC';
}

/**
 * Mapea un registro crudo de InsForge al tipo de dominio DocumentItem
 */
export function mapInsForgeToDocumentItem(record: InsForgeDocumentRecord): DocumentItem {
  const fileType = inferFileType(record.file_url, record.file_name);
  return {
    id: record.id,
    // code: se utiliza file_name como identificador de archivo (fallback al título)
    code: record.file_name || record.title || 'Documento',
    title: record.title || 'Documento sin título',
    fileType,
    // stateCode: la tabla no posee estado geográfico directo; se normaliza desde substation_name o NAC.
    stateCode: toStateCode(record.substation_name),
    driveEmbedUrl: record.file_url || '',
    author: record.uploaded_by || 'CORPOELEC GGPD',
    updatedAt: (record.updated_at || record.created_at || '').slice(0, 10),
    downloadAllowedRoles: DEFAULT_ROLES,
    category: record.category || undefined,
  };
}

/**
 * Carga los documentos institucionales y técnicos desde InsForge.
 * Inicia vacío: si no hay registros (o no hay conexión) devuelve [].
 */
export async function fetchDocumentsFromInsForge(): Promise<DocumentItem[]> {
  if (!isInsforgeConfigured) return [];

  const loadTable = async (table: string): Promise<DocumentItem[]> => {
    try {
      const { data, error } = await insforge.database
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.warn(`⚠️ Error al consultar ${table}:`, error);
        return [];
      }
      if (!data || !Array.isArray(data)) return [];

      return (data as unknown as InsForgeDocumentRecord[]).map(mapInsForgeToDocumentItem);
    } catch (err) {
      console.warn(`❌ Excepción al consultar ${table}:`, err);
      return [];
    }
  };

  try {
    const [institutional, technical] = await Promise.all([
      loadTable('institutional_documents'),
      loadTable('technical_documents'),
    ]);

    // Deduplicar por id conservando el orden (institucionales primero).
    const seen = new Set<string>();
    const merged: DocumentItem[] = [];
    [...institutional, ...technical].forEach((doc) => {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        merged.push(doc);
      }
    });
    return merged;
  } catch (err) {
    console.warn('❌ Error combinando documentos InsForge:', err);
    return [];
  }
}