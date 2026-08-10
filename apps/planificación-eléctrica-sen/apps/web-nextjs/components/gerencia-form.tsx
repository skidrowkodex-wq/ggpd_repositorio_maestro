"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface GerenciaFormProps {
  entes: { id: string; nombre: string }[]
  regiones: { id: string; nombre: string }[]
  estados: { id: string; nombre: string }[]
}

export function GerenciaForm({ entes, regiones, estados }: GerenciaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      ente_id: formData.get("ente_id"),
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion") || null,
      ambito: formData.get("ambito") || "GENERAL",
      proceso_medular: formData.get("proceso_medular") || "NO APLICA",
      ceco: formData.get("ceco") || null,
      codigo_sap: formData.get("codigo_sap") || null,
      region_id: formData.get("region_id") || null,
      estado_id: formData.get("estado_id") || null,
      direccion_fisica: formData.get("direccion_fisica") || null,
      centro_servicios: formData.get("centro_servicios") || null,
    }

    try {
      const response = await fetch("/api/gerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear gerencia")

      router.push("/gerencias")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Ente *</label>
          <select name="ente_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar ente...</option>
            {entes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código *</label>
          <input type="text" name="codigo" required maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input type="text" name="nombre" required maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="descripcion" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ámbito</label>
          <select name="ambito" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="GENERAL">GENERAL</option>
            <option value="NACIONAL">NACIONAL</option>
            <option value="REGIONAL">REGIONAL</option>
            <option value="ESTADAL">ESTADAL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Proceso Medular</label>
          <select name="proceso_medular" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="NO APLICA">NO APLICA</option>
            <option value="GENERACIÓN">GENERACIÓN</option>
            <option value="TRANSMISIÓN">TRANSMISIÓN</option>
            <option value="DISTRIBUCIÓN">DISTRIBUCIÓN</option>
            <option value="COMERCIALIZACIÓN">COMERCIALIZACIÓN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CECO</label>
          <input type="text" name="ceco" maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Región</label>
          <select name="region_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar región...</option>
            {regiones.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select name="estado_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar estado...</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dirección Física</label>
        <textarea name="direccion_fisica" rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Gerencia"}
        </button>
      </div>
    </form>
  )
}
