"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ItemFormProps {
  partidas: { id: string; nombre: string; codigo: string }[]
  elementos: { id: string; nombre: string; codigo: string; partida_presupuestaria_id: string }[]
}

export function ItemForm({ partidas, elementos }: ItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPartida, setSelectedPartida] = useState<string>("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      partida_presupuestaria_id: formData.get("partida_presupuestaria_id"),
      elemento_id: formData.get("elemento_id") || null,
      codigo: formData.get("codigo"),
      codigo_snc: formData.get("codigo_snc") || null,
      codigo_sap: formData.get("codigo_sap") || null,
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion") || null,
      especificacion_tecnica: formData.get("especificacion_tecnica") || null,
      cantidad: formData.get("cantidad") || 0,
      unidad_medida: formData.get("unidad_medida") || null,
      costo_unitario: formData.get("costo_unitario") || 0,
      tipo_item: formData.get("tipo_item"),
      tipo_reemplazo: formData.get("tipo_reemplazo") || null,
      justificacion: formData.get("justificacion"),
      estado: formData.get("estado") || "PENDIENTE",
      fecha_ejecucion_estimada: formData.get("fecha_ejecucion_estimada") || null,
    }

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear item")

      router.push("/items")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const elementosFiltrados = selectedPartida
    ? elementos.filter((e) => e.partida_presupuestaria_id === selectedPartida)
    : elementos

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Partida Presupuestaria *</label>
          <select
            name="partida_presupuestaria_id"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            onChange={(e) => setSelectedPartida(e.target.value)}
          >
            <option value="">Seleccionar partida...</option>
            {partidas.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Elemento</label>
          <select name="elemento_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar elemento...</option>
            {elementosFiltrados.map((e) => (
              <option key={e.id} value={e.id}>{e.codigo} - {e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Código *</label>
          <input type="text" name="codigo" required maxLength={100} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Item *</label>
          <select name="tipo_item" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar tipo...</option>
            <option value="MATERIAL">Material</option>
            <option value="SERVICIO">Servicio</option>
            <option value="ACTIVO">Activo</option>
            <option value="VIATICO">Viático</option>
            <option value="RECURSO_HUMANO">Recurso Humano</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input type="text" name="nombre" required maxLength={500} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="descripcion" rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad *</label>
          <input type="number" name="cantidad" required min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Costo Unitario *</label>
          <input type="number" name="costo_unitario" required min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
          <input type="text" name="unidad_medida" maxLength={100} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select name="estado" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="EN_PROCESO">EN PROCESO</option>
            <option value="COMPLETADO">COMPLETADO</option>
            <option value="ANULADO">ANULADO</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Código SNC</label>
          <input type="text" name="codigo_snc" maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código SAP</label>
          <input type="text" name="codigo_sap" maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Justificación *</label>
        <textarea name="justificacion" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha Ejecución Estimada</label>
        <input type="date" name="fecha_ejecucion_estimada" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Item"}
        </button>
      </div>
    </form>
  )
}
