"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface PartidaFormProps {
  acciones: { id: string; nombre: string; codigo: string; poa: { nombre: string; anio: number } }[]
}

export function PartidaForm({ acciones }: PartidaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      accion_especifica_id: formData.get("accion_especifica_id"),
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion") || null,
      monto_presupuestado: formData.get("monto_presupuestado") || null,
      monto_ejecutado: formData.get("monto_ejecutado") || null,
      moneda: formData.get("moneda") || "VES",
      cantidad: formData.get("cantidad") || null,
      unidad_medida: formData.get("unidad_medida") || null,
      costo_unitario: formData.get("costo_unitario") || null,
      justificacion: formData.get("justificacion") || null,
    }

    try {
      const response = await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear partida")

      router.push("/partidas")
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
          <label className="block text-sm font-medium mb-1">Acción Específica *</label>
          <select name="accion_especifica_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar acción...</option>
            {acciones.map((a) => (
              <option key={a.id} value={a.id}>{a.codigo} - {a.nombre} ({a.poa.nombre} {a.poa.anio})</option>
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
        <textarea name="descripcion" rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Monto Presupuestado</label>
          <input type="number" name="monto_presupuestado" min={0} step={0.01} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Monto Ejecutado</label>
          <input type="number" name="monto_ejecutado" min={0} step={0.01} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input type="number" name="cantidad" min={0} step={0.01} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Costo Unitario</label>
          <input type="number" name="costo_unitario" min={0} step={0.01} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
          <input type="text" name="unidad_medida" maxLength={100} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
          <select name="moneda" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="VES">VES (Bolívar)</option>
            <option value="USD">USD (Dólar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Justificación</label>
        <textarea name="justificacion" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Partida"}
        </button>
      </div>
    </form>
  )
}
