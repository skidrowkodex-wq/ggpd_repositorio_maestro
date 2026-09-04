/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CargaTira, Despachador, EstadoCarga, TiraInterrupcion } from './types';
import {
  cargarDespachadores,
  cargarTiras,
  crearTira,
  eliminarTira,
} from './services/sctisService';

const FORM_INICIAL: CargaTira = {
  codigoEstado: '',
  sistema: 'DISTRIBUCION',
  subestacionNombre: '',
  circuitoCodigo: '',
  fechaApertura: '',
  fechaCierre: '',
  causaCodigo: '',
  observacion: '',
  despachador: '',
};

export default function App() {
  // Los datos arrancan SIEMPRE vacíos y se cargan desde InsForge al montar.
  const [tiras, setTiras] = useState<TiraInterrupcion[]>([]);
  const [despachadores, setDespachadores] = useState<Despachador[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CargaTira>(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setEstado('cargando');
    setError(null);
    const [resTiras, resDesp] = await Promise.all([cargarTiras(), cargarDespachadores()]);
    if (resTiras.error) {
      setError(resTiras.error);
      setEstado('error');
      setTiras([]);
    } else {
      setTiras(resTiras.tiras);
      setEstado(resTiras.tiras.length === 0 ? 'vacio' : 'listo');
    }
    setDespachadores(resDesp.despachadores);
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const despachadoresActivos = useMemo(
    () => despachadores.filter((d) => d.esActivo !== false),
    [despachadores],
  );

  const onChange = (campo: keyof CargaTira) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setMensaje(null);
    const payload: CargaTira = { ...form };
    if (payload.fechaApertura && payload.fechaCierre) {
      const a = new Date(payload.fechaApertura).getTime();
      const c = new Date(payload.fechaCierre).getTime();
      if (Number.isFinite(a) && Number.isFinite(c) && c >= a) {
        payload.duracionMinutos = Math.round((c - a) / 60000);
      }
    }
    const { error: err } = await crearTira(payload);
    setEnviando(false);
    if (err) {
      setMensaje(`Error al registrar la tira: ${err}`);
      return;
    }
    setMensaje('Tira registrada correctamente en InsForge.');
    setForm(FORM_INICIAL);
    await recargar();
  };

  const onEliminar = async (id: string | number) => {
    if (!window.confirm('¿Eliminar esta tira de interrupción?')) return;
    const { error: err } = await eliminarTira(id);
    if (err) {
      setMensaje(`Error al eliminar: ${err}`);
      return;
    }
    await recargar();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-[Inter,sans-serif]">
      <header className="bg-sky-700 text-white px-6 py-4 shadow">
        <h1 className="text-xl font-extrabold tracking-tight">
          SCTIS V2.0 — Tiras de Interrupción de Distribución
        </h1>
        <p className="text-sky-100 text-xs mt-1">
          🛡️ ZONA SEGURA DE GRADO INDUSTRIAL | ISO 27001 · ISO 8000 · OWASP · PORT 3002
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ── Registro de nueva tira ─────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-slate-700 mb-4">Registrar tira de interrupción</h2>
          <form onSubmit={onCrear} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Código de estado
              <input required value={form.codigoEstado || ''} onChange={onChange('codigoEstado')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" placeholder="Ej. ANZ" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Subestación
              <input required value={form.subestacionNombre || ''} onChange={onChange('subestacionNombre')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" placeholder="Nombre de la S/E" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Circuito
              <input required value={form.circuitoCodigo || ''} onChange={onChange('circuitoCodigo')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" placeholder="Código del circuito" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Fecha apertura
              <input required type="datetime-local" value={form.fechaApertura || ''} onChange={onChange('fechaApertura')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Fecha cierre
              <input type="datetime-local" value={form.fechaCierre || ''} onChange={onChange('fechaCierre')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Causa (código)
              <input value={form.causaCodigo || ''} onChange={onChange('causaCodigo')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" placeholder="Ej. SC_FASE" />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Despachador
              <input list="despachadores" value={form.despachador || ''} onChange={onChange('despachador')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" placeholder="Nombre del despachador" />
              <datalist id="despachadores">
                {despachadoresActivos.map((d) => (
                  <option key={d.id} value={d.nombre} />
                ))}
              </datalist>
            </label>
            <label className="text-xs font-semibold text-slate-500 md:col-span-2">
              Observación
              <input value={form.observacion || ''} onChange={onChange('observacion')}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm" />
            </label>
            <div className="md:col-span-3 flex items-center gap-3">
              <button type="submit" disabled={enviando}
                className="bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded">
                {enviando ? 'Guardando…' : 'Registrar tira'}
              </button>
              {mensaje && <span className="text-sm text-slate-600">{mensaje}</span>}
            </div>
          </form>
        </section>

        {/* ── Listado ────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700">Tiras registradas</h2>
            <button onClick={recargar}
              className="text-xs font-semibold text-sky-700 hover:underline">
              Recargar desde InsForge
            </button>
          </div>

          {estado === 'cargando' && (
            <p className="text-sm text-slate-500 py-6 text-center">Cargando tiras desde InsForge…</p>
          )}
          {estado === 'error' && (
            <p className="text-sm text-red-600 py-6 text-center">
              No fue posible cargar las tiras: {error}
            </p>
          )}
          {estado === 'vacio' && (
            <p className="text-sm text-slate-500 py-6 text-center">
              No hay tiras de interrupción registradas.
            </p>
          )}
          {estado === 'listo' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400 border-b">
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Subestación</th>
                    <th className="py-2 pr-3">Circuito</th>
                    <th className="py-2 pr-3">Apertura</th>
                    <th className="py-2 pr-3">Cierre</th>
                    <th className="py-2 pr-3">Duración (min)</th>
                    <th className="py-2 pr-3">MW</th>
                    <th className="py-2 pr-3">Causa</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {tiras.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2 pr-3 font-semibold">{t.codigoEstado ?? '—'}</td>
                      <td className="py-2 pr-3">{t.subestacionNombre ?? '—'}</td>
                      <td className="py-2 pr-3">{t.circuitoCodigo ?? '—'}</td>
                      <td className="py-2 pr-3">{t.fechaApertura ?? '—'}</td>
                      <td className="py-2 pr-3">{t.fechaCierre ?? '—'}</td>
                      <td className="py-2 pr-3">{t.duracionMinutos ?? '—'}</td>
                      <td className="py-2 pr-3">{t.mwInterrumpidos ?? '—'}</td>
                      <td className="py-2 pr-3">{t.causaNombre ?? t.causaCodigo ?? '—'}</td>
                      <td className="py-2 pr-3">
                        <button onClick={() => onEliminar(t.id)}
                          className="text-xs text-red-600 hover:underline">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center text-[11px] text-slate-400 py-6">
        CORPOELEC GGPD · ISO/IEC 27001 · ISO 8000-110 · OWASP Top 10 · ISACA COBIT — Datos en tiempo real desde InsForge.
      </footer>
    </div>
  );
}
