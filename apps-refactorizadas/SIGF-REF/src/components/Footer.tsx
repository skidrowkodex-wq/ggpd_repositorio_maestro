import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  totalRecords?: number;
}

export const Footer: React.FC<FooterProps> = ({ totalRecords }) => {
  return (
    <footer 
      style={{
        background: '#0b3d2e',
        color: '#e8e8e8',
        fontSize: '0.8rem',
        padding: '20px 24px',
        borderTop: '2px solid #c9a227',
        textAlign: 'center',
        lineHeight: '1.6'
      }}
      className="mt-auto shadow-inner"
    >
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Pilares Normativos Obligatorios */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-xs text-[#c9a227]">
          <span className="font-bold">PILARES NORMATIVOS:</span>
          <span>ISO 27001</span>
          <span>·</span>
          <span>ISO 8000-110</span>
          <span>·</span>
          <span>OWASP Top 10</span>
          <span>·</span>
          <span>ISACA COBIT</span>
        </div>

        {/* Mención IA Obligatoria */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-[#c9a227]" />
          <span>Impulsado por Inteligencia Artificial Avanzada:</span>
          <span className="font-semibold text-white">Google Antigravity</span>
          <span>·</span>
          <span className="font-semibold text-white">Gemini Flash AI</span>
        </div>

        {/* Mención Institucional Unificada */}
        <div className="pt-2 border-t border-[#1a5f47] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
          <div className="font-bold text-white">
            CORPOELEC · Gerencia General de Planificación y Distribución (GGPD) · 2026
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Plantilla Oficial FLOTA.xlsx (Cols A:AS)</span>
            {totalRecords !== undefined && (
              <>
                <span>·</span>
                <span className="text-amber-300">{totalRecords} unidades activas en base de datos</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
