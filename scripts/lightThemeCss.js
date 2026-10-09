export const LIGHT_THEME_CSS = `
  /* RESET GLOBAL A MODO CLARO DE ALTO CONTRASTE (OPTIMIZADO PARA IMPRESORAS LÁSER MONOCROMÁTICAS) */
  html, body, #root {
    background: #ffffff !important;
    background-color: #ffffff !important;
    background-image: none !important;
    color: #0f172a !important;
  }

  /* PANELES Y TARJETAS */
  .glass-panel, .glass-panel-elevated, 
  div[class*="bg-slate-900"], div[class*="bg-slate-950"], div[class*="bg-[#040914]"],
  div[class*="bg-slate-900/"], div[class*="bg-slate-950/"], div[class*="bg-sky-950"] {
    background: #ffffff !important;
    background-color: #ffffff !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* BORDES */
  *[class*="border-sky-"], *[class*="border-cyan-"], *[class*="border-slate-"] {
    border-color: #cbd5e1 !important;
  }

  /* TIPOGRAFÍA Y TÍTULOS */
  h1, h2, h3, h4, h5, h6 {
    color: #002b49 !important;
  }

  .text-white {
    color: #0f172a !important;
  }

  .text-slate-100, .text-slate-200, .text-slate-300 {
    color: #1e293b !important;
  }

  .text-slate-400, .text-slate-500 {
    color: #475569 !important;
  }

  .text-cyan-400, .text-cyan-300, .text-sky-400, .text-sky-300 {
    color: #004488 !important;
    font-weight: 700 !important;
  }

  .text-emerald-400, .text-emerald-300 {
    color: #047857 !important;
    font-weight: 700 !important;
  }

  .text-rose-400, .text-rose-500, .text-red-400 {
    color: #b91c1c !important;
    font-weight: 700 !important;
  }

  .text-amber-400, .text-amber-300 {
    color: #b45309 !important;
    font-weight: 700 !important;
  }

  /* INPUTS Y SELECTS */
  input, select, textarea {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #94a3b8 !important;
  }

  /* BOTONES */
  button {
    background-color: #f8fafc !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
  }

  button.btn-primary, button[type="submit"], button[class*="bg-cyan-"], button[class*="bg-blue-"] {
    background-color: #002b49 !important;
    color: #ffffff !important;
    border-color: #002b49 !important;
  }

  /* TARJETAS KPI */
  .badge-servicio, div:has(> span:contains("En Servicio")) {
    background-color: #f0fdf4 !important;
    border: 1.5px solid #86efac !important;
    color: #14532d !important;
  }

  .badge-fallado, div:has(> span:contains("Indisponible")) {
    background-color: #fef2f2 !important;
    border: 1.5px solid #fca5a5 !important;
    color: #7f1d1d !important;
  }

  /* LIENZO SVG UNIFILAR (ATLAS TOPOLÓGICO) EN ALTO CONTRASTE */
  svg {
    background-color: #ffffff !important;
  }

  svg rect[fill="url(#grid)"] {
    fill: #ffffff !important;
  }

  svg pattern#grid path {
    stroke: #e2e8f0 !important;
  }

  /* Textos en el SVG */
  svg text {
    fill: #002b49 !important;
    font-weight: 700 !important;
  }

  /* Barras colectoras de potencia */
  svg line[stroke-width="6"] {
    stroke: #002b49 !important;
  }

  /* Conductores y líneas unifilares */
  svg line[stroke*="#"], svg path[stroke*="#"] {
    stroke: #1e293b !important;
  }

  /* Disyuntores de potencia (rectángulos) */
  svg rect[stroke-width="2"] {
    fill: #ffffff !important;
    stroke: #002b49 !important;
    stroke-width: 2.5 !important;
  }

  /* Transformadores de potencia (círculos entrelazados) */
  svg circle[stroke-width="3"] {
    stroke: #002b49 !important;
    stroke-width: 3.5 !important;
    fill: #ffffff !important;
  }

  /* Seccionadores */
  svg circle[r="4"] {
    fill: #1e293b !important;
  }
`;
