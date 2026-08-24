"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface MetaFormProps {
  acciones: { id: string; nombre: string; unidad_medida: string | null }[]
  meses: { id: string; nombre: string; nombre_corto: string }[]
}

export function MetaForm({ acciones, meses }: MetaFormProps) {
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
      mes_id: formData.get("mes_id"),
      anio: parseInt(formData.get("anio") as string),
      programado: formData.get("programado") || 0,
      ejecutado: formData.get("ejecutado") || 0,
      unidad_medida: formData.get("unidad_medida") || null,
    }

    try {
      const response = await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear meta")

      router.push("/metas")
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
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mes *</label>
          <select name="mes_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar mes...</option>
            {meses.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Año *</label>
          <input type="number" name="anio" required min={2020} max={2050} defaultValue={2027} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Programado *</label>
          <input type="number" name="programado" required min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ejecutado</label>
          <input type="number" name="ejecutado" min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
        <input type="text" name="unidad_medida" maxLength={100} placeholder="Se hereda de la acción si se deja vacío" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Meta"}
        </button>
      </div>
    </form>
  )
}
