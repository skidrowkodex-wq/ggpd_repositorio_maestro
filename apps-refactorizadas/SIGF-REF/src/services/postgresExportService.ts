import { VehicleRecord, MasterCatalogsState, MasterCatalogItem, CentroServicioItem } from '../types/fleet';
import { VENEZUELA_REGIONS, VENEZUELA_STATES } from '../data/venezuelaRegions';
import { PREDEFINED_SYSTEM_USERS } from '../data/defaultUsers';
import { authService } from './authService';
import { passwordResetService } from './passwordResetService';
import { backupService } from './backupService';

/**
 * Escapa valores de cadena de texto para PostgreSQL (comillas simples duplicadas)
 */
function sqlString(val: any): string {
  if (val === null || val === undefined || val === '') {
    return 'NULL';
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Convierte un número a valor SQL
 */
function sqlNumber(val: any, fallback: number = 0): string {
  if (val === null || val === undefined || val === '') {
    return String(fallback);
  }
  const num = Number(val);
  return isNaN(num) ? String(fallback) : String(num);
}

/**
 * Convierte un booleano a SQL
 */
function sqlBool(val: any): string {
  return val ? 'TRUE' : 'FALSE';
}

/**
 * Convierte un objeto o array a literal JSONB en SQL
 */
function sqlJsonb(val: any): string {
  if (!val) {
    return "'[]'::jsonb";
  }
  try {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  } catch {
    return "'[]'::jsonb";
  }
}

export const postgresExportService = {
  /**
   * Genera el Esquema DDL completo normalizado para PostgreSQL (14 / 15 / 16)
   */
  generatePostgreSqlSchema(): string {
    return `-- ============================================================================
-- SISTEMA DE GESTIÓN DE FLOTA VEHICULAR (CORPOELEC - GGPD)
-- ESQUEMA RELACIONAL OFICIAL PARA POSTGRESQL (14 / 15 / 16)
-- Generado automáticamente por el motor de ingeniería SEN
-- ============================================================================

-- Habilitar extensión para generación de identificadores UUID si no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza controlada en caso de reinstalación (opcional)
-- DROP VIEW IF EXISTS v_resumen_operativo_flota CASCADE;
-- DROP VIEW IF EXISTS v_kpis_mantenimiento CASCADE;
-- DROP VIEW IF EXISTS v_vehiculos_recuperados CASCADE;
-- DROP TABLE IF EXISTS auditoria_sistema CASCADE;
-- DROP TABLE IF EXISTS puntos_control_backups CASCADE;
-- DROP TABLE IF EXISTS flota_vehiculos CASCADE;
-- DROP TABLE IF EXISTS solicitudes_reinicio_clave CASCADE;
-- DROP TABLE IF EXISTS centros_servicios CASCADE;
-- DROP TABLE IF EXISTS catalogos_maestros CASCADE;
-- DROP TABLE IF EXISTS estados_venezuela CASCADE;
-- DROP TABLE IF EXISTS regiones_venezuela CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Almacena operadores, directores y administradores del SEN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(180),
    rol VARCHAR(50) NOT NULL DEFAULT 'estado', -- 'admin', 'nacional', 'gerente', 'estado'
    estado_asignado VARCHAR(100),
    avatar VARCHAR(20) DEFAULT '👤',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- ----------------------------------------------------------------------------
-- 2. TABLA: solicitudes_reinicio_clave
-- Gestión de tickets de restablecimiento de contraseña solicitados por usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solicitudes_reinicio_clave (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(180) NOT NULL REFERENCES usuarios(email) ON DELETE CASCADE,
    estado VARCHAR(100) NOT NULL,
    solicitante_nombre VARCHAR(150) NOT NULL,
    solicitante_cedula VARCHAR(30) NOT NULL,
    motivo TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'APROBADO', 'RECHAZADO'
    nueva_clave_temporal VARCHAR(100),
    atendido_por VARCHAR(180),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_atencion TIMESTAMP WITH TIME ZONE,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes_reinicio_clave(status);
CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON solicitudes_reinicio_clave(email);

-- ----------------------------------------------------------------------------
-- 3. TABLA: regiones_venezuela
-- 8 Regiones estratégicas CORPOELEC
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regiones_venezuela (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    gerencia VARCHAR(150),
    sede_principal VARCHAR(180),
    descripcion TEXT
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: estados_venezuela
-- División político-territorial nacional incluyendo Guayana Esequiba
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estados_venezuela (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    capital VARCHAR(100),
    region_id VARCHAR(50) REFERENCES regiones_venezuela(id) ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_estados_region ON estados_venezuela(region_id);

-- ----------------------------------------------------------------------------
-- 5. TABLA: centros_servicios
-- Centros de Servicio y Operaciones en todo el territorio nacional
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS centros_servicios (
    id VARCHAR(100) PRIMARY KEY,
    codigo VARCHAR(50),
    nombre VARCHAR(150) NOT NULL,
    estado_id VARCHAR(50) REFERENCES estados_venezuela(id) ON UPDATE CASCADE,
    estado_nombre VARCHAR(100),
    region_id VARCHAR(50) REFERENCES regiones_venezuela(id) ON UPDATE CASCADE,
    region_nombre VARCHAR(100),
    municipio VARCHAR(100),
    tipo VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_centros_estado ON centros_servicios(estado_id);

-- ----------------------------------------------------------------------------
-- 6. TABLA: catalogos_maestros
-- Tablas auxiliares de marcas, modelos, tipos de unidad y repuestos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogos_maestros (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(60) NOT NULL, -- 'marcas', 'modelos', 'tipos_vehiculo', 'gerencias', etc.
    codigo VARCHAR(60),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_catalogo_categoria_nombre UNIQUE(categoria, nombre)
);

CREATE INDEX IF NOT EXISTS idx_catalogos_categoria ON catalogos_maestros(categoria);

-- ----------------------------------------------------------------------------
-- 7. TABLA: flota_vehiculos (ESTÁNDAR CORPOELEC GGPD - 45 COLUMNAS OFICIALES)
-- Inventario central del parque automotor
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flota_vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Col A (1): Estado General
    estado VARCHAR(50) NOT NULL,
    
    -- Col B (2): Número de Vehículo (Identificador Único SEN)
    numero_vehiculo VARCHAR(50) UNIQUE NOT NULL,
    
    -- Placa del Vehículo
    placa VARCHAR(30),
    
    -- Col C (3): Marca del Vehículo
    marca_vehiculo VARCHAR(100) NOT NULL,
    
    -- Modelo del Vehículo
    modelo_vehiculo VARCHAR(100),
    
    -- Col D (4): Tipo de Vehículo
    tipo_vehiculo VARCHAR(100) NOT NULL,
    
    -- Col E (5): Unidad Asignada
    unidad_asignada VARCHAR(150) NOT NULL,
    
    -- Col F (6): Centro de Servicios
    centro_servicios VARCHAR(150) NOT NULL,
    
    -- Col G (7): Condición Actual
    condicion_actual VARCHAR(50) NOT NULL,
    
    -- Col H (8): Mantenimiento Preventivo
    mantenimiento_preventivo VARCHAR(50) NOT NULL,

    -- 21 Componentes Mecánicos / Eléctricos (Cols I - AC, 9 - 29)
    pastillas VARCHAR(20) DEFAULT 'N/A',
    bandas VARCHAR(20) DEFAULT 'N/A',
    bomba_freno VARCHAR(20) DEFAULT 'N/A',
    disco VARCHAR(20) DEFAULT 'N/A',
    plato VARCHAR(20) DEFAULT 'N/A',
    collarin VARCHAR(20) DEFAULT 'N/A',
    bombin_superior VARCHAR(20) DEFAULT 'N/A',
    bombin_inferior VARCHAR(20) DEFAULT 'N/A',
    bateria VARCHAR(20) DEFAULT 'N/A',
    bobina VARCHAR(20) DEFAULT 'N/A',
    bujias VARCHAR(20) DEFAULT 'N/A',
    cauchos VARCHAR(20) DEFAULT 'N/A',
    correas_motor VARCHAR(20) DEFAULT 'N/A',
    luces_delanteras VARCHAR(20) DEFAULT 'N/A',
    parabrisas VARCHAR(20) DEFAULT 'N/A',
    tren_delantero VARCHAR(20) DEFAULT 'N/A',
    ballesta VARCHAR(20) DEFAULT 'N/A',
    crucetas VARCHAR(20) DEFAULT 'N/A',
    amortiguadores VARCHAR(20) DEFAULT 'N/A',
    radiador VARCHAR(20) DEFAULT 'N/A',
    motor VARCHAR(20) DEFAULT 'N/A',

    -- Insumos y Repuestos (Cols AD - AH, 30 - 34)
    cant_total_reparaciones INTEGER DEFAULT 0,
    cant_cauchos INTEGER DEFAULT 0,
    medidas_caucho VARCHAR(80),
    cantidad_baterias INTEGER DEFAULT 0,
    caracteristicas_bateria VARCHAR(100),

    -- Trazabilidad de Recuperación y Gerencias (Cols AI - AM, 35 - 39)
    vehiculo_recuperado VARCHAR(10) DEFAULT 'NO',
    fecha_recuperacion VARCHAR(30),
    gerencia_origen VARCHAR(150),
    vehiculo_otra_gerencia_devuelto VARCHAR(10) DEFAULT 'NO',
    fecha_entrega_gerencia_origen VARCHAR(30),

    -- Observaciones y Prioridad (Cols AN - AP, 40 - 42)
    observacion TEXT,
    certificar_tipo_vehiculo VARCHAR(100),
    prioridad_recuperacion VARCHAR(30) DEFAULT 'MEDIA',

    -- Personal Responsable / Custodio (Cols AQ - AS, 43 - 45)
    nombre_personal_responsable VARCHAR(150),
    cedula_personal_responsable VARCHAR(40),
    telefono_personal_responsable VARCHAR(50),

    -- Metadatos Territoriales y Multimedia
    region VARCHAR(80),
    estado_venezuela VARCHAR(80),
    correlativo_carga VARCHAR(80),
    fotos_vehiculo JSONB DEFAULT '[]'::jsonb,

    -- Auditoría del Registro
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento Operativo
CREATE INDEX IF NOT EXISTS idx_flota_num_vehiculo ON flota_vehiculos(numero_vehiculo);
CREATE INDEX IF NOT EXISTS idx_flota_placa ON flota_vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_flota_estado_vzla ON flota_vehiculos(estado_venezuela);
CREATE INDEX IF NOT EXISTS idx_flota_condicion ON flota_vehiculos(condicion_actual);
CREATE INDEX IF NOT EXISTS idx_flota_mantenimiento ON flota_vehiculos(mantenimiento_preventivo);
CREATE INDEX IF NOT EXISTS idx_flota_prioridad ON flota_vehiculos(prioridad_recuperacion);
CREATE INDEX IF NOT EXISTS idx_flota_marca ON flota_vehiculos(marca_vehiculo);

-- ----------------------------------------------------------------------------
-- 8. TABLA: puntos_control_backups
-- Historial inmutable de Puntos de Control (incluyendo SISFLOTA01)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puntos_control_backups (
    id VARCHAR(80) PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL,
    descripcion TEXT NOT NULL,
    es_oficial BOOLEAN DEFAULT FALSE,
    total_vehiculos INTEGER NOT NULL,
    payload_vehiculos JSONB NOT NULL,
    payload_catalogos JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. TABLA: auditoria_sistema
-- Bitácora de eventos y cambios de seguridad
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria_sistema (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(180) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    detalle TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50) DEFAULT '127.0.0.1'
);

-- ----------------------------------------------------------------------------
-- 10. VISTAS ANALÍTICAS PARA REPORTES GERENCIALES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_resumen_operativo_flota AS
SELECT 
    COALESCE(estado_venezuela, 'NO ASIGNADO') AS estado_venezuela,
    COUNT(*) AS total_vehiculos,
    COUNT(*) FILTER (WHERE condicion_actual = 'BUENO') AS operativos_bueno,
    COUNT(*) FILTER (WHERE condicion_actual = 'REGULAR') AS operativos_regular,
    COUNT(*) FILTER (WHERE condicion_actual IN ('MALO', 'FUERA DE SERVICIO')) AS inoperativos,
    COUNT(*) FILTER (WHERE mantenimiento_preventivo = 'VENCIDO') AS mantenimiento_vencido,
    COUNT(*) FILTER (WHERE vehiculo_recuperado = 'SI') AS total_recuperados
FROM flota_vehiculos
GROUP BY estado_venezuela;

CREATE OR REPLACE VIEW v_kpis_mantenimiento AS
SELECT 
    id,
    numero_vehiculo,
    placa,
    marca_vehiculo,
    modelo_vehiculo,
    estado_venezuela,
    centro_servicios,
    condicion_actual,
    mantenimiento_preventivo,
    prioridad_recuperacion,
    cant_total_reparaciones,
    nombre_personal_responsable,
    telefono_personal_responsable
FROM flota_vehiculos
WHERE mantenimiento_preventivo = 'VENCIDO' 
   OR condicion_actual IN ('MALO', 'FUERA DE SERVICIO')
ORDER BY 
    CASE prioridad_recuperacion
        WHEN 'ALTA' THEN 1
        WHEN 'MEDIA' THEN 2
        ELSE 3
    END;
`;
  },

  /**
   * Genera el archivo DML de migración con datos reales del sistema
   */
  generatePostgreSqlSeedData(
    vehicles: VehicleRecord[],
    catalogs?: MasterCatalogsState
  ): string {
    const lines: string[] = [];

    lines.push(`-- ============================================================================`);
    lines.push(`-- MIGRACIÓN DE DATOS (DML) - CORPOELEC GGPD`);
    lines.push(`-- Fecha de Generación: ${new Date().toLocaleString()}`);
    lines.push(`-- Total de Vehículos Migrados: ${vehicles.length}`);
    lines.push(`-- ============================================================================`);
    lines.push(`BEGIN;`);
    lines.push(``);

    // 1. Regiones de Venezuela
    lines.push(`-- 1. Insertando 8 Regiones Estratégicas CORPOELEC`);
    for (const r of VENEZUELA_REGIONS) {
      lines.push(
        `INSERT INTO regiones_venezuela (id, nombre, codigo, gerencia, sede_principal, descripcion) VALUES (` +
        `${sqlString(r.id)}, ${sqlString(r.nombre)}, ${sqlString(r.codigo)}, ` +
        `${sqlString(r.gerencia)}, ${sqlString(r.sedePrincipal)}, ${sqlString(r.descripcion)}` +
        `) ON CONFLICT (id) DO UPDATE SET ` +
        `nombre = EXCLUDED.nombre, gerencia = EXCLUDED.gerencia, sede_principal = EXCLUDED.sede_principal;`
      );
    }
    lines.push(``);

    // 2. Estados de Venezuela
    lines.push(`-- 2. Insertando Estados de Venezuela (incluyendo Guayana Esequiba)`);
    for (const s of VENEZUELA_STATES) {
      lines.push(
        `INSERT INTO estados_venezuela (id, codigo, nombre, capital, region_id) VALUES (` +
        `${sqlString(s.id)}, ${sqlString(s.codigo)}, ${sqlString(s.nombre)}, ` +
        `${sqlString(s.capital)}, ${sqlString(s.region_id)}` +
        `) ON CONFLICT (id) DO UPDATE SET ` +
        `nombre = EXCLUDED.nombre, capital = EXCLUDED.capital, region_id = EXCLUDED.region_id;`
      );
    }
    lines.push(``);

    // 3. Catálogos Maestros (marcas, modelos, tipos, gerencias)
    if (catalogs) {
      lines.push(`-- 3. Insertando Catálogos Maestros del Sistema`);
      const insertCat = (categoria: string, items: MasterCatalogItem[]) => {
        if (!items || !items.length) return;
        for (const it of items) {
          lines.push(
            `INSERT INTO catalogos_maestros (categoria, codigo, nombre, descripcion, activo) VALUES (` +
            `${sqlString(categoria)}, ${sqlString(it.codigo || it.id)}, ${sqlString(it.nombre)}, ` +
            `${sqlString(it.descripcion || it.adicional)}, ${sqlBool(it.activo !== false)}` +
            `) ON CONFLICT (categoria, nombre) DO NOTHING;`
          );
        }
      };

      insertCat('marcas', catalogs.marcas || []);
      insertCat('modelos', catalogs.modelos || []);
      insertCat('tipos_vehiculo', catalogs.tipos_vehiculo || []);
      insertCat('gerencias', catalogs.gerencias || []);
      insertCat('unidades_asignadas', catalogs.unidades_asignadas || []);
      insertCat('medidas_cauchos', catalogs.medidas_cauchos || []);
      insertCat('caracteristicas_baterias', catalogs.caracteristicas_baterias || []);
      lines.push(``);

      // Centros de Servicios
      if (catalogs.centros_servicios && catalogs.centros_servicios.length) {
        lines.push(`-- 4. Insertando Centros de Servicios Activos`);
        for (const cs of catalogs.centros_servicios as CentroServicioItem[]) {
          lines.push(
            `INSERT INTO centros_servicios (id, codigo, nombre, estado_id, estado_nombre, region_id, region_nombre, municipio, tipo, activo) VALUES (` +
            `${sqlString(cs.id)}, ${sqlString(cs.codigo)}, ${sqlString(cs.nombre)}, ` +
            `${sqlString(cs.estado_id)}, ${sqlString(cs.estado_nombre)}, ` +
            `${sqlString(cs.region_id)}, ${sqlString(cs.region_nombre)}, ` +
            `${sqlString(cs.municipio)}, ${sqlString(cs.tipo)}, ${sqlBool(cs.activo !== false)}` +
            `) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, estado_id = EXCLUDED.estado_id;`
          );
        }
        lines.push(``);
      }
    }

    // 4. Usuarios del Sistema y sus Contraseñas Activas
    lines.push(`-- 5. Insertando Usuarios Institucionales y Credenciales`);
    for (const u of PREDEFINED_SYSTEM_USERS) {
      const activePassword = authService.getPasswordForUser(u.email);
      lines.push(
        `INSERT INTO usuarios (email, password_hash, nombre_completo, cargo, rol, estado_asignado, avatar, activo) VALUES (` +
        `${sqlString(u.email)}, ${sqlString(activePassword)}, ${sqlString(u.nombre)}, ` +
        `${sqlString(u.cargo)}, ${sqlString(u.role)}, ${sqlString(u.estadoAsignado)}, ` +
        `${sqlString(u.avatar)}, TRUE` +
        `) ON CONFLICT (email) DO UPDATE SET ` +
        `password_hash = EXCLUDED.password_hash, nombre_completo = EXCLUDED.nombre_completo, rol = EXCLUDED.rol;`
      );
    }
    lines.push(``);

    // 5. Solicitudes de reinicio de clave
    const resetRequests = passwordResetService.getRequests();
    if (resetRequests.length > 0) {
      lines.push(`-- 6. Insertando Solicitudes de Reinicio de Clave`);
      for (const req of resetRequests) {
        lines.push(
          `INSERT INTO solicitudes_reinicio_clave (id, email, estado, solicitante_nombre, solicitante_cedula, motivo, status, nueva_clave_temporal, atendido_por, observaciones) VALUES (` +
          `${sqlString(req.id)}, ${sqlString(req.email)}, ${sqlString(req.estado)}, ` +
          `${sqlString(req.solicitanteNombre)}, ${sqlString(req.solicitanteCedula)}, ` +
          `${sqlString(req.motivo)}, ${sqlString(req.status)}, ` +
          `${sqlString(req.nuevaClaveTemporal)}, ${sqlString(req.atendidoPor)}, ` +
          `${sqlString(req.observaciones)}` +
          `) ON CONFLICT (id) DO NOTHING;`
        );
      }
      lines.push(``);
    }

    // 6. Respaldo Oficial SISFLOTA01
    const backups = backupService.getBackups();
    if (backups.length > 0) {
      lines.push(`-- 7. Insertando Puntos de Control y Respaldos (SISFLOTA01)`);
      for (const bk of backups) {
        lines.push(
          `INSERT INTO puntos_control_backups (id, codigo, descripcion, es_oficial, total_vehiculos, payload_vehiculos, payload_catalogos) VALUES (` +
          `${sqlString(bk.id)}, ${sqlString(bk.checkpointCode || bk.id)}, ` +
          `${sqlString(bk.description)}, ${sqlBool(bk.isOfficialCheckpoint)}, ` +
          `${sqlNumber(bk.totalVehicles)}, ` +
          `${sqlJsonb(bk.vehicles)}, ${sqlJsonb(bk.catalogs)}` +
          `) ON CONFLICT (id) DO UPDATE SET descripcion = EXCLUDED.descripcion;`
        );
      }
      lines.push(``);
    }

    // 7. Flota Vehicular Completa (Las 45 Columnas)
    lines.push(`-- 8. Insertando Parque Automotor Actual (${vehicles.length} vehículos)`);
    for (const v of vehicles) {
      lines.push(
        `INSERT INTO flota_vehiculos (` +
        `estado, numero_vehiculo, placa, marca_vehiculo, modelo_vehiculo, tipo_vehiculo, ` +
        `unidad_asignada, centro_servicios, condicion_actual, mantenimiento_preventivo, ` +
        `pastillas, bandas, bomba_freno, disco, plato, collarin, bombin_superior, bombin_inferior, ` +
        `bateria, bobina, bujias, cauchos, correas_motor, luces_delanteras, parabrisas, ` +
        `tren_delantero, ballesta, crucetas, amortiguadores, radiador, motor, ` +
        `cant_total_reparaciones, cant_cauchos, medidas_caucho, cantidad_baterias, caracteristicas_bateria, ` +
        `vehiculo_recuperado, fecha_recuperacion, gerencia_origen, vehiculo_otra_gerencia_devuelto, fecha_entrega_gerencia_origen, ` +
        `observacion, certificar_tipo_vehiculo, prioridad_recuperacion, ` +
        `nombre_personal_responsable, cedula_personal_responsable, telefono_personal_responsable, ` +
        `region, estado_venezuela, correlativo_carga, fotos_vehiculo` +
        `) VALUES (` +
        `${sqlString(v.estado)}, ${sqlString(v.numero_vehiculo)}, ${sqlString(v.placa)}, ` +
        `${sqlString(v.marca_vehiculo)}, ${sqlString(v.modelo_vehiculo)}, ${sqlString(v.tipo_vehiculo)}, ` +
        `${sqlString(v.unidad_asignada)}, ${sqlString(v.centro_servicios)}, ` +
        `${sqlString(v.condicion_actual)}, ${sqlString(v.mantenimiento_preventivo)}, ` +
        `${sqlString(v.pastillas)}, ${sqlString(v.bandas)}, ${sqlString(v.bomba_freno)}, ` +
        `${sqlString(v.disco)}, ${sqlString(v.plato)}, ${sqlString(v.collarin)}, ` +
        `${sqlString(v.bombin_superior)}, ${sqlString(v.bombin_inferior)}, ${sqlString(v.bateria)}, ` +
        `${sqlString(v.bobina)}, ${sqlString(v.bujias)}, ${sqlString(v.cauchos)}, ` +
        `${sqlString(v.correas_motor)}, ${sqlString(v.luces_delanteras)}, ${sqlString(v.parabrisas)}, ` +
        `${sqlString(v.tren_delantero)}, ${sqlString(v.ballesta)}, ${sqlString(v.crucetas)}, ` +
        `${sqlString(v.amortiguadores)}, ${sqlString(v.radiador)}, ${sqlString(v.motor)}, ` +
        `${sqlNumber(v.cant_total_reparaciones)}, ${sqlNumber(v.cant_cauchos)}, ` +
        `${sqlString(v.medidas_caucho)}, ${sqlNumber(v.cantidad_baterias)}, ` +
        `${sqlString(v.caracteristicas_bateria)}, ` +
        `${sqlString(v.vehiculo_recuperado)}, ${sqlString(v.fecha_recuperacion)}, ` +
        `${sqlString(v.gerencia_origen)}, ${sqlString(v.vehiculo_otra_gerencia_devuelto)}, ` +
        `${sqlString(v.fecha_entrega_gerencia_origen)}, ` +
        `${sqlString(v.observacion)}, ${sqlString(v.certificar_tipo_vehiculo)}, ` +
        `${sqlString(v.prioridad_recuperacion)}, ` +
        `${sqlString(v.nombre_personal_responsable)}, ${sqlString(v.cedula_personal_responsable)}, ` +
        `${sqlString(v.telefono_personal_responsable)}, ` +
        `${sqlString(v.region)}, ${sqlString(v.estado_venezuela)}, ` +
        `${sqlString(v.correlativo_carga)}, ${sqlJsonb(v.fotos_vehiculo)}` +
        `) ON CONFLICT (numero_vehiculo) DO UPDATE SET ` +
        `condicion_actual = EXCLUDED.condicion_actual, ` +
        `mantenimiento_preventivo = EXCLUDED.mantenimiento_preventivo, ` +
        `placa = EXCLUDED.placa, ` +
        `ultima_actualizacion = CURRENT_TIMESTAMP;`
      );
    }

    lines.push(``);
    lines.push(`COMMIT;`);
    lines.push(`-- Fin de la migración de datos PostgreSQL CORPOELEC GGPD.`);

    return lines.join('\n');
  },

  /**
   * Genera el script unificado de despliegue completo (DDL + DML)
   */
  generateCompleteSetupScript(
    vehicles: VehicleRecord[],
    catalogs?: MasterCatalogsState
  ): string {
    const ddl = this.generatePostgreSqlSchema();
    const dml = this.generatePostgreSqlSeedData(vehicles, catalogs);

    return `-- ============================================================================
-- PAQUETE COMPLETO DE DESPLIEGUE POSTGRESQL (ESQUEMA + DATOS)
-- SISTEMA DE GESTIÓN DE FLOTA VEHICULAR CORPOELEC - GGPD
-- ============================================================================
-- INSTRUCCIONES RÁPIDAS DE INSTALACIÓN EN LINUX / PSQL:
-- 1. Iniciar sesión en el servidor PostgreSQL:
--      sudo -u postgres psql
-- 2. Crear la base de datos y usuario dedicado:
--      CREATE DATABASE corpoelec_flota_db;
--      CREATE USER corpoelec_admin WITH ENCRYPTED PASSWORD 'Corpoelec2026*';
--      GRANT ALL PRIVILEGES ON DATABASE corpoelec_flota_db TO corpoelec_admin;
--      \\c corpoelec_flota_db
--      GRANT ALL ON SCHEMA public TO corpoelec_admin;
-- 3. Ejecutar este archivo completo:
--      psql -U corpoelec_admin -d corpoelec_flota_db -f corpoelec_bd_completa_setup.sql
-- ============================================================================

${ddl}

${dml}
`;
  },

  /**
   * Helper para descargar scripts .sql en el navegador
   */
  downloadSqlFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Guía de comandos CLI para despliegue en servidor corporativo
   */
  getDeploymentGuide(): string {
    return `# Guía de Despliegue en Servidor Corporativo PostgreSQL (Linux / Windows)

### 1. Requisitos
- Servidor con PostgreSQL versión 14, 15 o 16.
- Acceso con privilegios de administrador (\`postgres\` o \`root\`).

### 2. Creación de la Base de Datos y Roles en Linux (Ubuntu/Debian/CentOS)
\`\`\`bash
# Conectar como superusuario postgres
sudo -u postgres psql

# En el prompt de psql:
CREATE DATABASE corpoelec_flota_db WITH ENCODING 'UTF8';
CREATE USER corpoelec_admin WITH ENCRYPTED PASSWORD 'Corpoelec2026*';
GRANT ALL PRIVILEGES ON DATABASE corpoelec_flota_db TO corpoelec_admin;

\\c corpoelec_flota_db
GRANT ALL ON SCHEMA public TO corpoelec_admin;
\\q
\`\`\`

### 3. Ejecución del Script Unificado
Descargue el archivo **corpoelec_bd_completa_setup.sql** y ejecútelo con:
\`\`\`bash
psql -h localhost -U corpoelec_admin -d corpoelec_flota_db -f corpoelec_bd_completa_setup.sql
\`\`\`

### 4. Consultas Útiles de Verificación
\`\`\`sql
-- Contar vehículos registrados
SELECT COUNT(*) FROM flota_vehiculos;

-- Ver resumen territorial de flota
SELECT * FROM v_resumen_operativo_flota;

-- Ver vehículos con mantenimiento preventivo vencido
SELECT * FROM v_kpis_mantenimiento;

-- Verificar usuarios y contraseñas
SELECT email, rol, estado_asignado, activo FROM usuarios;
\`\`\`
`;
  }
};
