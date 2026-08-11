import React from 'react';

// SCTIS Dashboard Mock
export const SCTISDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
    <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400">Dashboard SCTIS v2.0 (En Construcción)</h3>
    <p className="text-xs text-emerald-700 dark:text-emerald-600 mt-2">
      Este módulo consolidará la Energía No Suministrada (ENS) y las métricas de interrupciones del esquema `sctis`.
    </p>
  </div>
);

// SGTA Dashboard Mock
export const SGTADashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
    <h3 className="text-lg font-black text-blue-900 dark:text-blue-400">Dashboard Tareas y Minutas (En Construcción)</h3>
    <p className="text-xs text-blue-700 dark:text-blue-600 mt-2">
      Integración pendiente con el catálogo de compromisos institucionales.
    </p>
  </div>
);

// Planificacion Dashboard Mock
export const PlanificacionDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
    <h3 className="text-lg font-black text-purple-900 dark:text-purple-400">Dashboard Planificación SEN (En Construcción)</h3>
    <p className="text-xs text-purple-700 dark:text-purple-600 mt-2">
      Se conectará al esquema `samc` para consolidar POA, Meta Física y cierres presupuestarios de Viáticos.
    </p>
  </div>
);

// SCEIN Dashboard Mock
export const SCEINDashboard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
    <h3 className="text-lg font-black text-amber-900 dark:text-amber-400">Dashboard REMIX SCEIN (En Construcción)</h3>
    <p className="text-xs text-amber-700 dark:text-amber-600 mt-2">
      Consolidado de criticidad y equipos de patio indisponibles a nivel nacional.
    </p>
  </div>
);
