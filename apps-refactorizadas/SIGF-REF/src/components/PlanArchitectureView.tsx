import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  Workflow, 
  Table, 
  GitBranch, 
  ArrowRight, 
  Sliders, 
  Copy, 
  Check,
  FileCheck
} from 'lucide-react';

interface PlanArchitectureViewProps {
  onGoToCatalogs: () => void;
  onGoToForm: () => void;
}

export const PlanArchitectureView: React.FC<PlanArchitectureViewProps> = ({ onGoToCatalogs, onGoToForm }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'arquitectura' | 'fases' | 'catalogos_plan'>('diagnostico');

  const copySqlSchema = () => {
    const sql = `-- MODELO DE BASE DE DATOS RELACIONAL NORMALIZADO (CORPOELEC FLOTA)
-- Diseñado a partir de las 45 columnas de FLOTA.xlsx

-- 1. Tabla Única Territorial y Catálogos con Llaves Foráneas Dependientes
CREATE TABLE cat_regiones (
    id VARCHAR(30) PRIMARY KEY, -- PK e.g. 'reg-guayana', 'reg-capital'
    codigo VARCHAR(5) NOT NULL UNIQUE, -- 'GUY', 'CAP', 'OCC'
    nombre VARCHAR(100) NOT NULL UNIQUE,
    gerencia_regional VARCHAR(150),
    sede_principal VARCHAR(150),
    descripcion TEXT
);

CREATE TABLE cat_estados (
    id VARCHAR(30) PRIMARY KEY, -- PK e.g. 'bol', 'mir', 'cap', 'esq'
    codigo VARCHAR(5) NOT NULL UNIQUE, -- 'BOL', 'MIR', 'CCS', 'ESQ'
    nombre VARCHAR(80) NOT NULL UNIQUE,
    capital VARCHAR(80),
    region_id VARCHAR(30) NOT NULL REFERENCES cat_regiones(id) ON UPDATE CASCADE -- LLAVE FORÁNEA: Región determina Estados
);

CREATE TABLE cat_centros_servicios (
    id VARCHAR(30) PRIMARY KEY, -- PK e.g. 'cs-bol-01'
    codigo VARCHAR(20),
    nombre VARCHAR(120) NOT NULL,
    estado_id VARCHAR(30) NOT NULL REFERENCES cat_estados(id) ON UPDATE CASCADE, -- LLAVE FORÁNEA: Estado determina Centros de Servicios
    region_id VARCHAR(30) NOT NULL REFERENCES cat_regiones(id) ON UPDATE CASCADE, -- LLAVE FORÁNEA: Región determina Centros de Servicios
    municipio VARCHAR(80),
    tipo VARCHAR(80),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cat_marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    pais_origen VARCHAR(80),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cat_tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cat_unidades_asignadas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Entidad Principal del Vehículo (con Integridad Referencial de 3 Niveles)
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_vehiculo VARCHAR(30) NOT NULL UNIQUE, -- Col B (PK de negocio)
    region_id VARCHAR(30) NOT NULL REFERENCES cat_regiones(id), -- Col SEN (Región CORPOELEC)
    estado_id VARCHAR(30) NOT NULL REFERENCES cat_estados(id), -- Col AO (FK dependiente: estados de la región)
    centro_servicios_id VARCHAR(30) REFERENCES cat_centros_servicios(id), -- Col F (FK dependiente: el estado determina estrictamente los centros de servicio)
    marca_id INT NOT NULL REFERENCES cat_marcas(id), -- Col C
    tipo_vehiculo_id INT NOT NULL REFERENCES cat_tipos_vehiculo(id), -- Col D
    certificar_tipo_vehiculo VARCHAR(100), -- Col AO
    unidad_asignada VARCHAR(120), -- Col E (Campo Operativo Libre, completamente desacoplado del Centro de Servicios)
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('ACTIVO', 'INACTIVO', 'EN MANTENIMIENTO', 'FUERA DE SERVICIO', 'RECUPERADO')), -- Col A
    condicion_actual VARCHAR(30) NOT NULL CHECK (condicion_actual IN ('BUENO', 'REGULAR', 'MALO', 'FUERA DE SERVICIO')), -- Col G
    mantenimiento_preventivo VARCHAR(20) CHECK (mantenimiento_preventivo IN ('AL DIA', 'VENCIDO', 'PENDIENTE', 'NO APLICA')), -- Col H
    prioridad_recuperacion VARCHAR(10) CHECK (prioridad_recuperacion IN ('ALTA', 'MEDIA', 'BAJA')), -- Col AP
    observacion TEXT, -- Col AN
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Especificación de Insumos y Repuestos Críticos
CREATE TABLE vehiculo_insumos (
    vehiculo_id UUID PRIMARY KEY REFERENCES vehiculos(id) ON DELETE CASCADE,
    cant_total_reparaciones INT DEFAULT 0 CHECK (cant_total_reparaciones >= 0), -- Col AD
    cant_cauchos INT DEFAULT 0 CHECK (cant_cauchos >= 0), -- Col AE
    medidas_caucho VARCHAR(50), -- Col AF
    cantidad_baterias INT DEFAULT 0 CHECK (cantidad_baterias >= 0), -- Col AG
    caracteristicas_bateria VARCHAR(100) -- Col AH
);

-- 4. Diagnóstico Mecánico y Eléctrico de los 21 Componentes
CREATE TABLE vehiculo_diagnostico_componentes (
    vehiculo_id UUID PRIMARY KEY REFERENCES vehiculos(id) ON DELETE CASCADE,
    pastillas VARCHAR(10) DEFAULT 'BUENO' CHECK (pastillas IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col I
    bandas VARCHAR(10) DEFAULT 'BUENO' CHECK (bandas IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col J
    bomba_freno VARCHAR(10) DEFAULT 'BUENO' CHECK (bomba_freno IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col K
    disco VARCHAR(10) DEFAULT 'BUENO' CHECK (disco IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col L
    plato VARCHAR(10) DEFAULT 'BUENO' CHECK (plato IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col M
    collarin VARCHAR(10) DEFAULT 'BUENO' CHECK (collarin IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col N
    bombin_superior VARCHAR(10) DEFAULT 'BUENO' CHECK (bombin_superior IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col O
    bombin_inferior VARCHAR(10) DEFAULT 'BUENO' CHECK (bombin_inferior IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col P
    bateria VARCHAR(10) DEFAULT 'BUENO' CHECK (bateria IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col Q
    bobina VARCHAR(10) DEFAULT 'BUENO' CHECK (bobina IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col R
    bujias VARCHAR(10) DEFAULT 'BUENO' CHECK (bujias IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col S
    cauchos VARCHAR(10) DEFAULT 'BUENO' CHECK (cauchos IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col T
    correas_motor VARCHAR(10) DEFAULT 'BUENO' CHECK (correas_motor IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col U
    luces_delanteras VARCHAR(10) DEFAULT 'BUENO' CHECK (luces_delanteras IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col V
    parabrisas VARCHAR(10) DEFAULT 'BUENO' CHECK (parabrisas IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col W
    tren_delantero VARCHAR(10) DEFAULT 'BUENO' CHECK (tren_delantero IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col X
    ballesta VARCHAR(10) DEFAULT 'BUENO' CHECK (ballesta IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col Y
    crucetas VARCHAR(10) DEFAULT 'BUENO' CHECK (crucetas IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col Z
    amortiguadores VARCHAR(10) DEFAULT 'BUENO' CHECK (amortiguadores IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col AA
    radiador VARCHAR(10) DEFAULT 'BUENO' CHECK (radiador IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col AB
    motor VARCHAR(10) DEFAULT 'BUENO' CHECK (motor IN ('BUENO', 'REGULAR', 'MALO', 'N/A')), -- Col AC
    fecha_inspeccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trazabilidad de Recuperación y Gerencias
CREATE TABLE vehiculo_recuperaciones (
    vehiculo_id UUID PRIMARY KEY REFERENCES vehiculos(id) ON DELETE CASCADE,
    es_recuperado VARCHAR(2) DEFAULT 'NO' CHECK (es_recuperado IN ('SI', 'NO')), -- Col AI
    fecha_recuperacion DATE, -- Col AJ
    gerencia_origen_id INT REFERENCES cat_gerencias(id), -- Col AK
    devuelto_a_gerencia VARCHAR(2) DEFAULT 'NO' CHECK (devuelto_a_gerencia IN ('SI', 'NO')), -- Col AL
    fecha_entrega DATE -- Col AM
);

-- 6. Custodia y Personal Asignado Responsable
CREATE TABLE vehiculo_custodias (
    id SERIAL PRIMARY KEY,
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
    nombre_responsable VARCHAR(120) NOT NULL, -- Col AQ
    cedula_responsable VARCHAR(20) NOT NULL, -- Col AR
    telefono_responsable VARCHAR(30), -- Col AS
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <span>Diagnóstico Técnico y Plan Maestro de Ingesta</span>
            <span aria-hidden="true">·</span>
            <span>45 Columnas (A : AS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Validación de Estructura de FLOTA y Plan para el Sistema de Captura
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Hemos validado integralmente la plantilla de 45 columnas de <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">FLOTA.xlsx</code>. A continuación se presenta el diagnóstico estructural, la arquitectura relacional recomendada y la estrategia para integrar los catálogos maestros que nos suministrarás.
          </p>
        </div>

        {/* Action Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'diagnostico'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. Diagnóstico de la Estructura (45 Cols)
          </button>
          <button
            onClick={() => setActiveTab('catalogos_plan')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'catalogos_plan'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2. Estrategia de Catálogos Maestros
          </button>
          <button
            onClick={() => setActiveTab('arquitectura')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'arquitectura'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            3. Modelo de Base de Datos Relacional
          </button>
          <button
            onClick={() => setActiveTab('fases')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'fases'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            4. Hoja de Ruta de Implementación
          </button>
        </div>
      </div>

      {/* Tab 1: Diagnóstico de la Estructura */}
      {activeTab === 'diagnostico' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">45 Columnas Formalizadas</h3>
                  <p className="text-xs text-slate-500 font-mono">Rango A:AS · Fila 1 Encabezados</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Estructura exhaustiva que cubre desde la ficha legal y ubicación, hasta el detalle mecánico de 21 componentes y trazabilidad de traspaso entre gerencias.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">7 Campos Clave Sin Normalizar</h3>
                  <p className="text-xs text-slate-500">Riesgo de errores tipográficos en Excel</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Campos como Marca, Tipo, Gerencia, Centro de Servicio y Medida de Caucho son texto abierto en Excel, lo cual genera duplicidad de criterios y desvirtúa los reportes.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Reglas de Integridad Críticas</h3>
                  <p className="text-xs text-slate-500 font-mono">Unicidad en Col B (N° Vehículo)</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                El sistema debe rechazar registros con números de vehículo repetidos o vacíos, y validar dependencias (ej. si no fue recuperado, no exigir fecha).
              </p>
            </div>
          </div>

          {/* Detailed Diagnosis Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-900">
                Análisis Detallado de Vulnerabilidades de la Estructura Excel y Solución Propuesta
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Comparación entre la recolección actual en hojas de cálculo y la transformación a base de datos estructurada.
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <span className="font-semibold text-slate-900">1. Identificador Primario</span>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Columna B (Número de Vehículo)</div>
                </div>
                <div className="md:col-span-4 text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <strong className="block text-amber-800 font-semibold mb-1">Riesgo en Excel:</strong>
                  Excel permite accidentalmente duplicar números de vehículo, incluir espacios iniciales o finales (" COR-4012 " vs "COR-4012") o dejar la celda en blanco.
                </div>
                <div className="md:col-span-5 text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-800 font-semibold mb-1">Solución del Sistema:</strong>
                  Forzar restricción de <code className="font-mono bg-white px-1 rounded">PRIMARY KEY UNIQUE</code> con normalización automática (mayúsculas y trim). Validación en vivo antes de guardar.
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <span className="font-semibold text-slate-900">2. Dispersión Tipográfica</span>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Cols C, D, E, F, AK (Marcas, Gerencias, etc.)</div>
                </div>
                <div className="md:col-span-4 text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <strong className="block text-amber-800 font-semibold mb-1">Riesgo en Excel:</strong>
                  Los digitadores escriben "Toyota", "TOYOTA", "Toyot", "GGPD", "Prog. y Control". Esto destruye los filtros y conteos consolidados de la flota.
                </div>
                <div className="md:col-span-5 text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-800 font-semibold mb-1">Solución del Sistema:</strong>
                  Sustituir texto libre por <strong>Catálogos Maestros</strong> seleccionables en lista desplegable y búsqueda inteligente, listos para cargar tus catálogos definitivos.
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <span className="font-semibold text-slate-900">3. Matriz de 21 Componentes</span>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Cols I a AC (Pastillas a Motor)</div>
                </div>
                <div className="md:col-span-4 text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <strong className="block text-amber-800 font-semibold mb-1">Riesgo en Excel:</strong>
                  Llenar manualmente 21 celdas por cada carro es tedioso y propenso a errores tipográficos ("regular", "R", "buen", "N/A", "x").
                </div>
                <div className="md:col-span-5 text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-800 font-semibold mb-1">Solución del Sistema:</strong>
                  Matriz de botones de un solo toque (<code className="font-mono bg-white px-1 rounded">BUENO</code>, <code className="font-mono bg-white px-1 rounded">REGULAR</code>, <code className="font-mono bg-white px-1 rounded">MALO</code>, <code className="font-mono bg-white px-1 rounded">N/A</code>) con atajo rápido "Marcar Todo Bueno" para agilizar el diagnóstico.
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <span className="font-semibold text-slate-900">4. Dependencias Lógicas</span>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Cols AI:AJ (Recuperación) y AL:AM (Devolución)</div>
                </div>
                <div className="md:col-span-4 text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <strong className="block text-amber-800 font-semibold mb-1">Riesgo en Excel:</strong>
                  Contradicciones frecuentes: unidades con "VEHICULO RECUPERADO = NO" pero con fechas viejas escritas, o "DEVUELTO = SI" sin fecha de acta de entrega.
                </div>
                <div className="md:col-span-5 text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-800 font-semibold mb-1">Solución del Sistema:</strong>
                  Lógica condicional interactiva: Si el usuario marca "NO", el campo de fecha se bloquea o desactiva; si marca "SI", se activa y valida formato <code className="font-mono bg-white px-1 rounded">DD/MM/AAAA</code>.
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <span className="font-semibold text-slate-900">5. Cantidad de Reparaciones</span>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Columna AD (Cant. Total Reparaciones)</div>
                </div>
                <div className="md:col-span-4 text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                  <strong className="block text-amber-800 font-semibold mb-1">Riesgo en Excel:</strong>
                  El inspector coloca a mano un número (ej. "3"), pero en las columnas de componentes hay 7 ítems en "MALO". Hay discrepancia interna.
                </div>
                <div className="md:col-span-5 text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-800 font-semibold mb-1">Solución del Sistema:</strong>
                  El sistema calcula y sugiere automáticamente el total de reparaciones requeridas a partir de los componentes evaluados en estado REGULAR o MALO.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Estrategia de Catálogos Maestros */}
      {activeTab === 'catalogos_plan' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Estrategia de Parametrización de Catálogos Maestros
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cómo se integrarán los catálogos que nos suministrarás posteriormente para estructurar la base de datos y acelerar la ingesta.
                </p>
              </div>
              <button
                onClick={onGoToCatalogs}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="w-4 h-4" />
                <span>Ver Módulo de Catálogos</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Columna C</span>
                  <span className="text-xs text-slate-500">Obligatorio</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Marcas de Vehículos</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Estandariza los fabricantes autorizados (TOYOTA, FORD, CHEVROLET, IVECO, MACK, JAC, etc.).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Estado:</strong> Catálogo precargado listo para ampliar o sustituir por tu lista oficial.
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Columna D</span>
                  <span className="text-xs text-slate-500">Obligatorio</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Tipos de Vehículo</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Tipologías operativas de CORPOELEC (CAMIONETA, CAMIÓN CESTA AISLADA, CAMIÓN BRAZO, MOTO, etc.).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Impacto:</strong> Permite segmentar análisis de disponibilidad por tipo de cuadrilla.
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Columna AK</span>
                  <span className="text-xs text-slate-500">Recuperación</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Gerencias de Origen</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Estructura organizacional (GGPD, Distribución, Transmisión, Generación, Regiones Capital/Central/etc.).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Impacto:</strong> Facilita conciliación patrimonial de traspaso entre gerencias.
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Columna F</span>
                  <span className="text-xs text-slate-500">Ubicación</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Centros de Servicios (CS)</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Sedes territoriales y bases operativas de cuadrillas (CS Chacao, CS El Marqués, CS Valencia Norte, etc.).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Impacto:</strong> Monitoreo geográfico del parque automotor por estado o distrito.
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Columna E</span>
                  <span className="text-xs text-slate-500">Asignación</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Unidades Asignadas</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Especialidad de la cuadrilla (Averías, Líneas Subterráneas, Subestaciones, Alumbrado, Picapoda).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Impacto:</strong> Saber cuántos vehículos operativos tiene cada servicio crítico.
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-700 font-semibold">Cols AF y AH</span>
                  <span className="text-xs text-slate-500">Insumos</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">Cauchos y Baterías</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Medidas técnicas de neumáticos (265/70R16, 7.50R16) y amperajes de batería (1100 AMP, 800 AMP).
                </p>
                <div className="mt-3 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                  <strong>Impacto:</strong> Consolidar requerimientos exactos de compra y dotación de repuestos.
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong>¿Cómo nos enviarás los catálogos?</strong> Hemos diseñado el sistema para que cuando tengas tus listas (en texto, archivo Excel o JSON), puedas pegarlas o importarlas directamente en la pestaña <strong className="text-blue-950">"Catálogos Maestros"</strong> con un solo clic. El formulario y la base de datos se actualizarán automáticamente sin requerir reprogramación.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Modelo de Base de Datos Relacional */}
      {activeTab === 'arquitectura' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Modelo Entidad-Relación y Esquema SQL Recomendado
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estructuración en 6 entidades normalizadas a partir de las 45 columnas planas de FLOTA.xlsx.
                </p>
              </div>
              <button
                onClick={copySqlSchema}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado al Portapapeles' : 'Copiar Script DDL'}</span>
              </button>
            </div>

            {/* Architecture diagram cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
                <div className="text-xs font-mono font-semibold text-purple-700 uppercase">Tabla Territorial · FKs</div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Jerarquía Territorial (3 Niveles)</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Integridad referencial dependiente estricta:
                </p>
                <ul className="text-xs text-slate-600 font-mono mt-2 space-y-1 list-disc list-inside">
                  <li><strong>cat_regiones</strong> (PK id)</li>
                  <li><strong>cat_estados</strong> (FK region_id)</li>
                  <li><strong>cat_centros_servicios</strong> (FK estado_id, FK region_id)</li>
                  <li className="text-purple-800 font-sans text-[11px] font-semibold mt-1">
                    Regiones determinan a Estados y Centros de Servicios sin permitir cruces ajenos.
                  </li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="text-xs font-mono font-semibold text-blue-700 uppercase">Tabla 1 · Principal</div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">vehiculos</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Datos primarios inmutables y estado operativo:
                </p>
                <ul className="text-xs text-slate-500 font-mono mt-2 space-y-1 list-disc list-inside">
                  <li>id (UUID PK)</li>
                  <li>numero_vehiculo (UNIQUE)</li>
                  <li>region_id (FK cat_regiones)</li>
                  <li>estado_id (FK cat_estados)</li>
                  <li>centro_servicios_id (FK cat_centros)</li>
                  <li>marca_id & tipo_vehiculo_id (FK)</li>
                  <li>estado & condicion</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="text-xs font-mono font-semibold text-emerald-700 uppercase">Tabla 2 · Diagnóstico</div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">vehiculo_diagnostico_componentes</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Auditoría de los 21 componentes mecánicos:
                </p>
                <ul className="text-xs text-slate-500 font-mono mt-2 space-y-1 list-disc list-inside">
                  <li>vehiculo_id (FK)</li>
                  <li>frenos (pastillas, discos, bomba)</li>
                  <li>embrague (plato, collarín, bombines)</li>
                  <li>eléctrico (batería, bobina, bujías)</li>
                  <li>suspensión (amortiguador, ballesta)</li>
                  <li>motor & transmisión (radiador, motor)</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="text-xs font-mono font-semibold text-amber-700 uppercase">Tabla 3 · Custodia & Trazabilidad</div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">recuperaciones & custodias</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Control intergerencial y personal responsable:
                </p>
                <ul className="text-xs text-slate-500 font-mono mt-2 space-y-1 list-disc list-inside">
                  <li>gerencia_origen_id (FK)</li>
                  <li>es_recuperado (SI/NO) & fecha</li>
                  <li>devuelto_a_gerencia & fecha</li>
                  <li>nombre_responsable</li>
                  <li>cedula_responsable (V-)</li>
                  <li>telefono_responsable</li>
                </ul>
              </div>
            </div>

            {/* SQL snippet */}
            <div className="mt-6">
              <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-lg text-xs font-mono">
                <span>schema_corpoelec_flota.sql (PostgreSQL / SQLite)</span>
                <span>DDL DDL Ready</span>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto rounded-b-lg max-h-80 leading-relaxed">
{`-- Normalización Relacional para Ingesta Optimizada
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_vehiculo VARCHAR(30) NOT NULL UNIQUE, -- Col B
    marca_id INT NOT NULL REFERENCES cat_marcas(id), -- Col C
    tipo_vehiculo_id INT NOT NULL REFERENCES cat_tipos_vehiculo(id), -- Col D
    estado VARCHAR(30) NOT NULL, -- Col A
    condicion_actual VARCHAR(30) NOT NULL, -- Col G
    ...
);

CREATE TABLE vehiculo_diagnostico_componentes (
    vehiculo_id UUID PRIMARY KEY REFERENCES vehiculos(id),
    pastillas VARCHAR(10) CHECK (pastillas IN ('BUENO','REGULAR','MALO','N/A')),
    bandas VARCHAR(10), bomba_freno VARCHAR(10), disco VARCHAR(10),
    plato VARCHAR(10), collarin VARCHAR(10), bombin_superior VARCHAR(10),
    ... -- 21 componentes técnicos
);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hoja de Ruta de Implementación */}
      {activeTab === 'fases' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Plan de Trabajo en 4 Fases para el Sistema de Captura
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Metodología para transitar ordenadamente desde el archivo Excel plano hasta un sistema en producción.
            </p>

            <div className="mt-6 space-y-6">
              {/* Phase 1 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50/40 border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-emerald-950">
                      Fase 1: Validación Estructural y Diccionario de Datos (COMPLETADO)
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Completado
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    Mapeo exhaustivo de las 45 columnas (A a AS), definición de tipos de datos estrictos, restricciones de unicidad e identificación de campos que requieren catálogos maestros.
                  </p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50/50 border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-950">
                      Fase 2: Recepción e Ingesta de Catálogos Maestros (LISTO PARA TUS DATOS)
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      En Curso
                    </span>
                  </div>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    Preparación del motor de catálogos dinámicos. Cuando nos facilites los listados oficiales de Marcas, Tipos de Vehículo, Gerencias, Centros de Servicios y Medidas de Cauchos, se alimentará el formulario y las reglas de validación en segundos.
                  </p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Fase 3: Formulario Digital de Captura en Campo y Taller
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                      Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Despliegue del formulario responsive estructurado en 5 pasos lógicos, con validación reactiva en tiempo real y controles táctiles para evaluar los 21 componentes mecánicos sin fricción.
                  </p>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Fase 4: Pipeline de Ingesta Masiva y Exportación Oficial 1:1
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                      Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Módulo de carga de archivos Excel (.xlsx) y CSV con previsualización de errores celda a celda antes de insertar, y generación de exportación con la plantilla exacta e inmutable de 45 columnas para los reportes de CORPOELEC.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                ¿Deseas probar el formulario de captura o consultar el diccionario de columnas?
              </span>
              <button
                onClick={onGoToForm}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Probar Formulario de Captura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
