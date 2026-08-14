import React from 'react';

// SCTIS Dashboard Mock
export const SCTISDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
    <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400">Dashboard SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones</h3>
    <p className="text-xs text-emerald-700 dark:text-emerald-600 mt-2">
      Este módulo consolida la Energía No Suministrada (ENS en MWh) y las métricas de interrupciones del esquema `sctis`.
    </p>
  </div>
);

// SCMTP Dashboard Mock
export const SGTADashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
    <h3 className="text-lg font-black text-blue-900 dark:text-blue-400">Dashboard SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificacion</h3>
    <p className="text-xs text-blue-700 dark:text-blue-600 mt-2">
      Integración con el catálogo de compromisos institucionales y acuerdos de planificación regional.
    </p>
  </div>
);

// SCPPE Dashboard Mock
export const PlanificacionDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
    <h3 className="text-lg font-black text-purple-900 dark:text-purple-400">Dashboard SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales</h3>
    <p className="text-xs text-purple-700 dark:text-purple-600 mt-2">
      Conexión al esquema `samc` para consolidar POA, Meta Física y cierres presupuestarios de Viáticos.
    </p>
  </div>
);

// SCEIN Dashboard Mock
export const SCEINDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
    <h3 className="text-lg font-black text-amber-900 dark:text-amber-400">Dashboard SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles</h3>
    <p className="text-xs text-amber-700 dark:text-amber-600 mt-2">
      Consolidado de criticidad, transformadores y equipos de patio indisponibles a nivel nacional (ISO 55000).
    </p>
  </div>
);
