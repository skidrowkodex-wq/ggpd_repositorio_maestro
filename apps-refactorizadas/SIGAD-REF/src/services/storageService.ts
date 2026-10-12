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

      // Persistencia en esquema sigad.eventos_historial de InsForge
      if (insforgeClient.apiKey) {
        insforgeClient.insert('eventos_historial', [{
          id: evt.id,
          se_codigo: seCode,
          componente_id: comp.id,
          componente_nombre: comp.nombre_equipo,
          codigo_norma: comp.codigo_norma,
          tipo_evento: evt.tipo_evento,
          causa: evt.causa,
          descripcion: evt.descripcion,
          registrado_por: evt.registrado_por,
          es_reemplazo_nuevo: evt.es_reemplazo_nuevo || false,
          serial_anterior: evt.serial_anterior || null,
          serial_nuevo: evt.serial_nuevo || null,
          capacidad_nueva_mva: evt.capacidad_nueva_mva || null,
          sincronizado_scein: true,
          fecha_evento: evt.fecha_evento || new Date().toISOString(),
        }], 'sigad').catch(e => console.warn('SIGAD: Error registrando evento en InsForge:', e));
      }
    } catch (e) {
      console.warn('Error guardando log global:', e);
    }
  },

  async loadFromInsforge(seCode: string): Promise<SubestacionEstructura | null> {
    if (!insforgeClient.apiKey) return null;
    try {
      const res = await insforgeClient.select<any>('estructuras_subestaciones', {
        schema: 'sigad',
        filter: { se_codigo: seCode },
        limit: 1,
      });
      if (res.data && res.data.length > 0 && res.data[0].datos_estructura) {
        const est = res.data[0].datos_estructura as SubestacionEstructura;
        localStorage.setItem(`${STORAGE_PREFIX}${seCode}`, JSON.stringify(est));
        return est;
      }
    } catch (e) {
      console.warn('Error cargando estructura desde InsForge:', e);
    }
    return null;
  },

  async syncInsforgeAsync(estructura: SubestacionEstructura) {
    if (!insforgeClient.apiKey) return;
    try {
      const totalBahias = estructura.bahias.length;
      const totalComponentes = estructura.bahias.reduce((acc, b) => acc + b.componentes.length, 0);
      const totalIndisponibles = estructura.bahias.reduce(
        (acc, b) => acc + b.componentes.filter((c) => c.estado_operativo !== 'EN_SERVICIO').length,
        0
      );

      const payload = {
        se_codigo: estructura.se_codigo,
        datos_estructura: estructura,
        total_bahias: totalBahias,
        total_componentes: totalComponentes,
        total_indisponibles: totalIndisponibles,
        actualizado_en: estructura.ultima_actualizacion || new Date().toISOString(),
      };

      // Verificar si ya existe en sigad.estructuras_subestaciones
      const existing = await insforgeClient.select('estructuras_subestaciones', {
        schema: 'sigad',
        filter: { se_codigo: estructura.se_codigo },
        limit: 1,
      });

      if (existing.data && existing.data.length > 0) {
        await insforgeClient.patch('estructuras_subestaciones', 'se_codigo', estructura.se_codigo, payload, 'sigad');
      } else {
        await insforgeClient.insert('estructuras_subestaciones', [payload], 'sigad');
      }

      // Sincronizar componentes de patio individuales en sigad.componentes_patio
      const compsParaInsertar: any[] = [];
      estructura.bahias.forEach((b) => {
        b.componentes.forEach((c) => {
          compsParaInsertar.push({
            id: c.id,
            se_codigo: estructura.se_codigo,
            bahia_id: b.id,
            circuito_codigo: c.circuito_codigo || null,
            codigo_norma: c.codigo_norma,
            nombre_equipo: c.nombre_equipo,
            tipo_elemento: c.tipo_elemento,
            estado_operativo: c.estado_operativo,
            tension_kv: c.tension_kv || null,
            capacidad_mva: c.capacidad_mva || null,
            fabricante: c.fabricante || null,
            modelo: c.modelo || null,
            serial: c.serial || null,
            anio_instalacion: c.anio_instalacion || null,
            nivel_aceite: c.nivel_aceite || 'N/A',
            tecnologia_corte: c.tecnologia_corte || 'N/A',
            presion_sf6_bar: c.presion_sf6_bar || null,
            alarma_activa: c.alarma_activa || false,
            observaciones: c.observaciones || null,
            actualizado_en: new Date().toISOString(),
          });
        });
      });

      if (compsParaInsertar.length > 0) {
        for (let i = 0; i < compsParaInsertar.length; i += 50) {
          const chunk = compsParaInsertar.slice(i, i + 50);
          await insforgeClient.insert('componentes_patio', chunk, 'sigad');
        }
      }
    } catch (err: any) {
      console.warn('SIGAD: Persistencia remota en InsForge:', err?.message);
    }
  }
};
