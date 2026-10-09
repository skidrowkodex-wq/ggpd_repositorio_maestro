// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Servicio de Almacenamiento y Ciclo de Vida de Activos
// ==============================================================================

import { SubestacionEstructura, ComponentePatio, ComponentFaultEvent, BahiaPatio } from '../types/sigad';
import { insforgeClient } from '../lib/insforgeClient';

const STORAGE_PREFIX = 'sigad_estructura_';
const EVENTS_STORAGE_KEY = 'sigad_eventos_historico';

export const storageService = {
  getEstructura(seCode: string): SubestacionEstructura | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${seCode}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Error leyendo estructura de ${seCode}:`, e);
    }
    return null;
  },

  saveEstructura(estructura: SubestacionEstructura): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${estructura.se_codigo}`, JSON.stringify(estructura));
      
      // Asíncrono: intento de persistencia en InsForge si está en línea (no bloqueante)
      this.syncInsforgeAsync(estructura).catch(err => {
        console.warn('SIGAD: Persistencia remota en segundo plano no disponible (modo local activo):', err?.message);
      });
    } catch (e) {
      console.error(`Error guardando estructura de ${estructura.se_codigo}:`, e);
    }
  },

  updateComponente(seCode: string, compActualizado: ComponentePatio): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    let encontrado = false;
    est.bahias = est.bahias.map(b => {
      return {
        ...b,
        componentes: b.componentes.map(c => {
          if (c.id === compActualizado.id) {
            encontrado = true;
            return { ...compActualizado };
          }
          return c;
        })
      };
    });

    if (encontrado) {
      est.ultima_actualizacion = new Date().toISOString();
      this.saveEstructura(est);
    }
    return est;
  },

  addComponente(seCode: string, bahiaId: string, nuevoComp: ComponentePatio): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    let agregado = false;
    est.bahias = est.bahias.map(b => {
      if (b.id === bahiaId) {
        agregado = true;
        return {
          ...b,
          componentes: [...b.componentes, nuevoComp]
        };
      }
      return b;
    });

    if (agregado) {
      est.ultima_actualizacion = new Date().toISOString();
      this.saveEstructura(est);
    }
    return est;
  },

  deleteComponente(seCode: string, compId: string): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    let eliminado = false;
    est.bahias = est.bahias.map(b => {
      const filtered = b.componentes.filter(c => c.id !== compId);
      if (filtered.length !== b.componentes.length) eliminado = true;
      return { ...b, componentes: filtered };
    });

    if (eliminado) {
      est.ultima_actualizacion = new Date().toISOString();
      this.saveEstructura(est);
    }
    return est;
  },

  addBahia(seCode: string, nuevaBahia: BahiaPatio): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    est.bahias.push(nuevaBahia);
    est.ultima_actualizacion = new Date().toISOString();
    this.saveEstructura(est);
    return est;
  },

  deleteBahia(seCode: string, bahiaId: string): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    est.bahias = est.bahias.filter(b => b.id !== bahiaId);
    est.ultima_actualizacion = new Date().toISOString();
    this.saveEstructura(est);
    return est;
  },

  clearEstructura(seCode: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${seCode}`);
    } catch (e) {
      console.error(`Error borrando estructura de ${seCode}:`, e);
    }
  },

  declararAveria(
    seCode: string, 
    compId: string, 
    causa: string, 
    descripcion: string, 
    registradoPor: string
  ): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    const nuevoEvento: ComponentFaultEvent = {
      id: `evt-${Date.now()}`,
      fecha_evento: new Date().toISOString(),
      tipo_evento: 'FALLA_DECLARADA',
      causa,
      descripcion,
      registrado_por: registradoPor,
      sincronizado_scein: true,
    };

    let compModificado: ComponentePatio | null = null;

    est.bahias = est.bahias.map(b => ({
      ...b,
      componentes: b.componentes.map(c => {
        if (c.id === compId) {
          compModificado = {
            ...c,
            estado_operativo: 'INDISPONIBLE_FALLADO',
            alarma_activa: true,
            historial_eventos: [nuevoEvento, ...(c.historial_eventos || [])]
          };
          return compModificado;
        }
        return c;
      })
    }));

    if (compModificado) {
      est.ultima_actualizacion = new Date().toISOString();
      this.saveEstructura(est);
      this.guardarEventoGlobal(nuevoEvento, seCode, compModificado);
    }
    return est;
  },

  restablecerServicio(
    seCode: string, 
    compId: string, 
    detalles: {
      esNuevo: boolean;
      serial?: string;
      fabricante?: string;
      capacidadMva?: number;
      notas: string;
      registradoPor: string;
    }
  ): SubestacionEstructura | null {
    const est = this.getEstructura(seCode);
    if (!est) return null;

    let compModificado: ComponentePatio | null = null;

    est.bahias = est.bahias.map(b => ({
      ...b,
      componentes: b.componentes.map(c => {
        if (c.id === compId) {
          const serialAnterior = c.serial;
          const nuevoEvento: ComponentFaultEvent = {
            id: `evt-${Date.now()}`,
            fecha_evento: new Date().toISOString(),
            tipo_evento: 'RESTABLECIMIENTO_SERVICIO',
            causa: 'REPOSICIÓN_OPERATIVA',
            descripcion: detalles.notas || (detalles.esNuevo ? 'Instalación de nuevo activo en reemplazo' : 'Equipo reparado en sitio y energizado'),
            registrado_por: detalles.registradoPor,
            es_reemplazo_nuevo: detalles.esNuevo,
            serial_anterior: serialAnterior,
            serial_nuevo: detalles.serial || serialAnterior,
            capacidad_nueva_mva: detalles.capacidadMva,
            sincronizado_scein: true,
          };

          compModificado = {
            ...c,
            estado_operativo: 'EN_SERVICIO',
            alarma_activa: false,
            serial: detalles.serial || c.serial,
            fabricante: detalles.fabricante || c.fabricante,
            capacidad_mva: detalles.capacidadMva || c.capacidad_mva,
            historial_eventos: [nuevoEvento, ...(c.historial_eventos || [])]
          };
          return compModificado;
        }
        return c;
      })
    }));

    if (compModificado) {
      est.ultima_actualizacion = new Date().toISOString();
      this.saveEstructura(est);
    }
    return est;
  },

  guardarEventoGlobal(evt: ComponentFaultEvent, seCode: string, comp: ComponentePatio) {
    try {
      const logs = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || '[]');
      logs.unshift({
        ...evt,
        se_codigo: seCode,
        componente_nombre: comp.nombre_equipo,
        codigo_norma: comp.codigo_norma,
      });
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.warn('Error guardando log global:', e);
    }
  },

  async syncInsforgeAsync(estructura: SubestacionEstructura) {
    // Si la tabla sigad.estructuras_subestaciones existiese, guarda un snapshot JSONB
    if (!insforgeClient.apiKey) return;
    await insforgeClient.insert('estructuras_subestaciones', [{
      se_codigo: estructura.se_codigo,
      datos_estructura: estructura,
      actualizado_en: estructura.ultima_actualizacion
    }], 'sigad');
  }
};
